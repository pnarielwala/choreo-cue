import { File, Directory, Paths } from 'expo-file-system'
import * as DocumentPicker from 'expo-document-picker'
import analytics from 'resources/analytics'

export const deleteAllLocalFiles = async () => {
  const documentDir = Paths.document
  const contents = documentDir.list()

  if (contents) {
    const promises = contents.map((item) => {
      return new Promise<void>((resolve) => {
        item.delete()
        resolve()
      })
    })

    await Promise.all(promises)
  }
}

export const saveFileToDirectory = async (
  sourceFile: DocumentPicker.DocumentPickerAsset
) => {
  const destinationFile = new File(Paths.document, sourceFile.name)

  if (destinationFile.uri === sourceFile.uri) {
    // file is already in the document directory
    return sourceFile
  }

  try {
    const sourceFileInstance = new File(sourceFile.uri)
    sourceFileInstance.copy(destinationFile)

    // save file path to sqlite
  } catch (error) {
    analytics.error('Failed to copy file to document directory')
  }

  return {
    ...sourceFile,
    uri: destinationFile.uri,
  }
}
