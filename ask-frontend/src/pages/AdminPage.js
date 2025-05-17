import React, { useState } from 'react';

function AdminPage() {
  const [questions, setQuestions] = useState([
    'ليش اسم مشروعك الأسئلة؟',
    'وشلون أسوي موقع مثلك؟',
  ]);
  const [answers, setAnswers] = useState({});

  const handleAnswer = (index, value) => {
    setAnswers({ ...answers, [index]: value });
  };

  return (
    <div>
      <h2>لوحة التحكم</h2>
      {questions.map((q, index) => (
        <div key={index} className="admin-question">
          <p><strong>س:</strong> {q}</p>
          <textarea
            value={answers[index] || ''}
            onChange={(e) => handleAnswer(index, e.target.value)}
            placeholder="اكتب ردك هنا"
            rows="2"
          />
        </div>
      ))}
    </div>
  );
}

export default AdminPage;
