import dbClient from './client'

export const saveCue = async (data: {
  audioId: number
  start: number
  cueNumber: number
}) => {
  const { audioId, start, cueNumber } = data
  // find exiting cue with same audio_id and cue_number
  const existingCue = await dbClient('cues').where({
    audio_id: audioId,
    cue_number: cueNumber,
  })[0]
  if (existingCue) {
    // update start time if cue exists
    await dbClient('cues')
      .where({ audio_id: audioId, cue_number: cueNumber })
      .update({ start })
    return
  } else {
    await dbClient('cues').insert({
      audio_id: audioId,
      start,
      cue_number: cueNumber,
    })
  }
}

export const deleteCue = async (audioId: number, cueNumber: number) => {
  await dbClient('cues')
    .where({ audio_id: audioId, cue_number: cueNumber })
    .del()
}

export const deleteAllCues = async (audioId: number) => {
  await dbClient('cues').where({ audio_id: audioId }).del()
}

export const getAllCues = async (audioId: number) => {
  const results = await dbClient('cues')
    .where({ audio_id: audioId })
    .select('*')
  return results.map((result) => ({
    start: result.start,
    cueNumber: result.cue_number,
  }))
}
