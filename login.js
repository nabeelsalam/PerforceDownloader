'use strict'

const child_process = require('child_process');
const fs = require('fs');
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const password = 'd6F3Efeq';

let getDetailsFromFile = function () {
    let promise = new Promise((resolve) => {
        var details = require('./credentials');
        resolve(details);
    });
    return promise;
}

let decryptDetails = function (details) {
    let promise = new Promise((resolve) => {
        var decipher = crypto.createDecipher(algorithm, password)
        var dec = decipher.update(details['Perforce Password'], 'hex', 'utf8')
        dec += decipher.final('utf8');
        details['Perforce Password'] = dec;
        resolve(details);
    });
    return promise;
}

let generateTicket = function (decryptedDetails) {
    let promise = new Promise((resolve) => {
        child_process.exec(`echo ${decryptedDetails['Perforce Password']}|p4 -u ${decryptedDetails['Perforce Username']} login`, function (error, stdout, stderr) {
            if (stderr) {
                resolve('Wrong credentials...Run setup all over again');
            }
            else {
                resolve(decryptedDetails);
            }
        });
    });
    return promise;
}

let createConfig = function(details){
    let promise = new Promise((resolve)=>{
        let content = 
        `
        @echo off
        set p4username=${details['Perforce Username']}
        set p4workspace=${details['Perforce Workspace']}
        `;
        fs.writeFile("./config.bat", content, 'utf8', function (err) {
            if (err) {
              resolve(err);
            }
            else {
              resolve("Login Successful...")
            }
          });
    });
    return promise;
}

let main = function () {
    getDetailsFromFile()
        .then((details) => {
            return decryptDetails(details);
        })
        .then((decryptedDetails) => {
            return generateTicket(decryptedDetails);
        })
        .then((details) => {
            return createConfig(details);
        })
        .then((output) => {
            console.log(output);
        });
}

main();
