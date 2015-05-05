"use strict"

var express      = require('express'),
    favicon      = require('serve-favicon'),
    session      = require('express-session'),
    bodyParser   = require('body-parser'),
    exphbs       = require('express-secure-handlebars'),
    expValidator = require('express-validator'),
    flash        = require('connect-flash'),
    request      = require('request'),
    moment       = require('moment'),
    passport     = require('passport'),
    strategy     = require('passport-local').Strategy,
    pg           = require('pg'),
    app          = express();

var db           = require('./app/db');
var routes       = require('./app/routes');
var config       = require('./config.js');

// handlebars helpers
var hbs = exphbs.create({
    defaultLayout: 'main',
    helpers: {
        "formatDate": function(format, datetime) {
            return moment(datetime.fn(this), "YYYY-MM-DD").format(format);
        }
    }
});

// passport stuff
passport.use(
    new strategy(
        function(username, password, done) {
            db.getUserWithCredentials({ email: username, password: password}, function(err, user) {
                if (err) return done(err);
                if (!user) return done(null, false, { message: 'Email and Password do not match'});
                return done(null, user);
            });
        }));

passport.serializeUser(function(user, done) {
      done(null, user);
});

passport.deserializeUser(function(user, done) {
      done(null, user);
});

var checkAuthentication = function(req, res, next) {
    if (req.isAuthenticated()){
        next();
    } else {
        res.redirect('/login');
    }
};

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(__dirname + '/public'));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({extended: false}));
app.use(expValidator());
app.use(session({ secret: config.sessionSecret,
                  resave: false,
                  saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req, res, next) {
    // copy info so handlebars can render it
    res.locals.user = req.user;
    res.locals.errorFlash = req.flash('error');
    res.locals.messageFlash = req.flash('message');
    next();
});

app.get('/', checkAuthentication, routes.meals.get);
app.get('/meals/:date', checkAuthentication, routes.meals.get);

// login/logout user
app.route('/login')
    .get(function(req, res){
        if (req.isAuthenticated()) return res.redirect('/');
        res.render('login');
    })
    .post(passport.authenticate('local', { successRedirect: '/',
                                           failureRedirect: '/login',
                                           failureFlash: 'Invalid email or password' }));

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

// register new user
app.route('/signup')
    .get(function(req, res){
        if (req.isAuthenticated()) return res.redirect('/');
        res.render('signup');
    })
    .post(function(req, res){
        req.checkBody('name', 'Please choose a display name').len(1, 100);
        req.checkBody('email', 'A valid email address is required').isEmail();
        req.checkBody('password', 'Passwords must be at least 6 characters in length').len(6);

        var errors = req.validationErrors();
        if (errors) {
            console.log(errors);
            res.render('signup', { validationErrors: errors });
        } else {
            var user = {
                name: req.sanitize('name').toString(),
                email: req.sanitize('email').toString(),
                password: req.sanitize('password').toString()
            };
            db.createUser(user, function(err, result){
                if (err) {
                    res.render('signup', { validationErrors: [{ msg: err.message }]});
                } else {
                    req.flash('message', 'Your account has been created. Please login below.');
                    res.redirect('/login');
                }
            });
        }
    });

app.listen(process.env.PORT || 3000);

