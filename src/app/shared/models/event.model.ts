export class Event {
  id_event?: number;
  user_uuid?: string;
  session_uuid?: string;
  event_name?: string;
  event_start_datetime?: string | Date;
  event_end_datetime?: string | Date;
  event_static_url?: string;
  session_participant_uuids?: string[];
  session?: any;
}
