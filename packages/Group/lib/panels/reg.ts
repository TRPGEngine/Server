import { GroupPanelType, GroupPanel } from '../models/panel';
import _ from 'lodash';

const panels = new Map<GroupPanelType, GroupPanelHandler>();

interface GroupPanelInfo {
  name: string;
  type: GroupPanelType;
  groupUUID: string; // 相关团UUID
  userUUID: string; // 操作人UUID
}

export interface GroupPanelDestroyTargetRecordOptions {
  force?: boolean;
}

interface GroupPanelHandler {
  onCreate: (
    panelInfo: GroupPanelInfo
  ) => Promise<{
    targetUUID?: string;
    other?: {};
  }>;

  onDestroy: (
    panel: GroupPanel,
    options: GroupPanelDestroyTargetRecordOptions
  ) => Promise<void>;
}

/**
 * 注册面板
 * @param type 面板类型
 * @param handler 面板回调
 */
export function regGroupPanelHandler(
  type: GroupPanelType,
  handler: GroupPanelHandler
) {
  if (panels.has(type)) {
    throw new Error(`注册团面板失败: 已存在该面板 ${type}`);
  }

  panels.set(type, handler);
}

/**
 * 面板回调
 * @param type 面板类型
 */
function getGroupPanelHandler(type: GroupPanelType): GroupPanelHandler | null {
  if (!panels.has(type)) {
    return null;
  }

  return panels.get(type);
}

/**
 * 处理团面板创建事件
 */
export async function handleGroupPanelCreate(
  type: GroupPanelType,
  panelInfo: GroupPanelInfo
) {
  const groupPanelHandler = getGroupPanelHandler(type);

  if (_.isNull(groupPanelHandler)) {
    if (type !== 'test') {
      console.error('未知的面板', type);
    }
    return;
  }

  return await groupPanelHandler.onCreate(panelInfo);
}

export async function handleGroupPanelDestroy(
  type: GroupPanelType,
  panel: GroupPanel,
  options: GroupPanelDestroyTargetRecordOptions
) {
  const groupPanelHandler = getGroupPanelHandler(type);

  if (_.isNull(groupPanelHandler)) {
    if (type !== 'test') {
      console.error('未知的面板', type);
    }
    return;
  }

  return await groupPanelHandler.onDestroy(panel, options);
}
