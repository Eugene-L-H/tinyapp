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

// GLOBAL VARIABLES

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {};

// Listen for incoming requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// ROUTES

app.get("/", (req, res) => {
  res.send("Hello!");
  console.log('request recieved');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
if (longURL === undefined) {
  // res.send('<script>alert("Invalid URL")</script>');s
  return res.redirect('/urls');
}
  res.redirect(longURL);
});

// redirect to show all URLs page
app.get('/urls', (req, res) => {
  const cookieID = req.cookies.id;
  const userObject = userDatabase[cookieID];
  const templateVars = { 
    urls: urlDatabase,
    userObject: userObject
  };
  console.log('templateVars[userObject]: ', templateVars.userObject);
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  templateVars = {
    userObject: userDatabase[req.cookies.id]
  }
  res.render("urls_new", templateVars);
});

// READ

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: req.params.longURL,
    userObject: userDatabase[req.cookies.id]
  }

  templateVars.longURL = urlDatabase[templateVars.shortURL]; // Temp workaround?
  res.render("urls_show", templateVars);
});

app.get('/register', (req, res) => {
  templateVars = {
    userDatabase: userDatabase,
    userObject: userDatabase[req.cookies.id]
  }
  console.log('tem vars name: ', templateVars.username);
  res.render('register_form', templateVars);
});

app.get('/login', (req, res) => {
  templateVars = {
    userDatabase: userDatabase,
    userObject: userDatabase[req.cookies.id]
  }
  res.render('login_form', templateVars);
});

app.get('*', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

// CREATE

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  
  let shortUrlRandom = generateRandomString();

  urlDatabase[shortUrlRandom] = req.body.longURL;
  res.redirect(`/urls/${shortUrlRandom}`); 
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user_id = req.cookies.id;
  
  if (email === '' || password === '') {
    return res
    .status(400)
    .send('Both password and email fields must be filled.');
  }
  
  // Return error if email not in database
  if (!emailLookup(email, userDatabase)) {
    return res
    .status(403)
    .send('That email is not registered.');
  }
  
  console.log('id in /login: ', user_id);
  console.log('userDatabase: ', userDatabase);
  console.log('DB password: ', userDatabase[user_id]['password']);

  if (password !== userDatabase[user_id]['password']) {
    return res
    .status(403)
    .send('Incorrect password.');
  }
  
  res.cookie('user_id', );
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  console.log('users: ', userDatabase);
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();

  if (email === '' || password === '') {
    return res
      .status(400)
      .send('Both password and email fields must be filled out to register.');
  }

  console.log('userDatabase: ', urlDatabase);
  console.log('emailLookup: ', emailLookup(email, userDatabase));
  
  if (emailLookup(email, userDatabase)) {
    return res
      .status(400)
      .send('That email is already registered.')
  }

  userDatabase[id] = {};
  userDatabase[id]['id'] = id;
  userDatabase[id]['email'] = email;
  userDatabase[id]['password'] = password;

  // templateVars = {
  //   userObject: userDatabase[req.cookies.id]
  // }

  res.cookie('id', id);
  console.log('userDatabase after registration: ', userDatabase);
  res.redirect('/urls');
});

// UPDATE

app.post('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let newURL = req.body.new_url;
  urlDatabase[shortURL] = newURL;
  res.redirect('/urls');
});

// DELETE

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie(req.cookies.id);
  res.redirect('/urls');
});

// FUNCTIONS

const generateRandomString = () => {
  return Math.random().toString(36).slice(-6);
};

const emailLookup = function(email, database) {
  for (let key in database) {
    if (database[key]['email'] === email) {
      return true;
    }
  }
  return false;
};