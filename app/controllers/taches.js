/**
 * Created by ARISTIDE MARIE on 24/08/2016.
 */

var Commentaire = require('../models/Projet.js').TacheCommentaire;
var Projet = require('../models/Projet').Projet;
var FileProjet = require('../models/Projet').FileProjet;
var Utilisateur = require('../models/Utilisateur').Utilisateur;
var Tache = require('../models/Projet.js').Tache;


exports.getTaches = function(req, res) {
    Tache.find()
        .where("projet").equals(req.params.projetid)
        .where('actif').equals("activé")
        .populate("responsable", "-mdp -acces -actif")
        .exec(function(err, taches) {
            if(err)
                res.json({result: false, data: "Erreur sur les tâches"});
            else {
                Commentaire.find()
                    .where("projet").equals(req.params.projetid)
                    .populate('auteur', '-mdp -acces -actif')
                    .exec(function (er, commentaires) {
                        if (er)
                            res.json({result: false, data: "Erreur sur les commetaires des tâches"});
                        else {
                            FileProjet.find()
                                .where("projet").equals(req.params.projetid)
                                .populate('createur','-mdp -acces -actif')
                                .exec(function(err, fichiers) {
                                    if(err)
                                        res.json({result: false, data: "Erreur sur les commetaires des tâches"});
                                    else {
                                        res.json({result: true, taches: taches, commentaires: commentaires, fichiers: fichiers});
                                    }
                                });
                        }
                    });
            }
        });
};

exports.getTache = function(req, res) {
    Tache.findOne()
        .where("_id").equals(req.params.id)
        .populate("responsable", "-mdp -acces -actif")
        .populate("fichiers")
        .populate("commentaires")
        .exec(function(err, tache) {
            if(err)
                res.json({result: false, data: "Erreur sur les tâches"});
            else {
                Commentaire.find()
                    .where('_id').in(tache.commentaires)
                    .populate('auteur', '-mdp -acces -actif')
                    .exec(function(er, commentaires) {
                        if(err)
                            res.json({result: false, data: "Erreur sur les commetaires des tâches"});
                        else {
                            taches.commentaires = commentaires;
                            FileProjet.find()
                                .where('_id').in(tache.fichiers)
                                .populate('createur','-mdp -acces -actif')
                                .exec(function(err, fichiers) {
                                    if(err)
                                        res.json({result: false, data: "Erreur sur les commetaires des tâches"});
                                    else {
                                        tache.fichiers = fichiers;
                                        res.json({result: true, data: tache});
                                    }
                                });
                        }

                    });
            }
        });
};

exports.create = function(req, res) {
    req.body.tache.actif = "activé";
    Tache.create(req.body.tache, function(err, data) {
            if(err) {
                res.json({result: false, data: err});
            }
            else {
                if(req.body.commentaire) {
                    req.body.commentaire.tache = data._id;
                    Commentaire.create(req.body.commentaire, function(er, comment) {
                        if(er) {
                            res.json({result: false, data: err});
                        }else  {
                            res.json({result: true, tache: data, commentaire: comment});
                        }
                    });
                } else {
                    res.json({result: true, tache: data});
                }
            }
        });
};

exports.updateStatut = function(req, res) {
    Tache.findByIdAndUpdate(req.body.tache, {statut: req.body.statut}, function(err, data) {
        if(err)
            res.json({result: false, data: "Erreur de mise à jour"});
        else
            res.json({result: true, data: data});
    });
};

exports.update = function(req, res) {
    Tache.findByIdAndUpdate(req.body.editedTask._id, {$set: req.body.editedTask}, function(err, data) {
        if(err)
            res.json({result: false, data: "Erreur de mise à jour"});
        else
            res.json({result: true, data: data});
    });
};

exports.delete = function(req, res) {
    Tache.findByIdAndUpdate(req.params.tache, {$set: {actif: "désactivé"}}, function(err, data) {
        if(err)
            res.json({result: false, data: "Erreur de suppression"});
        else
            res.json({result: true, data: "Correctement supprimé"});
    });
};

exports.ajouterCommentaire = function(req, res) {
    req.body.commentaire.date = new Date();
    //console.log(req.body.commentaire);
    Commentaire.create(req.body.commentaire, function(err, data) {
            if(err)
                res.json({result: false, data: "Erreur d'ajout du commentaire"});
            else
                res.json({result: true, data: data});
        });
};

exports.deleteCommentaire = function(req, res) {
    Commentaire.findByIdAndRemove(req.params.commentaire, function(err, count) {
        if(err)
            res.json({result: false, data: "Erreur de suppression"});
        else
            res.json({result: true, data: "Correctement supprimé"});
    });
};

exports.deleteFile  = function(req, res) {
    FileProjet.findByIdAndRemove(req.params.fichier, function(err, count){
        if(err)
            res.json({result: false, data: "Erreur de suppression"});
        else
            res.json({result: true, data: "Correctement supprimé"});

    });
}