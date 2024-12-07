import { useState, useEffect } from 'react'

const useIsScreenActive = (props: { navigation: any }) => {
  const { navigation } = props
  const [isScreenActive, setIsScreenActive] = useState(true)

  useEffect(() => {
    const onFocus = () => setIsScreenActive(true)
    const onBlur = () => setIsScreenActive(false)

    navigation.addListener('focus', onFocus)
    navigation.addListener('blur', onBlur)

    return () => {
      navigation.removeListener('focus', onFocus)
      navigation.removeListener('blur', onBlur)
    }
  }, [navigation])

  return isScreenActive
}

export default useIsScreenActive
