import { syncQuestionToNeo4j } from './graph.js';

export async function updateProblem(data, id) {
  const response = await fetch('/api/question/' + id, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const result = await response.json();
    console.log(result);
    throw new Error('创建题目失败');
  }
  const result = await response.json();

  // console.log(result);

  const questionNumber = result?.data?.question_number;

  if (
    questionNumber !== undefined &&
    questionNumber !== null &&
    String(questionNumber).trim() !== ''
  ) {
    syncQuestionToNeo4j(questionNumber).catch(() => { });
  }

  return result;
}
