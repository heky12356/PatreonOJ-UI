import { getUserId, isLoggedIn } from './user.js';

const API_BASE_URL = '/api';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );

const toQueryString = (params = {}) => {
  const qs = new URLSearchParams(cleanParams(params)).toString();
  return qs ? `?${qs}` : '';
};

const parseJson = async (response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
  return response.json();
};

const requestJson = async (url) => {
  try {
    const response = await fetch(url);
    const data = await parseJson(response);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error };
  }
};

const unwrapApiData = (payload) => {
  if (!payload || typeof payload !== 'object') return payload;
  if (payload.data !== undefined) return payload.data;
  if (payload.result !== undefined) return payload.result;
  return payload;
};

const normalizeListResp = (
  payload,
  fallbackPageIdx = 1,
  fallbackPageSize = 20
) => {
  const body = payload && typeof payload === 'object' ? payload : {};
  const data = unwrapApiData(body);

  const result = Array.isArray(body.result)
    ? body.result
    : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.list)
        ? data.list
        : Array.isArray(data)
          ? data
          : [];

  const pageIdx = Number(
    body.pageIdx ?? data?.pageIdx ?? data?.page ?? fallbackPageIdx
  );
  const pageSize = Number(
    body.pageSize ?? data?.pageSize ?? data?.size ?? fallbackPageSize
  );
  const totalCnt = Number(
    body.totalCnt ?? data?.totalCnt ?? data?.total ?? data?.count ?? result.length
  );

  return {
    ...body,
    result,
    pageIdx: Number.isFinite(pageIdx) && pageIdx > 0 ? pageIdx : fallbackPageIdx,
    pageSize:
      Number.isFinite(pageSize) && pageSize > 0 ? pageSize : fallbackPageSize,
    totalCnt: Number.isFinite(totalCnt) && totalCnt >= 0 ? totalCnt : result.length,
  };
};

const normalizeDetailResp = (payload) => {
  const body = payload && typeof payload === 'object' ? payload : {};
  if (body.data !== undefined) return body;
  if (body.result !== undefined) return { ...body, data: body.result };
  return { ...body, data: body };
};

export async function getProblem({ q, pageIdx, pageSize, difficult } = {}) {
  const params = {
    q,
    pageIdx,
    pageSize,
    difficult,
  };

  if (isLoggedIn()) {
    params.uuid = getUserId();
  }

  const response = await fetch(
    `${API_BASE_URL}/question/${toQueryString(params)}`
  );
  const data = await parseJson(response);
  return normalizeListResp(data, Number(pageIdx) || 1, Number(pageSize) || 20);
}

export async function getProblemById(id) {
  const primary = await requestJson(`${API_BASE_URL}/question/${id}`);
  if (primary.ok) {
    return normalizeDetailResp(primary.data);
  }

  const compat = await requestJson(`${API_BASE_URL}/question/id/${id}`);
  if (compat.ok) {
    return normalizeDetailResp(compat.data);
  }

  throw primary.error || compat.error || new Error('获取题目详情失败');
}

export async function getProblemByNumber(id) {
  return getProblemById(id);
}

export async function getNewProblems({ pageIdx = 1, pageSize = 3 } = {}) {
  const response = await fetch(
    `${API_BASE_URL}/question/new${toQueryString({ pageIdx, pageSize })}`
  );
  const data = await parseJson(response);
  return normalizeListResp(data, pageIdx, pageSize);
}
