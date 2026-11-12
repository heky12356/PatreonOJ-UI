async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, { credentials: 'include', cache: 'no-store', ...options });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.msg || payload.error || '自测请求失败');
  return payload.data ?? payload.result ?? payload;
}
export const getPublicSamples = (pk, signal) => request(`/question/${pk}/samples`, { signal });
export const createDebugRun = (body) => request('/debug/runs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const getDebugRun = (id, signal) => request(`/debug/runs/${encodeURIComponent(id)}`, { signal });
export const cancelDebugRun = (id) => request(`/debug/runs/${encodeURIComponent(id)}`, { method: 'DELETE' });
