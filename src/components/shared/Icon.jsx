import MdiIcon from '@mdi/react';
import React from 'react';

export default ({ ...props }) => (
  <MdiIcon
    size="1em"
    css={{
      marginTop: '0.06em',
      verticalAlign: 'top'
    }}
    {...props}
  />
);
