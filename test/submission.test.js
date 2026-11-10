import assert from 'node:assert/strict';
import { test } from 'node:test';
import axios from 'axios';
import { getVerdict, formatDate, shortSubmissionId } from '../src/utils/submission.js';
import { getMyProblemStatuses } from '../src/api/userSolve.js';

test('completed is not treated as accepted unless all cases passed', () => {
  assert.equal(getVerdict({ status: 'completed', results: [{ is_correct: false }] }), 'WA');
  assert.equal(getVerdict({ status: 'completed', results: [{ is_correct: true }] }), 'AC');
  assert.equal(getVerdict({ status: 'completed', verdict: 'RE' }), 'RE');
  assert.equal(getVerdict({ status: 'error', error_code: 'E002' }), 'CE');
  assert.equal(getVerdict({ status: 'pending', verdict: 'AC' }), 'PENDING');
  assert.equal(getVerdict({ status: 'error', error_code: 'E005' }), 'SE');
});
test('record labels have compact IDs and consistent dates', () => {
  assert.equal(shortSubmissionId('12345678-abcd-1234'), '12345678');
  assert.equal(formatDate('2026-11-10T10:45:30Z'), '2026-11-10');
  assert.equal(formatDate('bad-date'), '-');
});
test('personal status endpoint uses the session and rejects a changed identity', async () => {
  axios.defaults.adapter = async (config) => {
    assert.equal(config.url, '/api/user/me/problem-status');
    assert.deepEqual(config.params, { ids: '1,2' });
    return { data: { user_uuid: 'alice', statuses: { 1: 'solved', 2: 'unsolved' } }, status: 200, headers: {}, config };
  };
  assert.deepEqual(await getMyProblemStatuses([1, 2], { expectedUuid: 'alice' }), { 1: 'solved', 2: 'unsolved' });
  await assert.rejects(getMyProblemStatuses([1, 2], { expectedUuid: 'bob' }), /登录状态已变化/);
});
