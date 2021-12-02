import {Participant} from '@shared/models/participant.model';
import {SessionType} from '@shared/models/session-type.model';

export class Session {
  id_session?: number;
  session_uuid?: string;
  id_session_type?: number;
  id_creator_user?: number;
  id_creator_device?: number;
  id_creator_participant?: number;
  id_creator_service?: number;
  session_name?: string;
  session_start_datetime?: Date | string;
  session_duration?: number;
  session_status?: number;
  session_comments?: string;
  session_parameters?: string;
  session_participants?: Participant[];
  session_participants_uuids?: string[];
  session_users_uuids?: string[];
  session_type?: SessionType;
}
