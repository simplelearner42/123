const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const password = process.env.TEACHER_PASSWORD || 'ctss-teacher';
const rootDir = __dirname;
const dataDir = path.join(rootDir, 'data');
const uploadsDir = path.join(rootDir, 'uploads');
const dataFile = path.join(dataDir, 'teacher-items.json');

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, '[]', 'utf8');
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (_req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, Date.now() + '-' + safeName);
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 20 * 1024 * 1024 } });

function readItems() {
  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch (error) {
    return [];
  }
}

function writeItems(items) {
  fs.writeFileSync(dataFile, JSON.stringify(items, null, 2), 'utf8');
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(rootDir));

app.get('/api/teacher-items', function (_req, res) {
  res.json(readItems());
});

app.post('/api/teacher-items', upload.single('file'), function (req, res) {
  const { title, topic, notes, password: suppliedPassword } = req.body || {};

  if (suppliedPassword !== password) {
    return res.status(403).json({ ok: false, message: 'Teacher password required.' });
  }

  const items = readItems();
  const item = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    title: (title || '').trim(),
    topic: (topic || '').trim(),
    notes: (notes || '').trim(),
    fileName: req.file ? req.file.originalname : '',
    filePath: req.file ? '/uploads/' + req.file.filename : ''
  };

  items.unshift(item);
  writeItems(items);
  res.json({ ok: true, item: item });
});

app.post('/api/teacher-items/:id/delete', express.urlencoded({ extended: true }), function (req, res) {
  const { password: suppliedPassword } = req.body || {};
  if (suppliedPassword !== password) {
    return res.status(403).json({ ok: false, message: 'Teacher password required.' });
  }

  const items = readItems();
  const itemToDelete = items.find(function (item) { return item.id === req.params.id; });
  if (itemToDelete && itemToDelete.filePath) {
    const potentialPath = path.join(rootDir, itemToDelete.filePath.replace(/^\//, ''));
    if (fs.existsSync(potentialPath)) {
      fs.unlinkSync(potentialPath);
    }
  }

  const nextItems = items.filter(function (item) { return item.id !== req.params.id; });
  writeItems(nextItems);
  res.json({ ok: true, removedId: req.params.id });
});

app.listen(port, function () {
  console.log('Teacher admin server running on http://localhost:' + port);
});
