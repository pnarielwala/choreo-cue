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
