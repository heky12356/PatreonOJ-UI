import { useSyncExternalStore } from 'react';
import { getUserId, getUserInfoUpdatedEventName } from '../api/user.js';

function subscribe(callback) {
  window.addEventListener(getUserInfoUpdatedEventName(), callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(getUserInfoUpdatedEventName(), callback);
    window.removeEventListener('storage', callback);
  };
}
export default function useCurrentUserUuid() {
  return useSyncExternalStore(subscribe, () => getUserId() || '', () => '');
}
