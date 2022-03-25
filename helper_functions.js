
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

const urlShortLookup  = function(url, database) {
  for (let key in database) {
    if (key === url) {
      return true;
    }
  }
  return false;
};

const idLookup = function(email, database) {
  for (let key in database) {
    if (database[key]['email'] === email) {
      return key;
    }
  }
};


const filterURLS = function(userID, database) {
  const userURLs = {};
  for (let shortURL in database) {
      console.log('database[shortURL]["userID"]: ', database[shortURL]['userID'], ' === userID: ', userID);
    if (database[shortURL]['userID'] === userID) {
      // id === shortURL
      userURLs[shortURL] = {};
      userURLs[shortURL]['longURL'] = database[shortURL].longURL;
    }
  }
  return userURLs;
}

const blockUnregisteredUser = function(cookieID, res) {
  console.log(cookieID);
  if (!cookieID) {
    return res
      .status(401)
      .send('Must be registered and logged in to do that.\n');
  }
}

module.exports = { 
  generateRandomString,
  emailLookup,
  urlShortLookup,
  idLookup,
  filterURLS,
  blockUnregisteredUser
};