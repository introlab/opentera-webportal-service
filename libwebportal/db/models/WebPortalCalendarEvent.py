from libwebportal.db.Base import db, BaseModel
from sqlalchemy.dialects.postgresql import ARRAY
import datetime
from datetime import timedelta


class WebPortalCalendarEvent(db.Model, BaseModel):
    __tablename__ = "t_calendar_events"
    id_event = db.Column(db.Integer, db.Sequence('id_event_sequence'), primary_key=True, autoincrement=True)
    user_uuid = db.Column(db.String(36), nullable=False)
    session_uuid = db.Column(db.String(36), nullable=True, unique=True)
    event_name = db.Column(db.String, nullable=False)
    event_start_datetime = db.Column(db.TIMESTAMP(timezone=True), nullable=False)
    event_end_datetime = db.Column(db.TIMESTAMP(timezone=True), nullable=False)
    event_static_url = db.Column(db.String, nullable=True)
    session_participant_uuids = db.Column(ARRAY(db.String))

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
    def delete_with_session_uuid(session_uuid):
        delete_obj = WebPortalCalendarEvent.query.filter(WebPortalCalendarEvent.session_uuid == session_uuid).first()
        if delete_obj:
            db.session.delete(delete_obj)
            db.session.commit()

    @staticmethod
    def create_defaults():
        pass
