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

const unwrapApiData = (payload) => {
  if (!payload || typeof payload !== 'object') return payload;
  if (payload.data !== undefined) return payload.data;
  if (payload.result !== undefined) return payload.result;
  return payload;
};

const buildError = async (response) => {
  const text = await response.text();

  try {
    const payload = JSON.parse(text);
    const message =
      payload?.message || payload?.msg || payload?.error || `HTTP ${response.status}`;
    return new Error(String(message));
  } catch {
    return new Error(text || `HTTP ${response.status}`);
  }
};

const parseJson = async (response) => {
  if (!response.ok) {
    throw await buildError(response);
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

const normalizeFeedbackQuestion = (question) => ({
  question_id: question?.question_id ?? '',
  question_pk: question?.question_pk ?? question?.id ?? null,
  title: question?.title ?? '',
  difficulty: question?.difficulty ?? '',
  tags: question?.tags ?? '',
  reason: question?.reason ?? '',
});

const normalizeRecommendation = (item) => ({
  question_id: item?.question_id ?? '',
  question_pk: item?.question_pk ?? item?.id ?? null,
  title: item?.title ?? '',
  difficulty: item?.difficulty ?? '',
  tags: item?.tags ?? '',
  reason: item?.reason ?? '',
});

const normalizeGraphPayload = (payload) => ({
  truncated: Boolean(payload?.truncated),
  root_question_id: payload?.root_question_id ?? '',
  root_question_pk: payload?.root_question_pk ?? null,
  nodes: Array.isArray(payload?.nodes) ? payload.nodes : [],
  edges: Array.isArray(payload?.edges) ? payload.edges : [],
  tree: payload?.tree ?? null,
});

const normalizeFeedbackPayload = (payload, uuid) => ({
  user_uuid: payload?.user_uuid ?? uuid ?? '',
  stage: payload?.stage ?? '',
  weak_skills: Array.isArray(payload?.weak_skills) ? payload.weak_skills : [],
  mastered_skills: Array.isArray(payload?.mastered_skills)
    ? payload.mastered_skills
    : [],
  next_questions: Array.isArray(payload?.next_questions)
    ? payload.next_questions.map(normalizeFeedbackQuestion)
    : [],
  positive_feedback: payload?.positive_feedback ?? '',
});

const normalizeRecommendationsPayload = (payload) => ({
  recommendations: Array.isArray(payload?.recommendations)
    ? payload.recommendations.map(normalizeRecommendation)
    : [],
});

export const getUserLearningFeedback = async ({ uuid, limit = 5 } = {}) => {
  if (!uuid) {
    throw new Error('用户 uuid 不能为空');
  }

  const response = await fetch(
    `${API_BASE_URL}/learning/users/${uuid}/feedback${toQueryString({ limit })}`
  );
  const payload = await parseJson(response);
  const data = unwrapApiData(payload);

  return {
    ...payload,
    data: normalizeFeedbackPayload(data, uuid),
  };
};

export const getProblemRecommendations = async ({
  uuid,
  id,
  questionId,
  limit = 5,
} = {}) => {
  if (!uuid || ((id === undefined || id === null || id === '') && !questionId)) {
    return {
      data: {
        recommendations: [],
      },
    };
  }

  const routeTarget = id ?? questionId;
  const primary = await requestJson(
    `${API_BASE_URL}/learning/users/${uuid}/questions/${routeTarget}/recommendations${toQueryString({ limit })}`
  );

  if (!primary.ok && questionId && String(questionId) !== String(routeTarget)) {
    const compat = await requestJson(
      `${API_BASE_URL}/learning/users/${uuid}/questions/${questionId}/recommendations${toQueryString({ limit })}`
    );
    if (compat.ok) {
      return {
        ...compat.data,
        data: normalizeRecommendationsPayload(unwrapApiData(compat.data)),
      };
    }
  }

  if (!primary.ok) {
    throw primary.error || new Error('获取推荐题目失败');
  }

  return {
    ...primary.data,
    data: normalizeRecommendationsPayload(unwrapApiData(primary.data)),
  };
};

export const getQuestionGraph = async (id, { depth = 3 } = {}) => {
  if (id === undefined || id === null || id === '') {
    throw new Error('题目 id 不能为空');
  }

  const query = toQueryString({ depth });
  const candidates = [
    `${API_BASE_URL}/learning/questions/${id}/graph${query}`,
    `/learning/questions/${id}/graph${query}`,
  ];

  let lastErr = null;
  for (const url of candidates) {
    const result = await requestJson(url);
    if (result.ok) {
      return {
        ...result.data,
        data: normalizeGraphPayload(unwrapApiData(result.data)),
      };
    }
    lastErr = result.error;
  }

  throw lastErr || new Error('获取题目图谱失败');
};
