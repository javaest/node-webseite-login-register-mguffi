const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');

let users = [
  { id: 1, name: 'Alice', password: 'test' },
  { id: 2, name: 'admin', password: 'password' }
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'mein-geheimer-schluessel',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (users.find(user => user.name === username)) {
    return res.status(400).send('Benutzername bereits vergeben');
  }
  users.push({ id: users.length + 1, name: username, password });
  res.redirect('/login');
});

app.get('/get-username', (req, res) => {
  if (req.session.user) {
    res.json({ username: req.session.user });
  } else {
    res.status(401).json({ error: 'Nicht angemeldet' });
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.name === username && u.password === password);
  if (user) {
    req.session.user = username;
    return res.redirect('/content');
  }
  res.status(401).send('Benutzername oder Passwort falsch');
});

app.get('/content', (req, res) => {
  if (!req.session.user) {
    return res.status(403).send('Zugriff verweigert. Bitte anmelden.');
  }
  res.sendFile(path.join(__dirname, 'views', 'content.html'));
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Fehler beim Abmelden');
    }
    res.redirect('/');
  });
});

app.listen(3000, () => {
  console.log('Server läuft auf http://localhost:3000');
});