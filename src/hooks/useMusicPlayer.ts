import { useQuery } from '@tanstack/react-query'
import { getAudioFileById } from 'api/db/audio'
import { getSpotifyTrack } from 'api/spotifyClient'
import FileSound from 'classes/FileSound'
import Sound from 'classes/Sound'
import SpotifySound from 'classes/SpotifySound'
import { useEffect, useState } from 'react'

import rollbar from 'resources/rollbar'

const useAudioPlayer = (audioId: number) => {
  const [sound, setSound] = useState<Sound>()
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentPosition, setCurrentPosition] = useState(0)

  const { data } = useQuery({
    queryKey: ['audio', audioId],
    queryFn: () => getAudioFileById(audioId),
    enabled: !!audioId,
  })

  const source = data?.source
  const name = data?.name
  const path = data?.path

  const { data: spotifyTrackData } = useQuery({
    queryKey: ['spotify-track', path],
    queryFn: () => getSpotifyTrack(path!),
    enabled: source === 'Spotify' && !!path,
  })

  useEffect(() => {
    if (spotifyTrackData && source === 'Spotify') {
      setDuration(spotifyTrackData.data.duration_ms)
      const sound = new SpotifySound(spotifyTrackData.data)
      setSound(sound)

      sound.loadAsync()
      sound.playbackListener(onPlaybackStatusUpdate)
      return () => {
        sound.unloadAsync()
      }
    }
  }, [spotifyTrackData, source])

  useEffect(() => {
    if (source === 'iCloud') {
      if (name && path) {
        const sound = new FileSound()
        setSound(sound)
        sound.playbackListener(onPlaybackStatusUpdate)
        sound.loadAsync({ uri: path, name: name })
        return () => {
          sound.unloadAsync()
        }
      } else {
        rollbar.error('Sound missing!')
      }
    }
  }, [name, path, source])

  const onPlaybackStatusUpdate = (status: {
    isLoaded: boolean
    isPlaying: boolean
    positionMillis: number
    durationMillis: number
  }) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying)
      setDuration(status.durationMillis)
      setCurrentPosition(status.positionMillis)
    }
  }

  async function playSound() {
    sound?.playAsync()
  }

  async function pauseSound() {
    sound?.pauseAsync()
  }

  const setSoundPosition = async (position: number) =>
    await sound?.setPositionAsync(position)

  const setSoundSpeed = async (tempo: number) =>
    await sound?.setRateAsync(tempo)

  return {
    isSoundLoaded: !!sound,
    playAudio: playSound,
    pauseAudio: pauseSound,
    setAudioPosition: setSoundPosition,
    setAudioSpeed: setSoundSpeed,
    isPlaying,
    currentPosition,
    duration,
    details: {
      trackName: name || 'Unnamed audio',
      source,
    },
  }
}

export default useAudioPlayer
