//Controlleur GroupeChat
var GroupeChat  = require("../models/GroupeChat").GroupeChat;
var ParticipantChat = require('../models/Participant').ParticipantChat;
var Utilisateur = require('../models/Utilisateur').Utilisateur;
var async = require('async');

exports.index = function(req, res) {
	if(req.user._id)
		res.render('groupechats/groupechats.ejs');
	else
		res.redirect('/login');
};

exports.create = function(req, res) {
	GroupeChat.create({nom: req.body.nomGroupe, createur: req.user._id, date: new Date(), nombre: 1},
		function(err, groupe) {
			if(!err)

			ParticipantChat.create({groupeid: groupe._id, userid: req.user._id, acces: 'admin'}, function(err, part) {
				if(err) res.json({result: false, data: "Echec de création"});
				res.json({result: true, data: {groupe: groupe, part: part} });
			});
	})
};

exports.getGroupeByID = function(req, res) {
	ParticipantChat.find({groupeid: req.params.groupeid})
		.populate("userid"," -mdp -actif -acces")
		.exec(function(err, groupes) {
			if(err)
				res.json({result:  false, data: "Echec de lecture"});
			else
				res.json({result: true, data: groupes});
		})
};

//retourne mes groupes
exports.getGroupe = function(req, res) {
	ParticipantChat.find()
		.where("userid").equals(req.user._id)
		.populate("groupeid")
		.select("groupeid -_id")
		.exec(function(err, groupes){
			var liste = [];
			groupes.forEach(function(grp, key) {
				liste.push(grp.groupeid._id);
			});
			console.log("123123");
			ParticipantChat.find()
				.where("groupeid").in(liste)
				.populate("userid "," -actif -acces -mdp")
				.populate("groupeid")
				.exec(function(err, retour) {
					if(err) res.json({ result: false, "data" : "Echec de connexion" });
					console.log("1111222233333\n"+JSON.stringify(retour));
					res.json({result: true, data: retour});
				});
		});
}
exports.listeNonMembre = function(req, res) {
	ParticipantChat.find()
		.where("groupeid").equals(req.params.groupeid)
		.select("userid -_id")
		.exec(function(err, membres) {
			var liste = [];
			membres.forEach(function(mbr, key) {
				liste.push(mbr.userid);
			});

			if(err)
				res.json({ result: false, "data" : "Echec de connexion" });
			else
				Utilisateur.find()
					.where("_id").nin(liste)
					.where("actif").equals("activé")
					.select("-mdp -actif -acces")
					.exec(function(err, users){
						if(err) res.json({result: false, data: "Erreur de connexion"});
						res.json({result: true, data: users});
					});

		});
};

exports.listeMembreGroupe = function(groupeid) {
	ParticipantChat.find()
		.where("groupeid").equals(groupeid)
		.populate("groupeid")
		.populate("userid"," -mdp -actif -acces")
		.exec(function(err, result){
			if(err) res.json({result: false, data: "Echec de connexion"});
			res.json({result: true, data: result});
		})
};

exports.supprimer = function(req, res) {
	GroupeChat.findByIdAndRemove(req.params.groupeid, function(err, groupe){
		if(!err){
			ParticipantChat.remove({groupeid: req.params.groupeid}, function(error, grp) {
				if(!error)
					res.json({ "result" : true, "data" : "Groupe supprimé avec succès" });
				else
				res.json({"result": false, "data": "Erreur lors de la suppression du groupe"});
			});
		} else {
			res.json({"result": false, "data": "Erreur lors de la suppression du groupe"});
		}
	});
};

exports.ajouterMembre = function(req, res) {
	ParticipantChat.create({groupeid:req.body.groupeid, userid: req.body.userid, acces: req.body.acces}, function(err, part) {
		if(err)  {
			res.json({result: false, data: "Echec d'ajout du membre"});
		} else {
			GroupeChat.findByIdAndUpdate(req.body.groupeid, {$inc : {nombre: 1} }, function(error, data) {
				if(error) {
					res.json({result: false, data: "Echec d'ajout du membre"});
				}else
					res.json({ "result" : true, "data" : part });
			});
		}
	});
};

exports.update = function(req, res) {
	GroupeChat.update({_id: req.body.groupeid}, {$set: {nom: req.body.nomGroupe}}, function(err, groupe){
		if(!err){
			res.json({ "result" : true, "data" : "Groupe mis à jour avec succès" });
		} else {
			res.json({"result": false, "data": "Erreur lors de la mise à jour du groupe"});
		}
	})
};

 exports.sortir = function(req, res) {
	 ParticipantChat.findOneAndRemove({userid: req.params.userid, groupeid: req.params.groupeid}, function(err, part) {
		 if(!err){
			 GroupeChat.findByIdAndUpdate(req.params.groupeid, {$inc : {nombre: -1} }, function(error, data) {
				 if(error) {
					 res.json({result: false, data: "Echec d'ajout du membre"});
				 }else
					 res.json({ "result" : true, "data" : part });
			 });
		 } else {
			 res.json({"result": false, "data": "Erreur lors de la sortie du groupe"});
		 }
	 })
 };