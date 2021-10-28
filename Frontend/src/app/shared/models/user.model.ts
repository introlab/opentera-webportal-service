import {Project} from './project.model';
import {Site} from './site.model';

export class User {
  id_user?: number;
  user_email?: string;
  user_enabled?: boolean;
  user_firstname?: string;
  user_lastname?: string;
  user_lastonline?: Date;
  user_notes?: string;
  user_profile?: string;
  user_superadmin?: boolean;
  user_username?: string;
  user_password?: string;
  user_uuid?: string;
  projects?: Project[];
  sites?: Site[];
}
