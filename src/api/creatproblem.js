/**
 * 这是一个创建题目的api
 */
import { syncQuestionToNeo4j } from './graph.js';

const baseUrl = '/api/question/';

/**
 * 创建题目
 *
 * @param {*} data 题目数据
 * @returns 创建结果
 */
export async function createProm(data) {
  try {
    console.log(data);
    const response = await fetch(baseUrl, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('创建题目失败');
    }
    const result = await response.json();
    console.log(result);

    const questionNumber = result?.data?.question_number;

    if (
      questionNumber !== undefined &&
      questionNumber !== null &&
      String(questionNumber).trim() !== ''
    ) {
      syncQuestionToNeo4j(questionNumber).catch(() => {});
    }

    return result;
  } catch (error) {
    throw error;
  }
}
