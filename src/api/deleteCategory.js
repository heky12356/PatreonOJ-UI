/**
 * 删除分类
 * @param {*} id 分类id
 * @returns 分类删除结果
 */
export async function deleteCategory(id) {
  try {
    const response = await fetch(`/api/category/delete/${id}`, {
      method: 'delete',
    });
    if (!response.ok) {
      console.error('删除分类失败');
      return {
        code: 400,
        message: '删除分类失败',
      };
    }
    return {
      code: 200,
      message: '删除分类成功',
    };
  } catch (error) {
    console.error(error);
    return '删除分类失败';
  }
}
