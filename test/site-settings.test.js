import assert from 'node:assert/strict';
import { test } from 'node:test';
import { safeSiteURL } from '../src/site/urls.js';
import { updateSiteSettings, uploadSiteImage } from '../src/api/site.js';

test('site image and click links reject executable and off-origin relative URLs', () => {
  for (const value of ['/problem', '/api/site/images/a.png', 'https://example.com/image.png']) assert.equal(safeSiteURL(value), value);
  for (const value of ['javascript:alert(1)', '//example.com', '/%2fexample.com', '/\\example.com', 'data:image/svg+xml,x', '/a%0aheader', 'https://user:pass@example.com/a']) assert.equal(safeSiteURL(value), '');
});

test('theme writes send only the theme patch and retain server carousel response', async () => {
  const original = globalThis.fetch;
  const settings = { theme_id: 'default', carousel: { enabled: true, slides: [{ id: 'example' }] } };
  try {
    globalThis.fetch = async (url, init) => {
      assert.equal(url, '/api/site/settings');
      assert.equal(init.method, 'PUT');
      assert.deepEqual(JSON.parse(init.body), { theme_id: 'default' });
      return { ok: true, json: async () => ({ data: settings }) };
    };
    assert.deepEqual(await updateSiteSettings({ theme_id: 'default' }), settings);
  } finally { globalThis.fetch = original; }
});

test('image upload sends multipart data and propagates useful server errors', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (url, init) => {
      assert.equal(url, '/api/site/images');
      assert(init.body instanceof FormData);
      assert(init.body.get('file'));
      return { ok: false, json: async () => ({ msg: '图片格式无效' }) };
    };
    await assert.rejects(uploadSiteImage(new Blob(['invalid'], { type: 'image/png' })), /图片格式无效/);
  } finally { globalThis.fetch = original; }
});
