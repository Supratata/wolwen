/**
 * Created by ARISTIDE MARIE on 02/08/2016.
 */

var mongoose = require('../config/db.js').mongoose;

var ChatGroupeSchema = mongoose.Schema({
    expediteur : {type : mongoose.Schema.Types.ObjectId, ref : "Utilisateur", required: true},
    recepteur : {type : mongoose.Schema.Types.ObjectId, ref : "GroupeChat", required: true},
    dateEnvoi: Date,
    message: { type : String, required : true },
    fichier: mongoose.Schema.Types.Mixed,
    vus: [{type : mongoose.Schema.Types.ObjectId, ref : "Utilisateur"}]
});

var ChatGroupe = mongoose.model("ChatGroupe", ChatGroupeSchema);

exports.ChatGroupe = ChatGroupe;

var ChatUserSchema = mongoose.Schema({
    expediteur : {type : mongoose.Schema.Types.ObjectId, ref : "Utilisateur", required: true},
    recepteur : {type : mongoose.Schema.Types.ObjectId, ref : "GroupeChat", required: true},
    dateEnvoi: Date,
    message: { type : String, required : true },
    fichier: mongoose.Schema.Types.Mixed,
    vu: Date
});
var ChatUser = mongoose.model("ChatUser", ChatUserSchema);

exports.ChatUser = ChatUser;