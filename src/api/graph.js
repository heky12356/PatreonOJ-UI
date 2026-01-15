/**
 * 题目关系图谱API
 * 用于获取题目之间的关系数据和学习路径
 */

// API基础URL，使用Vite代理配置
const API_BASE_URL = '/api';
const DEFAULT_TIMEOUT_MS = 3000;

const fetchJson = async (url, { method = 'GET', params, body, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) => {
  const qs = params ? new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null)).toString() : '';
  const fullUrl = qs ? `${url}?${qs}` : url;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(fullUrl, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      throw new Error('接口返回数据格式错误');
    }

    if (!response.ok) {
      const msg = data && (data.message || data.error) ? (data.message || data.error) : `HTTP error! status: ${response.status}`;
      throw new Error(msg);
    }

    return data;
  } catch (e) {
    if (e && (e.name === 'AbortError')) {
      throw new Error('请求超时');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
};

/**
 * GET /graph/node
 * 响应字段：
 * - questions: 全部题目节点（QuestionNode）
 * - skills: 全部技能/标签节点（SkillNode）
 * - question_relations: 题目-题目关系
 * - question_skill_relations: 题目-技能关系（HAS_SKILL）
 * - skill_relations: 技能-技能关系
 * - edges: 统一边列表（from/to 使用 Q:1001、S:哈希表 形式）
 * - count/skill_count/edge_count: 数量统计
 */
export const getGraphNodePage = async ({ page = 1, pageSize = 200 } = {}) => {
  const data = await fetchJson(`${API_BASE_URL}/graph/node`, {
    method: 'GET',
    params: { page, page_size: pageSize },
  });

  const questions = Array.isArray(data?.questions)
    ? data.questions
    : (Array.isArray(data?.result) ? data.result : []);

  const skills = Array.isArray(data?.skills) ? data.skills : [];
  const edges = Array.isArray(data?.edges) ? data.edges : [];

  const count = typeof data?.count === 'number' ? data.count : questions.length;
  const skill_count = typeof data?.skill_count === 'number' ? data.skill_count : skills.length;
  const edge_count = typeof data?.edge_count === 'number' ? data.edge_count : edges.length;

  return {
    questions,
    skills,
    question_relations: data?.question_relations ?? null,
    question_skill_relations: Array.isArray(data?.question_skill_relations) ? data.question_skill_relations : null,
    skill_relations: Array.isArray(data?.skill_relations) ? data.skill_relations : null,
    edges,
    count,
    skill_count,
    edge_count,
  };
};

/**
 * 获取题目列表
 */
export const getAllQuestions = async () => {
  const { questions } = await getGraphNodePage();
  return questions;
};

export const getRelationList = async () => {
  return fetchJson(`${API_BASE_URL}/relation/`);
};

export const getNodeList = async () => {
  return fetchJson(`${API_BASE_URL}/node/`);
};

export const syncQuestionToNeo4j = async (questionNumber) => {
  return fetchJson(`${API_BASE_URL}/graph/questions/${questionNumber}/sync`, {
    method: 'POST',
  });
};

export const createGraphRelation = async ({
  from_question,
  to_question,
  relation_type,
  weight,
  description,
}) => {
  return fetchJson(`${API_BASE_URL}/graph/relations`, {
    method: 'POST',
    body: { from_question, to_question, relation_type, weight, description },
  });
};

export const deleteGraphRelation = async ({ from_question, to_question, relation_type }) => {
  return fetchJson(`${API_BASE_URL}/graph/relations`, {
    method: 'DELETE',
    body: { from_question, to_question, relation_type },
  });
};

export const getPrerequisites = async (questionNumber) => {
  return fetchJson(`${API_BASE_URL}/graph/questions/${questionNumber}/prerequisites`);
};

export const getNextQuestions = async (questionNumber) => {
  return fetchJson(`${API_BASE_URL}/graph/questions/${questionNumber}/next`);
};

export const getRecommendations = async (questionNumber, limit = 5) => {
  return fetchJson(`${API_BASE_URL}/graph/questions/${questionNumber}/recommendations`, {
    params: { limit },
  });
};

export const findLearningPath = async (start, end) => {
  return fetchJson(`${API_BASE_URL}/graph/path`, { params: { start, end } });
};

/**
 * 获取完整的题目关系图数据
 * 基于现有题目数据构建图谱
 * @param {Array} filterOptions - 筛选选项 {difficulties: [], tags: [], questionIds: []}
 * @returns {Promise} - 返回图谱数据
 */
export const getGraphData = async (filterOptions = {}) => {
  const page = filterOptions.page ?? 1;
  const pageSize = filterOptions.pageSize ?? 200;

  const graphNode = await getGraphNodePage({ page, pageSize });
  const { questions: allQuestions, count, edges, question_relations } = graphNode;

  const difficulties = Array.isArray(filterOptions.difficulties)
    ? filterOptions.difficulties
    : (filterOptions.difficulties ? [filterOptions.difficulties] : []);

  const tags = Array.isArray(filterOptions.tags)
    ? filterOptions.tags.filter(Boolean)
    : (filterOptions.tags ? [filterOptions.tags] : []);

  const questionIds = Array.isArray(filterOptions.questionIds)
    ? filterOptions.questionIds
    : (filterOptions.questionIds ? [filterOptions.questionIds] : []);

  let filteredQuestions = allQuestions;

  if (difficulties.length > 0 && !difficulties.includes('all')) {
    const diffSet = new Set(difficulties);
    filteredQuestions = filteredQuestions.filter((q) => diffSet.has(q.difficulty));
  }

  if (tags.length > 0) {
    const tagSet = new Set(tags.map((t) => String(t).trim()).filter(Boolean));
    filteredQuestions = filteredQuestions.filter((q) => {
      const qTags = String(q.tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      return qTags.some((t) => tagSet.has(t));
    });
  }

  if (questionIds.length > 0) {
    const idSet = new Set(questionIds.map((x) => String(x)));
    filteredQuestions = filteredQuestions.filter((q) => idSet.has(String(q.question_number)));
  }

  const nodes = filteredQuestions.map((question) => ({
    id: `${question.question_number}`,
    question_number: question.question_number,
    title: question.title,
    difficulty: question.difficulty,
    tags: question.tags || '',
    group: getDifficultyGroup(question.difficulty),
    description: question.content || question.description,
    input_format: question.input_format,
    output_format: question.output_format,
    sample_input: question.sample_input,
    sample_output: question.sample_output,
    hint: question.hint,
    source: question.source,
  }));

  const nodeIdSet = new Set(nodes.map((n) => String(n.id)));
  const links = [];
  const linkKeySet = new Set();

  const parseId = (x) => {
    const s = String(x ?? '');
    if (s.startsWith('Q:')) return s.slice(2);
    return s;
  };

  const q2qEdges = Array.isArray(edges)
    ? edges.filter((e) => String(e?.from || '').startsWith('Q:') && String(e?.to || '').startsWith('Q:'))
    : [];

  q2qEdges.forEach((e) => {
    const sourceId = parseId(e.from);
    const targetId = parseId(e.to);
    if (!nodeIdSet.has(sourceId) || !nodeIdSet.has(targetId)) return;

    const relationType = e.type || e.relation_type || 'RELATED';
    const value = typeof e.weight === 'number' ? e.weight : (typeof e.value === 'number' ? e.value : 1);

    const key = `${sourceId}->${targetId}:${relationType}`;
    if (linkKeySet.has(key)) return;
    linkKeySet.add(key);

    links.push({
      source: sourceId,
      target: targetId,
      value,
      relation_type: relationType,
    });
  });

  if (links.length === 0 && Array.isArray(question_relations)) {
    question_relations.forEach((r) => {
      const sourceId = String(r.from_question ?? r.from ?? r.source ?? '');
      const targetId = String(r.to_question ?? r.to ?? r.target ?? '');
      if (!nodeIdSet.has(sourceId) || !nodeIdSet.has(targetId)) return;

      const relationType = r.relation_type || r.type || 'RELATED';
      const value = typeof r.weight === 'number' ? r.weight : 1;

      const key = `${sourceId}->${targetId}:${relationType}`;
      if (linkKeySet.has(key)) return;
      linkKeySet.add(key);

      links.push({
        source: sourceId,
        target: targetId,
        value,
        relation_type: relationType,
      });
    });
  }

  if (links.length === 0) {
    const fallback = await generateQuestionLinks(nodes);
    fallback.forEach((l) => {
      const key = `${String(l.source)}->${String(l.target)}:${String(l.relation_type || '')}`;
      if (linkKeySet.has(key)) return;
      linkKeySet.add(key);
      links.push(l);
    });
  }

  return { nodes, links, count, page, pageSize };
};

/**
 * 根据题目特征自动生成关系链接
 * @param {Array} nodes - 节点数组
 * @returns {Promise<Array>} - 返回链接数组
 */
const generateQuestionLinks = async (nodes) => {
  const nodeIdSet = new Set(nodes.map((n) => String(n.id)));
  const links = [];
  const linkKeySet = new Set();

  for (const node of nodes) {
    const prerequisitesResponse = await getPrerequisites(node.question_number);

    const prereqs = Array.isArray(prerequisitesResponse?.prerequisites)
      ? prerequisitesResponse.prerequisites
      : [];

    prereqs.forEach((prereq) => {
      const sourceId = String(prereq.question_number);
      const targetId = String(node.id);
      if (!nodeIdSet.has(sourceId) || !nodeIdSet.has(targetId)) return;

      const key = `${sourceId}->${targetId}:PREREQUISITE`;
      if (linkKeySet.has(key)) return;
      linkKeySet.add(key);

      links.push({
        source: sourceId,
        target: targetId,
        value: 2,
        relation_type: 'PREREQUISITE',
      });
    });

    const nextQuestionsResponse = await getNextQuestions(node.question_number);

    const nexts = Array.isArray(nextQuestionsResponse?.next_questions)
      ? nextQuestionsResponse.next_questions
      : [];

    nexts.forEach((next) => {
      const sourceId = String(node.id);
      const targetId = String(next.question_number);
      if (!nodeIdSet.has(sourceId) || !nodeIdSet.has(targetId)) return;

      const key = `${sourceId}->${targetId}:NEXT`;
      if (linkKeySet.has(key)) return;
      linkKeySet.add(key);

      links.push({
        source: sourceId,
        target: targetId,
        value: 2,
        relation_type: 'NEXT',
      });
    });
  }

  return links;
};

/**
 * 根据难度获取分组
 * @param {string} difficulty - 难度
 * @returns {number} - 分组编号
 */
const getDifficultyGroup = (difficulty) => {
  const difficultyMap = {
    入门: 1,
    简单: 2,
    中等: 3,
    困难: 4,
  };
  return difficultyMap[difficulty] || 2;
};
