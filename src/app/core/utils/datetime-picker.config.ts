import {OwlDateTimeIntl} from '@danielmoncada/angular-datetime-picker';
import {Injectable} from '@angular/core';

@Injectable()
export class DefaultIntl extends OwlDateTimeIntl {
  /** A label for the up second button (used by screen readers).  */
  upSecondLabel = 'Ajouter une seconde';

  /** A label for the down second button (used by screen readers).  */
  downSecondLabel = 'Enlever une seconde';

  /** A label for the up minute button (used by screen readers).  */
  upMinuteLabel = 'Ajouter une minute';

  /** A label for the down minute button (used by screen readers).  */
  downMinuteLabel = 'Enlever une minute';

  /** A label for the up hour button (used by screen readers).  */
  upHourLabel = 'Ajouter une heure';

  /** A label for the down hour button (used by screen readers).  */
  downHourLabel = 'Enlever une heure';

  /** A label for the previous month button (used by screen readers). */
  prevMonthLabel = 'Mois précédent';

  /** A label for the next month button (used by screen readers). */
  nextMonthLabel = 'Mois suivant';

  /** A label for the previous year button (used by screen readers). */
  prevYearLabel = 'Année précédente';

  /** A label for the next year button (used by screen readers). */
  nextYearLabel = 'Année suivante';

  /** A label for the previous multi-year button (used by screen readers). */
  prevMultiYearLabel = '21 années passées';

  /** A label for the next multi-year button (used by screen readers). */
  nextMultiYearLabel = '21 années suivantes';

  /** A label for the 'switch to month view' button (used by screen readers). */
  switchToMonthViewLabel = 'Changer pour la vue en mois';

  /** A label for the 'switch to year view' button (used by screen readers). */
  switchToMultiYearViewLabel = 'Changer pour la vue en années';

  /** A label for the cancel button */
  cancelBtnLabel = 'Annuler';

  /** A label for the set button */
  setBtnLabel = 'OK';

  /** A label for the range 'from' in picker info */
  rangeFromLabel = 'de';

  /** A label for the range 'to' in picker info */
  rangeToLabel = 'à';

  /** A label for the hour12 button (AM) */
  hour12AMLabel = 'AM';

  /** A label for the hour12 button (PM) */
  hour12PMLabel = 'PM';
}
