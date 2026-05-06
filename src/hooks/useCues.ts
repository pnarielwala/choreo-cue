import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  CueRow,
  deleteAllCues,
  deleteCue,
  getAllCues,
  reorderCues,
  saveCue,
  updateCue,
} from 'api/db/cues'

export type Cue = {
  id: number
  cueNumber: number
  slot: number
  start: number
  label: string | null
  loopDurationMs: number | null
}

const toCue = (row: CueRow, idx: number): Cue => ({
  id: row.id,
  cueNumber: row.cueNumber,
  slot: idx + 1,
  start: row.start,
  label: row.label,
  loopDurationMs: row.loopDurationMs,
})

const cuesKey = (audioId: number) => ['cues', audioId] as const

const useCues = (audioId: number) => {
  return useQuery({
    queryKey: cuesKey(audioId),
    queryFn: () => getAllCues(audioId),
    select: (data) => data.map(toCue),
  })
}

export const useSaveCue = (audioId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      start: number
      cueNumber: number
      label?: string | null
      loopDurationMs?: number | null
      orderIndex?: number | null
    }) => saveCue({ audioId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cuesKey(audioId) })
    },
  })
}

export const useUpdateCue = (audioId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      id: number
      start?: number
      label?: string | null
      loopDurationMs?: number | null
      orderIndex?: number | null
    }) => {
      const { id, ...patch } = data
      return updateCue(id, patch)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cuesKey(audioId) })
    },
  })
}

export const useDeleteCue = (audioId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteCue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cuesKey(audioId) })
    },
  })
}

export const useDeleteAllCues = (audioId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deleteAllCues(audioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cuesKey(audioId) })
    },
  })
}

export const useReorderCues = (audioId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderedIds: number[]) => reorderCues(audioId, orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cuesKey(audioId) })
    },
  })
}

export default useCues
