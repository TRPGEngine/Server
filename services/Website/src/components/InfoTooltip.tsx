import Tooltip from 'rc-tooltip';
import React from 'react';

/**
 * 用于展示信息的容器
 */
export const InfoTooltip: React.FC<{
  text: (() => React.ReactNode) | React.ReactNode;
}> = React.memo((props) => {
  return (
    <Tooltip placement="top" overlay={props.text} destroyTooltipOnHide={true}>
      <div style={{ display: 'inline-block' }}>{props.children}</div>
    </Tooltip>
  );
});
InfoTooltip.displayName = 'InfoTooltip';
