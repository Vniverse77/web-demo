const express = require('express');
const fs = require('fs').promises;
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

// Google OAuth Credentials (replace with your actual credentials)
const GOOGLE_CLIENT_ID = '87432178367-7tpk4lhkd0fr12eqstbjkq3t5jvieo16.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

// GitHub OAuth Credentials (replace with your actual credentials)
const GITHUB_CLIENT_ID = 'YOUR_GITHUB_CLIENT_ID'; // Replace with your GitHub Client ID
const GITHUB_CLIENT_SECRET = 'YOUR_GITHUB_CLIENT_SECRET'; // Replace with your GitHub Client Secret

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// Session middleware
app.use(session({
  secret: 'your_secret_key', // Replace with a strong secret key
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/google/callback'
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      const data = await fs.readFile('db.json', 'utf8');
      const db = JSON.parse(data);

      let user = db.users.find(u => u.googleId === profile.id);

      if (!user) {
        user = {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          verified: true, // Google authenticated users are considered verified
          downloads: []
        };
        db.users.push(user);
        await fs.writeFile('db.json', JSON.stringify(db, null, 2));
      } else {
        // Update user's name/email if it changed in Google
        user.name = profile.displayName;
        user.email = profile.emails[0].value;
        user.verified = true;
        await fs.writeFile('db.json', JSON.stringify(db, null, 2));
      }
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Passport GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/github/callback'
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      const data = await fs.readFile('db.json', 'utf8');
      const db = JSON.parse(data);

      let user = db.users.find(u => u.githubId === profile.id);

      if (!user) {
        user = {
          githubId: profile.id,
          name: profile.displayName || profile.username,
          email: profile.emails ? profile.emails[0].value : null,
          photo: profile.photos ? profile.photos[0].value : null,
          verified: true, // GitHub authenticated users are considered verified
          downloads: []
        };
        db.users.push(user);
        await fs.writeFile('db.json', JSON.stringify(db, null, 2));
      } else {
        // Update user's info if it changed in GitHub
        user.name = profile.displayName || profile.username;
        user.email = profile.emails ? profile.emails[0].value : null;
        user.photo = profile.photos ? profile.photos[0].value : null;
        user.verified = true;
        await fs.writeFile('db.json', JSON.stringify(db, null, 2));
      }
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));


// Serialize and deserialize user for session management
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to a success page or directly download
    res.redirect('/download-success'); // We'll create this page
  });

// GitHub OAuth routes
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

// API endpoint to get current user information
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    // Only send necessary user information, not the whole user object
    const user = {
      id: req.user.googleId || req.user.githubId, // Use appropriate ID
      name: req.user.name,
      email: req.user.email,
      photo: req.user.photo || null // Include photo if available
    };
    res.json(user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Logout route
app.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// A simple page to show after successful Google login
app.get('/download-success', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`
      <h1>Welcome, ${req.user.name}!</h1>
      <p>You have successfully logged in with Google. You can now download the file:</p>
      <a href="/api/download/placeholder.png">Download placeholder.png</a>
      <p><a href="/">Go back to home</a></p>
    `);
  } else {
    res.redirect('/');
  }
});


// Endpoint to handle contact form submission (now redirects to Google login)
app.post('/api/contact', (req, res) => {
  // Instead of processing the form, we'll redirect to Google login
  res.redirect('/auth/google');
});

// Endpoint to handle file download
app.get('/api/download/:itemId', async (req, res) => {
  const { itemId } = req.params;

  if (!req.isAuthenticated()) {
    return res.status(403).send('You must be logged in with Google to download this file.');
  }

  try {
    const data = await fs.readFile('db.json', 'utf8');
    const db = JSON.parse(data);

    const user = db.users.find(u => u.googleId === req.user.googleId);

    if (!user || !user.verified) {
      return res.status(403).send('Your Google account is not verified (this should not happen with Google login).');
    }

    if (user.downloads.includes(itemId)) {
      return res.status(403).send('You have already downloaded this file.');
    }

    // Allow download
    user.downloads.push(itemId);
    await fs.writeFile('db.json', JSON.stringify(db, null, 2));

    res.download(`images/${itemId}`, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error downloading file.');
      }
    });

  } catch (error) {
    res.status(500).send('An error occurred.');
  }
});


// Admin Database
eval(`import('lowdb')`).then(({ Low, JSONFileSync }) => {
  const adapter = new JSONFileSync('admin-db.json');
  const db = new Low(adapter);
  db.read();
  db.data = db.data || { admins: [] };
  db.write();


  // Create a default admin user if one doesn't exist
  if (!db.data.admins.find(admin => admin.username === 'admin')) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('admin', salt);
    db.data.admins.push({ username: 'admin', password: hashedPassword });
    db.write();
  }

  const JWT_SECRET = 'your_jwt_secret'; // Replace with a strong secret

  // Admin login route
  app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const admin = db.data.admins.find(admin => admin.username === username);

    if (admin && bcrypt.compareSync(password, admin.password)) {
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).send('Invalid credentials');
    }
  });

  // Middleware to verify token
  const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token) {
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send('Invalid token');
        }
        req.decoded = decoded;
        next();
      });
    } else {
      res.status(401).send('No token provided');
    }
  };

  // Protected admin route
  app.get('/api/admin/users', verifyToken, async (req, res) => {
    try {
      const data = await fs.readFile('db.json', 'utf8');
      const db = JSON.parse(data);
      res.json(db.users);
    } catch (error) {
      res.status(500).send('An error occurred.');
    }
  });

  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });

});