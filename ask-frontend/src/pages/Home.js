import React, { useState, useEffect } from 'react';
import Login from '../components/Login';
import { fetchAnsweredQuestions, submitQuestion, hideQuestion, fetchPendingQuestions } from '../api/questions';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import { formatTimeAgo } from '../helpers/time';


const formatTextWithLinks = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split('\n').map((line, index) => (
    <span key={index}>
      {line.split(urlRegex).map((part, i) =>
        urlRegex.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a>
        ) : (
          part
        )
      )}
      <br />
    </span>
  ));
};

function Home() {
  const [question, setQuestion] = useState('');
  const [status, setStatus] = useState('');
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [adminMode, setAdminMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();

useEffect(() => {
  loadPendingCount();
  const token = localStorage.getItem('admin_token');
  if (token === 'zagrart-approved') setAdminMode(true);

  const hash = window.location.hash;
  if (hash && hash.startsWith('#q')) {
    const id = parseInt(hash.replace('#q', ''), 10);
    if (!isNaN(id)) {
      fetchAnsweredQuestions().then((all) => {
        const target = all.find((q) => q.id === id);
        if (target) {
          setAnsweredQuestions([target]);
        } else {
          setStatus('❌ لم يتم العثور على السؤال');
        }
      });
      return;
    }
  }

  loadQuestions();

  // تحديث عدد الأسئلة المعلّقة كل 10 ثواني
  const interval = setInterval(() => {
    loadPendingCount();
  }, 10000);

  // تنظيف التايمر عند الخروج
  return () => clearInterval(interval);
}, []);


  const loadQuestions = async () => {
    const questions = await fetchAnsweredQuestions();
    setAnsweredQuestions(questions);
  };

  const loadPendingCount = async () => {
  const pending = await fetchPendingQuestions();
  setPendingCount(pending.length);
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!question.trim()) {
      setStatus('❌ اكتب سؤال أول.');
      return;
    }

    const res = await submitQuestion(question.trim());
    if (res.ok) {
      setStatus('✅ تم إرسال سؤالك بنجاح');
      setQuestion('');
      loadQuestions();
    } else {
      const data = await res.json();
      setStatus(`❌ خطأ: ${data.error || 'فشل في الإرسال'}`);
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
        loadQuestions();
      } else {
        setStatus(`❌ ${data.error || 'كلمة المرور غير صحيحة'}`);
      }
    } catch (err) {
      setStatus('❌ ما قدرنا نتصل بالسيرفر');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setAdminMode(false);
    setStatus('👋 تم تسجيل الخروج');
    navigate('/');
  };

  const handleHide = async (id) => {
    const ok = await hideQuestion(id);
    if (ok) {
      setStatus('✅ تم إخفاء السؤال');
      loadQuestions();
    } else {
      setStatus('❌ فشل في الإخفاء');
    }
  };

  const handlePostToX = (q) => {
    const baseUrl = 'https://ask.fhidan.com';
    const url = `${baseUrl}/#q${q.id}`;

    let text = `❓| ${q.question_text} \n💬| ${q.answer_text}\n🔗| ${url}`;
    if (text.length > 280) {
      const cutoff = 250 - url.length;
      text = `❓| ${q.question_text.slice(0, cutoff / 2)}... \n💬| ${q.answer_text.slice(0, cutoff / 2)}...\n🔗| ${url}`;
    }

    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(tweetUrl, '_blank');
  };

  return (
    <div className="container">
      <div className="top-bar">
      {/* <button onClick={() => window.location.href = '/'}>🏠 الصفحة الرئيسية</button> */}
        {adminMode ? (
          <>
            <button onClick={handleLogout}>🚪 تسجيل خروج</button>
            <button onClick={() => navigate('/pending')}>
            📥 الأسئلة ({pendingCount})
            </button>

          </>
        ) : (
          <button onClick={() => setShowLogin(true)}>🔐 تسجيل الدخول</button>
        )}
      </div>

      {showLogin && (
        <Login
          adminPassword={adminPassword}
          setAdminPassword={setAdminPassword}
          handleAdminLogin={handleAdminLogin}
          closeModal={() => setShowLogin(false)}
        />
      )}

      <h1>⁉️🤔</h1>
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
          <p>لا يوجد إجابات...</p>
        ) : (
          answeredQuestions.map((item) => (
            <div key={item.id} id={`q${item.id}`} className="answered-card">
            <p><strong>❓| {formatTextWithLinks(item.question_text)}</strong></p>
            <p>💬| {formatTextWithLinks(item.answer_text)}</p>

<p className="timestamp">
  <span
    onClick={() => {
      const el = document.getElementById(`q${item.id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }}
    className="timestamp"
    style={{ cursor: 'pointer', textDecoration: 'underline' }}
  >
    📅 {formatTimeAgo(item.answered_at)}
  </span>
</p>


              {adminMode && (
                <>
                  <button onClick={() => handleHide(item.id)}>🛑 إخفاء</button>
                  <button className="x-post" onClick={() => handlePostToX(item)}>
                    <i className="fab fa-x-twitter"></i> نشـر
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;
