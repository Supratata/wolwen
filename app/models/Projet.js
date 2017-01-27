/**
 * Created by MASSAGA on 23/07/2016.
 */

var mongoose = require('../config/db.js').mongoose;

var ProjetSchema = mongoose.Schema({
    nom : { type : String, required : true },
    description : { type : String, required : true },
    dateCreation: { type : Date, required : true },
    dateFin: { type : Date, required : true },
    priorite: { type : Number, required : true },
    statut: { type : Number, required : true },
    actif: String,
    createur: {type : mongoose.Schema.Types.ObjectId, ref : "Utilisateur", required: true},
    membres: [{type : mongoose.Schema.Types.ObjectId, ref : "Utilisateur", required: true}]
});

var Projet = mongoose.model("Projet", ProjetSchema);

exports.Projet = Projet;

var FileProjetSchema = mongoose.Schema({
    description : { type : String, required : true },
    fichier: { type : String, required : true },
    dateEnvoi: Date,
    actif: String,
    preview: String,
    projet: {type : mongoose.Schema.Types.ObjectId, ref : "Projet", required: true},
    tache: {type : mongoose.Schema.Types.ObjectId, ref : "Tache"},
    createur: {type : mongoose.Schema.Types.ObjectId, ref : "Utilisateur", required: true}
});

var FileProjet = mongoose.model("FileProjet", FileProjetSchema);

exports.FileProjet = FileProjet;


var tacheCommentaireSchema = mongoose.Schema({
    date: Date,
    auteur: {type : mongoose.Schema.Types.ObjectId, ref : "Utilisateur", required: true},
    projet: {type : mongoose.Schema.Types.ObjectId, ref : "Projet", required: true},
    tache: {type : mongoose.Schema.Types.ObjectId, ref : "Tache", required: true},
    commentaire: { type : String, required : true }
});

exports.TacheCommentaire = mongoose.model("TacheCommentaire", tacheCommentaireSchema);

var tacheSchema = mongoose.Schema({
    nom: { type : String, required : true },
    projet: {type : mongoose.Schema.Types.ObjectId, ref : "Projet"},
    parent: {type : mongoose.Schema.Types.ObjectId, ref : "Tache"},
    dateDebut: { type : Date, required : true },
    dateFin: { type : Date, required : true },
    statut: { type : Number, required : true },
    responsable: {type : mongoose.Schema.Types.ObjectId, ref : "Utilisateur", required: true},
    duree: Number,
    description: { type : String, required : true },
    rappel: {date: Date, text: String},
    numero: { type : Number, required : true },
    priorite: { type : Number, required : true },
    actif: String
});

exports.Tache =  mongoose.model("Tache", tacheSchema);

