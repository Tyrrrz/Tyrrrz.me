import { Link as InternalLink } from 'gatsby';
import { OutboundLink as ExternalLink } from 'gatsby-plugin-google-analytics';
import React from 'react';

import { isAbsoluteUrl } from '../../utils';

export default ({ to, ...props }) => (isAbsoluteUrl(to) ? <ExternalLink href={to} {...props} /> : <InternalLink to={to} {...props} />);
