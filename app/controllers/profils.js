/**
 * Created by ARISTIDE MARIE on 04/08/2016.
 */

var Utilisateur  = require("../models/Utilisateur.js").Utilisateur;
var fs = require("fs");
var multer = require('multer');
var cryptojs = require("crypto-js/sha256");
var name = "";

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './public/images/profils')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        name = file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1];
        cb(null, name)
    }
});
var upload = multer({ //multer settings
    storage: storage
}).single('photo');

var fonctionUpdate = function(req, res, user) {
    Utilisateur.findOneAndUpdate({_id: user._id}, {$set: user}, function(er, usee) {
        if(er)
            res.json({result: false, data: "Erreur de mise à jour"});
        else{
            Utilisateur.findOne({_id: user._id})
                .select("-mdp")
                .exec(function(error, result) {
                    if(error)
                        res.json({result: false, data: "Erreur de mise à jour"});
                    else {
                        res.json({result: true, data: result});
                    }
                });
        }
    });
};

var testPhoto = function(req,res, user) {
    if(req.body.photo) {
        user.photo = 'images/profils/photo' + '-' + Date.now() + '.png';
        console.log(user.photo);
        fs.writeFile("./public/"+user.photo, req.body.photo, 'base64', function(err) {
            if(err) {
                res.json({result: false, data: err});
                return;
            }
            fonctionUpdate(req, res, user);
        });
    }else {
        fonctionUpdate(req, res, user);
    }
};

exports.update = function(req, res) {
    var user = req.body.user;
    if (user.mdp) {
        Utilisateur.findOne({mdp: cryptojs(req.body.input).toString()}, function(err, user) {
            if(err || !user) {
                res.json({result: false, data: "Mot de passe incorrect"});
                return;
            } else {
                user.mdp = cryptojs(user.confirmemdp).toString();
                delete user.confirmemdp;
                testPhoto(req,res, user);
            }
        });
    }else {
        testPhoto(req,res, user);
    }


};



