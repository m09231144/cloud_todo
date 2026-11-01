const express = require('express');
const { Client } = require('pg');

const app = express();
app.use(express.json());
app.use(express.static('.'))

// إعداد الاتصال بقاعدة البيانات PostgreSQL
const client = new Client({
  connectionString: 'postgres://postgres:fatima333@localhost:5432/todo_db'
});

client.connect()
  .then(() => console.log('تم الاتصال بقاعدة البيانات بنجاح!'))
  .catch(err => console.error('خطأ في الاتصال:', err));

  const path = require('path');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
}); 
// جلب جميع المهام (GET) من قاعدة البيانات
app.get('/tasks', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM tasks');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// إضافة مهمة جديدة (POST) إلى قاعدة البيانات
app.post('/tasks', async (req, res) => {
  const { title } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO tasks (title, done) VALUES ($1, false) RETURNING *',
      [title]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await client.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// مسار تحديث حالة المهمة (PUT)
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { done } = req.body;
  try {
    const result = await client.query(
      'UPDATE tasks SET done = $1 WHERE id = $2 RETURNING *',
      [done, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(8080, () => {
  console.log('السيرفر يعمل على المنفذ 8080');
});