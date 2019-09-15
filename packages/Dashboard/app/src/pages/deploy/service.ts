import gqlQuery from '@/utils/gql';
import { DeployVersionType } from './data';
// import request from '@/utils/request';

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
