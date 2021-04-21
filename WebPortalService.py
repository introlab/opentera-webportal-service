# Twisted
from twisted.internet import reactor, defer
from twisted.python import log

import sys
import uuid
import json
import logging

from FlaskModule import flask_app

# Configuration 
from ConfigManager import ConfigManager
from opentera.redis.RedisClient import RedisClient
from opentera.redis.RedisVars import RedisVars

# Modules
from FlaskModule import FlaskModule
from opentera.services.ServiceOpenTera import ServiceOpenTera

# Local

# Database
import Globals
from sqlalchemy.exc import OperationalError
from libwebportal.db.DBManager import DBManager

class WebPortalService(ServiceOpenTera):
    def __init__(self, config_man: ConfigManager, service_info: dict):

        # Create REST backend
        self.flaskModule = FlaskModule(config_man)

        # Create twisted service
        self.flaskModuleService = self.flaskModule.create_service()

    def notify_service_messages(self, pattern, channel, message):
        pass

    def setup_rpc_interface(self):
        super().setup_rpc_interface()
        # TODO ADD more rpc interface here


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

    # Create the service
    service = WebPortalService(config_man, service_info)

    # Start App/ reactor events
    reactor.run()

