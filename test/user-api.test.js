import assert from 'node:assert/strict';
import { test, beforeEach } from 'node:test';
import axios from 'axios';
import { getUserByUuid, updateUserByUuid, logout, saveUserInfo, getUserInfo } from '../src/api/user.js';

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: (key) => values.delete(key),
};
beforeEach(() => values.clear());

test('profile and update requests use the same UUID route', async () => {
  const calls = [];
  axios.defaults.adapter = async (config) => {
    calls.push([config.method, config.url]);
    return { data: { result: { uuid: 'owner-uuid' } }, status: 200, headers: {}, config };
  };
  await getUserByUuid('owner-uuid', { operator_uuid: 'owner-uuid' });
  await updateUserByUuid('owner-uuid', { nickname: 'updated' }, { operator_uuid: 'owner-uuid' });
  assert.deepEqual(calls, [['get', '/api/user/owner-uuid'], ['put', '/api/user/owner-uuid']]);
});

test('role permissions survive profile refresh', () => {
  saveUserInfo({ uuid: 'owner', permissions: 'read', roles: [{ name: 'administrator', permissions: [{ code: 'admin' }] }] });
  assert.deepEqual(getUserInfo().permissions.sort(), ['admin', 'read']);
});

test('legacy avatar paths stay absolute on nested pages', () => {
  saveUserInfo({ uuid: 'owner', avatar_url: 'oss/bucket/avatars/owner/avatar.png' });
  assert.equal(getUserInfo().avatar_url, '/oss/bucket/avatars/owner/avatar.png');
});

test('logout revokes the server session before clearing local identity', async () => {
  saveUserInfo({ uuid: 'owner' });
  axios.defaults.adapter = async (config) => {
    assert.equal(config.method, 'post');
    assert.equal(config.url, '/api/user/logout');
    assert.equal(getUserInfo().uuid, 'owner');
    return { data: {}, status: 200, headers: {}, config };
  };
  await logout();
  assert.equal(getUserInfo(), null);
});

test('failed logout keeps identity so the UI can retry', async () => {
  saveUserInfo({ uuid: 'owner' });
  axios.defaults.adapter = async () => { throw new Error('offline'); };
  await assert.rejects(logout, /offline/);
  assert.equal(getUserInfo().uuid, 'owner');
});

test('expired sessions can still be cleared locally', async () => {
  saveUserInfo({ uuid: 'owner' });
  axios.defaults.adapter = async () => { throw { response: { status: 401 } }; };
  await logout();
  assert.equal(getUserInfo(), null);
});
