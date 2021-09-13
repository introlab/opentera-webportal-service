from libwebportal.db.Base import db, BaseModel


class WebPortalAppConfig(db.Model, BaseModel):
    __tablename__ = "t_apps_config"
    id_app_config = db.Column(db.Integer, db.Sequence('id_app_config_sequence'), primary_key=True, autoincrement=True)
    id_app = db.Column(db.Integer, db.ForeignKey('t_apps.id_app', ondelete='cascade'), nullable=False)
    participant_uuid = db.Column(db.String, nullable=False)
    app_config_url = db.Column(db.String, nullable=False)

    def to_json(self, ignore_fields=None, minimal=False):
        if ignore_fields is None:
            ignore_fields = []

        ignore_fields.extend(['app_config_app'])
        rval = super().to_json(ignore_fields=ignore_fields)
        return rval

    @staticmethod
    def create_defaults():
        default_participant_uuid = 'e846a6d8-03f2-4eff-95ad-ad3f04f79f21'  # Hard coded, change for real value

        base_config = WebPortalAppConfig()
        base_config.id_app = 1     # Hard coded for now
        base_config.participant_uuid = default_participant_uuid
        base_config.app_config_url = 'https://calendar.google.com'  # TODO: Put real url here
        WebPortalAppConfig.insert(base_config)

        base_config = WebPortalAppConfig()
        base_config.id_app = 2  # Hard coded for now
        base_config.participant_uuid = default_participant_uuid
        base_config.app_config_url = 'https://mail.google.com'  # TODO: Put real url here
        WebPortalAppConfig.insert(base_config)

        base_config = WebPortalAppConfig()
        base_config.id_app = 4  # Hard coded for now
        base_config.participant_uuid = default_participant_uuid
        base_config.app_config_url = 'https://physiotec.ca'  # TODO: Put real url here
        WebPortalAppConfig.insert(base_config)

    @staticmethod
    def get_apps_configs_for_participant(part_uuid: str):
        return WebPortalAppConfig.query.filter_by(participant_uuid=part_uuid).all()

    @staticmethod
    def get_app_config_for_participant(part_uuid: str, app_id: int):
        return WebPortalAppConfig.query.filter_by(participant_uuid=part_uuid, id_app=app_id).first()
