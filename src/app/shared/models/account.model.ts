import {Application} from '@shared/models/application.model';
import {Site} from '@shared/models/site.model';

export class Account {
  login_id?: number;
  login_type?: string;
  fullname?: string;
  username?: string;
  login_uuid?: string;
  is_super_admin?: boolean;
  project_id?: number;
  project_name?: string;
  apps?: Application[];
  user?: any;
  sites?: Site[];
}
