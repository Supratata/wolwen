/**
 * Created by MASSAGA on 23/07/2016.
 */

var Projet = require('../models/Projet').Projet;
var FileProjet = require('../models/Projet').FileProjet;
var Utilisateur = require('../models/Utilisateur').Utilisateur;
var Tache = require('../models/Projet.js').Tache;
var flow = require('../config/flow-node.js')('projets');
var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var zipFolder = require('zip-folder');
var dirTree = require('directory-tree');
var ACCESS_CONTROLL_ALLOW_ORIGIN = false;

var multer  =   require('multer');
var name = "";
var ext = "";

var megaO = 1024*1024;
var parcourtFils = function(parent,result){
    var data = {};
    data.name = parent.name;
    data.route = parent.path;
    data.date = parent.date;
    data.size = parseFloat(parent.size/megaO).toFixed(2) + " Mo";
    //data.size = data.size
    if(parent.children) {
        data.folders = [];
        data.files = [];
        parent.children.forEach(function(fils) {
            parcourtFils(fils, data);
        });
        result.folders.push(data);
    }else {
        result.files.push(data);
    }
    return result;
};

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './projets/'+req.cookies.projet+'/fichiers');
    },
    filename: function (req, file, cb) {
        ext = file.originalname.split('.')[file.originalname.split('.').length -1];
        name = 'fichier-'+new Date()+'.'+ext;
        cb(null, name)
    }
});
var upload = multer({ //multer settings
    storage: storage
}).single('fichier');


var selectPreview = function(ext) {
    previewImage = '';
    if(ext == 'pdf')
        previewImage = "previews/pdf.png";
    else if(ext == 'doc' || ext == 'docx' || ext == 'odt')
        previewImage = "previews/word.png";
    else if(ext == 'zip' || ext == '7z' || ext == 'rar' || ext == 'tar')
        previewImage = "previews/compresse.png";
    else if(ext == 'png' || ext == 'jpg' || ext == 'bmp' || ext == 'gif' || ext == 'jpeg' || ext == 'tiff')
        previewImage = 'fichiers/'+name;
    else if(ext == 'avi' || ext == 'flv' || ext == 'mkv' || ext == 'mp4' || ext == 'mpeg' || ext == 'mov' || ext == 'webm' || ext == 'rmvb' || ext == 'wmv')
        previewImage = "previews/video.jpg";
    else if(ext == 'mp3' || ext == 'wav' || ext == 'wma' || ext == 'aac')
        previewImage = "previews/audio.png";
    else
        previewImage = "previews/fichier.jpg";
    return previewImage;
};

exports.index = function(req, res) {
    res.render('projets/projets');
};

exports.getOneProjet = function(req, res) {
    Projet.findOne({_id: req.params.projetid})
        .populate("createur","-mdp -actif -acces")
        .populate("membres","-mdp -actif -acces")
        .select('-actif')
        .exec(function(err, prj) {
            if(err || !prj)
                res.json({result: false, data: "Erreur de connexion"});
            else {
                var tree = dirTree(path.normalize(__dirname + '/../../projets/'+prj.nom)+'/projet');
                var Rtree = {folders: [], files:[]};
                parcourtFils(tree,Rtree);
                res.json({result: true, data: prj, tree: Rtree});
            }
        });
};

exports.create = function(req, res) {
    var projet = req.body.projet;
    projet.actif = "activé";
    projet.statut = 0;
    projet.membres = [projet.createur];
    //veérifie si le projet n'existe
    Projet.find({nom: projet.nom}, function(err, retour) {
        //console.log(JSON.stringify(retour));
        if(retour.length == 0 ) {
            Projet.create(projet, function(err, pro) {
                if(err)
                    res.json({result: false, data: "Erreur de création"});
                else {
                    fse.mkdirsSync('./projets/'+pro.nom+'/fichiers');
                    fse.mkdirsSync('./projets/'+pro.nom+'/projet');
                    fse.ensureFileSync('./projets/'+pro.nom+'/projet/'+pro.nom+'.txt');
                    Projet.findOne({_id: pro._id})
                        .populate("createur","-mdp -actif -acces")
                        .exec(function(error, data) {
                            if(error)
                                res.json({result: false, data: "Erreur de création"});
                            else
                                res.json({result: true, data: data});
                        });
                }
            });
        }else {
            res.json({result: false, data: "Le projet existe déjà"});
        }
    });
};

exports.update = function(req,res){
   Projet.findByIdAndUpdate(req.body.projetid, {$set: req.body.projet}, function(err, count){
       if(err)
           res.json({result: false, data: "Erreur de mise à jour"});
       else
           res.json({result: true, data: count});
   });
};

exports.indexprojet = function(req, res) {
    res.render('projets/projet', {idprojet: req.params.projetid});
};

exports.mesProjets = function(req, res) {
    Projet.find({ $or: [{createur: req.user._id}, {"membres": req.user._id}]})
        .populate("createur","-mdp -actif -acces")
        .populate("membres","-mdp -actif -acces")
        .where("actif").equals("activé")
        .select('-actif')
        .exec(function(err, projets) {
            if(err)
                res.json({result: false, data: "Erreur recupération"});
            else
                res.json({result: true, data: projets});
        });
};

exports.supprimer = function(req, res) {
    Projet.findByIdAndUpdate(req.params.projetid, {$set: {actif: "désactivé"}},  function(err, doc) {
        if(err)
            res.json({result: false, data: "Erreur de suppression"});
        else
            res.json({result: true, data: "Suppression effectuée"});
    })
};

exports.updateStatut = function(req, res) {
    Projet.findByIdAndUpdate(req.body.projet, {statut: req.body.statut}, function(err, data) {
        if(err)
            res.json({result: false, data: "Erreur de mise à jour"});
        else
            res.json({result: true, data: data});
    });
};

exports.adherants = function(req, res) {
    Utilisateur.find()
        .where("_id").nin(req.body.projet.membres)
        .where("_id").ne(req.user._id)
        .where("actif").equals("activé")
        .select("-mdp -actif -acces")
        .exec(function(err, users) {
            if(err)
                res.json({result: false, data: "Erreur de lectures"});
            else
                res.json({result: true, data: users });
        });
};

exports.adherer = function(req, res) {
    Projet.findById(req.body.projetid, function(err, projet) {
        if(err)
            res.json({result: false, data: "Erreur de lectures"});
        else {
            projet.membres = projet.membres.concat(req.body.pris);
            projet = new Projet(projet);
            projet.save(function(error, pro) {
                if(error)
                    res.json({result: false, data: "Echec d'enregistrement"});
                else
                    res.json({result: true, data: pro});

            });
        }
    });
};

exports.saveFile = function(req, res) {
    upload(req, res, function (err) {
        if (err) {
            res.json({result: false, data: err});
            return;
        }
        var previewImage = selectPreview(ext);
        var file = null;
        if(req.body.data.tache) {
            file = {description: req.body.data.description, fichier: name, dateEnvoi: new Date, actif: "activé",
                createur: req.user._id, tache: req.body.data.tache, projet: req.body.data.projetid, preview: previewImage};
        }else{
            file = {description: req.body.data.description, fichier: name, dateEnvoi: new Date, actif: "activé",
                createur: req.user._id, projet: req.body.data.projetid, preview: previewImage};
        }
        FileProjet.create(file, function(err, fichier) {
            if(err)
                res.json({result: false, data: "Erreur d'enregistrement"});
            else
                res.json({result: true, data: fichier});
        });
    });
};

exports.getFilesProjet = function(req, res) {
    FileProjet.find({projet: req.params.projetid})
        .populate("createur", "-mdp -actif -acces")
        .populate("tache", "-projet -parent -dateDebut -dateFin -statut -responsable -duree -description -numero -rappel -priorite -actif")
        .exec(function(err, files) {
            if(err)
                res.json({result: false, data: "Erreur de connexion"});
            else
                res.json({result: true, data: files});
        });
};

exports.retirerDuProjet = function(req, res) {
    Projet.findByIdAndUpdate( req.body.projetid, {$set: {membres: req.body.membres}}, function(err, data) {
        if(err)
            res.json({result: false, data: "Erreur de suppression"});
        else
            res.json({result: true, data: "Retiré avec succès"});
    })
};

exports.newChef = function(req, res) {
    Projet.findByIdAndUpdate( req.body.projetid, {$set: {createur: req.body.chef, membres: req.body.membres}}, function(err, data) {
        if(err)
            res.json({result: false, data: "Erreur de changement"});
        else
            res.json({result: true, data: "Changé avec succès"});
    })
};

exports.saveFolder = function(req, res) {
    req.route = path.normalize(__dirname + '/../../projets/');
    flow.post(req, function(status, filename, original_filename, identifier, currentTestChunk, numberOfChunks, pathFile) {
        console.log('POST', status, original_filename, identifier);
        if (status === 'done' && currentTestChunk > numberOfChunks) {
            console.log('subFolder ',pathFile);
            var stream = fs.createWriteStream(pathFile);
            flow.write(identifier, stream, { onDone: flow.clean });
        }
        res.sendStatus(200);
    });
};

exports.saveFolderOptions = function(req, res) {
    var route, dest;
    dest = path.normalize(__dirname + '/../../projets/'+req.cookies.projet+"/fichiers/");
    if(req.body.isFile) {
        route = path.normalize(__dirname + '/../../projets/'+req.cookies.projet+"/fichiers/");
        console.log('length',req.body.first.split('.')[req.body.first.split('.').length-1]);
        var previewImage = selectPreview(req.body.first.split('.')[req.body.first.split('.').length-1]);
        var file = {description: req.body.description, fichier: req.body.first, dateEnvoi: new Date(), actif: "activé",
            createur: req.user._id, projet: req.body.projet, preview: previewImage};
        FileProjet.create(file, function(err, fichier) {
            if(err)
                res.json({result: false, data: "Erreur d'enregistrement"});
            else{
                var tree = dirTree(path.normalize(__dirname + '/../../projets/'+req.cookies.projet)+'/projet');
                var Rtree = {folders: [], files:[]};
                parcourtFils(tree,Rtree);
                res.json({result: true, data: fichier, tree: Rtree});
            }
        });
    }else {
        var tree = dirTree(path.normalize(__dirname + '/../../projets/'+req.cookies.projet)+'/projet');
        var Rtree = {folders: [], files:[]};
        parcourtFils(tree,Rtree);
        res.json({result: true, tree: Rtree});
    }

};

exports.saveFolderGet = function(req, res) {
    flow.get(req, function(status, filename, original_filename, identifier) {
        console.log('GET', status);
        if (ACCESS_CONTROLL_ALLOW_ORIGIN) {
            res.header("Access-Control-Allow-Origin", "*");
        }
        if (status == 'found') {
            status = 200;
        } else {
            status = 204;
        }
        res.sendStatus(status);
    });
};

exports.download = function(req, res) {
    var arbre = req.params.name.split('_1_2_');
    var route = path.normalize(__dirname + '/../../projets/'+req.cookies.projet);
    var routefiles = path.normalize(route+'/fichiers/');
    var fileName = '';
    var folderName = '';

    if(arbre.length >= 2 ) {
        arbre.splice(0,1);
        fileName = arbre[arbre.length-1];
        folderName = arbre[arbre.length-2];
        arbre.splice(arbre.length-1,1);
        route = path.normalize(route+'/' + arbre.join('/'));
    }else {
        route = routefiles;
        fileName = req.params.name;
    }
    var options = { root: route, dotfiles: 'deny', headers: { 'x-timestamp': Date.now(), 'x-sent': true } };

    if(fileName == 'dossier') {
        zipFolder(route, routefiles+ folderName +'.zip', function(err) {
            if(err) {
                console.log('oh no!', err);
            } else {
                options.root = path.normalize(routefiles);
                res.sendFile(folderName+'.zip', options, function (err) {
                    if (err) {
                        console.log(err);
                        res.status(err.status).end();
                    }
                    else {
                        console.log('Sent:', fileName);
                    }
                });
            }
        });
    }else {
        res.sendFile(fileName, options, function (err) {
            if (err) {
                console.log(err);
                res.status(err.status).end();
            }
            else {
                console.log('Sent:', fileName);
            }
        });
    }
};

exports.delete = function(req,res) {
    var arbre = req.params.name.split('_1_2_');
    arbre.splice(0,1);
    var fileName = arbre[arbre.length-1];
    if(fileName == "dossier") {
        arbre.splice(arbre.length-1,1);
    }
    route = path.normalize(__dirname + '/../../projets/'+req.cookies.projet+'/' + arbre.join('/'));
    fse.remove(route,function(err){
        if(err) {
            console.log('err',err);
        }else {
            var tree = dirTree(path.normalize(__dirname + '/../../projets/'+req.cookies.projet+'/projet'));
            var Rtree = {folders: [], files:[]};
            parcourtFils(tree,Rtree);
            res.json({result: true, tree:Rtree});
        }
    });
};