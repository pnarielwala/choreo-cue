import React, { ComponentProps, useState } from 'react';

import { Pressable as DripsyPressable } from 'dripsy';

type PropsT = ComponentProps<typeof DripsyPressable>;

const Pressable = (props: PropsT) => {
  const [pressed, setPressed] = useState(false);
  return (
    <DripsyPressable
      {...props}
      onPressIn={(event) => {
        props.onPressIn?.(event);
        setPressed(true);
      }}
      onPressOut={(event) => {
        props.onPressOut?.(event);
        setPressed(false);
      }}
      sx={{
        ...props.sx,
        opacity: pressed ? 0.2 : 1,
      }}
    />
  );
};

export default Pressable;
