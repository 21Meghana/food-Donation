const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

// Initialize express app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost/your_database', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Express session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash middleware
app.use(flash());

// Global variables for flash messages
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Define routes
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Load User model
const User = require('./models/user');

// Passport config
require('./config/passport')(passport);

// Middleware for ensuring login and role-based access
const middleware = require('./middleware');

// Define protected routes
app.get('/dashboard', middleware.ensureLoggedIn, (req, res) => {
    res.send('Dashboard');
});

app.get('/admin/dashboard', middleware.ensureAdminLoggedIn, (req, res) => {
    res.send('Admin Dashboard');
});

app.get('/donor/dashboard', middleware.ensureDonorLoggedIn, (req, res) => {
    res.send('Donor Dashboard');
});

app.get('/agent/dashboard', middleware.ensureAgentLoggedIn, (req, res) => {
    res.send('Agent Dashboard');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
