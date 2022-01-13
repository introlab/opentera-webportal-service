from opentera.services.ServiceConfigManager import ServiceConfigManager, DBConfig


# Build configuration from base classes
class ConfigManager(ServiceConfigManager, DBConfig):
    def __init__(self):
        super().__init__()
        self.moodle_config = None

    def validate_config(self, config_json):

        if 'Moodle' in config_json:
            self.moodle_config = config_json['Moodle']

        return super().validate_config(config_json) and super().validate_database_config(config_json)

