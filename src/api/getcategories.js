/**
 * 返回数据库中的全部分类，用于给到前端题库进行筛选以及创建题目时拿到分类id给到后端
 */
const baseUrl = '/api/category/';

/**
 * 获取数据库中的全部分类
 *
 * @returns 全部分类
 */
export async function getCategories() {
  try {
    const response = await fetch(baseUrl);
    if (!response.ok) {
      console.error('获取分类失败');
      return [];
    }
    const result = await response.json();
    return result.result;
  } catch (error) {
    console.error(error);
    return [];
  }
}
