import _get from 'lodash/get';
import _find from 'lodash/find';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

interface InternalUser {
  name: string;
  desc: string;
  url: string;
  imageUrl: string;
}

function useInternalUser(name: string): InternalUser | null {
  const { siteConfig } = useDocusaurusContext();

  const users = _get(siteConfig, 'customFields.users');
  const user = _find(users, ['name', name]);

  return user;
}

export default useInternalUser;
