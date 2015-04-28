"use strict"

var pg   = require('pg'),
    uuid = require('node-uuid');

var hasher = require('./hasher.js');
var config = require('../../config.js');

// wrapper around pg.connect to abstract away client pooling
var query = function(statement, params, cb) {
    pg.connect(config.pgConnectionString, function(err, client, done){
        if (err) {
            throw new Error('Error fetching client from pool', err);
        }
        client.query(statement, params, function(err, result){
            done();
            cb(err, result);
        });
    });
}

var getUserWithEmail = function(emailAddress, cb) {
    query('SELECT * FROM users WHERE email = $1', [emailAddress], function(err, results){
        cb(err, results);
    });
};

var userWithEmailExists = function(emailAddress, cb) {
    getUserWithEmail(emailAddress, function(err, results){
        if (err) cb(err);

        if (results.rowCount > 0) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    });
};

var createUser = function(user, cb) {
    userWithEmailExists(user.email, function(err, exists){
        if (err) return cb(err);
        if (exists) return cb(new Error("Email address already in use"));

        hasher.cryptPassword(user.password, function(err, hash) {
            if (err) return cb(err); 

            var userId = uuid.v1();
            var dateCreated = new Date();
            var dateModified = dateCreated; 

            query('INSERT INTO users (id, name, email, password, date_created, date_modified) VALUES ($1, $2, $3, $4, $5, $6)',
                [ userId, user.name, user.email, hash, dateCreated, dateModified ], function(err, results){
                    var data = {
                        id: userId,
                        dateCreated: dateCreated,
                        dateModified: dateModified
                    }
                    cb(err, data);
            });
        });
    });
};

// user param must contain 'email' and unhashed 'password'
var getUserWithCredentials = function(user, cb){
    getUserWithEmail(user.email, function(err, results){
        if (err) return cb(err);
        if (results.rowCount != 1) return cb(null, null);
        
        var result = results.rows[0];
        hasher.comparePassword(user.password, result.password, function(err, passwordMatch){
            if (passwordMatch) {
                // only pass back relevant data
                cb(null, { id: result.id, name: result.name, email: result.email });
            } else {
                cb(null, null);
            }
        });
    });
};

exports.createUser = createUser;
exports.getUserWithCredentials = getUserWithCredentials;

