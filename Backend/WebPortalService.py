# Twisted
from twisted.internet import reactor, defer
from twisted.python import log

import sys
import uuid
import json
import logging
from google.protobuf.json_format import Parse, ParseError
from google.protobuf.message import DecodeError

from FlaskModule import flask_app
from opentera.services.ServiceOpenTera import ServiceOpenTera
import opentera.messages.python as messages

# Configuration 
from ConfigManager import ConfigManager
from opentera.redis.RedisClient import RedisClient
from opentera.redis.RedisVars import RedisVars

# Modules
from FlaskModule import FlaskModule
from opentera.services.BaseWebRTCService import BaseWebRTCService
from opentera.modules.BaseModule import ModuleNames, create_module_event_topic_from_name

# Local

# Database
import Globals
from sqlalchemy.exc import OperationalError
from libwebportal.db.DBManager import DBManager


class WebPortalService(ServiceOpenTera):
    def __init__(self, config_man: ConfigManager, service_info: dict):
        ServiceOpenTera.__init__(self, config_man, service_info)

        # Create REST backend
        self.flaskModule = FlaskModule(config_man)

        # Create twisted service
        self.flaskModuleService = self.flaskModule.create_service()

    def notify_service_messages(self, pattern, channel, message):
        pass

    def setup_rpc_interface(self):
        super().setup_rpc_interface()
        # TODO ADD more rpc interface here

    @defer.inlineCallbacks
    def register_to_events(self):
        # Need to register to events produced by UserManagerModule
        ret1 = yield self.subscribe_pattern_with_callback(create_module_event_topic_from_name(
            ModuleNames.DATABASE_MODULE_NAME, 'session'), self.database_event_received)

        print(ret1)

    def database_event_received(self, pattern, channel, message):
        print('WebPortalService - database_event_received', pattern, channel, message)
        try:
            tera_event = messages.TeraEvent()
            if isinstance(message, str):
                ret = tera_event.ParseFromString(message.encode('utf-8'))
            elif isinstance(message, bytes):
                ret = tera_event.ParseFromString(message)

            database_event = messages.DatabaseEvent()

            # Look for DatabaseEvent
            for any_msg in tera_event.events:
                if any_msg.Unpack(database_event):
                    self.handle_database_event(database_event)

        except DecodeError as decode_error:
            print('WebPortalService - DecodeError ', pattern, channel, message, decode_error)
        except ParseError as parse_error:
            print('WebPortalService - Failure in redisMessageReceived', parse_error)

    def handle_database_event(self, event: messages.DatabaseEvent):
        print('WebPortalService.handle_database_event', event)

        if event.type == messages.DatabaseEvent.DB_DELETE:
            print("Delete Session Event")
            # TODO delete event linked to the deleted session, event_name = 'session'
            calendar_access = DBManager.calendar_access()
            session_info = json.loads(event.object_value)
            calendar_access.delete_event_with_session_uuid(session_info)
            # Resend invitation to newly connected user
        if event.type == messages.DatabaseEvent.DB_UPDATE:
            print("Update Session Event")
            # TODO update event linked to the updated session, event_name = 'session'
            calendar_access = DBManager.calendar_access()
            session_info = json.loads(event.object_value)
            calendar_access.update_event_after_session_update(session_info)
            # Resend invitation to newly connected user
            pass


if __name__ == '__main__':

    # Very first thing, log to stdout
    log.startLogging(sys.stdout)

    print('Starting WebPortal Service...')
    config_man = ConfigManager()
    config_man.load_config('config/WebPortalService.json')

    # Retrieve configuration from redis
    redis_client = RedisClient(config_man.redis_config)

    # Get service UUID
    service_json = (redis_client.redisGet(RedisVars.RedisVar_ServicePrefixKey +
                                          config_man.service_config['name']))

    if service_json is None:
        logging.error('Error: Unable to get service info from OpenTera Server - is the server running and config '
                      'correctly set in this service?')
        exit(1)

    service_info = json.loads(service_json)

    if 'service_uuid' not in service_info:
        logging.error('OpenTera Server didn\'t return a valid service UUID - aborting.')
        exit(1)

    # Update service_info in configuration
    config_man.service_config['ServiceUUID'] = service_info['service_uuid']
    config_man.service_config['port'] = service_info['service_port']
    config_man.service_config['hostname'] = service_info['service_hostname']

    # DATABASE CONFIG AND OPENING
    #############################
    Globals.db_man = DBManager(config_man)
    try:
        Globals.db_man.open()
    except OperationalError as e:
        print("Unable to connect to database - please check settings in config file!", e)
        quit()

    with flask_app.app_context():
        DBManager.create_defaults()

    # Update Service Access information
    from opentera.services.ServiceAccessManager import ServiceAccessManager

    ServiceAccessManager.api_user_token_key = redis_client.redisGet(RedisVars.RedisVar_UserTokenAPIKey)
    ServiceAccessManager.api_device_token_key = redis_client.redisGet(RedisVars.RedisVar_DeviceTokenAPIKey)
    ServiceAccessManager.api_device_static_token_key = redis_client.redisGet(RedisVars.RedisVar_DeviceStaticTokenAPIKey)
    ServiceAccessManager.api_participant_token_key = redis_client.redisGet(RedisVars.RedisVar_ParticipantTokenAPIKey)
    ServiceAccessManager.api_participant_static_token_key = \
        redis_client.redisGet(RedisVars.RedisVar_ParticipantStaticTokenAPIKey)
    ServiceAccessManager.config_man = config_man

    # Create the service
    Globals.service = WebPortalService(config_man, service_info)

    # Start App/ reactor events
    reactor.run()
