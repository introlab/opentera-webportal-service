import {ServiceProject} from '@shared/models/service-project.model';

export class Service {
  id_service?: number;
  service_clientendpoint?: string;
  service_default_config?: string;
  service_editable_config?: false;
  service_enabled?: boolean;
  service_endpoint?: string;
  service_hostname?: string;
  service_key?: string;
  service_name?: string;
  service_port?: number;
  service_roles?: any[];
  service_uuid?: string;
  service_projects?: ServiceProject[];
}
