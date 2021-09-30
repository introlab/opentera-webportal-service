// App page urls

import {GlobalConstants} from '@core/utils/global-constants';

export class Pages {
  static participantPrefix = 'participant';
  static userPrefix = 'clinicien';

// All
  static homePage = '';
  static fourofourPage = '404';
  static loginPage = 'connexion';
  static calendarPage = 'calendrier';
  static eventFormPage = 'evenement';

// Users
  static participantsPage = 'participants';
  static planningPage = 'planification';
  static applicationsPage = 'sections';

// Participants
  static participantConnectionURL = 'login/participant';
  static appPage = 'app';
  static emailPage = 'courriel';

  static createPath(ending: string, isUser = false): string {
    return isUser ? Pages.userPrefix + '/' + ending : Pages.participantPrefix + '/' + ending;
  }
}
