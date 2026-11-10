export async function deleteProblem(id, uuid) {
  const response = await fetch('/api/question/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id,
      uuid,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || '删除题目失败');
  }

  return response.json();
}
