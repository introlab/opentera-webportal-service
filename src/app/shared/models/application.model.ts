import {ApplicationConfig} from '@shared/models/application-config.model';
import {Service} from '@shared/models/service.model';

export class Application {
  app_config?: ApplicationConfig;
  app_icon?: string;
  app_name?: string;
  app_enabled?: boolean;
  app_service_key?: string;
  app_static_url?: string;
  app_type?: number;
  id_app?: number;
  id_project?: number;
  app_deletable?: boolean;
  app_order?: number;
  service?: Service[];
}
