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
  static organism = 'Centre de Recherche sur le Vieillissement de Sherbrooke - Regroupement INTER - 2020';

  static applicationTypes = {external: 0, 'OpenTera Service': 1};

  // App page urls
  static homePage = '';
  static loginPage = 'connexion';
  static calendarPage = 'calendrier';
  static eventFormPage = 'evenement';
  static participantsPage = 'participants';
  static sectionsPage = 'sections';
  static planningPage = 'planifiation';
  static applicationsPage = 'sections';
  static sessionPage = 'seance';
  static emailPage = 'courriel';
  static exercisesPage = 'exercices';
  static fourofourPage = '404';

  // TODO to be app_config_url probably
  static emailLink = 'https://mail.google.com/';
  static seanceLink = 'https://telesante.cdrv.ca:40001?webId=ihkLMOuLvzYdpE2QEcX435kn';
  static physiotecLink = 'https://physiotec.ca/ca/en/login/';

  // Strings
  static requiredMessage = 'Ce champ est requis.';
}
