/**
 * 更新分类
 */
export async function updateCategory(data, id) {
  try {
    const response = await fetch(`/api/category/${id}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    // console.log(JSON.stringify(data));
    // console.log(response);
    if (!response.ok) {
      console.error('更新分类失败');
      return {
        code: 500,
        message: '更新分类失败',
      };
    }
    const result = await response.json();
    return {
      code: 200,
      message: '更新分类成功',
      data: result,
    };
  } catch (error) {
    console.error(error);
    return {
      code: 500,
      message: '更新分类失败',
    };
  }
}
