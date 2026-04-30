#!/usr/bin/env bash
set -euo pipefail

# Strips the bitcode (__LLVM) segment from every slice of the SpotifyiOS
# xcframework that ships in node_modules. App Store Connect rejects archives
# containing bitcode (error 90482) and Spotify still ships their SDK with it
# embedded. Stripping at install time means every downstream build copies an
# already-clean binary, regardless of Xcode build-phase ordering.
#
# Idempotent: running again on an already-stripped binary is a no-op.

if [ "$(uname -s)" != "Darwin" ]; then
  exit 0
fi

if ! command -v xcrun >/dev/null 2>&1; then
  exit 0
fi

XCFRAMEWORK="node_modules/react-native-spotify-remote/ios/external/SpotifySDK/SpotifyiOS.xcframework"

if [ ! -d "$XCFRAMEWORK" ]; then
  echo "[strip-spotify-bitcode] $XCFRAMEWORK not found; skipping"
  exit 0
fi

shopt -s nullglob
SLICES=("$XCFRAMEWORK"/*/)
if [ ${#SLICES[@]} -eq 0 ]; then
  echo "[strip-spotify-bitcode] no slices under $XCFRAMEWORK; skipping"
  exit 0
fi

for SLICE_DIR in "${SLICES[@]}"; do
  BIN="${SLICE_DIR}SpotifyiOS.framework/SpotifyiOS"
  if [ -f "$BIN" ]; then
    echo "[strip-spotify-bitcode] stripping $BIN"
    xcrun bitcode_strip -r "$BIN" -o "$BIN"
  fi
done
