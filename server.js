// server.js - minimal Express + SQLite backend to receive book data and cover images
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// directory to store uploaded/generated covers
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

app.use(bodyParser.json({ limit: '10mb' })); // accept large base64 images
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// serve uploaded images
app.use('/uploads', express.static(UPLOAD_DIR));

// init sqlite DB
const db = new sqlite3.Database(path.join(__dirname, 'books.db'));
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    author TEXT,
    year INTEGER,
    category TEXT,
    description TEXT,
    cover_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// helper: save base64 data URL to file and return filename
function saveDataUrl(dataUrl){
  if (!dataUrl || !dataUrl.startsWith('data:')) return null;
  const matches = dataUrl.match(/^data:(image\/(png|jpeg|jpg|gif));base64,(.+)$/);
  if (!matches) return null;
  const ext = matches[2] === 'jpeg' ? 'jpg' : matches[2];
  const base64 = matches[3];
  const buf = Buffer.from(base64, 'base64');
  const filename = `cover_${Date.now()}_${Math.round(Math.random()*10000)}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filepath, buf);
  return filename;
}

// POST JSON: { title,author,year,category,description, cover (dataURL) }
app.post('/api/books-json', (req, res) => {
  const { title, author, year, category, description, cover } = req.body;
  let coverPath = null;
  try{
    if (cover && cover.startsWith('data:')) coverPath = saveDataUrl(cover);
  } catch(e){ console.error('save cover error', e); }

  db.run(`INSERT INTO books(title,author,year,category,description,cover_path) VALUES(?,?,?,?,?,?)`,
    [title,author,year,category,description,coverPath], function(err){
      if(err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, cover_url: coverPath ? `/uploads/${coverPath}` : null });
    });
});

// GET all books
app.get('/api/books', (req, res) => {
  db.all('SELECT * FROM books ORDER BY created_at DESC', (err, rows) => {
    if(err) return res.status(500).json({ error: err.message });
    const mapped = rows.map(r => ({ ...r, cover_url: r.cover_path ? `/uploads/${r.cover_path}` : null }));
    res.json(mapped);
  });
});

// DELETE book
app.delete('/api/books/:id', (req,res)=>{
  const id = req.params.id;
  db.get('SELECT cover_path FROM books WHERE id = ?', [id], (err,row)=>{
    if(err) return res.status(500).json({ error: err.message });
    if(row && row.cover_path){
      const f = path.join(UPLOAD_DIR, row.cover_path);
      if(fs.existsSync(f)) fs.unlinkSync(f);
    }
    db.run('DELETE FROM books WHERE id = ?', [id], function(err2){
      if(err2) return res.status(500).json({ error: err2.message });
      res.json({ removedId: id });
    });
  });
});

app.listen(PORT, ()=> console.log(`Server running http://localhost:${PORT}`));
