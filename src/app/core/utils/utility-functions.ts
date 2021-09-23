import {Account} from '@shared/models/account.model';
import {GlobalConstants} from '@core/utils/global-constants';

export function dateToISOLikeButLocal(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const msLocal = date.getTime() - offsetMs;
  const dateLocal = new Date(msLocal);
  const iso = dateLocal.toISOString();
  return iso.slice(0, 19);
}

export function setDate(date: Date, time: Date): Date {
  date.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return date;
}

export function getDuration(startTime: Date, endTime: Date): number {
  const diffMs = endTime.getTime() - startTime.getTime();
  return Math.floor(diffMs / 60000);
}

export function isUser(account: Account): boolean {
  return account.login_type === 'user';
}

export function convertMinutesToHoursMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (minutes < 60) {
    return m + 'min';
  } else {
    const mString = m < 10 ? '0' + m : m;
    return h + 'h' + mString;
  }
}

export function isObjectEmpty(object: any): boolean {
  return !object || !Object.keys(object).length;
}

// https://(url du serveur):(port)/webportal/participant?token=(token du participant))
export function createParticipantUrl(token: string): string {
  return `${GlobalConstants.protocol}://${GlobalConstants.hostname}:${GlobalConstants.port}/webportal/participant?token=${token}`;
}
