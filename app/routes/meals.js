"use strict"

var config  = require('../../config.js'),
    request = require('request');

var userMealsUrl = function(host, userId, date) {
    var queryStrings = "";
    if (date) queryStrings = "?from=" + date;

    return host + "/users/" + userId + '/meals' + queryStrings;
};

exports.get = function(req, res){
    var url = userMealsUrl(config.munchcalApiUrl, req.user.id, req.params.date);
    request.get({ url: url, json:true }, function(err, resp, body){
        if (err || resp.statusCode != 200) return res.render('error');
        return res.render('home', body); 
    });
};

