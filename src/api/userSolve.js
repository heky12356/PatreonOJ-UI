import axios from 'axios';

const API_BASE_URL = '/api';

const extractErrMsg = (error, fallback) =>
  error?.response?.data?.msg ||
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const normalizeSolvedIds = (payload) => {
  if (Array.isArray(payload)) {
    return payload
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item) && item > 0);
  }

  if (payload && typeof payload === 'object') {
    const source = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.result)
        ? payload.result
        : [];

    return source
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item) && item > 0);
  }

  return [];
};

export async function getMyProblemStatuses(ids, { signal, expectedUuid } = {}) {
  const { data } = await axios.get('/api/user/me/problem-status', { params: { ids: ids.join(',') }, signal });
  const body = data?.data ?? data?.result ?? data;
  if (expectedUuid && body.user_uuid !== expectedUuid) throw new Error('登录状态已变化，请重新登录');
  return body.statuses || {};
}

export async function getUserSolvedQuestionIds(uuid) {
  if (!uuid) {
    return [];
  }

  try {
    const { data } = await axios.get(`${API_BASE_URL}/user/solves/${uuid}`);
    return normalizeSolvedIds(data);
  } catch (error) {
    throw new Error(extractErrMsg(error, '获取已通过题目列表失败'));
  }
}

export async function getUserQuestionSolved({ uuid, id, questionId } = {}) {
  if (!uuid) {
    return { solved: false };
  }

  const resolvedId = id ?? questionId;
  if (resolvedId === undefined || resolvedId === null || resolvedId === '') {
    throw new Error('题目 id 不能为空');
  }

  try {
    const { data } = await axios.get(`${API_BASE_URL}/user/solve/`, {
      params: {
        uuid,
        id: resolvedId,
      },
    });

    return {
      solved: Boolean(data?.solved),
    };
  } catch (error) {
    throw new Error(extractErrMsg(error, '获取题目完成状态失败'));
  }
}
