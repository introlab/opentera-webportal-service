export class SessionManager {
  session_uuid?: string;
  id_service?: number;
  id_session?: number;
  id_creator_user?: number;
  id_session_type?: number;
  session_participants?: string[];
  session_users?: string[];
  session_devices?: string[];
  action?: string;
  parameters?: string;

}
