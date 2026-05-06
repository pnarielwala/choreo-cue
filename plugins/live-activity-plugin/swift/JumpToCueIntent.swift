import AppIntents
import Foundation

private let appGroupId = "group.com.pnarielwala.choreo-cue"
private let darwinNotificationName = "com.pnarielwala.choreo-cue.cue-tap"
private let pendingTapKey = "pendingCueTap"

@available(iOS 17.0, *)
public struct JumpToCueIntent: AppIntent {
  public static var title: LocalizedStringResource = "Jump to cue"
  public static var description = IntentDescription("Jump audio playback to a saved cue position.")
  public static var openAppWhenRun: Bool = false

  @Parameter(title: "Audio ID")
  public var audioId: Int

  @Parameter(title: "Cue number")
  public var cueNumber: Int

  public init() {}

  public init(audioId: Int, cueNumber: Int) {
    self.audioId = audioId
    self.cueNumber = cueNumber
  }

  public func perform() async throws -> some IntentResult {
    if let defaults = UserDefaults(suiteName: appGroupId) {
      defaults.set([
        "audioId": audioId,
        "cueNumber": cueNumber,
        "ts": Date().timeIntervalSince1970,
      ], forKey: pendingTapKey)
    }
    let center = CFNotificationCenterGetDarwinNotifyCenter()
    CFNotificationCenterPostNotification(
      center,
      CFNotificationName(darwinNotificationName as CFString),
      nil,
      nil,
      true
    )
    return .result()
  }
}
