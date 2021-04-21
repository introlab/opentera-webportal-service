from flask_sqlalchemy import event
from sqlalchemy.engine import Engine
from sqlite3 import Connection as SQLite3Connection

from opentera.config.ConfigManager import ConfigManager
from opentera.modules.BaseModule import ModuleNames
from opentera.db.models.TeraParticipant import TeraParticipant

# Must include all Database objects here to be properly initialized and created if needed
from opentera.modules.BaseModule import BaseModule
from .DBGlobals import db

# All at once to make sure all files are registered.
from .models.WebPortalApp import WebPortalApp
from .models.WebPortalAppConfig import WebPortalAppConfig

from FlaskModule import flask_app

# User access with roles

# Alembic
from alembic.config import Config
from alembic import command


class DBManager (BaseModule):
    """db_infos = {
        'user': '',
        'pw': '',
        'db': '',
        'host': '',
        'port': '',
        'type': ''
    }"""

    def __init__(self, config: ConfigManager):

        BaseModule.__init__(self, ModuleNames.DATABASE_MODULE_NAME.value, config)

        self.db_uri = None

    # @staticmethod
    # def userAccess(user: TeraUser):
    #     access = DBManagerTeraUserAccess(user=user)
    #     return access
    #
    # @staticmethod
    # def deviceAccess(device: TeraDevice):
    #     access = DBManagerTeraDeviceAccess(device=device)
    #     return access

    @staticmethod
    def participantAccess(participant: TeraParticipant):
        # access = DBManagerTeraParticipantAccess(participant=participant)
        # return access
        return None

    @staticmethod
    def create_defaults():
        if WebPortalApp.get_count() == 0:
            print('No app entries - creating defaults')
            WebPortalApp.create_defaults()

        if WebPortalAppConfig.get_count() == 0:
            print('No app configs - creating defaults')
            WebPortalAppConfig.create_defaults()

    def open(self, echo=False):
        self.db_uri = 'postgresql://%(username)s:%(password)s@%(url)s:%(port)s/%(name)s' % self.config.db_config

        flask_app.config.update({
            'SQLALCHEMY_DATABASE_URI': self.db_uri,
            'SQLALCHEMY_TRACK_MODIFICATIONS': False,
            'SQLALCHEMY_ECHO': echo
        })

        # Create db engine
        db.init_app(flask_app)
        db.app = flask_app

        # Init tables
        # db.drop_all()
        db.create_all()

        # Apply any database upgrade, if needed
        self.upgrade_db()

    def open_local(self, db_infos, echo=False, ram=True):
        # self.db_uri = 'sqlite:///%(filename)s' % db_infos

        # IN RAM
        if ram:
            self.db_uri = 'sqlite://'
        else:
            self.db_uri = 'sqlite:///%(filename)s' % db_infos

        flask_app.config.update({
            'SQLALCHEMY_DATABASE_URI': self.db_uri,
            'SQLALCHEMY_TRACK_MODIFICATIONS': False,
            'SQLALCHEMY_ECHO': echo,
            'SQLALCHEMY_ENGINE_OPTIONS': {}
        })

        # Create db engine
        db.init_app(flask_app)
        db.app = flask_app

        # Init tables
        db.create_all()

        # Apply any database upgrade, if needed
        self.upgrade_db()

    def init_alembic(self):
        import sys
        import os
        # determine if application is a script file or frozen exe
        if getattr(sys, 'frozen', False):
            # If the application is run as a bundle, the pyInstaller bootloader
            # extends the sys module by a flag frozen=True and sets the app
            # path into variable _MEIPASS'.
            this_file_directory = sys._MEIPASS
            # When frozen, file directory = executable directory
            root_directory = this_file_directory
        else:
            this_file_directory = os.path.dirname(os.path.abspath(__file__))
            root_directory = os.path.join(this_file_directory, '..' + os.sep + '..')

        # this_file_directory = os.path.dirname(os.path.abspath(inspect.stack()[0][1]))

        alembic_directory = os.path.join(root_directory, 'alembic')
        ini_path = os.path.join(root_directory, 'alembic.ini')

        # create Alembic config and feed it with paths
        config = Config(ini_path)
        config.set_main_option('script_location', alembic_directory)
        config.set_main_option('sqlalchemy.url', self.db_uri)

        return config

    def upgrade_db(self):
        config = self.init_alembic()

        # prepare and run the command
        revision = 'head'
        sql = False
        tag = None

        # upgrade command
        command.upgrade(config, revision, sql=sql, tag=tag)

    def stamp_db(self):
        config = self.init_alembic()

        # prepare and run the command
        revision = 'head'
        sql = False
        tag = None

        # Stamp database
        command.stamp(config, revision, sql, tag)


# Fix foreign_keys on sqlite
@event.listens_for(Engine, "connect")
def _set_sqlite_pragma(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, SQLite3Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.close()
