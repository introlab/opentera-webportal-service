import {App} from '@shared/models/app.model';
import {Site} from '@shared/models/site.model';

export class Account {
  id?: number;
  login_type?: string;
  fullname?: string;
  uuid?: string;
  is_super_admin?: boolean;
  project_id?: number;
  apps?: App[];
  user?: any;
  sites?: Site[];
}
