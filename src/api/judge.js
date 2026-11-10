import axios from 'axios';

const API_BASE_URL = '/api';

const languageIds = {
  python: 71,
  cpp: 54,
  java: 62,
  go: 60,
};

const unwrapApiData = (payload) => {
  if (!payload || typeof payload !== 'object') return payload;
  if (payload.data !== undefined) return payload.data;
  if (payload.result !== undefined) return payload.result;
  return payload;
};

const extractErrMsg = (error, fallback) =>
  error?.response?.data?.msg ||
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  );

const clampPageSize = (size, max = 100) => {
  const n = Number(size);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.min(Math.floor(n), max);
};

const normalizeSubmission = (payload) => {
  const raw = unwrapApiData(payload);
  if (!raw || typeof raw !== 'object') return raw;

  return {
    ...raw,
    code: raw.source_code ?? (typeof raw.code === 'string' ? raw.code : undefined),
    submission_id: raw.submission_id ?? raw.id,
    question_pk: raw.question_pk ?? raw.question_number ?? raw.problem_id,
    question_number: raw.question_number ?? raw.question_pk ?? raw.problem_id,
    passed_cases:
      raw.passed_cases ??
      (Array.isArray(raw.results)
        ? raw.results.filter((x) => x?.is_correct).length
        : undefined),
    total_cases: raw.total_cases ?? (Array.isArray(raw.results) ? raw.results.length : undefined),
  };
};

const normalizeSubmissionList = (payload, fallbackPage = 1, fallbackSize = 20) => {
  const body = payload && typeof payload === 'object' ? payload : {};
  const data = unwrapApiData(body);

  const items = Array.isArray(body.items)
    ? body.items
    : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.list)
        ? data.list
        : Array.isArray(data)
          ? data
          : [];

  const normalizedItems = items.map((x) => normalizeSubmission(x));

  const total = Number(body.total ?? data?.total ?? data?.count ?? normalizedItems.length);
  const page = Number(body.page ?? data?.page ?? fallbackPage);
  const size = Number(body.size ?? data?.size ?? fallbackSize);
  const pages = Number(body.pages ?? data?.pages ?? Math.max(1, Math.ceil((total || 0) / (size || 1))));

  return {
    ...body,
    total: Number.isFinite(total) ? total : normalizedItems.length,
    page: Number.isFinite(page) && page > 0 ? page : fallbackPage,
    size: Number.isFinite(size) && size > 0 ? size : fallbackSize,
    pages: Number.isFinite(pages) && pages > 0 ? pages : 1,
    items: normalizedItems,
  };
};

const resolveSubmitArgs = (...args) => {
  if (args.length === 1 && args[0] && typeof args[0] === 'object') {
    const obj = args[0];
    return {
      code: obj.code,
      language: obj.language,
      userId: obj.userId,
      questionPk: obj.questionPk,
      questionId: obj.questionId,
    };
  }

  const [code, language, userId, questionPk, questionId] = args;
  return { code, language, userId, questionPk, questionId };
};

export async function submitCode(...args) {
  const { code, language, userId, questionPk, questionId } = resolveSubmitArgs(...args);

  const payload = {
    user_id: userId,
    code,
  };

  // Keep compatibility for backends that still consume language in submit payload.
  if (language !== undefined && language !== null && language !== '') {
    payload.language = language;
  }

  if (questionPk !== undefined && questionPk !== null && questionPk !== '') {
    payload.question_pk = Number.isFinite(Number(questionPk))
      ? Number(questionPk)
      : questionPk;
  }

  if (questionId !== undefined && questionId !== null && questionId !== '') {
    payload.question_id = String(questionId);
  }

  try {
    const { data } = await axios.post(`${API_BASE_URL}/submission/`, payload);
    return normalizeSubmission(data);
  } catch (error) {
    throw new Error(extractErrMsg(error, '提交失败'));
  }
}

export async function getSubmissionResult(submissionId) {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/submission/${submissionId}`);
    return normalizeSubmission(data);
  } catch (error) {
    throw new Error(extractErrMsg(error, '获取提交结果失败'));
  }
}

export async function getProblemSubmissions(
  problemId,
  { page = 1, size = 20, status, language } = {}
) {
  const params = cleanParams({
    page,
    size: clampPageSize(size),
    status,
    language,
  });

  const candidates = [
    `/api/api/problems/${problemId}/submissions`,
    `/api/problems/${problemId}/submissions`,
    `/api/api/problems/id/${problemId}/submissions`,
    `/api/problems/id/${problemId}/submissions`,
  ];

  let lastErr = null;
  for (const url of candidates) {
    try {
      const { data } = await axios.get(url, { params });
      return normalizeSubmissionList(data, page, size);
    } catch (error) {
      lastErr = error;
      const statusCode = Number(error?.response?.status);
      if (statusCode !== 404 && statusCode !== 400) {
        throw new Error(extractErrMsg(error, '获取题目提交记录失败'));
      }
    }
  }

  throw new Error(extractErrMsg(lastErr, '获取题目提交记录失败'));
}

export async function getUserSubmissions(
  userId,
  {
    problem_id,
    page = 1,
    size = 20,
    status,
    language,
    operator_uuid,
    user_uuid,
  } = {}
) {
  const reqParams = cleanParams({
    problem_id,
    page,
    size: clampPageSize(size),
    status,
    language,
    operator_uuid,
  });
  const reqHeaders = user_uuid ? { 'X-User-UUID': user_uuid } : undefined;
  const candidates = [
    `/api/api/users/${userId}/submissions`,
    `/api/users/${userId}/submissions`,
  ];

  let lastErr = null;
  for (const url of candidates) {
    try {
      const { data } = await axios.get(url, {
        params: reqParams,
        headers: reqHeaders,
      });
      return normalizeSubmissionList(data, page, size);
    } catch (error) {
      lastErr = error;
      const statusCode = Number(error?.response?.status);
      if (statusCode !== 404 && statusCode !== 400) {
        throw new Error(extractErrMsg(error, '获取用户提交记录失败'));
      }
    }
  }

  throw new Error(extractErrMsg(lastErr, '获取用户提交记录失败'));
}

export function getSupportedLanguages() {
  return Object.keys(languageIds);
}

export async function mockRunCode(sourceCode, language = 'python', input = '') {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (language === 'python' && sourceCode.includes('print')) {
    return `模拟输出: Hello World!\n输入: ${input}`;
  }

  return `模拟运行成功\n语言: ${language}\n输入: ${input}`;
}

export async function mockSubmitCode(code, language, userId, questionNumber) {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const submissionId = `mock-${Math.random().toString(36).substring(2, 15)}`;

  return {
    submission_id: submissionId,
    user_id: userId,
    question_pk: questionNumber,
    question_number: questionNumber,
    question_id: String(questionNumber),
    status: 'pending',
    message: '代码已提交，正在评测中',
    created_at: new Date().toISOString(),
  };
}
