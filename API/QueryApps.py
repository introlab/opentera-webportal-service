from flask_restx import Resource, reqparse, inputs
from FlaskModule import default_api_ns as api
from flask_babel import gettext

from opentera.services.ServiceAccessManager import ServiceAccessManager, current_login_type, \
    current_participant_client, LoginType

# Parser definition(s)
get_parser = api.parser()
get_parser.add_argument('id_project', type=int, help='ID of the project to get apps for', required=True)
get_parser.add_argument('with_config', type=inputs.boolean, help='Flag to also returns specific config for the current '
                                                                 'participant')


class QueryApps(Resource):

    def __init__(self, _api, *args, **kwargs):
        Resource.__init__(self, _api, *args, **kwargs)
        self.module = kwargs.get('flaskModule', None)
        self.parser = reqparse.RequestParser()

    @api.expect(get_parser)
    @api.doc(description='Get apps for the portal',
             responses={200: 'Success - Return the list of apps',
                        501: 'Not implemented yet for that login type'})
    @ServiceAccessManager.token_required
    def get(self):
        # For now, API is only available for participants
        if current_login_type != LoginType.PARTICIPANT_LOGIN:
            return 501, gettext('Sorry - not available yet for login type.')

        parser = get_parser
        args = parser.parse_args()

        # Get base app list for project
        from libwebportal.db.models.WebPortalApp import WebPortalApp
        apps = WebPortalApp.get_apps_for_project(args['id_project'])

        apps_json = [app.to_json() for app in apps]
        if args['with_config']:
            from libwebportal.db.models.WebPortalAppConfig import WebPortalAppConfig
            part_uuid = current_participant_client.participant_uuid
            for app in apps_json:
                app_config = WebPortalAppConfig.get_app_config_for_participant(part_uuid, app['id_app'])
                app_config_json = None
                if app_config:
                    app_config_json = app_config.to_json(ignore_fields=['id_app', 'participant_uuid'])
                    if app['app_type'] == WebPortalApp.WebPortalAppType.OPENTERA_SERVICE.value:
                        # Create url for that service
                        # TODO: Query services with service API and generate correct URL
                        pass
                app['app_config'] = app_config_json

        return apps_json

