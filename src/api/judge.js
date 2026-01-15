/**
 * 代码运行和判题API
 * 从ide-part项目迁移而来，用于在线代码执行
 */
import axios from 'axios';

// 本地API配置
const API_BASE_URL = '/api'; // 使用相对路径，通过Vite代理转发到后端

// Judge0 API配置 - 在线代码执行服务（用于本地运行代码）
const JUDGE_API_URL = 'https://judge0-ce.p.rapidapi.com/submissions';
const headers = {
  'Content-Type': 'application/json',
  'X-RapidAPI-Key': '你的_API_KEY', // 需要替换为实际的API密钥
  'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
};

// 编程语言ID映射表
const languageIds = {
  python: 71, // Python 3
  cpp: 54, // C++ (GCC 9.2.0)
  java: 62, // Java (OpenJDK 13.0.1)
  go: 60, // Go (1.13.5)
};

/**
 * 运行代码并返回结果
 * @param {string} sourceCode - 源代码
 * @param {string} language - 编程语言 (python/cpp/java/go)
 * @param {string} input - 输入数据
 * @returns {Promise<string>} 运行结果
 */
export async function runCode(sourceCode, language = 'python', input = '') {
  try {
    // 发送代码执行请求
    const { data } = await axios.post(
      JUDGE_API_URL + '?base64_encoded=false&wait=true',
      {
        source_code: sourceCode,
        language_id: languageIds[language],
        stdin: input,
      },
      { headers }
    );

    // 返回执行结果
    return data.stdout || data.stderr || '运行失败';
  } catch (error) {
    console.error('代码运行失败:', error);
    return '网络错误或服务不可用';
  }
}

/**
 * 提交代码进行评测
 * @param {string} code - 提交的代码内容
 * @param {string} language - 编程语言 (python/cpp/java/go)
 * @param {string} userId - 用户ID
 * @param {number} questionNumber - 题目编号
 * @returns {Promise<Object>} 提交结果
 */
export async function submitCode(code, language, userId, questionNumber) {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/submission/`, {
      user_id: userId,
      question_number: questionNumber,
      code: code,
      language: language,
    });
    console.log('提交结果:', data);
    return data;
  } catch (error) {
    console.error('代码提交失败:', error);
    throw new Error(error.response?.data?.message || '提交失败，请稍后重试');
  }
}

/**
 * 获取提交结果
 * @param {string} submissionId - 提交ID
 * @returns {Promise<Object>} 评测结果
 */
export async function getSubmissionResult(submissionId) {
  try {
    const { data } = await axios.get(
      `${API_BASE_URL}/submission/${submissionId}`
    );
    return data;
  } catch (error) {
    console.error('获取提交结果失败:', error);
    throw new Error(
      error.response?.data?.message || '获取结果失败，请稍后重试'
    );
  }
}

/**
 * 清理参数中的无效值（undefined, null, ''）
 * @param {Object} params - 查询参数对象
 * @returns {Object} 清理后的参数对象
 */
const cleanParams = (params) => {
  if (!params) return {};
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  );
};

/**
 * 限制分页大小在有效范围内（1-100）
 * @param {number|string} size - 分页大小参数
 * @param {number} max - 最大允许值（默认100）
 * @returns {number|undefined} 清理后的分页大小（有效范围1-100）
 */
const clampPageSize = (size, max = 100) => {
  const n = Number(size);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.min(Math.floor(n), max);
};

/**
 * 获取题目提交记录
 * @param {number} questionNumber - 题目编号
 * @param {Object} [params={}] - 查询参数（page, size, status, language）
 * @returns {Promise<Object>} 提交记录列表
 */
export async function getProblemSubmissions(
  questionNumber,
  { page = 1, size = 20, status, language } = {}
) {
  try {
    const { data } = await axios.get(
      `${API_BASE_URL}/api/problems/${questionNumber}/submissions`,
      {
        params: cleanParams({
          page,
          size: clampPageSize(size),
          status,
          language,
        }),
      }
    );
    // console.log('获取题目提交记录:', data);
    return data;
  } catch (error) {
    console.error('获取题目提交记录失败:', error);
    throw new Error(
      error.response?.data?.message || '获取题目提交记录失败，请稍后重试'
    );
  }
}

/**
 * 获取个人提交记录
 * @param {string} userId - 用户ID
 * @param {Object} [params={}] - 查询参数（problem_id, page, size, status, language, operator_uuid, user_uuid）
 * @returns {Promise<Object>} 提交记录列表
 */
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
  try {
    const { data } = await axios.get(
      `${API_BASE_URL}/api/users/${userId}/submissions`,
      {
        params: cleanParams({
          problem_id,
          page,
          size: clampPageSize(size),
          status,
          language,
          operator_uuid,
        }),
        headers: user_uuid ? { 'X-User-UUID': user_uuid } : undefined,
      }
    );
    return data;
  } catch (error) {
    console.error('获取个人提交记录失败:', error);
    throw new Error(
      error.response?.data?.message || '获取个人提交记录失败，请稍后重试'
    );
  }
}

/**
 * 获取支持的编程语言列表
 * @returns {Array} 支持的语言列表
 */
export function getSupportedLanguages() {
  return Object.keys(languageIds);
}

/**
 * 模拟本地代码运行（用于开发测试）
 * @param {string} sourceCode - 源代码
 * @param {string} language - 编程语言
 * @param {string} input - 输入数据
 * @returns {Promise<string>} 模拟运行结果
 */
export async function mockRunCode(sourceCode, language = 'python', input = '') {
  // 模拟延迟
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 简单的模拟逻辑
  if (language === 'python' && sourceCode.includes('print')) {
    return `模拟输出: Hello World!\n输入: ${input}`;
  }

  return `模拟运行成功\n语言: ${language}\n输入: ${input}`;
}

/**
 * 模拟代码提交（用于开发测试）
 * @param {string} code - 提交的代码内容
 * @param {string} language - 编程语言
 * @param {string} userId - 用户ID
 * @param {number} questionNumber - 题目编号
 * @returns {Promise<Object>} 模拟提交结果
 */
export async function mockSubmitCode(code, language, userId, questionNumber) {
  // 模拟延迟
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // 生成随机UUID作为提交ID
  const submissionId = 'mock-' + Math.random().toString(36).substring(2, 15);

  return {
    submission_id: submissionId,
    user_id: userId,
    question_number: questionNumber,
    question_id: questionNumber,
    status: 'pending',
    message: '代码已提交，正在评测中',
    created_at: new Date().toISOString(),
  };
}
