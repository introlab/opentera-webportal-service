import Globals
from libwebportal.db.models.WebPortalApp import WebPortalApp


class DBManagerAppAccess:

    def query_apps_in_order(self, id_project: int, enabled_only=False):
        queries = [WebPortalApp.id_project == id_project]
        if enabled_only:
            queries.append(WebPortalApp.app_enabled is True)

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
