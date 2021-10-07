from opentera.services.ServiceAccessManager import current_participant_client

import Globals
from libwebportal.db.models.WebPortalApp import WebPortalApp
from libwebportal.db.models.WebPortalAppConfig import WebPortalAppConfig


class DBManagerAppAccess:

    def query_apps_in_order(self, id_project: int, enabled_only=False):
        queries = [WebPortalApp.id_project == id_project]
        if enabled_only:
            queries.append(WebPortalApp.app_enabled == enabled_only)

        # Order apps by app_order and if same order, alphabetically
        apps = WebPortalApp.query.filter(*queries).order_by(WebPortalApp.app_order.asc(),
                                                            WebPortalApp.app_name.asc()).all()

        if apps:
            return apps
        return []

    def query_app_service(self, app):
        if app['app_type'] == WebPortalApp.WebPortalAppType.OPENTERA_SERVICE.value \
                and app['app_service_key'] is not None:
            params = {'service_key': app['app_service_key']}
            endpoint = '/api/service/services'
            response = Globals.service.get_from_opentera(endpoint, params)

            if response.status_code == 200:
                service = response.json()
                app['service'] = service

        return app

    def query_project_apps(self, id_project):
        apps = WebPortalApp.query.filter(WebPortalApp.id_project == id_project).order_by(WebPortalApp.app_order.asc(),
                                                                                         WebPortalApp.app_name.asc()).all()
        if apps:
            return apps
        return []

    def query_app_config(self, apps_json):
        for app in apps_json:
            part_uuid = current_participant_client.participant_uuid
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

    def query_app_configs_for_participant(self, participant_uuid):
        configs = WebPortalAppConfig.query.filter(WebPortalAppConfig.participant_uuid == participant_uuid).all()

        if configs:
            return configs
        return []
