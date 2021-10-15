from flask import jsonify, request
from flask_restx import Resource, reqparse, inputs
from sqlalchemy.exc import InvalidRequestError
from sqlalchemy import exc
from flask_babel import gettext
from datetime import datetime, timedelta

from FlaskModule import default_api_ns as api
from opentera.services.ServiceAccessManager import ServiceAccessManager, current_user_client

from WebPortalService import WebPortalService
from libwebportal.db.DBManager import DBManager
from libwebportal.db.models.WebPortalCalendarEvent import WebPortalCalendarEvent
import Globals

# Parser definition(s)
get_parser = api.parser()
get_parser.add_argument('id_event', type=int, help='ID of the event to query')
get_parser.add_argument('start_date', type=str, help='Date of first day to query')
get_parser.add_argument('end_date', type=str, help='Date of last day to query')
get_parser.add_argument('overlaps', type=inputs.boolean, help='Return only overlapping events')
get_parser.add_argument('three', type=inputs.boolean, help='Return only three next events')
get_parser.add_argument('full', type=inputs.boolean, help='Get additional information for event')

post_parser = api.parser()
delete_parser = reqparse.RequestParser()
delete_parser.add_argument('id', type=int, help='Event ID to delete', required=True)


class QueryCalendar(Resource):

    def __init__(self, _api, *args, **kwargs):
        Resource.__init__(self, _api, *args, **kwargs)
        self.module = kwargs.get('flaskModule', None)

    @api.expect(get_parser)
    @api.doc(description='Get calendar events.',
             responses={200: 'Success - returns calendar events',
                        500: 'Database error'})
    @ServiceAccessManager.token_required(allow_static_tokens=True, allow_dynamic_tokens=True)
    def get(self):
        parser = get_parser
        args = parser.parse_args()
        calendar_access = DBManager.calendar_access()
        participant_uuids = request.args.getlist('participant_uuid', type=str)

        events = []
        if args['overlaps'] is True:
            if not args['start_date'] or not args['end_date']:
                return 'Missing dates arguments', 400
            elif participant_uuids:
                # Find session overlaps for participants
                start_time = datetime.fromisoformat(args['start_date'])
                end_time = datetime.fromisoformat(args['end_date'])
                events = calendar_access.query_overlaps(start_time, end_time, participants_uuids=participant_uuids)
            elif current_user_client:
                # Find event overlaps for connected user
                start_time = datetime.fromisoformat(args['start_date'])
                end_time = datetime.fromisoformat(args['end_date'])
                events = calendar_access.query_overlaps(start_time, end_time, user_uuid=current_user_client.user_uuid)
        elif args['three']:
            if participant_uuids:
                # Find next three events for participant
                events = calendar_access.query_next_three(participants_uuids=participant_uuids)
            elif current_user_client:
                # Find next three events
                events = calendar_access.query_next_three(user_uuid=current_user_client.user_uuid)
        else:
            if args['id_event']:
                # Get infos of event
                events = [calendar_access.query_event_by_id(event_id=args['id_event'])]
            elif participant_uuids:
                if not args['start_date'] or not args['end_date']:
                    return 'Missing date arguments', 400
                else:
                    # Get events for participants
                    events = calendar_access.query_event_for_participants(participant_uuids,
                                                                          start_date=args['start_date'],
                                                                          end_date=args['end_date'])
            elif current_user_client:
                if not args['start_date'] or not args['end_date']:
                    return 'Missing date arguments', 400
                else:
                    # Get events for connected user
                    events = calendar_access.query_event_for_user(user_uuid=current_user_client.user_uuid,
                                                                  start_date=args['start_date'],
                                                                  end_date=args['end_date'])

        try:
            events_list = []

            for event in events:
                event_json = event.to_json()

                if not args['overlaps']:
                    # Get the name of the user who booked the event
                    endpoint = '/api/service/users'
                    params = {'user_uuid': event.user_uuid}
                    response = Globals.service.get_from_opentera(endpoint, params)
                    if response.status_code == 200 and response is not None:
                        user = response.json()
                        event_json['user_fullname'] = user['user_firstname'] + ' ' + user['user_lastname']

                # If event has a session associated to it, get it from OpenTera
                if event.session_uuid and args['full'] is True:
                    endpoint = '/api/service/sessions'
                    params = {'uuid_session': event.session_uuid, 'with_session_type': True}
                    response = Globals.service.get_from_opentera(endpoint, params)

                    if response.status_code == 200:
                        session_info = response.json()
                        event_json['session'] = session_info
                    else:
                        return 'Unauthorized', 403

                events_list.append(event_json)

            return jsonify(events_list)

        except InvalidRequestError as e:
            self.module.logger.log_error(self.module.module_name,
                                         QueryCalendar.__name__,
                                         'get', 500, 'InvalidRequestError', str(e))
            return gettext('Invalid request'), 500

    @api.expect(post_parser)
    @api.doc(description='Create / update events. id_event must be set to "0" to create a new event.'
                         'An event can be created/modified if the user has admin rights to the related site.',
             responses={200: 'Success',
                        403: 'Logged user can\'t create/update the specified event',
                        400: 'Badly formed JSON or missing fields(id_site) in the JSON body',
                        500: 'Internal error occurred when saving event'})
    @ServiceAccessManager.token_required()
    def post(self):
        calendar_access = DBManager.calendar_access()
        # Using request.json instead of parser, since parser messes up the json!
        event_json = request.json['event']

        # Validate if we have an id
        if 'id_event' not in event_json:
            return gettext('Missing id_event argument'), 400

        start_time = datetime.fromisoformat(event_json['event_start_datetime'])
        end_time = datetime.fromisoformat(event_json['event_end_datetime'])

        # Don't allow edition of passed events
        if end_time < datetime.now():
            return gettext('Can\'t edit a passed event.'), 400

        # Check if there is already a event for that room between the times of the event
        overlapping_events = calendar_access.query_overlaps(start_time, end_time, user_uuid=event_json['user_uuid'],
                                                            id_event=event_json['id_event'])
        if overlapping_events:
            return gettext('An event already uses this time slot'), 400

        # Create the session associated with the event
        if 'session' in event_json:
            session = event_json['session']
            endpoint = '/api/service/sessions'
            params = {'session': session}
            response = Globals.service.post_to_opentera(endpoint, params)

            if response.status_code == 200:
                session_info = response.json()
                event_json['session_uuid'] = session_info[0]['session_uuid']
                event_json['session'] = session_info
            else:
                return 'Unauthorized', 403

        # Do the update
        if event_json['id_event'] > 0:
            # Already existing
            try:
                WebPortalCalendarEvent.update(event_json['id_event'], event_json)
            except exc.SQLAlchemyError as e:
                import sys
                print(sys.exc_info())
                self.module.logger.log_error(self.module.module_name,
                                             QueryCalendar.__name__,
                                             'post', 500, 'Database error', str(e))
                return gettext('Database error'), 500
        else:
            # New
            try:
                new_event = WebPortalCalendarEvent()
                new_event.from_json(event_json)
                WebPortalCalendarEvent.insert(new_event)
                # Update ID for further use
                event_json['id_event'] = new_event.id_event
            except exc.SQLAlchemyError as e:
                import sys
                print(sys.exc_info())
                self.module.logger.log_error(self.module.module_name,
                                             QueryCalendar.__name__,
                                             'post', 500, 'Database error', str(e))
                return gettext('Database error'), 500

        # TODO: Publish update to everyone who is subscribed to sites update...
        update_event = calendar_access.query_event_by_id(event_json['id_event'])

        return jsonify([update_event.to_json()])

    @api.expect(delete_parser)
    @api.doc(description='Delete a specific event',
             responses={200: 'Success',
                        403: 'Logged user can\'t delete event (only site admin can delete)',
                        500: 'Database error.'})
    @ServiceAccessManager.token_required()
    def delete(self):
        parser = delete_parser
        args = parser.parse_args()
        # current_user = TeraUser.get_user_by_uuid(session['_user_id'])
        id_to_delete = args['id']

        # Check if current user can delete
        # TODO Only site admins can delete an event
        event = WebPortalCalendarEvent.get_event_by_id(id_to_delete)

        # If we are here, we are allowed to delete.
        try:
            WebPortalCalendarEvent.delete(id_to_delete)
        except exc.SQLAlchemyError as e:
            import sys
            print(sys.exc_info())
            self.module.logger.log_error(self.module.module_name,
                                         QueryCalendar.__name__,
                                         'delete', 500, 'Database error', str(e))
            return gettext('Database error'), 500

        return '', 200
