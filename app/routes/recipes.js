"use strict"

var request = require('request'),
    config  = require('../../config.js');

exports.get = function(req, res) {
    req.sanitize('q').trim();
    if (!req.query.q) {
        return res.render('recipes');
    }

    var url = config.munchcalRecipesUrl + "/recipes?q=" + req.query.q;
    request.get({ url:url, json:true }, function(err, resp, body){
        if (err || resp.statusCode != 200) {
            return res.status(500).render('error');
        }

        body.q = req.query.q;
        if (body.data.length < 1) {
            body.resultsMessage = "No recipes found";
        }
        return res.render('recipes', body);
    });
}

