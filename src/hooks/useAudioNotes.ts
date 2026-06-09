import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getAudioNotes, updateAudioNotes } from 'api/db/audio'

const notesKey = (audioId: number) => ['audioNotes', audioId] as const

const useAudioNotes = (audioId: number) => {
  return useQuery({
    queryKey: notesKey(audioId),
    queryFn: () => getAudioNotes(audioId),
  })
}

export const useUpdateAudioNotes = (audioId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (notes: string) => updateAudioNotes(audioId, notes),
    onSuccess: (_data, notes) => {
      queryClient.setQueryData(notesKey(audioId), notes)
    },
  })
}

export default useAudioNotes
