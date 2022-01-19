from ConfigManager import ConfigManager
from requests import post, Response


class LibMoodle:
    def __init__(self, config: ConfigManager):
        self.config_man = config

    def get_login_url_for_participant(self, participant: dict) -> Response:
        uuid = participant['participant_uuid']
        participant_names = participant['participant_name'].split(' ', 1)
        firstname = participant_names[0]
        if len(participant_names) > 1:
            lastname = participant_names[-1].replace('#', '')
        else:
            lastname = 'x'
        username = ''
        if 'participant_username' in participant:
            username = participant['participant_username']
        if not username:
            # No username for that participant, generate it!
            username = ''.join(e for e in participant['participant_name'] if e.isalnum()).lower()
            import text_unidecode
            username = text_unidecode.unidecode(username)

        email = participant['participant_email']
        if not email:
            email = username + '@opentera.com'

        return self.get_login_url(uuid=uuid, username=username, firstname=firstname, lastname=lastname, email=email)

    def get_login_url(self, uuid: str, username: str, firstname: str, lastname: str, email: str) -> Response:

        redirect_url = self.config_man.moodle_config['url'] + \
                       '/webservice/rest/server.php?wstoken=' + \
                       self.config_man.moodle_config['token'] + \
                       '&wsfunction=auth_userkey_request_login_url&moodlewsrestformat=json&user[idnumber]=' + \
                       uuid + '&user[username]=' + username + '&user[email]=' + email + '&user[firstname]=' + \
                       firstname + '&user[lastname]=' + lastname

        response = post(redirect_url)
        return response
