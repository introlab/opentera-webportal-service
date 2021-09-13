from libwebportal.db.Base import db, BaseModel
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
    app_type = db.Column(db.Integer, nullable=False)  # App type - 0 = External, 1 = OpenTera Service
    app_static_url = db.Column(db.String, nullable=True)
    app_service_key = db.Column(db.String, nullable=True)
    app_enabled = db.Column(db.Boolean, nullable=False, default=True)
    app_deletable = db.Column(db.Boolean, nullable=False, default=True)
    app_order = db.Column(db.Integer, nullable=False)

    def to_json(self, ignore_fields=None, minimal=False):
        if ignore_fields is None:
            ignore_fields = []
        ignore_fields.extend(['WebPortalAppType'])

        rval = super().to_json(ignore_fields=ignore_fields)
        return rval

    @staticmethod
    def create_defaults():
        base_app = WebPortalApp()
        base_app.app_deletable = False  # Can't delete calendar app, only disable it
        base_app.id_project = 1  # Hard coded for now
        base_app.app_name = 'Calendrier'
        base_app.app_icon = 'event'
        base_app.app_order = 1
        base_app.app_type = WebPortalApp.WebPortalAppType.EXTERNAL.value
        WebPortalApp.insert(base_app)

        base_app = WebPortalApp()
        base_app.id_project = 1  # Hard coded for now
        base_app.app_name = 'Courriel'
        base_app.app_icon = 'mail'
        base_app.app_order = 2
        base_app.app_type = WebPortalApp.WebPortalAppType.EXTERNAL.value
        WebPortalApp.insert(base_app)

        base_app = WebPortalApp()
        base_app.id_project = 1  # Hard coded for now
        base_app.app_name = 'Séance'
        base_app.app_type = WebPortalApp.WebPortalAppType.OPENTERA_SERVICE.value
        base_app.app_service_key = "VideoRehabService"
        base_app.app_order = 3
        base_app.app_icon = 'auto_stories'
        WebPortalApp.insert(base_app)

        base_app = WebPortalApp()
        base_app.id_project = 1  # Hard coded for now
        base_app.app_name = 'Exercices'
        base_app.app_icon = 'follow_the_signs'
        base_app.app_order = 3
        base_app.app_type = WebPortalApp.WebPortalAppType.EXTERNAL.value
        WebPortalApp.insert(base_app)

    @staticmethod
    def get_app_by_id(app_id: int):
        return WebPortalApp.query.filter_by(id_app=app_id).first()

    @staticmethod
    def get_apps_for_project(project_id: int):
        return WebPortalApp.query.filter_by(id_project=project_id).all()
