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
  static sectionsPage = 'sections';
  static planningPage = 'planification';
  static applicationsPage = 'sections';

// Participants
  static appPage = 'app';
  static sessionPage = 'seance';
  static emailPage = 'courriel';
  static exercisesPage = 'exercices';

  static createPath(ending: string, isUser = false): string {
    return isUser ? Pages.userPrefix + '/' + ending : Pages.participantPrefix + '/' + ending;
  }
}
