/**
 * 题目关系图谱API
 * 用于获取题目之间的关系数据和学习路径
 */
import questionBankData from '../data/quesionBank.json';

// API基础URL，使用Vite代理配置
const API_BASE_URL = '/api';


/**
 * 获取所有题目数据
 * @returns {Promise} - 返回题目列表
 */
export const getAllQuestions = async () => {
  try {
    // 优先尝试从API获取
    const response = await fetch('/api/question/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('API返回数据:', data);

    // API返回的数据格式: { result: [...] }
    return data.result;
  } catch (error) {
    console.warn('从API获取题目失败，使用本地数据:', error);
    // 如果API失败，使用本地数据
    console.log('使用本地数据:', questionBankData);
    return questionBankData;
  }
};

/**
 * 获取题目的前置题目
 * @param {number} questionNumber - 题目编号
 * @returns {Promise} - 返回前置题目列表
 */
export const getPrerequisites = async (questionNumber) => {
  try {
    const response = await fetch(`${API_BASE_URL}/graph/questions/${questionNumber}/prerequisites`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('获取前置题目失败:', error);
    throw error;
  }
};

/**
 * 获取题目的进阶题目
 * @param {number} questionNumber - 题目编号
 * @returns {Promise} - 返回进阶题目列表
 */
export const getNextQuestions = async (questionNumber) => {
  try {
    const response = await fetch(`${API_BASE_URL}/graph/questions/${questionNumber}/next`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('获取进阶题目失败:', error);
    throw error;
  }
};

/**
 * 获取推荐题目
 * @param {number} questionNumber - 题目编号
 * @param {number} limit - 推荐题目数量限制，默认5
 * @returns {Promise} - 返回推荐题目列表
 */
export const getRecommendations = async (questionNumber, limit = 5) => {
  try {
    const url = `${API_BASE_URL}/graph/questions/${questionNumber}/recommendations?limit=${limit}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('获取推荐题目失败:', error);
    throw error;
  }
};

/**
 * 查找学习路径
 * @param {number} start - 起始题目编号
 * @param {number} end - 目标题目编号
 * @returns {Promise} - 返回学习路径
 */
export const findLearningPath = async (start, end) => {
  try {
    const response = await fetch(`${API_BASE_URL}/graph/path?start=${start}&end=${end}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('查找学习路径失败:', error);
    throw error;
  }
};

/**
 * 获取完整的题目关系图数据
 * 基于现有题目数据构建图谱
 * @param {Array} filterOptions - 筛选选项 {difficulties: [], tags: [], questionIds: []}
 * @returns {Promise} - 返回图谱数据
 */
export const getGraphData = async (filterOptions = {}) => {
  try {
    // 获取所有题目数据
    const allQuestions = await getAllQuestions();
    console.log('getGraphData', allQuestions);
    
    // 应用筛选条件
    let filteredQuestions = allQuestions;


    // 构建节点数据 - 适配API返回的数据结构
    const nodes = filteredQuestions.map(question => ({
      id: `${question.question_number}`,
      question_number: question.question_number,
      title: question.title,
      difficulty: question.difficulty,
      tags: question.tags || '',
      group: getDifficultyGroup(question.difficulty),
      description: question.content || question.description, // API使用content字段
      // 保留API的其他字段
      input_format: question.input_format,
      output_format: question.output_format,
      sample_input: question.sample_input,
      sample_output: question.sample_output,
      hint: question.hint,
      source: question.source
    }));

    // 构建关系链接 - 基于题目特征自动生成关系
    const links = await generateQuestionLinks(nodes);

    return { nodes, links };
  } catch (error) {
    console.error('获取图谱数据失败:', error);
    // 返回默认数据作为fallback
    return getDefaultGraphData();
  }
};

/**
 * 根据题目特征自动生成关系链接
 * @param {Array} nodes - 节点数组
 * @returns {Promise<Array>} - 返回链接数组
 */
const generateQuestionLinks = async (nodes) => {
  const links = [];
  
  // 尝试从API获取真实的关系数据
  for (const node of nodes) {
    try {
      // 获取前置题目关系
      const prerequisitesResponse = await getPrerequisites(node.question_number);
      console.log('getPrerequisites response:', prerequisitesResponse, node.question_number);
      
      // 处理API返回的prerequisites数据结构
      if (prerequisitesResponse && prerequisitesResponse.prerequisites && prerequisitesResponse.prerequisites.length > 0) {
        prerequisitesResponse.prerequisites.forEach(prereq => {
          const sourceNode = nodes.find(n => n.question_number === prereq.question_number);
          if (sourceNode) {
            links.push({
              source: sourceNode.id,
              target: node.id,
              value: 2,
              relation_type: 'PREREQUISITE'
            });
          }
        });
      }

      // 获取进阶题目关系
      const nextQuestionsResponse = await getNextQuestions(node.question_number);
      console.log('getNextQuestions response:', nextQuestionsResponse, node.question_number);
      
      // 处理API返回的next_questions数据结构
      if (nextQuestionsResponse && nextQuestionsResponse.next_questions && nextQuestionsResponse.next_questions.length > 0) {
        nextQuestionsResponse.next_questions.forEach(next => {
          const targetNode = nodes.find(n => n.question_number === next.question_number);
          if (targetNode) {
            links.push({
              source: node.id,
              target: targetNode.id,
              value: 2,
              relation_type: 'NEXT'
            });
          }
        });
      }

    } catch (error) {
      // API调用失败时，使用基于规则的关系生成
      console.warn(`获取题目 ${node.question_number} 的关系失败，使用规则生成:`, error);
    }
  }

  // 如果API调用失败或没有获取到关系，使用基于规则的关系生成
  if (links.length === 0) {
    console.log('未获取到API关系数据，使用规则生成关系');
    return generateRuleBasedLinks(nodes);
  }

  console.log('生成的关系链接:', links);
  return links;
};

/**
 * 基于规则生成题目关系链接
 * @param {Array} nodes - 节点数组
 * @returns {Array} - 返回链接数组
 */
const generateRuleBasedLinks = (nodes) => {
  const links = [];
  const sortedNodes = [...nodes].sort((a, b) => a.question_number - b.question_number);

  // 规则1: 难度递进关系
  const difficultyOrder = ['入门', '简单', '中等', '困难'];
  
  for (let i = 0; i < sortedNodes.length - 1; i++) {
    const currentNode = sortedNodes[i];
    const nextNode = sortedNodes[i + 1];
    
    const currentDiffIndex = difficultyOrder.indexOf(currentNode.difficulty);
    const nextDiffIndex = difficultyOrder.indexOf(nextNode.difficulty);
    
    // 如果下一题难度更高或相同，且题目编号相近，建立关系
    if (nextDiffIndex >= currentDiffIndex && 
        nextNode.question_number - currentNode.question_number <= 5) {
      links.push({
        source: currentNode.id,
        target: nextNode.id,
        value: 2,
        relation_type: nextDiffIndex > currentDiffIndex ? 'PREREQUISITE' : 'SIMILAR'
      });
    }
  }

  // 规则2: 相同标签的题目建立关系
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const node1 = nodes[i];
      const node2 = nodes[j];
      
      const tags1 = node1.tags.split(',').map(t => t.trim());
      const tags2 = node2.tags.split(',').map(t => t.trim());
      
      // 如果有共同标签，建立关系
      const commonTags = tags1.filter(tag => tags2.includes(tag));
      if (commonTags.length > 0 && Math.abs(node1.question_number - node2.question_number) <= 10) {
        links.push({
          source: node1.id,
          target: node2.id,
          value: 1,
          relation_type: 'RELATED'
        });
      }
    }
  }

  return links;
};

/**
 * 从题目ID中提取题目编号
 * @param {string} questionId - 题目ID (如 "p1000")
 * @returns {number} - 题目编号 (如 1000)
 */
const extractQuestionNumber = (questionId) => {
  const match = questionId.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
};

/**
 * 根据难度获取分组
 * @param {string} difficulty - 难度
 * @returns {number} - 分组编号
 */
const getDifficultyGroup = (difficulty) => {
  const difficultyMap = {
    '入门': 1,
    '简单': 2,
    '中等': 3,
    '困难': 4
  };
  return difficultyMap[difficulty] || 2;
};

// 辅助函数：根据题目编号获取难度（临时实现）
const getDifficultyByNumber = (number) => {
  if (number <= 1003) return '简单';
  if (number <= 1007) return '中等';
  return '困难';
};

// 辅助函数：根据题目编号获取标签（临时实现）
const getTagsByNumber = (number) => {
  const tags = ['数组', '哈希表', '双指针', '字符串', '动态规划', '贪心', '回溯'];
  return tags[number % tags.length];
};

// 默认图谱数据（作为fallback）
const getDefaultGraphData = () => {
  return {
    nodes: [
      { id: "1001", question_number: 1001, title: "两数之和", difficulty: "简单", tags: "数组,哈希表", group: 1 },
      { id: "1002", question_number: 1002, title: "两数相加", difficulty: "中等", tags: "链表,数学", group: 2 },
      { id: "1003", question_number: 1003, title: "无重复字符的最长子串", difficulty: "中等", tags: "哈希表,字符串", group: 2 },
      { id: "1004", question_number: 1004, title: "寻找两个正序数组的中位数", difficulty: "困难", tags: "数组,二分查找", group: 3 },
      { id: "1005", question_number: 1005, title: "最长回文子串", difficulty: "中等", tags: "字符串,动态规划", group: 2 },
    ],
    links: [
      { source: "1001", target: "1002", value: 2, relation_type: "PREREQUISITE" },
      { source: "1002", target: "1003", value: 2, relation_type: "NEXT" },
      { source: "1001", target: "1005", value: 2, relation_type: "PREREQUISITE" },
      { source: "1003", target: "1004", value: 2, relation_type: "NEXT" },
    ]
  };
};