require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection Test
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error', err);
    } else {
        console.log('Database Connected...');
    }
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/equipment', require('./routes/equipment.routes'));
app.use('/api/requests', require('./routes/request.routes'));
app.use('/api/users', require('./routes/user.routes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
