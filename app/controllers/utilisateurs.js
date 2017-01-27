//Controlleur Utilisateur
var Utilisateur  = require("../models/Utilisateur.js").Utilisateur;
var Departement = require("../models/Utilisateur.js").Departement;

exports.index = function(req, res) {
	res.render("utilisateurs/utilisateurs.ejs");
};

//Retourn tous les utilisateurs
exports.getUtilisateurs = function(req, res) {
	Utilisateur.find()
		.select("-mdp")
		.exec(function(err, users){
		if(err)
			res.json({result: false, data: "Erreur de connexion"});
		else
			res.json({result: true, data: users});
	});
};

exports.create = function(req, res) {
	var newUser = req.body.user;
	newUser.photo = "images/profils/defaut.jpg";
	newUser.actif = "activé";
	Utilisateur.create(newUser, function(err, user) {
		console.log(JSON.stringify(user));
		if(!err){
			delete user.mdp;
			res.json({ "result" : true, data : user });
		} else{
			res.json({ "result" : false, "data" : "Erreur lors de la création de l'utilisateur" });
		}
	});
};

exports.update = function(req, res) {
	var user = {};
	user.nom = req.body.nom;
	user.prenom = req.body.prenom;
	user.email = req.body.email;
	user.departement = req.body.departement;
	if(req.body.mdp && req.body.mdp != "")
		user.mdp = req.body.mdp;
	user.acces = req.body.acces;
	user.actif = req.body.actif;
	console.log('update', user);
	Utilisateur.findOneAndUpdate({_id: req.body._id}, {$set: user}, function(err, user){
		console.log("err",err);
		if(err)
			res.json({result : false, data : "Erreur de mise à jour" });
		else
			res.json({ result : true, data : "Utilisateur mis à jour" });
	});
};

exports.delete = function(req, res) {
	Utilisateur.findOneAndUpdate({_id: req.params.utilisateur}, {$set: {actif: "désactivé"}}, function(err, user){
		if(err)
			res.json({result: false, data: "Echec de suppression"});
		else
			res.json({result: true, data: "Utilisateur Supprimé"});
	});
};

exports.getDepartements = function(req, res) {
	Departement.find( {actif: 'activé'},function(err, data) {
		if(err)
			res.json({result: false, data: "Echec de lecture"});
		else
			res.json({result: true, data: data});
	});
};

exports.createDepartement = function(req, res) {
	req.body.departement.date = new Date();
	req.body.departement.actif = "activé";
	Departement.create(req.body.departement, function(err, data) {
		if(err) {
			console.log(err);
			res.json({result: false, data: "Echec de création"});
		}
		else
			res.json({result: true, data: data});
	});
};

exports.deleteDepartement = function(req, res) {
	Departement.findByIdAndUpdate( req.params.dep, {$set: {actif: "désactivé"}}, function(err, data) {
		if(err)
			res.json({result: false, data: "Echec de suppression"});
		else {
			Utilisateur.update({departement: data.nom}, {actif: "désactivé"}, { multi : true }, function(error, data) {
				if(error)
					res.json({result: false, data: "Echec de suppression"});
				else
					res.json({result: true, data: "Suppression effectuée"});
			});
		}
	})
}