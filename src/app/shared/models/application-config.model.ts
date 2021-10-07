import {Application} from '@shared/models/application.model';

export class ApplicationConfig {
  id_app_config?: number;
  id_app?: number;
  participant_uuid?: string;
  app_config_url?: string;
  application?: Application;
}
