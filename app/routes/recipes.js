"use strict"

var request = require('request'),
    _       = require('lodash'),
    config  = require('../../config.js');

var addDefaultImage = function(recipe){
    if (!_.has(recipe, 'image.url')) {
        _.set(recipe, 'image.url', config.defaultRecipeImage);
    }
    return recipe;
}

exports.search = function(req, res) {
    req.sanitize('q').trim();
    if (!req.query.q) {
        return res.render('recipes');
    }

    var url = config.munchcalRecipesUrl + "/recipes?q=" + req.query.q;
    request.get({ url:url, json:true }, function(err, resp, body){
        if (err || resp.statusCode != 200) {
            return res.status(500).render('error');
        }

        body.data = _.map(body.data, addDefaultImage);
        body.q = req.query.q;
        if (body.data.length < 1) {
            body.resultsMessage = "No recipes found";
        }
        return res.render('recipes', body);
    });
};

exports.get = function(req, res){
    var url = config.munchcalRecipesUrl + "/recipes/" + req.params.id;
    request.get({ url:url, json:true }, function(err, resp, body){
        if (err || resp.statusCode != 200){
            return res.status(500).render('error');
        }

        body.data = _.map(body.data, addDefaultImage);
        return res.render('recipesDetail', body);
    });
};

