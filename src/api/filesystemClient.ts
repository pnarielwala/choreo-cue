import * as FileSystem from 'expo-file-system'
import * as DocumentPicker from 'expo-document-picker'
import analytics from 'resources/analytics'

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

export const saveFileToDirectory = async (
  sourceFile: DocumentPicker.DocumentPickerAsset
) => {
  const destinationPath = `${FileSystem.documentDirectory}${encodeURI(sourceFile.name)}`

  if (destinationPath === sourceFile.uri) {
    // file is already in the document directory
    return sourceFile
  }

  if (FileSystem.documentDirectory) {
    await FileSystem.copyAsync({
      from: sourceFile.uri,
      to: destinationPath,
    })

    // save file path to sqlite
  } else {
    analytics.error('FileSystem.documentDirectory is undefined')
  }

  return {
    ...sourceFile,
    uri: destinationPath,
  }
}
