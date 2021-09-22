from opentera.services.ServiceAccessManager import ServiceAccessManager, current_login_type, \
    current_participant_client, current_user_client, LoginType
from flask_restx import Resource
from FlaskModule import default_api_ns as api
import Globals

from libwebportal.db.DBManager import DBManager

# Parser definition(s)
get_parser = api.parser()
get_parser.add_argument('id_site', type=int, help='ID of the selected site')


class QueryAccountInfos(Resource):

    def __init__(self, _api, *args, **kwargs):
        Resource.__init__(self, _api, *args, **kwargs)
        self.module = kwargs.get('flaskModule', None)

    @api.expect(get_parser)
    @api.doc(description='Gets connected user infos from token: login type, uuid, username',
             responses={200: 'Success'})
    @ServiceAccessManager.token_required(allow_static_tokens=True, allow_dynamic_tokens=True)
    def get(self):
        app_access = DBManager.app_access()
        parser = get_parser
        args = parser.parse_args()
        account_infos = {
            'login_type': 'unknown',
            'login_id': 0,
            'login_uuid': '',
            'is_super_admin': False,
            'username': 'unknown'
        }

        if current_login_type == LoginType.PARTICIPANT_LOGIN:
            participant = current_participant_client.get_participant_infos()
            account_infos['login_type'] = 'participant'
            account_infos['login_id'] = current_participant_client.id_participant
            account_infos['login_uuid'] = current_participant_client.participant_uuid
            account_infos['username'] = participant['participant_username']
            if participant and 'participant_name' in participant:
                account_infos['user'] = participant
                account_infos['fullname'] = participant['participant_name']
                account_infos['project_id'] = participant['id_project']
                if participant['id_project']:
                    # TODO: Use database objects directly instead of using a query to get apps information
                    apps = app_access.query_project_apps(participant['id_project'])
                    apps_json = [app.to_json() for app in apps]
                    app_access.query_app_config(apps_json)
                    account_infos['apps'] = apps_json

        if current_login_type == LoginType.USER_LOGIN:
            user = current_user_client.get_user_info()
            account_infos['user'] = user
            account_infos['username'] = user[0]['user_username']
            account_infos.update({'sites': user[0]['sites']})
            account_infos['login_type'] = 'user'
            account_infos['login_id'] = current_user_client.id_user
            account_infos['login_uuid'] = current_user_client.user_uuid
            account_infos['is_super_admin'] = current_user_client.user_superadmin
            account_infos['fullname'] = current_user_client.user_fullname

        return account_infos