// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

function App() {
  const [question, setQuestion] = useState('');
  const [status, setStatus] = useState('');
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [adminMode, setAdminMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnsweredQuestions();
    const token = localStorage.getItem('admin_token');
    if (token === 'zagrart-approved') setAdminMode(true);
  }, []);

  const fetchAnsweredQuestions = async () => {
    try {
      const response = await fetch('https://api.fhidan.com/questions');
      const data = await response.json();
      if (data.questions) setAnsweredQuestions(data.questions);
    } catch (error) {
      console.error('❌ Error fetching answered questions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!question.trim()) {
      setStatus('❌ اكتب سؤال أول.');
      return;
    }

    try {
      const response = await fetch('https://api.fhidan.com/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_text: question })
      });

      if (response.ok) {
        setStatus('✅ تم إرسال سؤالك بنجاح');
        setQuestion('');
        fetchAnsweredQuestions();
      } else {
        const data = await response.json();
        setStatus(`❌ خطأ: ${data.error || 'فشل في الإرسال'}`);
      }
    } catch (error) {
      setStatus('❌ ما قدرنا نتصل بالسيرفر.');
    }
  };

  const handleAdminLogin = async () => {
    if (!adminPassword.trim()) {
      setStatus('❌ أدخل كلمة مرور');
      return;
    }

    try {
      const response = await fetch('https://api.fhidan.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      const data = await response.json();
      if (response.ok && data.token === 'zagrart-approved') {
        localStorage.setItem('admin_token', data.token);
        setAdminMode(true);
        setShowLogin(false);
        setStatus('✅ دخلت كآدمن');
        setAdminPassword('');
      } else {
        setStatus(`❌ ${data.error || 'كلمة المرور غير صحيحة'}`);
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setStatus('❌ ما قدرنا نتصل بالسيرفر');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setAdminMode(false);
    setStatus('🚪 تم تسجيل الخروج');
  };

  const handleDeleteAnswer = async (questionId) => {
    const confirm = window.confirm('هل أنت متأكد أنك تريد حذف الإجابة؟');
    if (!confirm) return;
    try {
      const res = await fetch(`https://api.fhidan.com/answer/${questionId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAnsweredQuestions();
        setStatus('🗑 تم حذف الإجابة');
      } else {
        setStatus('❌ فشل في حذف الإجابة');
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ خطأ أثناء الاتصال بالسيرفر');
    }
  };

  const formatTimeAgo = (dateString) => {
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
  };

  return (
    <div className="container">
      <div className="top-bar">
        {!adminMode && <button onClick={() => setShowLogin(true)}>🔐 تسجيل الدخول</button>}
        {adminMode && (
          <>
            <span className="admin-tag">ارحب 🛠</span>
            <button onClick={() => navigate('/pending')}>📥 الأسئلة المعلّقة</button>
            <button onClick={handleLogout}>🚪 خروج</button>
          </>
        )}
      </div>

      {showLogin && (
        <div className="modal">
          <div className="modal-content">
            <h3>كلمة مرور الآدمن</h3>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
            />
            <button onClick={handleAdminLogin}>دخول</button>
            <button className="cancel" onClick={() => setShowLogin(false)}>إلغاء</button>
          </div>
        </div>
      )}

      <h1>🤔⁉️</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="اكتب سؤالك هنا..."
        />
        <button type="submit">أرسل السؤال</button>
      </form>
      {status && <p className="status">{status}</p>}

      <div className="answered-section">
        <h2>📜 الإجابات</h2>
        {answeredQuestions.length === 0 ? (
          <p>مافيه اجابات.</p>
        ) : (
          answeredQuestions.map((item) => (
            <div key={item.id} className="answered-card">
              <p><strong>❓ {item.question_text}</strong></p>
              <p>💬 {item.answer_text}</p>
              <p className="timestamp">🕒 {formatTimeAgo(item.answered_at)}</p>
              {adminMode && (
                <button className="danger" onClick={() => handleDeleteAnswer(item.id)}>🗑 حذف الإجابة</button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;