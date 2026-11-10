import axios from 'axios';

const API_BASE_URL = '/api';
const USER_INFO_UPDATED_EVENT = 'user-info-updated';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );

const unwrapApiData = (payload) => {
  if (!payload || typeof payload !== 'object') return payload;
  if (payload.data !== undefined) return payload.data;
  if (payload.result !== undefined) return payload.result;
  return payload;
};

const normalizePermissions = (permissions) => {
  if (Array.isArray(permissions)) return permissions;
  if (typeof permissions === 'string') {
    return permissions
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeRoles = (roles) => {
  if (!Array.isArray(roles)) return [];
  return roles
    .filter((role) => role && typeof role === 'object')
    .map((role) => ({
      ...role,
      permissions: normalizePermissions(
        Array.isArray(role.permissions)
          ? role.permissions
              .map((permission) => permission?.code ?? permission)
              .filter(Boolean)
          : role.permissions
      ),
    }));
};

const normalizeUserInfo = (payload) => {
  const raw = unwrapApiData(payload);
  if (!raw || typeof raw !== 'object') return raw;
  const roles = normalizeRoles(raw.roles);
  return {
    ...raw,
    avatar_url: typeof raw.avatar_url === 'string' && raw.avatar_url.startsWith('oss/') ? `/${raw.avatar_url}` : raw.avatar_url,
    permissions: [...new Set([...normalizePermissions(raw.permissions), ...roles.flatMap((role) => role.permissions)])],
    roles,
  };
};

const emitUserInfoUpdated = (detail) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(USER_INFO_UPDATED_EVENT, {
        detail,
      })
    );
  }
};

const withOperatorUuid = (operator_uuid) => {
  const op = operator_uuid ?? getUserId();
  return op ? { operator_uuid: op } : {};
};

const ensureDirSuffix = (prefix) => {
  if (!prefix) return '';
  return prefix.endsWith('/') ? prefix : `${prefix}/`;
};

const putToPresignedUrl = async (url, file) => {
  const contentType =
    file && file.type ? file.type : 'application/octet-stream';

  await axios.put(url, file, {
    headers: {
      'Content-Type': contentType,
    },
  });
};

const getOssUploadUrl = async ({ filename, path }) => {
  const response = await axios.get(`${API_BASE_URL}/oss/upload-url`, {
    params: {
      filename,
      path,
    },
  });
  return unwrapApiData(response.data);
};

export const register = async (username, password) => {
  const response = await axios.post(`${API_BASE_URL}/user/register`, {
    username,
    password,
  });
  return response.data;
};

export const login = async (username, password) => {
  const response = await axios.post(`${API_BASE_URL}/user/login`, {
    username,
    password,
  });
  return normalizeUserInfo(response.data);
};

export const logout = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user/logout`);
    clearUserInfo();
    return response.data;
  } catch (error) {
    if ([401, 403].includes(error?.response?.status)) {
      clearUserInfo();
      return null;
    }
    throw error;
  }
};

export const saveUserInfo = (userInfo) => {
  const normalized = normalizeUserInfo(userInfo);
  localStorage.setItem('userInfo', JSON.stringify(normalized));
  emitUserInfoUpdated(normalized);
};

export const getUserInfo = () => {
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) return null;

  try {
    return normalizeUserInfo(JSON.parse(userInfo));
  } catch {
    return null;
  }
};

export const clearUserInfo = () => {
  localStorage.removeItem('userInfo');
  emitUserInfoUpdated(null);
};

export const isLoggedIn = () => {
  return !!getUserInfo();
};

export const getUserId = () => {
  const userInfo = getUserInfo();
  return userInfo ? userInfo.uuid : null;
};

export const getUserPermissions = () => {
  const userInfo = getUserInfo();
  return userInfo ? normalizePermissions(userInfo.permissions) : [];
};

export const hasPermission = (permission) => {
  const userPermissions = getUserPermissions();
  if (!userPermissions.length) return false;

  if (Array.isArray(permission)) {
    return permission.some((p) => userPermissions.includes(p));
  }
  return userPermissions.includes(permission);
};

export const getUserByUuid = async (uuid, { operator_uuid } = {}) => {
  const response = await axios.get(`${API_BASE_URL}/user/${encodeURIComponent(uuid)}`, {
    params: cleanParams(withOperatorUuid(operator_uuid)),
  });

  const raw = response.data;
  const result = normalizeUserInfo(raw);

  if (raw && typeof raw === 'object' && raw.result !== undefined) {
    return { ...raw, result };
  }
  if (raw && typeof raw === 'object' && raw.data !== undefined) {
    return { ...raw, result };
  }
  return { result };
};

export const getUserList = async (params = {}, { operator_uuid } = {}) => {
  const response = await axios.get(`${API_BASE_URL}/user/`, {
    params: cleanParams({
      ...params,
      ...withOperatorUuid(operator_uuid),
    }),
  });

  const raw = response.data;
  const result = Array.isArray(unwrapApiData(raw))
    ? unwrapApiData(raw).map((item) => normalizeUserInfo(item))
    : [];

  if (raw && typeof raw === 'object' && raw.result !== undefined) {
    return { ...raw, result };
  }
  if (raw && typeof raw === 'object' && raw.data !== undefined) {
    return { ...raw, result };
  }
  return { result };
};

export const updateUserByUuid = async (
  uuid,
  payload,
  { operator_uuid } = {}
) => {
  const response = await axios.put(`${API_BASE_URL}/user/${encodeURIComponent(uuid)}`, payload, {
    params: cleanParams(withOperatorUuid(operator_uuid)),
  });

  const raw = response.data;
  const result = normalizeUserInfo(raw);

  if (raw && typeof raw === 'object' && raw.result !== undefined) {
    return { ...raw, result };
  }
  if (raw && typeof raw === 'object' && raw.data !== undefined) {
    return { ...raw, result };
  }
  return { result };
};

export const syncCurrentUserInfo = (patch = {}) => {
  const current = getUserInfo();
  if (!current || !patch || typeof patch !== 'object') {
    return current;
  }

  const next = normalizeUserInfo({
    ...current,
    ...patch,
  });
  saveUserInfo(next);
  return next;
};

export const getUserInfoUpdatedEventName = () => USER_INFO_UPDATED_EVENT;

export const uploadUserAvatarAndUpdateUserByUuid = async (
  uuid,
  avatarFile,
  {
    operator_uuid,
    path,
    filename,
    avatarField = 'avatar_url',
    extraPayload,
  } = {}
) => {
  if (!uuid) throw new Error('uuid is required');
  if (!avatarFile) throw new Error('avatarFile is required');

  const trimmedFilename = typeof filename === 'string' ? filename.trim() : '';

  let resolvedFilename = trimmedFilename;
  if (!resolvedFilename) {
    const originalName =
      typeof avatarFile.name === 'string' ? avatarFile.name : '';
    const dotIdx = originalName.lastIndexOf('.');
    const ext = dotIdx >= 0 ? originalName.slice(dotIdx) : '';
    resolvedFilename = ext && ext.length <= 10 ? `avatar${ext}` : 'avatar';
  }

  const dir = ensureDirSuffix(path ?? `avatars/${uuid}`);
  const uploaded = await getOssUploadUrl({
    filename: resolvedFilename,
    path: dir,
  });

  await putToPresignedUrl(uploaded.url, avatarFile);

  const bucket = uploaded?.bucket ?? '';

  let avatarValue =
    uploaded?.public_url ??
    uploaded?.publicUrl ??
    uploaded?.key ??
    uploaded?.url;

  if (bucket) {
    avatarValue = `/oss/${bucket}/${avatarValue}`;
  }

  const mergedExtraPayload =
    extraPayload && typeof extraPayload === 'object' ? extraPayload : {};

  const updateResp = await updateUserByUuid(
    uuid,
    {
      ...mergedExtraPayload,
      [avatarField]: avatarValue,
    },
    { operator_uuid }
  );

  if (getUserId() === uuid) {
    syncCurrentUserInfo({
      ...(updateResp?.result ?? {}),
      [avatarField]: avatarValue,
    });
  }

  return { upload: uploaded, avatar: avatarValue, update: updateResp };
};

export const mockLogin = (username, role = 'user') => {
  let permissions = ['user'];

  switch (role) {
    case 'admin':
      permissions = ['admin', 'moderator', 'teacher', 'user'];
      break;
    case 'moderator':
      permissions = ['moderator', 'user'];
      break;
    case 'teacher':
      permissions = ['teacher', 'user'];
      break;
    case 'student':
      permissions = ['student', 'user'];
      break;
    default:
      permissions = ['user'];
  }

  const mockUserInfo = {
    message: 'login success',
    user_id: 1,
    username: username || 'test-user',
    uuid: '2bfd19c5-abf9-40d0-903d-185c80e69fd4',
    permissions,
  };

  saveUserInfo(mockUserInfo);
  return mockUserInfo;
};
