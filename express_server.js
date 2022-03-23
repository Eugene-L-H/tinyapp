const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const morgan = require('morgan');
app.use(morgan('dev'));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Listen for incoming requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const displayUsername = function(username, path) {
  templateVars = { username: username };
  res.render(path, templateVars);
}

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
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies.username
   };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  templateVars = {
    username: req.cookies.username
  }
  res.render("urls_new", templateVars);
});

// READ

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: req.params.longURL,
    username: req.cookies.username
  }

  templateVars.longURL = urlDatabase[templateVars.shortURL]; // Temp workaround?
  res.render("urls_show", templateVars);
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
  const username = req.body.username;
  
  res.cookie('username', username);
  console.log('username: ', username)
  console.log('req.cookies: ', req.cookies);
  
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
  res.clearCookie('username');
  res.redirect('/urls');
});

// FUNCTIONS

const generateRandomString = () => {
  return Math.random().toString(36).slice(-6);
};