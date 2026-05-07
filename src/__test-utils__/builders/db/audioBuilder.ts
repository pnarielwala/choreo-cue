import { Audio } from 'knex/types/tables'

const baseAudio: Audio = {
  id: 1,
  name: 'Bye Bye Bye - NSYNC',
  created_at: new Date().toISOString(),
  last_opened_at: new Date().toISOString(),
  path: 'file://audioPath',
  source: 'iCloud',
  repeat_mode: 'off',
}

export const anAudio = (overrides: Partial<Audio> = {}): Audio => ({
  ...baseAudio,
  ...overrides,
})
