'use strict'

const prompt = require('prompt');
const child_process = require('child_process');
const fs = require('fs');
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const password = 'd6F3Efeq';

let getUserDetails = function () {
  let promise = new Promise((resolve) => {
    prompt.message = ">";
    const schema = {
      properties: {
        'Perforce Username': {
          required: true
        },
        'Perforce Workspace': {
          required: true
        },
        'Perforce Password': {
          hidden: true,
          replace: '*'
        }
      }
    };

    let _runPrompt = function () {
      prompt.start();

      prompt.get(schema, function (err, result) {
        child_process.exec(`echo ${result['Perforce Password']}|p4 -u ${result['Perforce Username']} login`, function (error, stdout, stderr) {
          if (stderr) {
            console.log('Wrong credentials...Try again');
            _runPrompt();
          }
          else {
            resolve(result);
          }
        });
      });
    }

    _runPrompt();
  });
  return promise;
}

let encryptDetails = function (details) {
  let promise = new Promise((resolve) => {
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(details['Perforce Password'], 'utf8', 'hex')
    crypted += cipher.final('hex');
    details['Perforce Password'] = crypted;
    resolve(details);
  });
  return promise;
}

let storeDetails = function (encryptedDetails) {
  let promise = new Promise((resolve) => {
    let content = JSON.stringify(encryptedDetails, null, 4);
    fs.writeFile("./credentials.json", content, 'utf8', function (err) {
      if (err) {
        resolve(err);
      }
      else {
        resolve("Details saved to file...")
      }
    });
  });
  return promise;
}

let main = function () {
  getUserDetails()
    .then((details) => {
      return encryptDetails(details);
    })
    .then((encryptedDetails) => {
      return storeDetails(encryptedDetails);
    })
    .then((output) => {
      console.log(output)
    });
}

main();
