from sqlalchemy import and_, or_, literal
from datetime import datetime
from libwebportal.db.models.WebPortalCalendarEvent import WebPortalCalendarEvent


class DBManagerCalendarAccess:

    def query_event_by_id(self, event_id: int):
        event = WebPortalCalendarEvent.get_event_by_id(event_id)
        return event

    def query_event_by_user(self, user_uuid, start_date, end_date):
        start_date = datetime.strptime(start_date, '%d-%m-%Y').date()
        end_date = datetime.strptime(end_date, '%d-%m-%Y')
        end_date = end_date.replace(hour=23, minute=59, second=59)

        events = WebPortalCalendarEvent.query.filter(
            WebPortalCalendarEvent.event_start_datetime.between(start_date, end_date),
            WebPortalCalendarEvent.user_uuid == user_uuid). \
            order_by(WebPortalCalendarEvent.event_start_datetime.asc()).all()

        if events:
            return events
        return []

    def query_overlaps(self, user_uuid, start_time, end_time, id_event=0):

        events = WebPortalCalendarEvent.query.filter(
            and_(WebPortalCalendarEvent.id_event != id_event,
                 or_(WebPortalCalendarEvent.event_start_datetime.between(start_time, end_time),
                     WebPortalCalendarEvent.event_end_datetime.between(start_time, end_time),
                     literal(start_time).between(WebPortalCalendarEvent.event_start_datetime,
                                                 WebPortalCalendarEvent.event_end_datetime),
                     literal(end_time).between(WebPortalCalendarEvent.event_start_datetime,
                                               WebPortalCalendarEvent.event_end_datetime))),
            WebPortalCalendarEvent.user_uuid == user_uuid).all()

        if events:
            return events
        return []

    def query_next_three(self, user_uuid):
        now = datetime.now()
        events = WebPortalCalendarEvent.query.filter(WebPortalCalendarEvent.event_end_datetime > now,
                                                     WebPortalCalendarEvent.user_uuid == user_uuid). \
            order_by(WebPortalCalendarEvent.event_start_datetime.asc()).limit(3).all()

        if events:
            return events
        return []
