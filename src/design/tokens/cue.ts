export type CueSlot = 1 | 2 | 3 | 4

export const getCueColorKey = (slot: CueSlot) =>
  `cueSlot${slot}` as `cueSlot${CueSlot}`
