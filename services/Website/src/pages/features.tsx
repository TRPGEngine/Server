import React from 'react';
import { Features } from '../components/Features';

export const PureFeature: React.FC = React.memo(() => {
  return <Features />;
});
PureFeature.displayName = 'PureFeature';

export default PureFeature;
