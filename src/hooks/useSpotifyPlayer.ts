import { useEffect, useRef, useState, useCallback } from 'react'
import { Alert, AppState, Linking, NativeModules, Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import type PlayerState from 'react-native-spotify-remote/dist/PlayerState'
import type { SpotifyRemoteApi } from 'react-native-spotify-remote/dist/SpotifyRemote'

import { getSpotifyAccessToken } from 'hooks/useSpotifyAuth'
import {
  getPlayerState as getWebPlayerState,
  playOnSpotify,
  pauseOnSpotify,
  seekOnSpotify,
  getDevices,
  transferPlayback,
  trackIdFromUri,
  SpotifyDevice,
} from 'api/spotifyClient'
import analytics from 'resources/analytics'
import type { PlayerHookResult, PlayerConnectionState } from 'hooks/playerTypes'

const TICK_MS = 250
const POLL_MS = 1500
const RECONNECT_DELAY_MS = 500
const DEVICE_KEY = 'ChoreoCue_Spotify_Device'

type StoredDevice = { name: string; type: string; id?: string }

let cachedDevice: StoredDevice | null | undefined = undefined

const loadStoredDevice = async (): Promise<StoredDevice | null> => {
  if (cachedDevice !== undefined) return cachedDevice
  if (Platform.OS === 'web') {
    cachedDevice = null
    return null
  }
  try {
    const raw = await SecureStore.getItemAsync(DEVICE_KEY)
    cachedDevice = raw ? (JSON.parse(raw) as StoredDevice) : null
  } catch {
    cachedDevice = null
  }
  return cachedDevice
}

const saveStoredDevice = async (d: StoredDevice) => {
  if (
    cachedDevice &&
    cachedDevice.name === d.name &&
    cachedDevice.type === d.type &&
    cachedDevice.id === d.id
  ) {
    return
  }
  cachedDevice = d
  if (Platform.OS !== 'web') {
    try {
      await SecureStore.setItemAsync(DEVICE_KEY, JSON.stringify(d))
    } catch {
      // best-effort persistence; not fatal
    }
  }
}

const pickPhoneDevice = (
  devices: SpotifyDevice[],
  saved: StoredDevice | null
): SpotifyDevice | null => {
  const usable = devices.filter((d) => d.id && !d.is_restricted)
  if (saved) {
    const exact = usable.find(
      (d) => d.name === saved.name && d.type === saved.type
    )
    if (exact) return exact
    const byName = usable.find((d) => d.name === saved.name)
    if (byName) return byName
  }
  const phone = usable.find((d) => d.type === 'Smartphone')
  if (phone) return phone
  return null
}

// Refresh the saved fingerprint to match the current live phone session.
// Spotify rotates device ids per session, so even if name+type are
// unchanged, the id has likely changed; we always want the most recent one.
const refreshStoredFromLive = async (
  devices: SpotifyDevice[],
  saved: StoredDevice | null
): Promise<void> => {
  const livePhone = pickPhoneDevice(devices, saved)
  if (livePhone && livePhone.id) {
    await saveStoredDevice({
      name: livePhone.name,
      type: livePhone.type,
      id: livePhone.id,
    })
  }
}

let cachedRemote: SpotifyRemoteApi | null | undefined = undefined
const loadRemote = (): SpotifyRemoteApi | null => {
  if (cachedRemote !== undefined) return cachedRemote

  // The package's module init does `NativeModules.RNSpotifyRemoteAuth.authorize`
  // and `nativeModule.connect.bind(...)` — both throw synchronously when the
  // native modules aren't linked in the running binary. Even though we wrap
  // the require in try/catch, RN's global ErrorUtils handler (used by
  // Rollbar's captureUncaught) can still surface the throw as a red-box
  // before our catch handler runs. So check the native bridge first and
  // skip the require entirely when it's not present.
  if (
    !NativeModules.RNSpotifyRemoteAuth ||
    !NativeModules.RNSpotifyRemoteAppRemote
  ) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log(
        '[Spotify] native modules not present; using Web API only. Rebuild the dev client (yarn ios) to enable App Remote.'
      )
    }
    cachedRemote = null
    return null
  }

  try {
    const mod = require('react-native-spotify-remote')
    const candidate = mod?.remote
    if (
      !candidate ||
      typeof candidate.connect !== 'function' ||
      typeof candidate.addListener !== 'function'
    ) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(
          '[Spotify] remote API missing on the loaded module; falling back to Web API only'
        )
      }
      cachedRemote = null
    } else {
      cachedRemote = candidate as SpotifyRemoteApi
    }
  } catch (e) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log(
        '[Spotify] native module require threw; falling back to Web API only',
        (e as any)?.message
      )
    }
    cachedRemote = null
  }
  return cachedRemote
}

const safeCall = <T>(fn: () => T, label: string): T | undefined => {
  try {
    return fn()
  } catch (e) {
    analytics.error(`[Spotify] ${label} threw`, e as any)
    return undefined
  }
}

const useSpotifyPlayer = (
  source: { uri: string; name: string } | undefined
): PlayerHookResult => {
  const trackUri = source?.uri ?? ''

  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [trackName, setTrackName] = useState(source?.name ?? 'Unnamed track')
  const [connectionState, setConnectionState] =
    useState<PlayerConnectionState>('disconnected')
  const [hasActiveSession, setHasActiveSession] = useState(false)

  const lastSyncAt = useRef(Date.now())
  const lastSyncPosition = useRef(0)
  const lastSyncIsPlaying = useRef(false)
  const startedTrack = useRef(false)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  // Position we want Spotify to be at after a deep-link launch. iOS strips
  // the URI fragment (`#m:ss`) when handing off via Linking.openURL, so we
  // fire a Web API seek once polling confirms our track is actually playing.
  const pendingSeekAfterReturn = useRef<number | null>(null)

  const applyState = useCallback(
    (next: { isPlaying: boolean; positionMs: number; durationMs?: number }) => {
      lastSyncAt.current = Date.now()
      lastSyncPosition.current = next.positionMs
      lastSyncIsPlaying.current = next.isPlaying
      setIsPlaying(next.isPlaying)
      setPosition(next.positionMs)
      if (next.durationMs && next.durationMs > 0) {
        setDuration(next.durationMs)
      }
      setHasActiveSession(true)
    },
    []
  )

  const onAppRemoteState = useCallback(
    (state: PlayerState) => {
      if (!state.track) return
      // Only mirror Spotify state into our UI when it's *our* track. If
      // Spotify happens to be on a different track (e.g. user just opened a
      // new project while Spotify was playing the previous one), we don't
      // want that track's position/duration/playing status leaking through.
      if (state.track.uri !== trackUri) {
        return
      }
      applyState({
        isPlaying: !state.isPaused,
        positionMs: state.playbackPosition,
        durationMs: state.track.duration,
      })
      startedTrack.current = true
      if (state.track.name) setTrackName(state.track.name)
    },
    [applyState, trackUri]
  )

  const tryConnect = useCallback(async () => {
    const remote = loadRemote()
    if (!remote) {
      setConnectionState('disconnected')
      return false
    }
    try {
      const token = await getSpotifyAccessToken()
      if (!token) {
        setConnectionState('disconnected')
        return false
      }
      await remote.connect(token)
      setConnectionState('app-remote')
      const initial = await remote.getPlayerState().catch(() => null)
      if (initial) onAppRemoteState(initial)
      return true
    } catch (e) {
      setConnectionState('disconnected')
      return false
    }
  }, [onAppRemoteState])

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
    reconnectTimer.current = setTimeout(() => {
      tryConnect()
    }, RECONNECT_DELAY_MS)
  }, [tryConnect])

  const pollWebState = useCallback(async () => {
    try {
      const state = await getWebPlayerState()
      if (state && state.item && state.item.uri === trackUri) {
        applyState({
          isPlaying: state.is_playing,
          positionMs: state.progress_ms ?? 0,
          durationMs: state.item.duration_ms,
        })
        startedTrack.current = true
        if (state.item.name) setTrackName(state.item.name)
        // If we deep-linked with a target position, Spotify launches the
        // track from 0:00 (the URI fragment isn't honored by the OS
        // handler). Now that we can see the track is actually playing,
        // seek to where the user wanted to be.
        if (state.is_playing && pendingSeekAfterReturn.current != null) {
          const target = pendingSeekAfterReturn.current
          pendingSeekAfterReturn.current = null
          seekOnSpotify(target).catch(() => {
            // best-effort — if the seek fails we just stay at 0:00
          })
        }
      } else {
        // Either no Connect device at all, or Spotify is on a different
        // track than ours. In both cases our track isn't playing — show
        // the wake banner and don't pollute our UI with foreign state.
        setIsPlaying(false)
        setHasActiveSession(false)
      }
    } catch {
      // Silent — most failures here are transient or 401 (handled by interceptor).
    }
  }, [applyState, trackUri])

  // Opportunistically capture the user's phone as their preferred device
  // whenever we see a Smartphone in the devices list during normal operation.
  // Refresh the saved id whenever it changes so wake attempts use the most
  // recent value Spotify knows about.
  useEffect(() => {
    if (!source) return
    let cancelled = false
    ;(async () => {
      try {
        const [devices, saved] = await Promise.all([
          getDevices(),
          loadStoredDevice(),
        ])
        if (cancelled) return
        await refreshStoredFromLive(devices, saved)
      } catch {
        // ignore — we'll capture on the first play instead
      }
    })()
    return () => {
      cancelled = true
    }
  }, [source])

  useEffect(() => {
    if (!source) return
    const remote = loadRemote()
    tryConnect()

    const appStateSub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        // User likely came back from Spotify. Pull state immediately via Web
        // API (fast, works regardless of App Remote), and retry App Remote in
        // parallel so subsequent commands are instant. Schedule a follow-up
        // poll because Spotify Connect can take ~1s to register the device.
        pollWebState()
        tryConnect()
        setTimeout(() => {
          pollWebState()
        }, 1200)
      }
    })

    if (!remote) {
      return () => {
        appStateSub.remove()
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      }
    }

    const onConnected = () => setConnectionState('app-remote')
    const onDisconnected = () => {
      setConnectionState('disconnected')
      scheduleReconnect()
    }

    safeCall(
      () => remote.addListener('playerStateChanged', onAppRemoteState),
      'addListener(playerStateChanged)'
    )
    safeCall(
      () => remote.addListener('remoteConnected', onConnected),
      'addListener(remoteConnected)'
    )
    safeCall(
      () => remote.addListener('remoteDisconnected', onDisconnected),
      'addListener(remoteDisconnected)'
    )

    return () => {
      safeCall(
        () => remote.removeListener('playerStateChanged', onAppRemoteState),
        'removeListener(playerStateChanged)'
      )
      safeCall(
        () => remote.removeListener('remoteConnected', onConnected),
        'removeListener(remoteConnected)'
      )
      safeCall(
        () => remote.removeListener('remoteDisconnected', onDisconnected),
        'removeListener(remoteDisconnected)'
      )
      appStateSub.remove()
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      safeCall(() => remote.disconnect().catch(() => {}), 'disconnect')
    }
  }, [source, tryConnect, onAppRemoteState, scheduleReconnect, pollWebState])

  useEffect(() => {
    if (!source) return
    if (connectionState === 'app-remote') {
      if (pollTimer.current) {
        clearInterval(pollTimer.current)
        pollTimer.current = null
      }
      return
    }
    pollWebState()
    pollTimer.current = setInterval(pollWebState, POLL_MS)
    return () => {
      if (pollTimer.current) {
        clearInterval(pollTimer.current)
        pollTimer.current = null
      }
    }
  }, [source, connectionState, pollWebState])

  useEffect(() => {
    if (!source) return
    const id = setInterval(() => {
      if (lastSyncIsPlaying.current) {
        const elapsed = Date.now() - lastSyncAt.current
        setPosition(lastSyncPosition.current + elapsed)
      }
    }, TICK_MS)
    return () => clearInterval(id)
  }, [source])

  const playAudio = async () => {
    if (!trackUri) return
    const remote = loadRemote()
    if (connectionState === 'app-remote' && remote) {
      try {
        if (!startedTrack.current) {
          await remote.playUri(trackUri)
          startedTrack.current = true
        } else {
          await remote.resume()
        }
        applyState({
          isPlaying: true,
          positionMs: lastSyncPosition.current,
          durationMs: duration,
        })
        return
      } catch (e) {
        analytics.error('[Spotify] App Remote play failed', e as any)
      }
    }

    // Look at the live device list AND the saved fingerprint. We target the
    // user's phone explicitly so an Echo / desktop / etc. never wins. If the
    // phone isn't in the live list, we still try to wake it via the saved id
    // and via plain play, before giving up and deep-linking.
    let liveDevices: SpotifyDevice[] = []
    let saved: StoredDevice | null = null
    try {
      const [devices, savedDev] = await Promise.all([
        getDevices(),
        loadStoredDevice(),
      ])
      liveDevices = devices
      saved = savedDev
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('[Spotify] devices:', devices, 'saved:', savedDev)
      }
      // Refresh the saved fingerprint to match the current live phone
      // session BEFORE attempting wake. Spotify rotates device ids per
      // session, so if our phone is in the live list we always want the
      // latest id (and name/type, in case the user renamed the device).
      await refreshStoredFromLive(devices, savedDev)
      // Re-read saved to pick up the refresh, so the cascade below uses
      // the current id even if the live list lookup falls through.
      saved = await loadStoredDevice()
    } catch (e) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('[Spotify] getDevices failed', (e as any)?.message)
      }
    }

    const livePhone = pickPhoneDevice(liveDevices, saved)
    // Choose the best id we have for the phone. Prefer live id (current
    // session). Fall back to saved id (may be stale, but Spotify sometimes
    // still recognizes it for a short while; cheap to attempt before
    // deep-linking).
    const targetId = livePhone?.id ?? saved?.id
    const phoneIsActive = !!livePhone?.is_active
    const phoneNameForSave = livePhone?.name ?? saved?.name ?? null
    const phoneTypeForSave = livePhone?.type ?? saved?.type ?? null

    const onWakeSuccess = async (resolvedId?: string) => {
      startedTrack.current = true
      if (phoneNameForSave && phoneTypeForSave) {
        await saveStoredDevice({
          name: phoneNameForSave,
          type: phoneTypeForSave,
          id: resolvedId ?? targetId,
        })
      }
      applyState({
        isPlaying: true,
        positionMs: lastSyncPosition.current,
        durationMs: duration,
      })
      scheduleReconnect()
    }

    // position_ms only applies when starting a track (uris set). Spotify
    // ignores it on a plain resume, and Spotify natively remembers the
    // resume point for an already-started track anyway.
    const startPosition =
      !startedTrack.current && lastSyncPosition.current > 0
        ? lastSyncPosition.current
        : undefined
    type Attempt = { label: string; run: () => Promise<void> }
    const playPlain = async () =>
      playOnSpotify(
        startedTrack.current
          ? undefined
          : { uris: [trackUri], position_ms: startPosition }
      )
    const playTargeted = async (id: string) =>
      playOnSpotify({
        uris: startedTrack.current ? undefined : [trackUri],
        device_id: id,
        position_ms: startedTrack.current ? undefined : startPosition,
      })
    const transferAndPlay = async (id: string) => {
      await transferPlayback(id, true)
      if (!startedTrack.current) {
        try {
          await playOnSpotify({
            uris: [trackUri],
            device_id: id,
            position_ms: startPosition,
          })
        } catch (e: any) {
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.log(
              '[Spotify] post-transfer URI swap failed (transfer alone may have already started playback)',
              e?.response?.status
            )
          }
        }
      }
    }

    // Build the cascade. Order depends on whether the phone is the active
    // device, and whether we're targeting a live id vs. a stale saved id.
    const attempts: Attempt[] = []
    if (targetId) {
      if (phoneIsActive) {
        // Phone is live and active — plain play is the most reliable call,
        // it routes to the active device which IS the phone.
        attempts.push({ label: 'plain-play', run: playPlain })
        attempts.push({
          label: 'active targeted-play',
          run: () => playTargeted(targetId),
        })
        attempts.push({
          label: 'active transfer+play',
          run: () => transferAndPlay(targetId),
        })
      } else {
        // Phone is registered but not active, OR not in live list at all.
        // Try targeted commands first (avoids any chance of Echo winning),
        // and keep plain-play as the last attempt before deep-linking.
        attempts.push({
          label: 'inactive targeted-play',
          run: () => playTargeted(targetId),
        })
        attempts.push({
          label: 'inactive transfer+play',
          run: () => transferAndPlay(targetId),
        })
        attempts.push({ label: 'inactive plain-play', run: playPlain })
      }
    } else {
      // We have no id at all — never targeted before. Plain play is the only
      // Web API option. (Risk: routes to Spotify's "most recent" which could
      // be Echo. We accept that here because it's the final attempt before
      // deep-linking.)
      attempts.push({ label: 'no-id plain-play', run: playPlain })
    }

    for (const attempt of attempts) {
      try {
        await attempt.run()
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log('[Spotify] wake succeeded via', attempt.label)
        }
        await onWakeSuccess(targetId)
        return
      } catch (e: any) {
        const status = e?.response?.status
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log(
            `[Spotify] wake attempt ${attempt.label} failed`,
            status,
            e?.message
          )
        }
        if (status && status !== 404 && status !== 502 && status !== 503) {
          analytics.error(`[Spotify] Web API wake (${attempt.label}) failed`, e)
          throw e
        }
      }
    }

    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[Spotify] all wake attempts exhausted; deep-linking')
    }
    await resumeOnSpotify(lastSyncPosition.current)
  }

  const pauseAudio = async () => {
    const remote = loadRemote()
    if (connectionState === 'app-remote' && remote) {
      try {
        await remote.pause()
        applyState({
          isPlaying: false,
          positionMs: lastSyncPosition.current,
          durationMs: duration,
        })
        return
      } catch (e) {
        analytics.error('[Spotify] App Remote pause failed', e as any)
      }
    }
    try {
      await pauseOnSpotify()
      applyState({
        isPlaying: false,
        positionMs: lastSyncPosition.current,
        durationMs: duration,
      })
      scheduleReconnect()
    } catch (e) {
      analytics.error('[Spotify] Web API pause failed', e as any)
    }
  }

  const setAudioPosition = async (positionMs: number) => {
    // User-initiated seek wins over any pending post-deep-link seek.
    pendingSeekAfterReturn.current = null
    const clamped = Math.max(0, Math.floor(positionMs))
    // Optimistically record the user's intent. This way, if the seek itself
    // fails (e.g. no active device yet) but the user follows it with a play
    // — like a double-tapped cue — playAudio still uses the cue position as
    // the start, and the post-deep-link auto-seek lands them there too.
    lastSyncPosition.current = clamped
    setPosition(clamped)
    const remote = loadRemote()
    if (connectionState === 'app-remote' && remote) {
      try {
        await remote.seek(clamped)
        applyState({
          isPlaying: lastSyncIsPlaying.current,
          positionMs: clamped,
          durationMs: duration,
        })
        return
      } catch (e) {
        analytics.error('[Spotify] App Remote seek failed', e as any)
      }
    }
    try {
      await seekOnSpotify(clamped)
      applyState({
        isPlaying: lastSyncIsPlaying.current,
        positionMs: clamped,
        durationMs: duration,
      })
      scheduleReconnect()
    } catch (e) {
      analytics.error('[Spotify] Web API seek failed', e as any)
    }
  }

  const setAudioSpeed = (_tempo: number) => {
    // Spotify SDK does not expose playback rate; tempo is hidden in the UI.
  }

  const resumeOnSpotify = async (positionMs?: number) => {
    if (!trackUri) return
    // Stash the target position so pollWebState can seek to it once Spotify
    // actually starts playing our track. The URI fragment below is a hint —
    // some Spotify versions honor it, some don't — but the post-return seek
    // is the reliable path.
    if (positionMs && positionMs > 1000) {
      pendingSeekAfterReturn.current = positionMs
    } else {
      pendingSeekAfterReturn.current = null
    }
    const trackId = trackIdFromUri(trackUri)
    // Spotify's URI fragment notation #m:ss — supported by the SDK's playUri
    // and by the iOS app when launched via a URL. Skip if position is < 1s
    // since "from the start" doesn't need a fragment.
    const fragment = (() => {
      if (!positionMs || positionMs < 1000) return ''
      const totalSeconds = Math.floor(positionMs / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      return `#${minutes}:${seconds.toString().padStart(2, '0')}`
    })()
    const seconds = positionMs ? Math.floor(positionMs / 1000) : 0
    const candidates: string[] = [
      ...(trackId ? [`spotify://track/${trackId}${fragment}`] : []),
      `${trackUri}${fragment}`,
      'spotify://',
      ...(trackId
        ? [
            `https://open.spotify.com/track/${trackId}${
              seconds > 0 ? `?t=${seconds}` : ''
            }`,
          ]
        : []),
    ]
    const failures: Array<{ url: string; reason: string }> = []
    for (const url of candidates) {
      try {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log('[Spotify] attempting openURL', url)
        }
        await Linking.openURL(url)
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log('[Spotify] openURL succeeded', url)
        }
        return
      } catch (e: any) {
        failures.push({ url, reason: e?.message ?? String(e) })
      }
    }
    analytics.error('[Spotify] could not open Spotify app via any URL format', {
      trackUri,
      failures,
    } as any)
    Alert.alert(
      "Couldn't open Spotify",
      'Make sure the Spotify app is installed on your device, then try again.\n\n' +
        failures.map((f) => `${f.url}\n→ ${f.reason}`).join('\n\n')
    )
  }

  return {
    playAudio,
    pauseAudio,
    setAudioPosition,
    setAudioSpeed,
    isPlaying,
    currentPosition: position,
    duration,
    details: { trackName },
    capabilities: { tempo: false },
    connectionState,
    hasActiveSession,
    resumeOnSpotify,
  }
}

export default useSpotifyPlayer
