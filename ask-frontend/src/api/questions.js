const BASE_URL = 'https://api.fhidan.com';

export async function fetchPendingQuestions() {
  const res = await fetch(`${BASE_URL}/pending`);
  const data = await res.json();
  return data.questions || [];
}

export async function submitAnswer(questionId, answerText) {
  await fetch(`${BASE_URL}/answer/${questionId}`, { method: 'DELETE' }); // نضمن دايمًا ما فيه إجابة سابقة
  const res = await fetch(`${BASE_URL}/answer/${questionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer_text: answerText })
  });
  return res.ok;
}

export async function deleteQuestion(questionId) {
  const res = await fetch(`${BASE_URL}/question/${questionId}`, { method: 'DELETE' });
  return res.ok;
}

export async function hideQuestion(questionId) {
  const res = await fetch(`${BASE_URL}/hide/${questionId}`, { method: 'POST' });
  return res.ok;
}

export async function fetchAnsweredQuestions() {
  const res = await fetch(`${BASE_URL}/questions`);
  const data = await res.json();
  return data.questions || [];
}

export async function submitQuestion(text) {
  const res = await fetch(`${BASE_URL}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question_text: text })
  });
  return res;
}
