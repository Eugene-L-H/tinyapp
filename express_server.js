const express = require("express");
const app = express();

const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

// MIDDLEWARE
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const morgan = require('morgan');
app.use(morgan('dev'));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const bcrypt = require('bcryptjs');

// HELPER FUNCTIONS

const { generateRandomString,
        emailLookup,
        urlShortLookup,
        idLookup,
        filterURLS,
        blockUnregisteredUser
} = require('./helper_functions');

// GLOBAL VARIABLES

const urlDatabase = {
  b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
  i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
};

const userDatabase = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// Listen for incoming requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// ROUTES

app.get("/", (req, res) => {
  res.redirect('urls');
});

app.get("/urls.json", (req, res) => {
  blockUnregisteredUser(req.cookies.user_id, res);
  
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL === undefined) {
    // res.send('<script>alert("Invalid URL")</script>');
    return res.redirect('/urls');
}
  res.redirect(longURL);
});

// redirect to show all URLs page
app.get('/urls', (req, res) => {
  // Store URLs that are associated with the user_id into an object
  const userURLs = filterURLS(req.cookies['user'], urlDatabase);

  const templateVars = {
    urls: userURLs,
    user_id: req.cookies['user_id'],
    // Email if user has cookie, null if not
    email: userDatabase[req.cookies['user_id']]
      ? userDatabase[req.cookies['user_id']].email
      : null,
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user_id: req.cookies['user_id'],
    email: userDatabase[req.cookies['user_id']]
      ? userDatabase[req.cookies['user_id']].email
      : null,
  };
  // Redirect user to login screen if not logged in
  if (!templateVars.user_id) res.redirect('/login');

  res.render("urls_new", templateVars);
});

// READ

app.get('/urls/:shortURL', (req, res) => {
  // Invalid page recieves 404 error
  if (urlDatabase[req.params.shortURL] === undefined) {
    return res
      .status(404)
      .send('<body><b>Page not found.<b><body>');
  }

  // Unregistered users can not view links
  blockUnregisteredUser(req.cookies.user_id, res);

  const templateVars = {
    urls: urlDatabase,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: req.cookies['user_id'],
    email: userDatabase[req.cookies['user_id']]
    ? userDatabase[req.cookies['user_id']].email
    : null,
  };
  console.log('urlDatabase in app.get/urls/:short: ', urlDatabase);
  console.log('shortURL: ', req.params.shortURL, ' Login id: ', req.cookies.user_id);
  // Registered user tries to view un-owned link
  if (urlDatabase[req.params.shortURL]['user_id'] !== req.cookies.user_id) {
    return res
      .status(401)
      .send('<body><b>You do not have access to this page.<b><body>');
  };

  res.render("urls_show", templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user_id: req.cookies['user_id'],
    email: userDatabase[req.cookies['user_id']]
      ? userDatabase[req.cookies['user_id']].email
      : null,
  };

  res.render('register_form', templateVars);
});

app.get('/login', (req, res) => {
    const templateVars = {
    urls: urlDatabase,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user_id: req.cookies['user_id'],
    email: userDatabase[req.cookies['user_id']]
      ? userDatabase[req.cookies['user_id']].email
      : null,
  };

  res.render('login_form', templateVars);
});

app.get('*', (req, res) => {
  const userURLs = filterURLS(req.cookies['user'], urlDatabase);
  const templateVars = {
    urls: userURLs,
    user_id: req.cookies['user_id'],
    // Email if user has cookie, null if not
    email: userDatabase[req.cookies['user_id']]
      ? userDatabase[req.cookies['user_id']].email
      : null,
  };
  
  res.render('urls_index', templateVars);
});

// CREATE

app.post("/urls", (req, res) => {
  console.log('body.longURL: ', req.body.longURL);  // Log the POST request body to the console

  blockUnregisteredUser(req.cookies.user_id, res);
  let shortUrlRandom = generateRandomString();

  // Add new short URL to urlDatabase
  urlDatabase[shortUrlRandom] = {};
  urlDatabase[shortUrlRandom]['longURL'] = req.body.longURL;
  urlDatabase[shortUrlRandom]['user_id'] = req.cookies['user_id'];
  console.log('newURL object: ', urlDatabase[shortUrlRandom]);
  res.redirect(`/urls/${shortUrlRandom}`); 
});
console.log('urlDatabase in app.post: ', urlDatabase)

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user_id = idLookup(email, userDatabase);
  
  if (email === '' || password === '') {
    return res
    .status(400)
    .send("<html><body><b>Both password and email fields must be filled.</b></body></html>\n");
  }
  
  // Return error if email not in database
  if (!emailLookup(email, userDatabase)) {
    return res
    .status(403)
    .send("<html><body><b>That email has not been registered.</b></body></html>\n");
  }
  
  if (!bcrypt.compareSync(password, userDatabase[user_id]['password'])) {
    return res
    .status(403)
    .send('Incorrect password.');
  }
  
  res.cookie('user_id', user_id);
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();

  if (email === '' || password === '') {
    return res
      .status(400)
      .send('Both password and email fields must be filled out to register.');
  }
  
  if (emailLookup(email, userDatabase)) {
    return res
      .status(400)
      .send('That email is already registered.')
  }

  // Register user email/password in userDatabase
  userDatabase[id] = {};
  userDatabase[id]['id'] = id;
  userDatabase[id]['email'] = email;
  userDatabase[id]['password'] = hashedPassword;

  res.redirect('/urls');
});

// UPDATE

app.post('/urls/:shortURL', (req, res) => {
  blockUnregisteredUser(req.cookies.user_id, res);

  let shortURL = req.params.shortURL;
  let newURL = req.body.new_url;
  urlDatabase[shortURL]['longURL'] = newURL;

  res.redirect('/urls');
});

// DELETE

app.post("/urls/:shortURL/delete", (req, res) => {
  blockUnregisteredUser(req.cookies.user_id, res);

  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  blockUnregisteredUser(req.cookies.user_id, res);

  console.log('logging out...')
  res.clearCookie('user_id');
  res.redirect('/urls');
});