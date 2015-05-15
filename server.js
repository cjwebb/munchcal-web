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
    morgan       = require('morgan'),
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
            return moment(datetime.fn(this), config.calendarFormat).format(format);
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
app.use(morgan('short'));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({extended: false}));
app.use(expValidator({
    customValidators: {
        isCalendarFormat: function(value) {
            return moment(value, config.calendarFormat, true).isValid();
        }
    }
}));
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
app.post('/', checkAuthentication, routes.meals.post);
app.get('/meals/:date', checkAuthentication, routes.meals.get);
app.post('/meals/:date', checkAuthentication, routes.meals.post);

// login/logout user
app.route('/login')
    .get(function(req, res){
        if (req.isAuthenticated()) return res.redirect('/');
        return res.render('login');
    })
    .post(passport.authenticate('local', { successRedirect: '/',
                                           failureRedirect: '/login',
                                           failureFlash: 'Invalid email or password' }));

app.get('/logout', function(req, res){
    req.logout();
    return res.redirect('/');
});

// register new user
app.route('/signup')
    .get(function(req, res){
        if (req.isAuthenticated()) return res.redirect('/');
        return res.render('signup');
    })
    .post(function(req, res){
        req.checkBody('name', 'Please choose a display name').len(1, 100);
        req.checkBody('email', 'A valid email address is required').isEmail();
        req.checkBody('password', 'Passwords must be at least 6 characters in length').len(6);

        var errors = req.validationErrors();
        if (errors) {
            return res.render('signup', { validationErrors: errors });
        }

        var user = {
            name: req.sanitize('name').toString(),
            email: req.sanitize('email').toString(),
            password: req.sanitize('password').toString()
        };
        db.createUser(user, function(err, result){
            if (err) {
                return res.render('signup', { validationErrors: [{ msg: err.message }]});
            }
            user.id = result.id;
            return req.login(user, function(err){
                if (err) return res.render('error');
                return res.redirect('/');
            });
        });
    });

app.listen(process.env.PORT || 3000);

