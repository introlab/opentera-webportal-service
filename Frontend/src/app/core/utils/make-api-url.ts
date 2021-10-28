import {GlobalConstants} from './global-constants';

export function makeApiURL(forPSService = false): string {
  const url = GlobalConstants.protocol + '://' + GlobalConstants.hostname + ':' + GlobalConstants.port + '/';
  if (forPSService) {
    return url + GlobalConstants.psService + GlobalConstants.osService;
  } else {
    return url + GlobalConstants.osService;
  }
}

export function getVideoRehabURL(): string{
  return GlobalConstants.protocol + '://' + GlobalConstants.hostname + ':' + GlobalConstants.port + '/' + GlobalConstants.rehabService;
}
