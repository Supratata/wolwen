//Controlleur Connexion
var Utilisateur = require('../models/Utilisateur.js').Utilisateur;
var jwt = require('json-web-token');
var moment = require('moment');
var secret = require('../config/config.js');
var cryptojs = require("crypto-js/sha256");

/*Controlleur des paramètres de connexion*/
exports.index = function(req, res){
	if(req.cookies.token) {
		jwt.decode(secret, req.cookies.token, function (err_, decode) {
			if(err_) {
				return console.error(err.name, err.message);
			} else {
				Utilisateur.findOne({_id: decode.user._id}, function(err, user) {
					if(err || !user) {
						res.json({state:false});
						return;
					} else {
						res.render('index.ejs', {
							userid: user._id,usernom: user.nom,	userprenom: user.prenom, useracces: user.acces, userphoto: user.photo,
							userdep: user.departement, 	useremail: user.email });
					}
				});
			}
		});
	}else {
		res.redirect("/login");
	}
};

/* Page de login */
exports.login = function(req, res) {
	console.log("cookies", req.cookies.token);
	if(req.cookies.token)
		res.redirect('/');
	else
  res.render('connexion/connexion.ejs', {state: false});
};

/*Vérification des données de connexion */
exports.connexion = function(req, res) {
	if(!req.body.state) {
		Utilisateur.findOne({nom: req.body.input, actif: "activé"}, function(err, user) {
			if(err || !user) {
				res.json({state:false});
			}else {
				res.json({state:true,photo:user.photo, nom:user.nom, prenom:user.prenom});
			}
		});
	} else {
		var ciphertext = cryptojs(req.body.input).toString();
		Utilisateur.findOne({mdp: ciphertext, nom: req.body.nom, actif: "activé"}, function(err, user) {
			if(err || !user) {
				res.json({state:false});
				return;
			} else {
				var expires = moment().add('days', 7).valueOf();
				jwt.encode(secret, {user: {_id: user._id}, exp: expires}, function (err, token) {
					if (err) {
						return console.error(err.name, err.message);
					} else {
						res.json({valide: true, token: token});
					}
				});
			}
		});
	}
};

/*deconnexion*/
exports.logout = function(req, res) {
	delete req.cookies.token;
	console.log("cookies", req.cookies.token);
	res.redirect('/login');
};


