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

export function getDuration(startTime: Date, endTime: Date, date: Date): number {
  const start = setDate(date, startTime);
  const end = setDate(date, endTime);
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / 60000);
}
