declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.ComponentType<
    React.SVGProps<SVGSVGElement>
  >;
  export default ReactComponent;
}
