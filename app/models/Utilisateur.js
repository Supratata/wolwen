//Mod-le Utilisateur
var mongoose =  require('../config/db.js').mongoose;
//var bcrypt = require('bcrypt');

var DepartementSchema = mongoose.Schema({
	nom : { type : String, unique: true, required : true },
	description : { type : String, required : true },
	actif : { type : String, required : true },
	date: Date
});

exports.Departement = mongoose.model("Departement", DepartementSchema);

var UtilisateurSchema = mongoose.Schema({
	nom : { type : String, required : true },
	email : { type : String, unique: true, required : true },
	prenom : { type : String, required : true },
	photo : { type : String, required : true },
	acces: { type : Number, required : true },
	actif: String,
	mdp: { type : String, required : true },
	naissance: Date,
	departement: {type: String, required: true},
	last: {type: Date}
});
/*
UtilisateurSchema.pre('save', function (next) {
	var user = this;
	if(this.isModified('password') || this.isNew) {
		bcrypt.genSalt(10, function (err, salt) {
			if (err) {
				return next(err);
			}
			bcrypt.hash(user.password, salt, function (err, hash) {
				if (err) {
					return next(err);
				}
				user.password = hash;
				next();
			});
		});
	} else {
		return next();
	}
});

UtilisateurSchema.methods.comparePassword = function (passw, cb) {
	bcrypt.compare(passw, this.password, function (err, isMatch) {
		if (err) {
			return cb(err);
		}
		cb(null, isMatch);
	});
};*/

var Utilisateur = mongoose.model("Utilisateur", UtilisateurSchema);

exports.Utilisateur = Utilisateur;