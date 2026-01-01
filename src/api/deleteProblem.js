/**
 * 删除题目
 *
 * @param {*} id 题目编号
 * @param {*} uuid 用户编号
 * @returns 删除结果
 */
export async function deleteProblem(id, uuid) {
  try {
    const response = await fetch(`/api/question/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: id,
        uuid: uuid,
      }),
    });
    if (!response.ok) {
      throw new Error('删除题目失败');
    }
    const result = await response.json();
    // console.log(result);
    return result;
  } catch (error) {
    throw error;
  }
}
