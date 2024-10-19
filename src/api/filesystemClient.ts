import * as FileSystem from 'expo-file-system'

export const deleteAllLocalFiles = async () => {
  const contents = await FileSystem.readDirectoryAsync(
    String(FileSystem.documentDirectory)
  )

  if (contents) {
    const promises = contents.map((fileName) =>
      FileSystem.deleteAsync(FileSystem.documentDirectory + encodeURI(fileName))
    )

    await Promise.all(promises)
  }
}
