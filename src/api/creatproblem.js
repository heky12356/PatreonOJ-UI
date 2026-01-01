/**
 * 这是一个创建题目的api
 */
const baseUrl = '/api/question/';

/**
 * 创建题目
 *
 * @param {*} data 题目数据
 * @returns 创建结果
 */
export async function createProm(data) {
  try {
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
    // console.log(result);
    return result;
  } catch (error) {
    throw error;
  }
}
