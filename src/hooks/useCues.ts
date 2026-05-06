import { useQuery } from '@tanstack/react-query'

import { getAllCues } from 'api/db/cues'

const useCues = (audioId: number) => {
  return useQuery({
    queryKey: ['cues', audioId],
    queryFn: () => getAllCues(audioId),
    select: (data) =>
      data.reduce(
        (acc, cue) => ({ ...acc, [cue.cueNumber]: cue.start }),
        {} as Record<number, number>
      ),
  })
}

export default useCues
