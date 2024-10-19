import React, { forwardRef, ComponentProps } from 'react'
import _ from 'lodash'

import { Box, useDripsyTheme } from 'dripsy'

type PropsT = ComponentProps<typeof Box> &
  React.SVGProps<SVGSVGElement> & {
    as: React.ComponentType<React.SVGProps<SVGSVGElement>>
  }

const Icon = (props: PropsT) => {
  const { theme } = useDripsyTheme()
  const themeColor = props.fill
    ? _.get(theme.colors ?? {}, props.fill)
    : undefined
  const fill = typeof themeColor === 'string' ? themeColor : props.fill

  const newProps = {
    ...props,
    sx: {
      ...props.sx,
      fill,
    },
  }
  return <Box {...newProps} />
}

export default Icon
