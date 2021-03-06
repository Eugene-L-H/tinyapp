
const generateRandomString = () => {
  return Math.random().toString(36).slice(-6);
};
// Check an email is associated with an id in a database, return true if present.
const emailLookup = function(email, database) {
  for (let key in database) {
    if (database[key]['email'] === email) {
      return true;
    }
  }
  return false;
};

// Return the id of an item in a database that is associated with the id provied
const idLookup = function(email, database) {
  for (let key in database) {
    if (database[key]['email'] === email) {
      return key;
    }
  }
  return false;
};


const filterURLS = function(userID, database) {
  const userURLs = {};
  for (let shortURL in database) {
    if (database[shortURL]['user_id'] === userID) {
      // id === shortURL
      userURLs[shortURL] = {};
      userURLs[shortURL]['longURL'] = database[shortURL].longURL;
    }
  }
  return userURLs;
};

const blockUnregisteredUser = function(cookieID, res) {
  if (!cookieID) {
    return res
      .status(401)
      .send('Must be registered and logged in to do that.\n');
  }
};

module.exports = {
  generateRandomString,
  emailLookup,
  idLookup,
  filterURLS,
  blockUnregisteredUser
};