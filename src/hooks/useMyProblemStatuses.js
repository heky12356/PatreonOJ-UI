import { useEffect, useState } from 'react';
import { getMyProblemStatuses } from '../api/userSolve.js';
import useCurrentUserUuid from './useCurrentUserUuid.js';

export default function useMyProblemStatuses(ids, revision = 0) {
  const uuid = useCurrentUserUuid();
  const key = [...new Set(ids.map(Number).filter((id) => Number.isInteger(id) && id > 0))].sort((a, b) => a - b).join(',');
  const [snapshot, setSnapshot] = useState(null);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const update = () => setRefresh((value) => value + 1);
    window.addEventListener('submission-evaluated', update);
    window.addEventListener('focus', update);
    return () => { window.removeEventListener('submission-evaluated', update); window.removeEventListener('focus', update); };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    if (uuid && key) {
      getMyProblemStatuses(key.split(','), { signal: controller.signal, expectedUuid: uuid })
        .then((statuses) => { if (!controller.signal.aborted) setSnapshot({ uuid, key, revision, statuses }); })
        .catch(() => { if (!controller.signal.aborted) setSnapshot({ uuid, key, revision, statuses: Object.fromEntries(key.split(',').map((id) => [id, 'unknown'])) }); });
    }
    return () => controller.abort();
  }, [uuid, key, revision, refresh]);
  if (!uuid || snapshot?.uuid !== uuid || snapshot?.key !== key || snapshot?.revision !== revision) return {};
  return snapshot.statuses;
}
