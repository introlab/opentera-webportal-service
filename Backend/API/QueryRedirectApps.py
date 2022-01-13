from flask_restx import Resource, reqparse, inputs
from flask import redirect
from requests import post

from opentera.services.ServiceAccessManager import ServiceAccessManager
from opentera.services.ServiceAccessManager import ServiceAccessManager, current_login_type, \
    current_participant_client, LoginType

from FlaskModule import default_api_ns as api

from libwebportal.db.DBManager import DBManager
from libwebportal.db.models.WebPortalApp import WebPortalApp

import Globals

# Parser definition(s)
get_parser = api.parser()
get_parser.add_argument('id_app', type=int, help='ID of the app to redirect to', required=True)


class QueryRedirectApps(Resource):

    def __init__(self, _api, *args, **kwargs):
        Resource.__init__(self, _api, *args, **kwargs)
        self.module = kwargs.get('flaskModule', None)
        self.parser = reqparse.RequestParser()

    @api.expect(get_parser)
    @api.doc(description='Redirects to the correct URL for the app',
             responses={302: 'Redirection to the URL',
                        400: 'Missing parameters',
                        500: 'Unable to redirect'})
    @ServiceAccessManager.token_required(allow_static_tokens=True)
    def get(self):

        parser = get_parser
        args = parser.parse_args()

        if current_login_type != LoginType.PARTICIPANT_LOGIN:
            return 'Only participants can access this API', 400

        if not args['id_app']:
            return 'Missing id_app', 400

        # Query app from database
        app = WebPortalApp.get_app_by_id(args['id_app'])
        if not app:
            return 'App not found', 400

        # Try to get specific config for that app
        app_access = DBManager.app_access()
        app_json = app.to_json()
        app_access.query_app_config([app_json])

        # Redirect according to app type
        if app.app_type == 0 or app.app_type == 1:  # Standard URL app or OpenTera Service App
            if app_json['app_config'] and app_json['app_config'] != '':
                target_url = app_json['app_config']['app_config_url']
            else:
                target_url = app.app_static_url
            return redirect(target_url)

        if app.app_type == 2:  # Moodle integrated app
            uuid = current_participant_client.participant_uuid

            response = Globals.service.get_from_opentera('/api/service/participants',
                                                         {"participant_uuid": uuid})
            if response.status_code != 200:
                return 'Unable to get participant infos', 500

            import json
            participant = json.loads(response.text)

            if not participant:
                return 'Error loading participant infos', 500

            participant_names = participant['participant_name'].split(' ', 1)
            firstname = participant_names[0]
            if len(participant_names) > 1:
                lastname = participant_names[-1].replace('#', '')
            else:
                lastname = 'x'
            username = participant['participant_username']
            if not username:
                # No username for that participant, generate it!
                username = ''.join(e for e in participant['participant_name'] if e.isalnum()).lower()
                import text_unidecode
                username = text_unidecode.unidecode(username)

            email = participant['participant_email']
            if not email:
                email = username + '@opentera.com'

            # Prepare redirection URL
            wanted_section = app.app_static_url.split(' ', 1)
            target_url = None
            if wanted_section and len(wanted_section) > 0:
                if wanted_section[0] != '':  # Not the dashboard
                    target_url = ServiceAccessManager.config_man.moodle_config['url']
                    if wanted_section[0] == 'message':
                        target_url += '/message'
                    else:
                        target_id = wanted_section[-1]
                        # If we have a specific config for that app and participant, the ID stored in URL has priority
                        if app_json['app_config'] and app_json['app_config'] != '':
                            target_id = app_json['app_config']['app_config_url']

                        if wanted_section[0] != 'course':
                            target_url += '/mod'

                        target_url += '/' + wanted_section[0] + '/view.php?id=' + target_id

            # Process login request
            redirect_url = ServiceAccessManager.config_man.moodle_config['url'] + \
                           '/webservice/rest/server.php?wstoken=' + \
                           ServiceAccessManager.config_man.moodle_config['token'] + \
                           '&wsfunction=auth_userkey_request_login_url&moodlewsrestformat=json&user[idnumber]=' + \
                           uuid + '&user[username]=' + username + '&user[email]=' + email + '&user[firstname]=' + \
                           firstname + '&user[lastname]=' + lastname

            response = post(redirect_url)
            if response.status_code == 200:
                response_json = response.json()
                if "loginurl" in response_json:
                    login_url = response_json['loginurl']
                    if target_url:
                        login_url += '&wantsurl=' + target_url
                    return redirect(login_url, 302)
                else:
                    print(response.text)
            else:
                print(response.text)

        return 'Unable to connect', 500
