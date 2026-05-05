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
          VStack(spacing: 2) {
            Text("\(idx + 1)")
              .font(.system(size: 16, weight: .semibold, design: .rounded))
            Text(unset ? "--:--" : formatMsPadded(position))
              .font(.system(size: 10, weight: .regular, design: .monospaced))
              .opacity(unset ? 0.5 : 0.85)
          }
          .frame(maxWidth: .infinity, minHeight: 44)
        }
        .buttonStyle(.bordered)
        .tint(unset ? Color.gray : cueSlotColor(idx + 1))
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

private func formatMsPadded(_ ms: Int) -> String {
  let totalSeconds = max(ms, 0) / 1000
  let m = totalSeconds / 60
  let s = totalSeconds % 60
  return String(format: "%02d:%02d", m, s)
}

// Cue slot colors mirror src/design/tokens/palette.ts cueDefaults.dark.
// The Live Activity background is always the dark "activity tint" we set
// on ActivityConfiguration, so the dark-mode hexes give the closest
// match to what the user sees in the app.
private func cueSlotColor(_ slot: Int) -> Color {
  switch slot {
  case 1: return Color(hex: 0xC63961)
  case 2: return Color(hex: 0x30A6A2)
  case 3: return Color(hex: 0x39AC5A)
  case 4: return Color(hex: 0xD1C647)
  default: return .accentColor
  }
}

private extension Color {
  init(hex: UInt32) {
    let r = Double((hex >> 16) & 0xFF) / 255.0
    let g = Double((hex >> 8) & 0xFF) / 255.0
    let b = Double(hex & 0xFF) / 255.0
    self.init(red: r, green: g, blue: b)
  }
}

@main
@available(iOS 17.0, *)
struct ChoreoCueWidgetBundle: WidgetBundle {
  var body: some Widget {
    ChoreoCueLiveActivityWidget()
  }
}
