import ActivityKit
import SwiftUI
import WidgetKit

@available(iOS 17.0, *)
public struct ChoreoCueLiveActivityWidget: Widget {
  public init() {}

  public var body: some WidgetConfiguration {
    ActivityConfiguration(for: CueAttributes.self) { context in
      LockScreenView(state: context.state, audioId: context.attributes.audioId)
        .padding()
        .activityBackgroundTint(Color.black.opacity(0.85))
        .activitySystemActionForegroundColor(Color.white)
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.center) {
          ExpandedView(state: context.state, audioId: context.attributes.audioId)
        }
      } compactLeading: {
        Image(systemName: context.state.isPlaying ? "play.fill" : "pause.fill")
      } compactTrailing: {
        Text(formatMs(context.state.currentMs))
          .monospacedDigit()
          .font(.caption2)
      } minimal: {
        Image(systemName: "music.note")
      }
    }
  }
}

@available(iOS 17.0, *)
private struct LockScreenView: View {
  let state: CueAttributes.ContentState
  let audioId: Int

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      HStack {
        Image(systemName: state.isPlaying ? "play.fill" : "pause.fill")
        Text(state.trackName)
          .font(.headline)
          .lineLimit(1)
        Spacer()
        Text("\(formatMs(state.currentMs)) / \(formatMs(state.durationMs))")
          .font(.caption)
          .monospacedDigit()
          .foregroundStyle(.secondary)
      }
      CueRow(state: state, audioId: audioId)
    }
  }
}

@available(iOS 17.0, *)
private struct ExpandedView: View {
  let state: CueAttributes.ContentState
  let audioId: Int

  var body: some View {
    VStack(spacing: 6) {
      Text(state.trackName).font(.subheadline).lineLimit(1)
      CueRow(state: state, audioId: audioId)
    }
  }
}

@available(iOS 17.0, *)
private struct CueRow: View {
  let state: CueAttributes.ContentState
  let audioId: Int

  var body: some View {
    HStack(spacing: 6) {
      ForEach(0..<4, id: \.self) { idx in
        let position = state.cuePositionsMs[idx]
        let unset = position < 0
        Button(intent: JumpToCueIntent(audioId: audioId, cueNumber: idx + 1)) {
          Text("\(idx + 1)")
            .font(.system(size: 16, weight: .semibold, design: .rounded))
            .frame(maxWidth: .infinity, minHeight: 36)
        }
        .buttonStyle(.bordered)
        .tint(unset ? .gray : .accentColor)
        .disabled(unset)
      }
    }
  }
}

private func formatMs(_ ms: Int) -> String {
  let totalSeconds = max(ms, 0) / 1000
  let m = totalSeconds / 60
  let s = totalSeconds % 60
  return String(format: "%d:%02d", m, s)
}

@main
@available(iOS 17.0, *)
struct ChoreoCueWidgetBundle: WidgetBundle {
  var body: some Widget {
    ChoreoCueLiveActivityWidget()
  }
}
