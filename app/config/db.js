/**
 * Created by ARISTIDE MARIE on 01/08/2016.
 */

var mongoose = require("mongoose");
var db = mongoose.connect("mongodb://127.0.0.1:27017/ashdownchat");

mongoose.connection.on("error", function() {
    console.log("Erreur de connexion à la base de données")
});
mongoose.connection.on("open", function() {
    console.log("Connexion réussie à la base de données");
});

exports.mongoose = mongoose;