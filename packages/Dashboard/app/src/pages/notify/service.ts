import gqlQuery from '@/utils/gql';
import request from '@/utils/request';

// 获取设备列表
export async function fetchDevicesList(page: number, limit = 10) {
  const offset = limit * (page - 1);
  return gqlQuery(
    `
      query fetchDevicesList($limit: Int, $offset: Int){
        devices: notify_upush_list(limit: $limit, offset: $offset) {
          id,
          registration_id,
          user_uuid,
          user_tags,
          is_active,
          updatedAt,
        }
      }
    `,
    {
      limit,
      offset,
    }
  );
}

export function sendNotify(data: {}) {
  return request.post('/dashboard/api/v2/notify/send', {
    data,
  });
}
