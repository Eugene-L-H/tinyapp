const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set('view engine', 'ejs');

// MIDDLEWARE
const cookieSession = require('cookie-session');
app.use(
  cookieSession({
    name: "session",
    keys: ["session1", "session1", "session1"],
  })
);

const morgan = require('morgan');
app.use(morgan('dev'));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const bcrypt = require('bcryptjs');

// HELPER FUNCTIONS

const { generateRandomString,
  emailLookup,
  idLookup,
  filterURLS,
  blockUnregisteredUser
} = require('./helper_functions');

// GLOBAL VARIABLES

const urlDatabase = {};
const userDatabase = {};

// Listen for incoming requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// GET ROUTES

app.get("/", (req, res) => {
  return res.redirect('urls');
});

app.get("/urls.json", (req, res) => {
  blockUnregisteredUser(req.session.user_id, res);
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// redirect to show all URLs page
app.get('/urls', (req, res) => {
  // Store URLs that are associated with the user_id into an object
  const userURLs = filterURLS(req.session.user_id, urlDatabase);

  const templateVars = {
    urls: userURLs,
    user_id: req.session.user_id,
    // Email if user has cookie, null if not
    email: userDatabase[req.session.user_id]
      ? userDatabase[req.session.user_id].email
      : null,
  };

  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    email: userDatabase[req.session.user_id]
      ? userDatabase[req.session.user_id].email
      : null,
  };

  // Redirect user to login screen if not logged in
  if (!req.session.user_id) res.redirect('/login');

  res.render("urls_new", templateVars);
});


app.get('/urls/:shortURL', (req, res) => {
  // Unregistered users can not view links
  blockUnregisteredUser(req.session.user_id, res);
  const shortURL = req.params.shortURL;
  const userURLs = filterURLS(req.session.user_id, urlDatabase);

  // Registered user tries to view un-owned link
  if (urlDatabase[shortURL]) { // if link exists in urlDatabase:
    const registeredLinkUserID = urlDatabase[shortURL].user_id;
    const sessionUserID = req.session.user_id;
    if (registeredLinkUserID !== sessionUserID) {
      return res
        .status(401)
        .send('<body><b>You do not have access to this page.<b><body>');
    }
  }
  
  // Invalid page recieves 404 error
  if (!userURLs[shortURL]) {
    return res
      .status(404)
      .send('<body><b>Page not found.<b><body>');
  }
    
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: req.session.user_id,
    email: userDatabase[req.session.user_id]
      ? userDatabase[req.session.user_id].email
      : null,
  };

  return res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  blockUnregisteredUser(req.session.user_id, res);
  const shortURL = req.params.id;
  const shortURLid = urlDatabase[shortURL];

  if (!shortURLid) {
    return res.status(404).send('ID not found.');
  } else {
    const longURL = urlDatabase[shortURL].longURL;
    return res.redirect(longURL);
  }
});

// READ

app.get('/login', (req, res) => {
  // Redirect user who is logged in
  if (req.session.user_id) {
    res.redirect('/urls');
  }

  const templateVars = {
    user_id: userDatabase[req.session.user_id]
      ? userDatabase[req.session.user_id]
      : null,
    email: userDatabase[req.session.user_id]
      ? userDatabase[req.session.user_id].email
      : null,
  };

  return res.render('login_form', templateVars);
});

app.get('/register', (req, res) => {
  // Redirect user who is logged in
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  
  const templateVars = {
    user_id: userDatabase[req.session.user_id]
      ? userDatabase[req.session.user_id]
      : null,
    email: userDatabase[req.session.user_id]
      ? userDatabase[req.session.user_id].email
      : null,
  };

  return res.render('register_form', templateVars);
});

app.get('*', (req, res) => {
  const userURLs = filterURLS(req.session.user_id, urlDatabase);
  const templateVars = {
    urls: userURLs,
    user_id: req.session.user_id,
    // Email if user has cookie, null if not
    email: userDatabase[req.session['user_id']]
      ? userDatabase[req.session['user_id']].email
      : null,
  };
  
  return res.render('urls_index', templateVars);
});

// CREATE

app.post('/urls', (req, res) => {

  blockUnregisteredUser(req.session.user_id, res);
  let shortUrlRandom = generateRandomString();

  // Add new short URL to urlDatabase
  urlDatabase[shortUrlRandom] = {};
  urlDatabase[shortUrlRandom]['longURL'] = req.body.longURL;
  urlDatabase[shortUrlRandom]['user_id'] = req.session.user_id;

  res.redirect(`/urls/${shortUrlRandom}`);
});

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
  
  req.session.user_id = user_id;
  return res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();

  if (email === '' || password === '') {
    return res
      .status(400)
      .send('Both password and email fields must be filled out to register.');
  }
  
  if (emailLookup(email, userDatabase)) {
    return res
      .status(400)
      .send('That email is already registered.');
  }

  // Register user email/password in userDatabase
  userDatabase[id] = {};
  userDatabase[id]['id'] = id;
  userDatabase[id]['email'] = email;
  userDatabase[id]['password'] = hashedPassword;

  req.session.user_id = id;

  res.redirect('/urls');
});



// UPDATE

app.post('/urls/:id', (req, res) => {
  blockUnregisteredUser(req.session.user_id, res);

  const shortURL = req.params.id;
  const newURL = req.body.new_url;
  urlDatabase[shortURL]['longURL'] = newURL;

  res.redirect('/urls');
});

// DELETE

app.post("/urls/:id/delete", (req, res) => {
  blockUnregisteredUser(req.session.user_id, res);

  const id = req.params.id;
  const userURLs = filterURLS(req.session.user_id, urlDatabase);

  if (!userURLs[id]) {
    return res
      .status(401)
      .send("Invalid URL.");
  }

  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  blockUnregisteredUser(req.session.user_id, res);

  console.log('logging out...');
  req.session = null; // Kill cookie session
  return res.redirect('/urls');
});