//Controlleur Chat
var ChatUser = require("../models/Chat").ChatUser;
var ChatGroupe= require("../models/Chat").ChatGroupe;
var Utilisateur = require("../models/Utilisateur.js").Utilisateur;
var GroupeChat = require('../models/GroupeChat.js').GroupeChat;
var ParticipantChat = require('../models/Participant').ParticipantChat;
var path = require('path');
var connectes = [], sockets = [], idConnectes = [];
var async = require('async');
var multer  =   require('multer');
var name = "", extension = "";

var storage = multer.diskStorage({ //multers disk storage settings
	destination: function (req, file, cb) {
		console.log('file',file);
		var type = file.mimetype.split('/')[0];
		if(type == 'audio' || type == 'video') {
			cb(null, './public/fichierchats');
		}else {
			cb(null, './fichierchats');
		}
	},
	filename: function (req, file, cb) {
		var datetimestamp = Date.now();
		extension = file.originalname.split('.')[file.originalname.split('.').length -1];
		name = file.fieldname + '-' + datetimestamp + '.' + extension ;
		cb(null, name)
	}
});
var upload = multer({ //multer settings
	storage: storage
}).single('fichier');



exports.index = function(req, res) {
	res.render("chat.ejs");
};

exports.participants = function(socket) {
	//nouveau client connecté
	socket.on("nouveau_client", function(data) {
		delete data.mdp;
		delete data.confirmemdp;
		delete data.acces;
		data.connecte = true;
		data.newMessage = false;
		idConnectes.push(data._id);
		socket.userid = data._id;
		sockets.push(socket);
		//console.log('socket\n'+sockets.length);
		//identification du connecté

		Utilisateur.find()
			.where("actif").equals("activé")
			.where("_id").nin(idConnectes)
			.select('-mdp -actif -acces')
			.exec(function(err, users) {
			// émission aux autres de celui qui s'est connecté
				if(err) {
					return console.log('err',err);
				}
				socket.broadcast.emit('nouveau_client', data);
				//envoi de la liste des connectés
				socket.emit('connectes', connectes);
				socket.emit('non connectes', users);
				//liste de mes groupes
				ParticipantChat.find()
					.where('userid').equals(data._id)
					.where('acces').ne("delete")
					.populate('groupeid')
					.exec(function(err, groupes) {
						socket.emit('connectes groupes', groupes);
					});
				//ajout à la liste des connectés
				connectes.push(data);
		});
	});

	// nouveau message
	socket.on("message", function (message) {
		console.log('humm ',message);
		var mess = {expediteur: message.expediteur, recepteur: message.recepteur, message: message.message, fichier: message.fichier,
			dateEnvoi: new Date(), photo: message.photo};
			ChatUser.create(mess, function(err, re){
				if(!err) {
					async.each(sockets, function(sock, callback) {
						if(sock.userid == mess.recepteur) {
							mess._id= re._id;
							sock.emit('message', mess);
						}
						callback(false);
						}, function(err){}
					);
				}
			});

	});

	socket.on("membre ajoute", function (groupe) {
		async.each(sockets, function(sock, callback) {
			if(sock.userid == groupe.go) {
				sock.emit('ajoute a un groupe', groupe);
				return;
			}
			callback(false);
		}, function(err){ });
	});

	socket.on('sortir groupe',function(data) {
		console.log(data);
		async.each(sockets, function(sock, callback) {
			if(sock.userid == data.userid) {
				sock.emit('sortir groupe', {groupe: data.groupeid});
			}
			callback(false);
		}, function(err){
			ParticipantChat.update({groupeid: data.groupeid, userid: data.userid}, {$set: {acces: "delete"}},
				function(err,count) {});
		});
	});
	socket.on('message groupe', function(message){
		var mess = {expediteur: message.expediteur, recepteur: message.recepteur, message: message.message, fichier: message.fichier,
			dateEnvoi: new Date()};
		ChatGroupe.create(mess, function(err, re){
			if(!err) {
				mess._id = re._id;
				socket.broadcast.emit('message de groupe', mess);
			}
		});
	});

	socket.on('ilecrit', function(data) {
		async.each(sockets, function(sock, callback) {
			if(sock.userid == data.expediteur) {
				sock.emit('ilecrit', data.moi);
			}
			callback(false);
		}, function(err){});
	});

	//déconnexion
	socket.on("disconnect", function() {
		var index = 0;
		async.each(connectes, function(connecte, callback) {
			if(socket.userid == connecte._id ) {
				connectes.splice(index,1);
				idConnectes.splice(index,1);
				return;
			}
			index++;
		}, function(err){});
		index = 0;
		async.each(sockets, function(sock, callback) {
			if(sock.userid == socket.userid) {
				Utilisateur.update({_id:sock.userid},{"last":new Date()}, function(er,c){
					console.log('er', er);
					console.log('c', c);
				});
				sockets.splice(index,1);
			}
			index++;
			callback(false);
		}, function(err){
			socket.broadcast.emit('deconnexion_client', {userid: socket.userid, last:new Date()});
		});
	});

};

exports.fileChat = function(req, res) {
	var route = path.normalize(__dirname + '/../../fichierchats/');
	var options = { root: route, dotfiles: 'deny', headers: { 'x-timestamp': Date.now(), 'x-sent': true } };
	res.sendFile(req.params.name, options, function (err) {
		if (err) {
			console.log(err);
			res.status(err.status).end();
		}
		else {
			console.log('Sent:', req.params.name);
		}
	});
};

exports.listeMessageGroupe = function(req, res) {
	ChatGroupe.find({recepteur: req.params.groupeid})
		.sort("dateEnvoi")
		.populate("expediteur", "-mdp -acces -actif")
		.exec( function(err, messages){
		if(err)
			res.json({result: false, data: err});
		else
			res.json({result: true, data: messages});
	});
};

exports.listeMessageUser = function(req, res) {
	var rec = req.body.recepteur;
	var exp = req.body.expediteur;

	ChatUser.update({$and: [{recepteur: exp},{expediteur: rec}], vu: undefined}, {$set: {vu: new Date()}},
		{ multi : true },function(err, count) {
			if(!err) {
				ChatUser.find({$or: [ {$and : [{recepteur: rec},{expediteur: exp}] }, {$and: [{recepteur: exp},{expediteur: rec}]}  ]})
					.sort("dateEnvoi")
					.populate("expediteur", "-mdp -acces -actif")
					.exec(function(er, messages){
						if(er)
							res.json({result: false, data: "Erreur de lecture"});
						else
							res.json({result: true, data: messages});
					});
			} else {
				res.json({result: false, data: "Erreur de lecture"});
			}
		});
};

exports.fichier = function(req, res) {
	upload(req, res, function (err) {
		if (err) {
			res.json({result: false, data: err});
		}
		console.log("type",req.body.type);
		var ext = extension;
		previewImage = null;
		if(ext == 'pdf')
			previewImage = "previews/pdf.png";
		else if(ext == 'doc' || ext == 'docx' || ext == 'odt')
			previewImage = "previews/word.png";
		else if(ext == 'zip' || ext == '7z' || ext == 'rar' || ext == 'tar')
			previewImage = "previews/compresse.png";
		else
			previewImage = "previews/fichier.jpg";

		if(req.body.type == 'video' || req.body.type == 'audio') {
			name = '/fichierchats/'+name;
		}

		res.json({result: true, data: name, preview: previewImage});
	});
};