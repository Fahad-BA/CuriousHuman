// Pending.js
import React, { useEffect, useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

function Pending() {
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [status, setStatus] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [adminMode, setAdminMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPending();
    const token = localStorage.getItem('admin_token');
    if (token === 'zagrart-approved') setAdminMode(true);
  }, []);

  const fetchPending = async () => {
    try {
      const response = await fetch('https://api.fhidan.com/pending');
      const data = await response.json();
      if (data.questions) setPendingQuestions(data.questions);
    } catch (err) {
      console.error(err);
      setStatus('❌ ما قدرنا نجيب الأسئلة المعلقة');
    }
  };

  const openModal = (id) => {
    setSelectedId(id);
    setAnswerText('');
  };

  const submitAnswer = async () => {
    if (!answerText.trim()) return;

    try {
      await fetch(`https://api.fhidan.com/answer/${selectedId}`, { method: 'DELETE' });
      const response = await fetch(`https://api.fhidan.com/answer/${selectedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer_text: answerText })
      });

      if (response.ok) {
        setStatus('✅ تم إرسال الإجابة');
        setSelectedId(null);
        fetchPending();
      } else {
        setStatus('❌ فشل في إرسال الإجابة');
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ خطأ في الاتصال بالسيرفر');
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('هل أنت متأكد أنك تريد حذف هذا السؤال نهائيًا؟');
    if (!confirm) return;

    try {
      const response = await fetch(`https://api.fhidan.com/question/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setStatus('🗑 تم حذف السؤال نهائيًا');
        fetchPending();
      } else {
        setStatus('❌ فشل في حذف السؤال');
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ خطأ في الاتصال أثناء الحذف');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setAdminMode(false);
    setStatus('🚪 تم تسجيل الخروج');
    navigate('/');
  };

  function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'الآن';
    if (diffMin < 60) return `قبل ${diffMin} دقيقة`;
    if (diffHr < 24) return `قبل ${diffHr} ساعة`;
    if (diffDays <= 6) return `قبل ${diffDays} يوم`;

    return date.toLocaleString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  }

  return (
    <div className="container">
      <div className="top-bar">
        <button onClick={() => navigate('/')}>🏠 الصفحة الرئيسية</button>
        {adminMode && (
          <button onClick={handleLogout}>🚪 خروج</button>
        )}
      </div>

      <h2>🟡 الأسئلة المعلّقة (مخفية أو غير مجابة)</h2>
      {status && <p className="status">{status}</p>}

      {pendingQuestions.length === 0 ? (
        <p>لا يوجد أسئلة معلّقة</p>
      ) : (
        pendingQuestions.map((q) => (
          <div key={q.id} className="answered-card">
            <p><strong>❓ {q.question_text}</strong></p>
            <p className="timestamp">🕒 {formatTimeAgo(q.created_at)}</p>
            {adminMode && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => openModal(q.id)}>✍️ جاوب الآن</button>
                <button onClick={() => handleDelete(q.id)} className="danger">🗑 حذف نهائي</button>
              </div>
            )}
          </div>
        ))
      )}

      {selectedId && (
        <div className="modal">
          <div className="modal-content">
            <h3>أدخل إجابتك</h3>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="الإجابة هنا..."
            />
            <button onClick={submitAnswer}>إرسال</button>
            <button className="cancel" onClick={() => setSelectedId(null)}>إلغاء</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pending;