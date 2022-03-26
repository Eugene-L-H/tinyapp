const { assert } = require('chai');
const {
  generateRandomString,
  emailLookup,
  idLookup,
  filterURLS,
  blockUnregisteredUser
} = require('../helper_functions.js');

describe('Generate a random string 6 characters long', () => {
  it ('Should return a string of 6 random characters.', () => {
    const randomString = generateRandomString();
    const length = randomString.length;
    const expectedLength = 6;
  
    assert.strictEqual(length, expectedLength);
  });

  it ('Two generated strings should not be equal.', () => {
    const randomString1 = generateRandomString();
    const randomString2 = generateRandomString();

    assert.notEqual(randomString1, randomString2);
  });
});


describe('Check an email is associated with an id in a database, return true if present.', () => {
  const testUsers = {
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

  const email1 = 'user2@example.com';
  const email2 = 'wrong3mail@example.com';

  it ('An email entered into function that is also present in database should return true.', () => {
    assert.strictEqual(emailLookup(email1, testUsers), true);
  });

  it ('An email entered into function that is not present in database should return false.', () => {
    assert.strictEqual(emailLookup(email2, testUsers), false);
  });
});

describe('Return the id of an item in a database that is associated with the id provied', () => {
  const testUsers = {
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

  const email1 = 'user@example.com'; 
  const email2 = 'wrong@example.com';

  it ('If email is present in the database function should return the id associated with that email.', () => {
    assert.strictEqual(idLookup(email1, testUsers), 'userRandomID');
  });
  
  it ('If id is NOT present in the database function should return false.', () => {
    assert.strictEqual(idLookup(email2, testUsers), false);
  });
});

describe('Return an object of URLs that are associated with a certain id', () => {
  const urlDatabase = { 
    rmjcd8:
            { longURL: 'http://www.google.ca',
               user_id: 'qlxkk8' 
            }, 
    rmjcd7:
            { longURL: 'http://www.google.com',
               user_id: 'qlxkk8' 
            }, 
    rmjcd6:
            { longURL: 'http://www.google.uk',
               user_id: 'qlxkk6' 
            }, 
  };

  const userID1 = 'qlxkk8';
  const userID2 = 'qlxkk6'; 

  it ('Should return two url objects', () => {
    assert.deepEqual(filterURLS(userID1, urlDatabase), {
      rmjcd8:
            { 
              longURL: 'http://www.google.ca', 
            }, 
      rmjcd7:
            { 
              longURL: 'http://www.google.com'
        }});
      });

  it ('Should return one url object', () => {
    assert.deepEqual(filterURLS(userID2, urlDatabase), { 
      rmjcd6: { 
              longURL: 'http://www.google.uk'
      }});
  });
});


