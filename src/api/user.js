// src/api/user.js
import axios from 'axios';

// API基础URL，可以根据环境配置
const API_BASE_URL = '/api';

/**
 * 用户注册
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise} - 返回注册结果
 */
export const register = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user/register`, {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    // console.error('注册失败:', error);
    throw error;
  }
};

/**
 * 用户登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise} - 返回登录结果，包含用户信息和token
 */
export const login = async (username, password) => {
  try {
    const response = await axios.post(`api/user/login`, {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    // console.error('登录失败:', error);
    throw error;
  }
};

/**
 * 保存用户信息到本地存储
 * @param {Object} userInfo - 用户信息对象
 */
export const saveUserInfo = (userInfo) => {
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
};

/**
 * 获取本地存储的用户信息
 * @returns {Object|null} - 返回用户信息对象，如果不存在则返回null
 */
export const getUserInfo = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

/**
 * 清除本地存储的用户信息（登出）
 */
export const clearUserInfo = () => {
  localStorage.removeItem('userInfo');
};

/**
 * 检查用户是否已登录
 * @returns {boolean} - 返回是否已登录
 */
export const isLoggedIn = () => {
  return !!getUserInfo();
};

/**
 * 获取当前登录用户ID
 * @returns {number|null} - 返回用户ID，如果未登录则返回null
 */
export const getUserId = () => {
  const userInfo = getUserInfo();
  return userInfo ? userInfo.uuid : null;
};

/**
 * 获取当前用户权限列表
 * @returns {string[]|null} - 返回权限数组，如果未登录则返回null
 */
export const getUserPermissions = () => {
  const userInfo = getUserInfo();
  return userInfo ? userInfo.permissions || [] : null;
};

/**
 * 检查用户是否拥有指定权限
 * @param {string|string[]} permission - 权限名称或权限数组
 * @returns {boolean} - 返回是否拥有权限
 */
export const hasPermission = (permission) => {
  const userPermissions = getUserPermissions();
  if (!userPermissions) return false;

  if (Array.isArray(permission)) {
    return permission.some((p) => userPermissions.includes(p));
  }
  return userPermissions.includes(permission);
};

// 辅助函数：清理参数中的undefined、null和空字符串
const cleanParams = (params) => {
  if (!params) return {};
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  );
};

// 辅助函数：如果operator_uuid不存在，则使用当前登录用户ID
const withOperatorUuid = (operator_uuid) => {
  const op = operator_uuid ?? getUserId();
  return op ? { operator_uuid: op } : {};
};

// 辅助函数：确保路径以斜杠结尾
const ensureDirSuffix = (prefix) => {
  if (!prefix) return '';
  return prefix.endsWith('/') ? prefix : `${prefix}/`;
};

// 辅助函数：通过预签名URL上传文件到OSS
const putToPresignedUrl = async (url, file) => {
  const contentType =
    file && file.type ? file.type : 'application/octet-stream';

  await axios.put(url, file, {
    headers: {
      'Content-Type': contentType,
    },
  });
};

// 获取OSS预签名上传URL
const getOssUploadUrl = async ({ filename, path }) => {
  const response = await axios.get(`${API_BASE_URL}/oss/upload-url`, {
    params: {
      filename,
      path,
    },
  });
  return response.data;
};

// 获取用户信息
export const getUserByUuid = async (uuid, { operator_uuid } = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/${uuid}`, {
      params: cleanParams(withOperatorUuid(operator_uuid)),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 更新用户信息
export const updateUserByUuid = async (
  uuid,
  payload,
  { operator_uuid } = {}
) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/user/${uuid}`, payload, {
      params: cleanParams(withOperatorUuid(operator_uuid)),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 更新用户头像并同步更新用户信息
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
  if (!uuid) throw new Error('uuid 不能为空');
  if (!avatarFile) throw new Error('avatarFile 不能为空');

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
    avatarValue = `oss/${bucket}/${avatarValue}`;
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

  return { upload: uploaded, avatar: avatarValue, update: updateResp };
};

// 获取用户掌握的题目列表
export const getUserMasteryQuestions = async (
  uuid,
  { operator_uuid, pageIdx, pageSize, min_mastery, sort, order } = {}
) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/user/${uuid}/mastery/questions`,
      {
        params: cleanParams({
          ...withOperatorUuid(operator_uuid),
          pageIdx,
          pageSize,
          min_mastery,
          sort,
          order,
        }),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 获取用户掌握的标签列表
export const getUserMasteryTags = async (
  uuid,
  { operator_uuid, pageIdx, pageSize, min_mastery, sort, order } = {}
) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/user/${uuid}/mastery/tags`,
      {
        params: cleanParams({
          ...withOperatorUuid(operator_uuid),
          pageIdx,
          pageSize,
          min_mastery,
          sort,
          order,
        }),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 提交用户掌握事件
export const postUserMasteryEvent = async (
  uuid,
  payload,
  { operator_uuid } = {}
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/user/${uuid}/mastery/events`,
      payload,
      {
        params: cleanParams(withOperatorUuid(operator_uuid)),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 重置用户掌握的题目
export const resetUserMasteryQuestion = async (
  uuid,
  questionNumber,
  { operator_uuid } = {}
) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/user/${uuid}/mastery/questions/${questionNumber}`,
      {
        params: cleanParams(withOperatorUuid(operator_uuid)),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 重置用户掌握的标签
export const resetUserMasteryTag = async (
  uuid,
  tag,
  { operator_uuid } = {}
) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/user/${uuid}/mastery/tags`,
      {
        params: cleanParams({
          ...withOperatorUuid(operator_uuid),
          tag,
        }),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * 模拟登录（开发环境使用）
 * @param {string} username - 用户名
 * @param {string} role - 角色类型（admin, teacher, student, user）
 * @returns {Object} - 返回模拟的用户信息
 */
export const mockLogin = (username, role = 'user') => {
  // 根据角色设置权限
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
    message: '登录成功',
    user_id: 1,
    username: username || '测试用户',
    uuid: '2bfd19c5-abf9-40d0-903d-185c80e69fd4',
    permissions: permissions,
  };

  saveUserInfo(mockUserInfo);
  return mockUserInfo;
};
