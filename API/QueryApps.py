from flask_restx import Resource, reqparse, inputs
from FlaskModule import default_api_ns as api
from flask_babel import gettext
from sqlalchemy import exc
from flask import jsonify, request

from libwebportal.db.DBManager import DBManager
from opentera.services.ServiceAccessManager import ServiceAccessManager, current_login_type, \
    current_participant_client, LoginType, current_user_client
from libwebportal.db.models.WebPortalApp import WebPortalApp
import Globals

# Parser definition(s)
get_parser = api.parser()
get_parser.add_argument('id_project', type=int, help='ID of the project to get apps for', required=True)
get_parser.add_argument('with_config', type=inputs.boolean, help='Flag to also returns specific config for the current '
                                                                 'participant')

post_parser = api.parser()
delete_parser = reqparse.RequestParser()
delete_parser.add_argument('id', type=int, help='App ID to delete', required=True)


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
        app_access = DBManager.app_access()
        parser = get_parser
        args = parser.parse_args()

        apps = []

        # Get apps for participant
        if current_login_type == LoginType.PARTICIPANT_LOGIN:
            # Get base app list for project
            apps = app_access.query_apps_in_order(args['id_project'], True)

        # Get all apps
        if current_login_type == LoginType.USER_LOGIN:
            # Get base app list for project
            apps = app_access.query_apps_in_order(args['id_project'])

        apps_json = [app.to_json() for app in apps]

        # Get with app config for participant
        if args['with_config'] and current_login_type == LoginType.PARTICIPANT_LOGIN:
            part_uuid = current_participant_client.participant_uuid
            from libwebportal.db.models.WebPortalAppConfig import WebPortalAppConfig
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

        # Get service associated to the app if OpenTera service
        if current_login_type == LoginType.USER_LOGIN:
            for app in apps_json:
                app_access.query_app_service(app)

        return apps_json

    @api.expect(post_parser)
    @api.doc(description='Create / update apps. id_app must be set to "0" to create a new app.'
                         'An app can be created/modified if the user has admin rights to the related site.',
             responses={200: 'Success',
                        403: 'Logged user can\'t create/update the specified app',
                        400: 'Badly formed JSON or missing fields(id_site) in the JSON body',
                        500: 'Internal error occurred when saving app'})
    @ServiceAccessManager.token_required
    def post(self):
        app_access = DBManager.app_access()
        # Using request.json instead of parser, since parser messes up the json!
        app_json = request.json['app']

        # Validate if we have an id
        if 'id_app' not in app_json:
            return gettext('Missing id_app argument'), 400

        # Do the update
        if app_json['id_app'] > 0:
            # Already existing
            try:
                WebPortalApp.update(app_json['id_app'], app_json)
            except exc.SQLAlchemyError as e:
                import sys
                print(sys.exc_info())
                self.module.logger.log_error(self.module.module_name,
                                             QueryApps.__name__,
                                             'post', 500, 'Database error', str(e))
                return gettext('Database error'), 500
        else:
            # New
            try:
                new_app = WebPortalApp()
                new_app.from_json(app_json)
                WebPortalApp.insert(new_app)
                # Update ID for further use
                app_json['id_app'] = new_app.id_app
            except exc.SQLAlchemyError as e:
                import sys
                print(sys.exc_info())
                self.module.logger.log_error(self.module.module_name,
                                             QueryApps.__name__,
                                             'post', 500, 'Database error', str(e))
                return gettext('Database error'), 500

        updated_app = WebPortalApp.get_app_by_id(app_json['id_app'])
        updated_app_json = updated_app.to_json()

        # Get service associated to the app if OpenTera service
        app_access.query_app_service(updated_app_json)

        return jsonify([updated_app_json])

    @api.expect(delete_parser)
    @api.doc(description='Delete a specific app',
             responses={200: 'Success',
                        403: 'Logged user can\'t delete app',
                        500: 'Database error.'})
    @ServiceAccessManager.token_required
    def delete(self):
        parser = delete_parser
        args = parser.parse_args()
        id_to_delete = args['id']

        # Validate that the app can be deleted
        app_to_del = WebPortalApp.get_app_by_id(id_to_delete)
        if not app_to_del.app_deletable:
            return gettext('Forbidden'), 403

        # If we are here, we are allowed to delete.
        try:
            WebPortalApp.delete(id_to_delete=id_to_delete)
        except exc.SQLAlchemyError as e:
            import sys
            print(sys.exc_info())
            self.module.logger.log_error(self.module.module_name,
                                         QueryApps.__name__,
                                         'delete', 500, 'Database error', str(e))
            return gettext('Database error'), 500

        return '', 200
