export class GlobalConstants {
  static title = 'Portail Web';
  static protocol = 'https';
  static hostname = 'localhost';
  static port = 40075;
  static osService = 'api/';
  static psService = 'webportal/';
  static rehabService = 'rehab/';
  static cookieValue = 'WebPortalCookie';
  static serviceKey = 'WebPortalService';
  static version = '1.0.2';
  static organism = 'Centre de Recherche sur le Vieillissement de Sherbrooke - Regroupement INTER - ' + new Date().getFullYear();

  static applicationTypes = {external: 0, 'OpenTera Service': 1, Moodle: 2};
  static emailLink = 'https://mail.google.com/';

  // Strings
  static requiredMessage = 'Ce champ est requis.';
}
