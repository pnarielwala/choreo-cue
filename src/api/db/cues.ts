import dbClient from './client'

export type CueRow = {
  id: number
  audioId: number
  start: number
  cueNumber: number
  label: string | null
  loopDurationMs: number | null
  orderIndex: number | null
}

type RawCueRow = {
  id: number
  audio_id: number
  start: number
  cue_number: number
  label: string | null
  loop_duration_ms: number | null
  order_index: number | null
}

const fromRaw = (raw: RawCueRow): CueRow => ({
  id: raw.id,
  audioId: raw.audio_id,
  start: raw.start,
  cueNumber: raw.cue_number,
  label: raw.label ?? null,
  loopDurationMs: raw.loop_duration_ms ?? null,
  orderIndex: raw.order_index ?? null,
})

export const saveCue = async (data: {
  audioId: number
  start: number
  cueNumber: number
  label?: string | null
  loopDurationMs?: number | null
  orderIndex?: number | null
}) => {
  const { audioId, start, cueNumber, label, loopDurationMs, orderIndex } = data
  const existing = await dbClient('cues')
    .where({ audio_id: audioId, cue_number: cueNumber })
    .first()
  if (existing) {
    const update: Record<string, unknown> = { start }
    if (label !== undefined) update.label = label
    if (loopDurationMs !== undefined) update.loop_duration_ms = loopDurationMs
    if (orderIndex !== undefined) update.order_index = orderIndex
    await dbClient('cues')
      .where({ audio_id: audioId, cue_number: cueNumber })
      .update(update)
    return existing.id as number
  }
  const inserted = await dbClient('cues').insert({
    audio_id: audioId,
    start,
    cue_number: cueNumber,
    label: label ?? null,
    loop_duration_ms: loopDurationMs ?? null,
    order_index: orderIndex ?? cueNumber,
  })
  return inserted[0]
}

export const updateCue = async (
  id: number,
  patch: {
    start?: number
    label?: string | null
    loopDurationMs?: number | null
    orderIndex?: number | null
  }
) => {
  const update: Record<string, unknown> = {}
  if (patch.start !== undefined) update.start = patch.start
  if (patch.label !== undefined) update.label = patch.label
  if (patch.loopDurationMs !== undefined)
    update.loop_duration_ms = patch.loopDurationMs
  if (patch.orderIndex !== undefined) update.order_index = patch.orderIndex
  if (Object.keys(update).length === 0) return
  await dbClient('cues').where({ id }).update(update)
}

export const reorderCues = async (audioId: number, orderedIds: number[]) => {
  await dbClient.transaction(async (trx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await trx('cues')
        .where({ id: orderedIds[i], audio_id: audioId })
        .update({ order_index: i + 1 })
    }
  })
}

export const deleteCue = async (id: number) => {
  await dbClient('cues').where({ id }).del()
}

export const deleteAllCues = async (audioId: number) => {
  await dbClient('cues').where({ audio_id: audioId }).del()
}

export const getAllCues = async (audioId: number): Promise<CueRow[]> => {
  const results: RawCueRow[] = await dbClient('cues')
    .where({ audio_id: audioId })
    .select('*')
    .orderByRaw('order_index IS NULL, order_index ASC, start ASC')
  return results.map(fromRaw)
}
