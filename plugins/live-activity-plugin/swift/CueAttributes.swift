import ActivityKit
import Foundation

// Shape MUST stay in sync with the host-side mirror in
// modules/live-activity/ios/LiveActivityModule.swift. ActivityKit serializes
// based on type identity, so the two structs are independent declarations
// that happen to encode/decode the same JSON.
public struct CueAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    public let trackName: String
    public let isPlaying: Bool
    public let currentMs: Int
    public let durationMs: Int
    public let cuePositionsMs: [Int]
  }

  public let audioId: Int
}
