const baseUrl = '/api/question/';

export async function createProm(data) {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || '创建题目失败');
  }

  return response.json();
}
