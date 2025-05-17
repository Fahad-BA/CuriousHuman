import React, { useState } from 'react';

function AskPage() {
  const [question, setQuestion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    // send to backend (موصل لاحقًا)
    setSubmitted(true);
    setQuestion('');
  };

  return (
    <div>
      <h2>أرسل سؤالك</h2>
      {submitted ? (
        <p>تم الإرسال! شكرًا لسؤالك 👌</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="اكتب سؤالك هنا..."
            rows="4"
          />
          <button type="submit">إرسال</button>
        </form>
      )}
    </div>
  );
}

export default AskPage;
