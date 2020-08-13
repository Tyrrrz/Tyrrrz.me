import MdiIcon from '@mdi/react';
import React from 'react';

export default ({ ...props }) => (
  <MdiIcon
    size="1rem"
    css={{
      marginTop: '0.06rem',
      verticalAlign: 'top'
    }}
    {...props}
  />
);
