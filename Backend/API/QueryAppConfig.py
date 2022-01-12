from flask_restx import Resource, reqparse
from FlaskModule import default_api_ns as api
from flask_babel import gettext
from sqlalchemy import exc
from flask import jsonify, request

from libwebportal.db.DBManager import DBManager
from opentera.services.ServiceAccessManager import ServiceAccessManager
from libwebportal.db.models.WebPortalAppConfig import WebPortalAppConfig

# Parser definition(s)
get_parser = api.parser()
get_parser.add_argument('participant_uuid', type=str, help='UUID of the participant')

post_parser = api.parser()


class QueryAppConfig(Resource):

    def __init__(self, _api, *args, **kwargs):
        Resource.__init__(self, _api, *args, **kwargs)
        self.module = kwargs.get('flaskModule', None)
        self.parser = reqparse.RequestParser()

    @api.expect(get_parser)
    @api.doc(description='Get calendar events.',
             responses={200: 'Success - returns calendar events',
                        500: 'Database error'})
    @ServiceAccessManager.token_required()
    def get(self):
        app_access = DBManager.app_access()
        parser = get_parser
        args = parser.parse_args()

        if not args['participant_uuid']:
            return 'Missing participant uuid', 400

        app_configs = app_access.query_app_configs_for_participant(args['participant_uuid'])
        app_configs_json = [app_config.to_json() for app_config in app_configs]

        return app_configs_json

    @api.expect(post_parser)
    @api.doc(description='Create / update app configs. id_app_config must be set to "0" to create a new app config.',
             responses={200: 'Success',
                        403: 'Logged user can\'t create/update the specified app config',
                        400: 'Badly formed JSON or missing fields(id_site) in the JSON body',
                        500: 'Internal error occurred when saving app config'})
    @ServiceAccessManager.token_required()
    def post(self):
        app_configs_json = request.json['configs']

        updated_app_configs_json = []
        for config_json in app_configs_json:

            # Validate if config already exists
            existing_config = WebPortalAppConfig.get_app_config_for_participant(config_json['participant_uuid'],
                                                                                config_json['id_app'])
            if existing_config:
                config_json['id_app_config'] = existing_config.id_app_config
            else:
                config_json['id_app_config'] = 0

            # Do the update
            if config_json['id_app_config'] > 0:
                # Already existing
                # If empty app_config_url, we must delete it!
                if 'app_config_url' not in config_json or not config_json['app_config_url']:
                    try:
                        WebPortalAppConfig.delete(config_json['id_app_config'])
                    except exc.SQLAlchemyError as e:
                        import sys
                        print(sys.exc_info())
                        self.module.logger.log_error(self.module.module_name,
                                                     QueryAppConfig.__name__,
                                                     'post', 500, 'Database error', str(e))
                        return gettext('Database error'), 500
                else:
                    try:
                        WebPortalAppConfig.update(config_json['id_app_config'], config_json)
                    except exc.SQLAlchemyError as e:
                        import sys
                        print(sys.exc_info())
                        self.module.logger.log_error(self.module.module_name,
                                                     QueryAppConfig.__name__,
                                                     'post', 500, 'Database error', str(e))
                        return gettext('Database error'), 500
                    updated_app_configs_json.append(config_json)
            else:
                # New
                if 'app_config_url' not in config_json or not config_json['app_config_url']:
                    continue  # Skip this one - no need to add an empty config!
                try:
                    new_app_config = WebPortalAppConfig()
                    new_app_config.from_json(config_json)
                    WebPortalAppConfig.insert(new_app_config)
                    # Update ID for further use
                    config_json['id_app_config'] = new_app_config.id_app_config
                except exc.SQLAlchemyError as e:
                    import sys
                    print(sys.exc_info())
                    self.module.logger.log_error(self.module.module_name,
                                                 QueryAppConfig.__name__,
                                                 'post', 500, 'Database error', str(e))
                    return gettext('Database error'), 500

                updated_app_configs_json.append(config_json)

        return jsonify(updated_app_configs_json)
