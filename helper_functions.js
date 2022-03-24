
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

const passwordLookup = function(email, database) {
  for (let key in database) {
    if (database[key]['email'] === email) {
      return database[key]['password'];
    }
  }
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

module.exports = { generateRandomString,
                    emailLookup,
                    passwordLookup,
                    idLookup,
                    filterURLS
                  };