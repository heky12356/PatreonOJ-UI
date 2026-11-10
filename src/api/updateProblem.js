export async function updateProblem(data, id) {
  const response = await fetch(`/api/question/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || '更新题目失败');
  }

  return response.json();
}
