import assert from 'node:assert/strict';
import { test } from 'node:test';
import axios from 'axios';
import { getSubmissionResult } from '../src/api/judge.js';

test('source code survives flat and nested API envelopes', async () => {
  const detail = { submission_id: 'example', status: 'completed', verdict: 'AC', source_code: 'print(3)', language: 'python' };
  for (const body of [{ code: 200, ...detail }, { code: 200, data: { ...detail, code: 'print(3)' } }]) {
    axios.defaults.adapter = async (config) => ({ data: body, status: 200, headers: {}, config });
    const result = await getSubmissionResult('example');
    assert.equal(result.code, 'print(3)');
    assert.equal(result.source_code, 'print(3)');
    assert.equal(result.verdict, 'AC');
  }
});
