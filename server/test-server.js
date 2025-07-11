const express = require('express');
const cors = require('cors');

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'Test server working' });
});

app.post('/api/auth/register', (req, res) => {
  console.log('Register endpoint hit:', req.body);
  res.json({ message: 'Register endpoint working', data: req.body });
});

app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
});