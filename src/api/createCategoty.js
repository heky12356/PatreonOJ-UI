/**
 * 创建分类
 */

export async function createCategory(data) {
  try {
    const response = await fetch('/api/category/', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.error('创建分类失败');
      return {
        success: false,
        message: '创建分类失败',
      };
    }
    const result = await response.json();
    return {
      success: true,
      message: '创建分类成功',
      data: result,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: '创建分类失败',
    };
  }
}
