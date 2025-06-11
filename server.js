const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const USERS_FILE = path.join(__dirname, 'users.json');
const RESULTS_DIR = path.join(__dirname, 'results');

if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR);
}

// Charger les utilisateurs
let users = {
  "Maths": "1234",
  "Mae": "1234"
};
if (fs.existsSync(USERS_FILE)) {
  users = JSON.parse(fs.readFileSync(USERS_FILE));
} else {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// API de connexion
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (users[username] && users[username] === password) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// API pour sauvegarder les résultats
app.post('/api/save-results', (req, res) => {
  const { username, results } = req.body;
  if (!username || !Array.isArray(results)) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
  const filePath = path.join(RESULTS_DIR, `${username}_results.txt`);
  const timestamp = new Date().toISOString();
  const content = `
=== Quiz du ${timestamp} ===
` +
    results.map(r => `${r.question} | ${r.userAnswer} | ${r.correctAnswer} | ${r.time}s | ${r.correct ? 'Correct' : 'Incorrect'}`).join('
') + '
';

  fs.appendFileSync(filePath, content);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Serveur en ligne sur http://localhost:${PORT}`);
});