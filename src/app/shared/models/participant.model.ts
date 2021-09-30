import {Project} from '@shared/models/project.model';
import {Group} from '@shared/models/group.model';
import {Site} from '@shared/models/site.model';

export class Participant {
  id_participant?: number;
  id_participant_group?: number;
  id_project?: number;
  id_site?: number;
  participant_enabled?: boolean;
  participant_lastonline?: Date;
  participant_name?: string;
  participant_uuid?: string;
  participant_username?: string;
  participant_email?: string;
  participant_password?: string;
  participant_token?: string;
  participant_login_enabled?: boolean;
  participant_participant_group?: Group;
  participant_project?: Project;
  site?: Site;
  connection_url?: string;
  participant_token_enabled?: boolean;
}
