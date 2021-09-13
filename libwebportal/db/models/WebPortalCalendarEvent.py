from opentera.db.Base import BaseModel
import datetime
from datetime import timedelta

from libwebportal.db.DBGlobals import db


class WebPortalCalendarEvent(db.Model, BaseModel):
    __tablename__ = "t_calendar_events"
    id_event = db.Column(db.Integer, db.Sequence('id_event_sequence'), primary_key=True, autoincrement=True)
    user_uuid = db.Column(db.String(36), nullable=False)
    session_uuid = db.Column(db.String(36), nullable=True, unique=True)
    event_name = db.Column(db.String, nullable=False)
    event_start_datetime = db.Column(db.TIMESTAMP(timezone=True), nullable=False)
    event_end_datetime = db.Column(db.TIMESTAMP(timezone=True), nullable=False)
    event_static_url = db.Column(db.String, nullable=True)

    def to_json(self, ignore_fields=None, minimal=False):
        if ignore_fields is None:
            ignore_fields = []
        ignore_fields.extend(['WebPortalCalendarEventType'])

        rval = super().to_json(ignore_fields=ignore_fields)
        return rval

    @staticmethod
    def get_event_by_id(event_id: int):
        return WebPortalCalendarEvent.query.filter_by(id_event=event_id).first()

    @staticmethod
    def get_events_for_user(user_uuid):
        return WebPortalCalendarEvent.query.filter_by(user_uuid=user_uuid).all()

    @staticmethod
    def create_defaults():
        base_event = WebPortalCalendarEvent()
        base_event.event_name = 'Suivi 9'
        base_event.user_uuid = '085c421a-64a0-4605-9147-ae25f34bef3a'
        base_event.session_uuid = '9e24c6fa-1c00-45a8-a48e-45063cd39dba'
        base_event.event_end_datetime = datetime.datetime.now() + timedelta(days=6, hours=3)
        base_event.event_start_datetime = datetime.datetime.now() + timedelta(days=6, hours=2)
        base_event.event_static_url = ''
        WebPortalCalendarEvent.insert(base_event)

        base_event = WebPortalCalendarEvent()
        base_event.event_name = 'Suivi 5'
        base_event.user_uuid = '085c421a-64a0-4605-9147-ae25f34bef3a'
        base_event.session_uuid = 'e248b502-1797-4249-9ae4-b7d746c9b418'
        base_event.event_end_datetime = datetime.datetime.now() + timedelta(days=10, hours=1.5)
        base_event.event_start_datetime = datetime.datetime.now() + timedelta(days=10)
        base_event.event_static_url = ''
        WebPortalCalendarEvent.insert(base_event)

        base_event = WebPortalCalendarEvent()
        base_event.event_name = 'Séance de télé'
        base_event.user_uuid = '085c421a-64a0-4605-9147-ae25f34bef3a'
        base_event.session_uuid = '30816858-e91f-4d4d-a71e-366de00342d0'
        base_event.event_end_datetime = datetime.datetime.now() + timedelta(days=5, hours=1.5)
        base_event.event_start_datetime = datetime.datetime.now() + timedelta(days=5)
        base_event.event_static_url = ''
        WebPortalCalendarEvent.insert(base_event)

        base_event = WebPortalCalendarEvent()
        base_event.event_name = 'Test de connexion'
        base_event.user_uuid = '085c421a-64a0-4605-9147-ae25f34bef3a'
        base_event.session_uuid = '5054a454-b8c4-4712-94e1-829d3c3a4282'
        base_event.event_end_datetime = datetime.datetime.now() + timedelta(days=7, hours=1.5)
        base_event.event_start_datetime = datetime.datetime.now() + timedelta(days=7)
        base_event.event_static_url = 'https://www.youtube.com/'
        WebPortalCalendarEvent.insert(base_event)

        base_event = WebPortalCalendarEvent()
        base_event.event_name = 'Évaluation mensuelle'
        base_event.user_uuid = '085c421a-64a0-4605-9147-ae25f34bef3a'
        base_event.session_uuid = '4ecc63e8-0ce8-420b-8a8c-8934e75889a2'
        base_event.event_end_datetime = datetime.datetime.now() + timedelta(days=2, hours=3)
        base_event.event_start_datetime = datetime.datetime.now() + timedelta(days=2, hours=2)
        base_event.event_static_url = 'http://localhost:4200/rehab/user?token=test7476524321'
        WebPortalCalendarEvent.insert(base_event)

        base_event = WebPortalCalendarEvent()
        base_event.event_name = 'Suivi 14'
        base_event.user_uuid = '085c421a-64a0-4605-9147-ae25f34bef3a'
        base_event.event_end_datetime = datetime.datetime.now() + timedelta(days=1, hours=3.5)
        base_event.event_start_datetime = datetime.datetime.now() + timedelta(days=1, hours=2)
        base_event.event_static_url = 'http://localhost:4200/rehab/user?token=test5657567'
        WebPortalCalendarEvent.insert(base_event)

        base_event = WebPortalCalendarEvent()
        base_event.event_name = 'Suivi 1'
        base_event.user_uuid = '085c421a-64a0-4605-9147-ae25f34bef3a'
        base_event.event_end_datetime = datetime.datetime.now() - timedelta(days=10, hours=3.5)
        base_event.event_start_datetime = datetime.datetime.now() - timedelta(days=10, hours=2)
        base_event.event_static_url = 'http://localhost:4200/rehab/user?token=test32132131'
        WebPortalCalendarEvent.insert(base_event)

        base_event = WebPortalCalendarEvent()
        base_event.event_name = 'Test de connexion'
        base_event.user_uuid = '085c421a-64a0-4605-9147-ae25f34bef3a'
        base_event.event_end_datetime = datetime.datetime.now() - timedelta(days=8, hours=3)
        base_event.event_start_datetime = datetime.datetime.now() - timedelta(days=8, hours=2.5)
        base_event.event_static_url = 'http://localhost:4200/rehab/user?token=test21213321'
        WebPortalCalendarEvent.insert(base_event)

        base_event = WebPortalCalendarEvent()
        base_event.event_name = 'Test de connexion iPad 34234'
        base_event.user_uuid = '085c421a-64a0-4605-9147-ae25f34bef3a'
        base_event.event_end_datetime = datetime.datetime.now() + timedelta(days=7, hours=4)
        base_event.event_start_datetime = datetime.datetime.now() + timedelta(days=7, hours=3.5)
        base_event.event_static_url = 'http://localhost:4200/rehab/user?token=test43243124'
        WebPortalCalendarEvent.insert(base_event)

