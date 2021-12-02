from opentera.services.ServiceConfigManager import ServiceConfigManager, DBConfig


# Build configuration from base classes
class ConfigManager(ServiceConfigManager, DBConfig):

    def validate_config(self, config_json):
        return super().validate_config(config_json) and super().validate_database_config(config_json)

