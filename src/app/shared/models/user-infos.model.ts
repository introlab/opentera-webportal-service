import {App} from '@shared/models/app.model';

export class UserInfos {
  id?: number;
  login_type?: string;
  fullname?: string;
  uuid?: string;
  is_super_admin?: boolean;
  project_id?: number;
  apps?: App[];
}
