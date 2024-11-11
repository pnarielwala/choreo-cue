import { runtimeVersion } from 'expo-updates'
import { useState, useEffect } from 'react'

export const checkForUpdateAsync = jest.fn(async () => {
  return {
    isAvailable: false,
    currentlyRunning: {
      manifest: {},
      runtimeVersion: undefined,
      channel: undefined,
    },
    manifest: {},
  }
})

export const fetchUpdateAsync = jest.fn(async () => {
  return {
    isNew: false,
    manifest: {},
  }
})

export const reloadAsync = jest.fn(async () => {
  return
})

export const useUpdates = jest.fn(() => {
  return {
    isAvailable: false,
    manifest: {},
    currentlyRunning: {
      manifest: {},
      runtimeVersion: undefined,
      channel: undefined,
    },
    isUpdatePending: false,
    downloadError: undefined,
    checkError: undefined,
    initializationError: undefined,
  }
})
