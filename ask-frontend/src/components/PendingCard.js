import React from 'react';

function PendingCard({ question, onAnswer, onDelete, formatTimeAgo }) {
  return (
    <div className="answered-card">
      <p><strong>❓ {question.question_text}</strong></p>
      <p className="timestamp">🕒 {formatTimeAgo(question.created_at)}</p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => onAnswer(question.id)}>✍️ جاوب الآن</button>
        <button onClick={() => onDelete(question.id)} className="danger">🗑 حذف نهائي</button>
      </div>
    </div>
  );
}

export default PendingCard;
