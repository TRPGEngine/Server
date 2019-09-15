import gqlQuery from '@/utils/gql';
import request from '@/utils/request';
import { DeployVersionType } from './data';

// 获取获取发布列表
export async function fetchDeployList(page: number, limit = 10) {
  const offset = limit * (page - 1);
  return gqlQuery<DeployVersionType>(
    `
      query fetchDeployList($limit: Int, $offset: Int){
        deploys: deploy_version_list(limit: $limit, offset: $offset) {
          id,
          version,
          platform,
          describe,
          createdAt,
        }
      }
    `,
    {
      limit,
      offset,
    }
  );
}

/**
 * 创建一条部署记录
 * @param data 数据
 */
export function createDeploy(data: {}) {
  return request.post('/dashboard/api/v2/deploy/create', {
    data,
  });
}
