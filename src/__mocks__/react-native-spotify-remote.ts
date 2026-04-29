const noop = async () => {}

export const remote = {
  isConnectedAsync: async () => false,
  connect: noop,
  disconnect: noop,
  playUri: noop,
  playItem: noop,
  playItemWithIndex: noop,
  queueUri: noop,
  seek: noop,
  resume: noop,
  pause: noop,
  skipToNext: noop,
  skipToPrevious: noop,
  setShuffling: noop,
  setRepeatMode: noop,
  getPlayerState: async () => null,
  getRootContentItems: async () => [],
  getRecommendedContentItems: async () => [],
  getChildrenOfItem: async () => [],
  getContentItemForUri: async () => undefined,
  getCrossfadeState: async () => ({ isEnabled: false, duration: 0 }),
  setPlaying: noop,
  addListener: () => {},
  removeListener: () => {},
  removeAllListeners: () => {},
}

export const auth = {
  initialize: async () => '',
  authorize: async () => ({
    accessToken: '',
    refreshToken: '',
    expirationDate: '',
    expired: true,
    scope: 0,
  }),
  endSession: noop,
  getSession: async () => undefined,
}

export enum ApiScope {
  AppRemoteControlScope = 'app-remote-control',
  UserModifyPlaybackStateScope = 'user-modify-playback-state',
  UserReadPlaybackStateScope = 'user-read-playback-state',
}

export enum RepeatMode {
  Off = 0,
  Track = 1,
  Context = 2,
}

export default { remote, auth }
