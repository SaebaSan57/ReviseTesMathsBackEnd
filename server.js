const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const router = express.Router();
const fetch = require('node-fetch');
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzeyVAuvQPLeyDh-ihFavNKUc8_kkHd6pKCypBfmKaHOxR9dsn8Ke5hSVKfA2U5D14YLg/exec'; // remplace par ton URL


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
/*app.post('/api/save-results', (req, res) => {
  const { username, results } = req.body;
  if (!username || !Array.isArray(results)) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
  const filePath = path.join(RESULTS_DIR, `${username}_results.txt`);
  const timestamp = new Date().toISOString();
  const contentLines = results.map(r => {
  return `${r.question} | ${r.userAnswer} | ${r.correctAnswer} | ${r.time}s | ${r.correct ? 'Correct' : 'Incorrect'}`;
  });
  const content = `\n=== Quiz du ${timestamp} ===\n` + contentLines.join('\n') + '\n';


  fs.appendFileSync(filePath, content);
  res.json({ success: true });
});*/

app.post('/api/save-results', async (req, res) => {
  const { username, results } = req.body;

  if (!username || !Array.isArray(results)) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }

  try {
    // Appel vers Google Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, results })
    });

    const data = await response.json();

    if (data.success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: 'Erreur côté Google Apps Script' });
    }
  } catch (error) {
    console.error('Erreur lors de l’envoi vers Google Sheets:', error);
    res.status(500).json({ success: false, error: 'Erreur réseau ou Google Script' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur en ligne sur http://localhost:${PORT}`);
});