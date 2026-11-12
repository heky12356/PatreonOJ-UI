import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDebugRun, getDebugRun, getPublicSamples } from '../src/api/debug.js';
import { getGraphTags, getTagGraph } from '../src/api/learning.js';

test('self-test preserves empty stdin and expected output without creating a submission', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, '/api/debug/runs');
      assert.equal(options.method, 'POST');
      assert.deepEqual(JSON.parse(options.body), { question_pk: 1, language: 'python', code: 'pass', input: '', expected_output: '' });
      return { ok: true, json: async () => ({ data: { id: 'debug-1', status: 'pending' } }) };
    };
    assert.equal((await createDebugRun({ question_pk: 1, language: 'python', code: 'pass', input: '', expected_output: '' })).id, 'debug-1');
  } finally { globalThis.fetch = original; }
});
test('expired and private self-test results preserve useful errors', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: false, json: async () => ({ msg: '自测记录不存在或已过期' }) });
    await assert.rejects(getDebugRun('private-id'), /不存在或已过期/);
  } finally { globalThis.fetch = original; }
});
test('sample and tag graph requests use the public bounded endpoints', async () => {
  const original = globalThis.fetch;
  const urls = [];
  try {
    globalThis.fetch = async url => { urls.push(url); return { ok: true, json: async () => ({ data: [] }) }; };
    await getPublicSamples(73);
    await getGraphTags();
    await getTagGraph({ tag: '前缀和', q: 'Long Title', page: 2 });
    assert.equal(urls[0], '/api/question/73/samples');
    assert.equal(urls[1], '/api/learning/tags');
    const query = new URL(urls[2], 'https://example.com').searchParams;
    assert.equal(query.get('tag'), '前缀和');
    assert.equal(query.get('q'), 'Long Title');
    assert.equal(query.get('page_size'), '60');
  } finally { globalThis.fetch = original; }
});
