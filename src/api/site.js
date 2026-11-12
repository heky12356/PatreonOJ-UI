async function request(path, options = {}) {
  const response = await fetch(`/api/site${path}`, { credentials: 'include', ...options });
  const body = await response.json();
  if (!response.ok) throw new Error(body.msg || body.error || '站点设置请求失败');
  return body.data;
}

export const getSiteSettings = () => request('/settings', { cache: 'no-store' });
export const updateSiteSettings = (patch) => request('/settings', {
  method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch),
});
export function uploadSiteImage(file) {
  const data = new FormData();
  data.append('file', file);
  return request('/images', { method: 'POST', body: data });
}
