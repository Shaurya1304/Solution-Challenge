// server.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
});

// Route for opportunities page
app.get('/opportunities.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'opportunities.html'));
});

// Add more routes as needed for other pages

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
