import React from 'react';

function AnswerModal({ answerText, setAnswerText, onSubmit, onCancel }) {
  return (
    <div className="modal">
      <div className="modal-content">
        <h3>🔫 جاوب</h3>
        <textarea
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder="الإجابة هنا..."
        />
        <button onClick={onSubmit}>إرسال</button>
        <button className="cancel" onClick={onCancel}>إلغاء</button>
      </div>
    </div>
  );
}

export default AnswerModal;
