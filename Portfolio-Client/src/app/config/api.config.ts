import { environment } from '../../environments/environment';

export const API_CONFIG = {
  baseUrl: environment.baseUrl,
  endpoints: {
    project: 'Project',
    auth: 'auth',
    profile: 'profile',
    tags: 'Tags',
    contactMethods: 'ContactMethods'
  }
};
