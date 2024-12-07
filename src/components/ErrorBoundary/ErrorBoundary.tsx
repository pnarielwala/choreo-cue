import { H1, View } from 'design'
import React from 'react'

import analytics from 'resources/analytics'

type PropsT = {
  children: React.ReactNode
}

type StateT = {
  hasError: boolean
}

class ErrorBoundary extends React.Component<PropsT, StateT> {
  constructor(props: PropsT) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    analytics.critical(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <View>
          <H1>Something went wrong.</H1>
        </View>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
