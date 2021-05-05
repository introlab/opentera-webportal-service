from opentera.services.ServiceAccessManager import ServiceAccessManager, current_login_type, \
    current_participant_client, current_user_client, LoginType
from flask_restx import Resource
from FlaskModule import default_api_ns as api
import Globals

# Parser definition(s)
get_parser = api.parser()
get_parser.add_argument('id_site', type=int, help='ID of the selected site')


class QueryUserInfos(Resource):

    def __init__(self, _api, *args, **kwargs):
        Resource.__init__(self, _api, *args, **kwargs)
        self.module = kwargs.get('flaskModule', None)

    @api.expect(get_parser)
    @api.doc(description='Gets connected user infos from token: login type, uuid, username',
             responses={200: 'Success'})
    @ServiceAccessManager.token_required
    def get(self):
        parser = get_parser
        args = parser.parse_args()
        user_infos = {
            'login_type': 'unknown',
            'uuid': 'unknown',
            'id': 0,
            'fullname': 'unknown',
            'is_super_admin': False,
            'project_id': 0,  # To get apps
            'apps': {}
        }

        if current_login_type == LoginType.PARTICIPANT_LOGIN:
            user_infos['login_type'] = 'participant'
            user_infos['id'] = current_participant_client.id_participant
            user_infos['uuid'] = current_participant_client.participant_uuid
            participant_info = current_participant_client.get_participant_infos()
            if participant_info and 'participant_name' in participant_info:
                user_infos['fullname'] = participant_info['participant_name']
                user_infos['project_id'] = participant_info['id_project']
                response = current_participant_client.do_get_request_to_backend(
                    '/webportal/api/apps?with_config=true&id_project=' + str(participant_info['id_project']))
                if response.status_code == 200:
                    user_infos['apps'] = response.json()

        if current_login_type == LoginType.USER_LOGIN:
            user_infos['uuid'] = current_user_client.user_uuid
            user_infos['fullname'] = current_user_client.user_fullname
            user_infos['is_super_admin'] = current_user_client.user_superadmin

        # If reservation has a session associated to it, get it from OpenTera
        if args['id_site']:
            params = {'id_site': args['id_site'], 'uuid_user': current_user_client.user_uuid}

        return user_infos
