import React, { useEffect, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View as RNView,
} from 'react-native'
import { Text, View } from 'dripsy'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import useTheme from './useTheme'

type PropsT = {
  isVisible: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

const SHOW_DURATION = 250
const HIDE_DURATION = 200

const BottomSheet = ({ isVisible, onClose, title, children }: PropsT) => {
  const theme = useTheme()
  const colors = theme.colors as Record<string, string>
  const insets = useSafeAreaInsets()
  const screenHeight = Dimensions.get('screen').height

  const [mounted, setMounted] = useState(isVisible)
  const translateY = useRef(new Animated.Value(screenHeight)).current
  const backdropOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isVisible) {
      setMounted(true)
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: SHOW_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: SHOW_DURATION,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: screenHeight,
          duration: HIDE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: HIDE_DURATION,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false)
      })
    }
  }, [isVisible, screenHeight, translateY, backdropOpacity])

  if (!mounted) return null

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexEnd}
      >
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}
          pointerEvents="box-none"
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityLabel="Close"
          >
            <RNView
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 'rgba(0,0,0,0.4)' },
              ]}
            />
          </Pressable>
        </Animated.View>

        <Animated.View style={{ transform: [{ translateY }] }}>
          <View
            style={{ minHeight: screenHeight / 2 }}
            sx={{
              backgroundColor: 'surfaceElevated',
              borderTopLeftRadius: 'xl',
              borderTopRightRadius: 'xl',
              paddingHorizontal: 4,
              paddingTop: 3,
              paddingBottom: Math.max(insets.bottom, 16) + 8,
            }}
          >
            <RNView
              style={{
                alignSelf: 'center',
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.border,
                marginBottom: 12,
              }}
            />
            {title ? (
              <Text variant="h2" sx={{ mt: 0, mb: 3 }}>
                {title}
              </Text>
            ) : null}
            {children}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  flexEnd: { flex: 1, justifyContent: 'flex-end' },
})

export default BottomSheet
