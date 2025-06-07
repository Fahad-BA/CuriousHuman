import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PendingCard from '../components/PendingCard';
import AnswerModal from '../components/AnswerModal';
import { fetchPendingQuestions, submitAnswer, deleteQuestion } from '../api/questions';
import { formatTimeAgo } from '../helpers/time';

function Pending() {
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [status, setStatus] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [adminMode, setAdminMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadPending();
    const token = localStorage.getItem('admin_token');
    if (token === 'zagrart-approved') setAdminMode(true);
  }, []);

  const loadPending = async () => {
    try {
      const questions = await fetchPendingQuestions();
      const sorted = questions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setPendingQuestions(sorted);
    } catch (err) {
      console.error(err);
      setStatus('❌ ما قدرنا نجيب الأسئلة المعلقة');
    }
  };

  const openModal = (id) => {
    setSelectedId(id);
    setAnswerText('');
  };

  const submit = async () => {
    if (!answerText.trim()) return;

    const ok = await submitAnswer(selectedId, answerText.trim());
    if (ok) {
      setStatus('✅ تم إرسال الإجابة');
      setSelectedId(null);
      loadPending();
    } else {
      setStatus('❌ فشل في إرسال الإجابة');
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('هل أنت متأكد أنك تريد حذف هذا السؤال نهائيًا؟');
    if (!confirm) return;

    const ok = await deleteQuestion(id);
    if (ok) {
      setStatus('🗑 تم حذف السؤال نهائيًا');
      loadPending();
    } else {
      setStatus('❌ فشل في حذف السؤال');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setAdminMode(false);
    setStatus('🚪 تم تسجيل الخروج');
    navigate('/');
  };

  return (
    <div className="container">
      <div className="top-bar">
        <button onClick={() => navigate('/')}>🏠 الصفحة الرئيسية</button>
        {adminMode && (
          <button onClick={handleLogout}>🚪 خروج</button>
        )}
      </div>

      <h2>🟡 الأسئلة المعلّقة</h2>
      {status && <p className="status">{status}</p>}

      {pendingQuestions.length === 0 ? (
        <p>لا يوجد أسئلة معلّقة</p>
      ) : (
        pendingQuestions.map((q) => (
          <PendingCard
            key={q.id}
            question={q}
            onAnswer={openModal}
            onDelete={handleDelete}
            formatTimeAgo={formatTimeAgo}
          />
        ))
      )}

      {selectedId && (
        <AnswerModal
          answerText={answerText}
          setAnswerText={setAnswerText}
          onSubmit={submit}
          onCancel={() => setSelectedId(null)}
        />
      )}

      {/* زر التحديث */}
      <div
        className="refresh-button"
        onClick={loadPending}
        title="تحديث الأسئلة"
      >
        🔃
      </div>
    </div>
  );
}

export default Pending;
