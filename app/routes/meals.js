"use strict"

var config  = require('../../config.js'),
    request = require('request');

var userMealsUrl = function(host, userId, date) {
    var queryStrings = "";
    if (date) queryStrings = "?from=" + date;

    return host + "/users/" + userId + '/meals' + queryStrings;
};

var renderMeals = function(req, res, validationErrors) {
    var url = userMealsUrl(config.munchcalApiUrl, req.user.id, req.params.date);
    request.get({ url:url, json:true }, function(err, resp, body){
        if (err || resp.statusCode != 200) return res.render('error');

        if (validationErrors) body.validationErrors = validationErrors;
        return res.render('home', body);
    });
}

exports.get = function(req, res){
    return renderMeals(req, res, null);
};

exports.post = function(req, res){

    req.checkBody('from', 'An error has occurred. Please sit tight whilst we dispatch engineers to fix this!').isCalendarFormat();
    req.checkBody('text', 'Please enter some text!').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        return renderMeals(req, res, errors);
    }

    var url = config.munchcalParserUrl + "/parse/meals";
    var body = {
        context: { date: req.body.from },
        text: req.body.text
    };
    request.post({ url:url, body:body, json:true }, function(err, resp, body){
        if (err || resp.statusCode != 200) return res.render('error');

        // when, who, what all need at least one entry
        var errors = [];
        if (body.when.length < 1) errors.push({ msg: "Could not extract a date from what you entered"});
        if (body.what.length < 1) errors.push({ msg: "Could not extract a meal from what you entered"});
        if (body.who.length < 1) errors.push({ msg: "Could not extract any people from what you entered"});

        if (errors.length > 0) {
            return renderMeals(req, res, errors);
        }

        // todo - change 'date' to 'when'
        var createBody = {
            date: body.when[0],
            what: body.what[0],
            who: body.who[0]
        }
        var createUrl = userMealsUrl(config.munchcalApiUrl, req.user.id, null);
        request.post({ url:createUrl, body:createBody, json:true }, function(err, resp, body){
            if (err || resp.statusCode != 201) return res.render('error');

            return renderMeals(req, res);
        });

    });
};

