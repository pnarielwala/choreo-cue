import useLocalPlayer from './useLocalPlayer'
import useSpotifyPlayer from './useSpotifyPlayer'
import type { PlayerHookResult } from './playerTypes'
import type { AudioSource } from 'api/db/audio'

type MusicPlayerInput = {
  uri: string
  name: string
  source?: AudioSource
}

const useMusicPlayer = (
  source: MusicPlayerInput | undefined
): PlayerHookResult => {
  const isSpotify = source?.source === 'Spotify'
  const localResult = useLocalPlayer(isSpotify ? undefined : source)
  const spotifyResult = useSpotifyPlayer(isSpotify ? source : undefined)
  return isSpotify ? spotifyResult : localResult
}

export default useMusicPlayer
