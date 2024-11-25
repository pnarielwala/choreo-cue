import { faker } from '@faker-js/faker'

const baseUserDevice: SpotifyApi.UserDevice = {
  id: '123',
  is_active: true,
  is_restricted: false,
  name: 'iPhone',
  type: 'Smartphone',
  is_private_session: false,
  volume_percent: 100,
}

export const aUserDevice = (override: Partial<SpotifyApi.UserDevice> = {}) => ({
  ...baseUserDevice,
  id: faker.string.uuid(),
  ...override,
})

export const anActiveUserDevice = (
  override: Partial<SpotifyApi.UserDevice> = {}
) => ({
  ...aUserDevice(override),
  is_active: true,
})

export const anInactiveUserDevice = (
  override: Partial<SpotifyApi.UserDevice> = {}
) => ({
  ...aUserDevice(override),
  is_active: false,
})

const baseTrack: SpotifyApi.TrackObjectFull = {
  album: {
    album_type: 'album',
    artists: [],
    available_markets: [],
    external_urls: {
      spotify: 'https://open.spotify.com/album/0sNOF9WDwhWunNAHPD3Baj',
    },
    href: 'https://api.spotify.com/v1/albums/0sNOF9WDwhWunNAHPD3Baj',
    id: '0sNOF9WDwhWunNAHPD3Baj',
    images: [],
    name: 'The Eminem Show',
    release_date: '2002-05-26',
    release_date_precision: 'day',
    total_tracks: 20,
    type: 'album',
    uri: 'spotify:album:0sNOF9WDwhWunNAHPD3Baj',
  },
  artists: [],
  available_markets: [],
  disc_number: 1,
  duration_ms: 284880,
  explicit: true,
  external_ids: {
    isrc: 'USIR10211062',
  },
  external_urls: {
    spotify: 'https://open.spotify.com/track/3yfqSUWxFvZELEM4PmlwIR',
  },
  href: 'https://api.spotify.com/v1/tracks/3yfqSUWxFvZELEM4PmlwIR',
  id: '3yfqSUWxFvZELEM4PmlwIR',
  is_local: false,
  name: 'Without Me',
  popularity: 78,
  preview_url: 'https://p.scdn.co/mp3-preview/0b3b3e3b3e6',
  track_number: 2,
  type: 'track',
  uri: 'spotify:track:3yfqSUWxFvZELEM4PmlwIR',
}

export const aTrack = (override: Partial<SpotifyApi.TrackObjectFull> = {}) => ({
  ...baseTrack,
  id: faker.string.uuid(),
  ...override,
})

const baseAlbum: SpotifyApi.AlbumObjectFull = {
  album_type: 'album',
  artists: [],
  available_markets: [],
  external_urls: {
    spotify: 'https://open.spotify.com/album/0sNOF9WDwhWunNAHPD3Baj',
  },
  href: 'https://api.spotify.com/v1/albums/0sNOF9WDwhWunNAHPD3Baj',
  id: '0sNOF9WDwhWunNAHPD3Baj',
  images: [],
  name: 'The Eminem Show',
  release_date: '2002-05-26',
  release_date_precision: 'day',
  total_tracks: 20,
  type: 'album',
  uri: 'spotify:album:0sNOF9WDwhWunNAHPD3Baj',
  copyrights: [],
  external_ids: {
    upc: '606949354247',
  },
  genres: [],
  label: 'Aftermath / Interscope',
  popularity: 82,
  tracks: {
    href: 'https://api.spotify.com/v1/albums/0sNOF9WDwhWunNAHPD3Baj/tracks?offset=0&limit=50',
    items: [],
    limit: 50,
    next: null,
    offset: 0,
    previous: null,
    total: 20,
  },
}

export const anAlbum = (
  override: Partial<SpotifyApi.AlbumObjectFull> = {}
) => ({
  ...baseAlbum,
  id: faker.string.uuid(),
  ...override,
})

const baseArtist: SpotifyApi.ArtistObjectFull = {
  external_urls: {
    spotify: 'https://open.spotify.com/artist/7dGJo4pcD2V6oG8kP0tJRR',
  },
  followers: {
    href: null,
    total: 23523846,
  },
  genres: [],
  href: 'https://api.spotify.com/v1/artists/7dGJo4pcD2V6oG8kP0tJRR',
  id: '7dGJo4pcD2V6oG8kP0tJRR',
  images: [],
  name: 'Eminem',
  popularity: 93,
  type: 'artist',
  uri: 'spotify:artist:7dGJo4pcD2V6oG8kP0tJRR',
}

export const anArtist = (
  override: Partial<SpotifyApi.ArtistObjectFull> = {}
) => ({
  ...baseArtist,
  id: faker.string.uuid(),
  ...override,
})
