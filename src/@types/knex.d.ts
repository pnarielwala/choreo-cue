import { Knex } from 'knex'

declare module 'knex/types/tables' {
  interface Migrations {
    version: number
  }

  interface Audio {
    id: number
    name: string
    path: string
    source: 'iCloud' | 'Dropbox' | 'Spotify' | 'YT' | 'Apple'
    created_at: string
    last_opened_at: string | null
    repeat_mode: 'off' | 'song' | 'cue'
  }

  interface Cue {
    id: number
    audio_id: number
    start: number
    cue_number: number
    label: string | null
    loop_duration_ms: number | null
    order_index: number | null
  }

  interface Tables {
    migrations: Migrations
    audio: Audio
    cues: Cue
  }
}
