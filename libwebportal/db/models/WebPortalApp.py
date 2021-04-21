from opentera.db.Base import BaseModel
from libwebportal.db.DBGlobals import db
from enum import Enum, unique


class WebPortalApp(db.Model, BaseModel):
    @unique
    class WebPortalAppType(Enum):
        EXTERNAL = 0
        OPENTERA_SERVICE = 1

        def describe(self):
            return self.name, self.value

    __tablename__ = "t_apps"
    id_app = db.Column(db.Integer, db.Sequence('id_app_sequence'), primary_key=True, autoincrement=True)
    id_project = db.Column(db.Integer, nullable=False)
    app_name = db.Column(db.String, nullable=False)
    app_icon = db.Column(db.String, nullable=False)
    app_type = db.Column(db.Integer, nullable=False)    # App type - 0 = External, 1 = OpenTera Service
    app_static_url = db.Column(db.String, nullable=True)
    app_service_key = db.Column(db.String, nullable=True)

    @staticmethod
    def create_defaults():
        base_app = WebPortalApp()
        base_app.id_project = 1     # Hard coded for now
        base_app.app_name = 'Calendrier'
        base_app.app_icon = 'icon_calendar.png'
        base_app.app_type = WebPortalApp.WebPortalAppType.EXTERNAL.value
        WebPortalApp.insert(base_app)

        base_app = WebPortalApp()
        base_app.id_project = 1  # Hard coded for now
        base_app.app_name = 'Courriel'
        base_app.app_icon = 'icon_email.png'
        base_app.app_type = WebPortalApp.WebPortalAppType.EXTERNAL.value
        WebPortalApp.insert(base_app)

        base_app = WebPortalApp()
        base_app.id_project = 1  # Hard coded for now
        base_app.app_name = 'Séance'
        base_app.app_type = WebPortalApp.WebPortalAppType.OPENTERA_SERVICE.value
        base_app.app_service_key = "VideoRehab"
        base_app.app_icon = 'icon_openteraplus.png'
        WebPortalApp.insert(base_app)

        base_app = WebPortalApp()
        base_app.id_project = 1  # Hard coded for now
        base_app.app_name = 'Exercices'
        base_app.app_icon = 'icon_exercices.png'
        base_app.app_type = WebPortalApp.WebPortalAppType.EXTERNAL.value
        WebPortalApp.insert(base_app)

    @staticmethod
    def get_app_by_id(app_id: int):
        return WebPortalApp.query.filter_by(id_app=app_id).first()

    @staticmethod
    def get_apps_for_project(project_id: int):
        return WebPortalApp.query.filter_by(id_project=project_id).all()
