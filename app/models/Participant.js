/**
 * Created by ARISTIDE MARIE on 03/08/2016.
 */

var mongoose = require('../config/db.js').mongoose;

var ParticipantChatSchema = mongoose.Schema({
    userid : {type : mongoose.Schema.Types.ObjectId, ref : "Utilisateur", required: true},
    groupeid : {type : mongoose.Schema.Types.ObjectId, ref : "GroupeChat", required: true},
    acces: { type : String, required : true },
});

var ParticipantChat = mongoose.model("ParticipantChat", ParticipantChatSchema);

exports.ParticipantChat = ParticipantChat;
