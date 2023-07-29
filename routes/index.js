var express = require('express');
var router = express.Router();
var passport = require('passport');
var GoogleStrategy = require('passport-google-oidc');
require('dotenv').config();
var Users = require('./users')



passport.use(new GoogleStrategy({
  clientID: process.env['GOOGLE_CLIENT_ID'],
  clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  callbackURL: '/oauth2/redirect/google',
  scope: [ 'email','profile' ]
}, async function verify(issuer, profile, cb) {
  console.log(profile);
  let exestinguser = await Users.findOne({email:profile.emails[0].value})
  if(exestinguser){
    return cb(null,exestinguser);
  }
  else{
    let newUser = await Users.create({name:profile.displayName,email:profile.emails[0].value})
    return cb(null,newUser);
  }
  
}));

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.user) {
    res.render('index', { title: 'Express' });
  } else {
    res.redirect('/login')
  }
});


router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/login/federated/google', passport.authenticate('google'));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

module.exports = router;