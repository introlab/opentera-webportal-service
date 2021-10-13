export class GlobalConstants {
  static title = 'Promo Santé';
  static protocol = 'https';
  static hostname = 'localhost';
  static port = 40075;
  static osService = 'api/';
  static psService = 'webportal/';
  static cookieValue = 'PromoSanteCookie';
  static serviceKey = 'WebPortalService';
  static version = '1.0';
  static organism = 'Centre de Recherche sur le Vieillissement de Sherbrooke - Regroupement INTER - ' + new Date().getFullYear();

  static applicationTypes = {external: 0, 'OpenTera Service': 1};
  static emailLink = 'https://mail.google.com/';

  // Strings
  static requiredMessage = 'Ce champ est requis.';
}
