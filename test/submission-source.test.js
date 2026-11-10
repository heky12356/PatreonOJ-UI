import assert from 'node:assert/strict';
import { test } from 'node:test';
import axios from 'axios';
import { getSubmissionResult } from '../src/api/judge.js';

test('source code survives the API envelope numeric code field', async () => {
  axios.defaults.adapter = async (config) => ({
    data: { code: 200, submission_id: 'example', status: 'completed', verdict: 'AC', source_code: 'print(3)', language: 'python' },
    status: 200, headers: {}, config,
  });
  const result = await getSubmissionResult('example');
  assert.equal(result.code, 'print(3)');
  assert.equal(result.verdict, 'AC');
});
