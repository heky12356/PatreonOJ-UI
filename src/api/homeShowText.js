const baseUrl = '/api';

/**
 * 获取首页展示文本
 * @returns 首页展示文本
 */
export async function getHomeShowText() {
  try {
    const response = await fetch(baseUrl + '/overview/getHomeText');
    if (!response.ok) {
      throw new Error('获取首页展示文本失败');
    }
    const data = await response.json();
    return data.home_text;
  } catch (err) {
    console.error('获取首页展示文本失败:', err);
    return err;
  }
}

/**
 * 设置首页展示文本
 * @param {*} text 首页展示文本
 * @returns 设置结果
 */
export async function updateHomeText(text) {
  try {
    const response = await fetch(baseUrl + '/overview/updateHomeText', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ home_text: text }),
    });
    if (!response.ok) {
      throw new Error('设置首页展示文本失败');
    }
    const result = await response.json();
    return result;
  } catch (err) {
    console.error('设置首页展示文本失败:', err);
    return err;
  }
}
