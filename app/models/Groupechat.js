// Modèle GroupeChat
var mongoose = require('../config/db.js').mongoose;

var GroupeChatSchema = mongoose.Schema({
	nom : { type : String, required : true },
	nombre: { type : Number, required : true },
	date: Date,
	createur: {type : mongoose.Schema.Types.ObjectId, ref : "Utilisateur", required: true}
});

var GroupeChat = mongoose.model("GroupeChat", GroupeChatSchema);

exports.GroupeChat = GroupeChat;