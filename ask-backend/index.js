require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 3001;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// اتصال تجريبي
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL'))
  .catch(err => console.error('❌ Connection error:', err));

// الصفحة الرئيسية
app.get('/', (req, res) => {
  res.send('As2ila Backend is running 🎉');
});

// تسجيل دخول الآدمن
app.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ token: 'zagrart-approved' });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// إرسال سؤال
app.post('/ask', async (req, res) => {
  const { question_text } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!question_text || question_text.trim() === '') {
    return res.status(400).json({ error: 'Question text is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO questions (question_text, ip_address) VALUES ($1, $2) RETURNING *',
      [question_text.trim(), ip]
    );

    res.status(201).json({ message: 'Question submitted!', question: result.rows[0] });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// عرض الأسئلة المجابة فقط
app.get('/questions', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT q.id, q.question_text, a.answer_text, q.created_at, a.created_at AS answered_at
       FROM questions q
       JOIN answers a ON q.id = a.question_id
       WHERE q.is_hidden = false
       ORDER BY a.created_at DESC`
    );
    res.json({ questions: result.rows });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// عرض الأسئلة المعلّقة (غير مجابة أو مخفية)
app.get('/pending', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, question_text, created_at
       FROM questions
       WHERE is_answered = false OR is_hidden = true
       ORDER BY created_at ASC`
    );
    res.json({ questions: result.rows });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// الرد على سؤال (مع حذف إجابة سابقة إن وجدت)
app.post('/answer/:id', async (req, res) => {
  const questionId = req.params.id;
  const { answer_text } = req.body;

  if (!answer_text || answer_text.trim() === '') {
    return res.status(400).json({ error: 'Answer text is required' });
  }

  try {
    const check = await pool.query(
      'SELECT * FROM questions WHERE id = $1',
      [questionId]
    );

    if (check.rowCount === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    await pool.query('DELETE FROM answers WHERE question_id = $1', [questionId]);

    await pool.query(
      'INSERT INTO answers (question_id, answer_text) VALUES ($1, $2)',
      [questionId, answer_text.trim()]
    );

    await pool.query(
      'UPDATE questions SET is_answered = true, is_hidden = false WHERE id = $1',
      [questionId]
    );

    res.json({ message: 'Answer saved successfully!' });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// إخفاء سؤال
app.post('/hide/:id', async (req, res) => {
  try {
    await pool.query(
      'UPDATE questions SET is_hidden = true WHERE id = $1',
      [req.params.id]
    );
    res.json({ message: 'Question hidden' });
  } catch (err) {
    console.error('Hide error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// حذف سؤال نهائيًا (مع إجابته)
app.delete('/question/:id', async (req, res) => {
  const questionId = req.params.id;

  try {
    await pool.query('DELETE FROM answers WHERE question_id = $1', [questionId]);
    await pool.query('DELETE FROM questions WHERE id = $1', [questionId]);

    res.json({ message: 'Question and answer deleted permanently' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// حذف إجابة فقط (وإعادة السؤال كمعلق)
app.delete('/answer/:questionId', async (req, res) => {
  const questionId = req.params.questionId;

  try {
    await pool.query('DELETE FROM answers WHERE question_id = $1', [questionId]);
    await pool.query('UPDATE questions SET is_answered = false, is_hidden = false WHERE id = $1', [questionId]);
    res.json({ message: 'Answer deleted and question reset' });
  } catch (err) {
    console.error('Delete answer error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server listening on http://${HOST}:${PORT}`);
});
