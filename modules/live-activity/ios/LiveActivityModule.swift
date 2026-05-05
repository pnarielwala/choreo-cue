import ActivityKit
import ExpoModulesCore
import Foundation

private let appGroupId = "group.com.pnarielwala.choreo-cue"
private let darwinNotificationName = "com.pnarielwala.choreo-cue.cue-tap"
private let pendingTapKey = "pendingCueTap"

// Mirror of the SwiftUI side's CueAttributes. Both targets must agree on the
// shape - if you change one, change the other (plugins/live-activity-plugin/
// swift/CueAttributes.swift).
public struct CueAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    public let trackName: String
    public let isPlaying: Bool
    public let currentMs: Int
    public let durationMs: Int
    public let cuePositionsMs: [Int]  // length 4, -1 means "unset"
  }

  public let audioId: Int
}

public class LiveActivityModule: Module {
  // Strong references to running activities so we can update/end them by id.
  private var activities: [String: Any] = [:]

  public func definition() -> ModuleDefinition {
    Name("LiveActivityModule")

    Events("onCueTap")

    OnCreate {
      self.registerDarwinObserver()
    }

    OnDestroy {
      self.unregisterDarwinObserver()
    }

    Function("areActivitiesEnabled") { () -> Bool in
      if #available(iOS 16.2, *) {
        return ActivityAuthorizationInfo().areActivitiesEnabled
      }
      return false
    }

    AsyncFunction("startActivity") { (state: [String: Any], promise: Promise) in
      guard #available(iOS 17.0, *) else {
        promise.resolve(nil)
        return
      }
      let authEnabled = ActivityAuthorizationInfo().areActivitiesEnabled
      NSLog("[LiveActivityModule] areActivitiesEnabled=\(authEnabled), attempting request anyway")
      do {
        let (attrs, content) = try Self.parse(state: state)
        let activity = try Activity<CueAttributes>.request(
          attributes: attrs,
          content: ActivityContent(state: content, staleDate: nil),
          pushType: nil
        )
        self.activities[activity.id] = activity
        promise.resolve(activity.id)
      } catch {
        NSLog("[LiveActivityModule] Activity.request threw: \(error)")
        promise.reject("E_LIVE_ACTIVITY_START", "\(error)")
      }
    }

    AsyncFunction("updateActivity") { (activityId: String, state: [String: Any], promise: Promise) in
      guard #available(iOS 17.0, *) else {
        promise.resolve(nil)
        return
      }
      guard let activity = self.activities[activityId] as? Activity<CueAttributes> else {
        promise.resolve(nil)
        return
      }
      do {
        let (_, content) = try Self.parse(state: state)
        Task {
          await activity.update(ActivityContent(state: content, staleDate: nil))
          promise.resolve(nil)
        }
      } catch {
        promise.reject("E_LIVE_ACTIVITY_UPDATE", error.localizedDescription)
      }
    }

    AsyncFunction("endActivity") { (activityId: String, promise: Promise) in
      guard #available(iOS 17.0, *) else {
        promise.resolve(nil)
        return
      }
      guard let activity = self.activities[activityId] as? Activity<CueAttributes> else {
        promise.resolve(nil)
        return
      }
      Task {
        await activity.end(nil, dismissalPolicy: .immediate)
        self.activities.removeValue(forKey: activityId)
        promise.resolve(nil)
      }
    }
  }

  // MARK: - Cross-process tap bridge

  private func registerDarwinObserver() {
    let center = CFNotificationCenterGetDarwinNotifyCenter()
    let opaque = Unmanaged.passUnretained(self).toOpaque()
    CFNotificationCenterAddObserver(
      center,
      opaque,
      { (_, observer, _, _, _) in
        guard let observer = observer else { return }
        let module = Unmanaged<LiveActivityModule>.fromOpaque(observer).takeUnretainedValue()
        module.handleDarwinTap()
      },
      darwinNotificationName as CFString,
      nil,
      .deliverImmediately
    )
  }

  private func unregisterDarwinObserver() {
    let center = CFNotificationCenterGetDarwinNotifyCenter()
    let opaque = Unmanaged.passUnretained(self).toOpaque()
    CFNotificationCenterRemoveObserver(center, opaque, CFNotificationName(darwinNotificationName as CFString), nil)
  }

  private func handleDarwinTap() {
    guard let defaults = UserDefaults(suiteName: appGroupId),
          let payload = defaults.dictionary(forKey: pendingTapKey),
          let audioId = payload["audioId"] as? Int,
          let cueNumber = payload["cueNumber"] as? Int else {
      return
    }
    sendEvent("onCueTap", [
      "audioId": audioId,
      "cueNumber": cueNumber,
    ])
  }

  // MARK: - JS payload parsing

  private static func parse(state: [String: Any]) throws -> (CueAttributes, CueAttributes.ContentState) {
    guard let audioId = state["audioId"] as? Int,
          let trackName = state["trackName"] as? String,
          let isPlaying = state["isPlaying"] as? Bool,
          let currentMs = state["currentMs"] as? Int,
          let durationMs = state["durationMs"] as? Int,
          let cues = state["cues"] as? [[String: Any]] else {
      throw NSError(domain: "LiveActivityModule", code: 1, userInfo: [
        NSLocalizedDescriptionKey: "Invalid state payload",
      ])
    }
    var positions: [Int] = [-1, -1, -1, -1]
    for cue in cues {
      guard let n = cue["number"] as? Int, n >= 1, n <= 4 else { continue }
      if let p = cue["positionMs"] as? Int {
        positions[n - 1] = p
      } else {
        positions[n - 1] = -1
      }
    }
    return (
      CueAttributes(audioId: audioId),
      CueAttributes.ContentState(
        trackName: trackName,
        isPlaying: isPlaying,
        currentMs: currentMs,
        durationMs: durationMs,
        cuePositionsMs: positions
      )
    )
  }
}
