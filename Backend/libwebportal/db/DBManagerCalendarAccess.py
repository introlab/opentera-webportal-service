from sqlalchemy import and_, or_, literal, String, cast
from datetime import datetime, timedelta

from flask_babel import gettext
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.exc import InvalidRequestError

from libwebportal.db.models.WebPortalCalendarEvent import WebPortalCalendarEvent


class DBManagerCalendarAccess:

    def query_event_by_id(self, event_id: int):
        event = WebPortalCalendarEvent.get_event_by_id(event_id)
        return event

    def query_event_for_user(self, user_uuid, start_date, end_date):
        start_date = datetime.strptime(start_date, '%d-%m-%Y')
        end_date = datetime.strptime(end_date, '%d-%m-%Y')
        start_date = start_date.replace(hour=0, minute=0, second=0)
        end_date = end_date.replace(hour=23, minute=59, second=59)

        events = WebPortalCalendarEvent.query.filter(
            WebPortalCalendarEvent.event_start_datetime.between(start_date, end_date),
            WebPortalCalendarEvent.user_uuid == user_uuid). \
            order_by(WebPortalCalendarEvent.event_start_datetime.asc()).all()

        if events:
            return events
        return []

    def query_event_for_participants(self, participant_uuids, start_date, end_date):
        start_date = datetime.strptime(start_date, '%d-%m-%Y')
        end_date = datetime.strptime(end_date, '%d-%m-%Y')
        start_date = start_date.replace(hour=0, minute=0, second=0)
        end_date = end_date.replace(hour=23, minute=59, second=59)

        events = WebPortalCalendarEvent.query.filter(
            WebPortalCalendarEvent.event_start_datetime.between(start_date, end_date),
            WebPortalCalendarEvent.session_participant_uuids.contains(cast([participant_uuids], ARRAY(String)))) \
            .order_by(WebPortalCalendarEvent.event_start_datetime.asc()).all()

        if events:
            return events
        return []

    def query_overlaps(self, start_time, end_time, user_uuid=None, participants_uuids=[], id_event=None):
        # Add 1 seconds as a buffer for consecutive time slots
        end_time = end_time - timedelta(seconds=1)
        start_time = start_time + timedelta(seconds=1)
        queries = [or_(WebPortalCalendarEvent.event_start_datetime.between(start_time, end_time),
                       WebPortalCalendarEvent.event_end_datetime.between(start_time, end_time),
                       literal(start_time).between(WebPortalCalendarEvent.event_start_datetime,
                                                   WebPortalCalendarEvent.event_end_datetime),
                       literal(end_time).between(WebPortalCalendarEvent.event_start_datetime,
                                                 WebPortalCalendarEvent.event_end_datetime))]
        if id_event is not None:
            queries.append(WebPortalCalendarEvent.id_event != id_event)
        if user_uuid is not None:
            queries.append(WebPortalCalendarEvent.user_uuid == user_uuid)
        elif participants_uuids is not []:
            queries.append(
                WebPortalCalendarEvent.session_participant_uuids.overlap(cast([participants_uuids], ARRAY(String))))

        events = WebPortalCalendarEvent.query.filter(*queries).order_by(
            WebPortalCalendarEvent.event_start_datetime.asc()).all()

        if events:
            return events
        return []

    def query_next_three(self, user_uuid=None, participants_uuids=[]):
        now = datetime.now()
        queries = [WebPortalCalendarEvent.event_end_datetime > now]
        if user_uuid is not None:
            queries.append(WebPortalCalendarEvent.user_uuid == user_uuid)
        elif participants_uuids is not []:
            queries.append(
                WebPortalCalendarEvent.session_participant_uuids.overlap(cast([participants_uuids], ARRAY(String))))

        events = WebPortalCalendarEvent.query.filter(*queries).order_by(
            WebPortalCalendarEvent.event_start_datetime.asc()).limit(3).all()

        if events:
            return events
        return []

    def delete_event_with_session_uuid(self, session_info):
        try:
            WebPortalCalendarEvent.delete_with_session_uuid(session_info['session_uuid'])
        except InvalidRequestError as e:
            return gettext('Invalid request'), 500

    def update_event_after_session_update(self, session_infos):
        pass
