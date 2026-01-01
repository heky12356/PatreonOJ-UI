export function updateProblem(data, id) {
  return fetch('/api/question/' + id, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}
