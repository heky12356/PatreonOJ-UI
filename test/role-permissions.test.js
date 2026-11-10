import assert from 'node:assert/strict';
import { test } from 'node:test';
import axios from 'axios';
import { saveUserInfo, getUserInfo, syncCurrentUserInfo, getUserByUuid, getRoleCatalog } from '../src/api/user.js';
const values = new Map();
globalThis.localStorage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };

test('inherited permissions remain separate after repeated normalization and role removal', async () => {
  axios.defaults.adapter = async (config) => ({ data: { result: { uuid: 'account', permissions: 'read', roles: [{ name: 'admin', permissions: [{ code: 'admin' }] }] } }, status: 200, headers: {}, config });
  const { result } = await getUserByUuid('account');
  assert.deepEqual(result.direct_permissions, ['read']);
  assert.deepEqual(result.permissions, ['read', 'admin']);
  saveUserInfo(result);
  assert.deepEqual(getUserInfo().direct_permissions, ['read']);
  syncCurrentUserInfo({ permissions: 'read', roles: [] });
  assert.deepEqual(getUserInfo().permissions, ['read']);
  assert.deepEqual(getUserInfo().direct_permissions, ['read']);
});

test('role options come from the actual server catalog', async () => {
  axios.defaults.adapter = async (config) => {
    assert.equal(config.url, '/api/user/roles');
    return { data: { result: [{ name: 'admin' }, { name: 'custom-role' }] }, status: 200, headers: {}, config };
  };
  assert.deepEqual((await getRoleCatalog()).map((role) => role.name), ['admin', 'custom-role']);
});
