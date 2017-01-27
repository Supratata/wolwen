/**
*	Dépendances
*/
var express = require('express');
var router = express.Router();
var connexion = require('../app/controllers/connexion.js');
var chats = require('../app/controllers/chats.js');
var groupeChat = require('../app/controllers/groupeChat.js');
var utilisateurs =  require("../app/controllers/utilisateurs.js");
var projets = require('../app/controllers/projets.js');
var profils = require('../app/controllers/profils.js');
var taches = require('../app/controllers/taches.js');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var secret = require('../app/config/config.js');
var jwt = require('json-web-token');
var sha512 = require('crypto-js/sha512');


function ensureAuthorized(req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.token;
    if (token) {
        // verifies secret and checks exp
        jwt.decode( secret, token, function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                req.user = decoded.user;
                //console.log('sha512',sha512(decoded.user.mdp));
                next();
            }
        });
    }else {
        res.redirect("/login");
    }
}

/* GET home page. (connection page)*/
router.get('/', connexion.index);
/*  page de login*/
router.get('/login', connexion.login);
/* Verification des paramètres de connexion*/
router.post('/connexion', connexion.connexion);
/*deconnexion*/
router.get('/logout', connexion.logout);

/* groupeChat */
router.get('/groupechats', ensureAuthorized, groupeChat.index);
router.get('/groupechats/getgroupeid/:groupeid', ensureAuthorized, groupeChat.getGroupeByID);
router.get('/groupechats/getGroupe', ensureAuthorized, groupeChat.getGroupe);
router.post('/groupechats/create', ensureAuthorized, groupeChat.create);
router.get('/groupechats/listeNonMembre/:groupeid', ensureAuthorized, groupeChat.listeNonMembre);
router.delete('/groupechats/:groupeid', ensureAuthorized, groupeChat.supprimer);
router.post('/groupechats/ajouterMembre', ensureAuthorized, groupeChat.ajouterMembre);
router.put('/groupechats', ensureAuthorized, groupeChat.update);
router.get('/groupechats/sortir/:groupeid/:userid', ensureAuthorized, groupeChat.sortir);

/* Routes utilisateurs */
router.get('/utilisateurs/index', ensureAuthorized, utilisateurs.index);
router.get('/utilisateurs', ensureAuthorized, utilisateurs.getUtilisateurs);
router.delete('/utilisateurs/:utilisateur', ensureAuthorized, utilisateurs.delete);
router.post('/utilisateurs', ensureAuthorized, utilisateurs.create);
router.put('/utilisateurs', ensureAuthorized, utilisateurs.update);

router.post('/departement', ensureAuthorized, utilisateurs.createDepartement);
router.get('/departements', ensureAuthorized, utilisateurs.getDepartements);
router.delete('/departement/:dep', ensureAuthorized, utilisateurs.deleteDepartement);


/* Routes Projets*/
router.get('/projets', ensureAuthorized, projets.index);
router.get('/projets/mesprojets', ensureAuthorized, projets.mesProjets);
router.get('/projets/projet/:projetid', ensureAuthorized, projets.getOneProjet);
router.post('/projets', ensureAuthorized, projets.create);
router.put('/projets', ensureAuthorized, projets.update);
router.delete('/projets/:projetid', ensureAuthorized, projets.supprimer);

router.get('/projet/:projetid', ensureAuthorized, projets.indexprojet);
router.get('/projet/:projetid/fichiers', ensureAuthorized, projets.getFilesProjet);
router.get('/projet/download/:name', ensureAuthorized, projets.download);
router.delete('/projet/delete/:name', ensureAuthorized, projets.delete);
router.post('/projet/retirerMembre', ensureAuthorized, projets.retirerDuProjet);
router.post('/projet/newchef', ensureAuthorized, projets.newChef);
router.post('/projet/savefile', ensureAuthorized, projets.saveFile);
router.put('/projet/statut', ensureAuthorized, projets.updateStatut);
router.post('/projet/adherants', ensureAuthorized, projets.adherants);
router.post('/projet/adherer', ensureAuthorized, projets.adherer);

router.get('/savefolder', ensureAuthorized, projets.saveFolderGet);
router.post('/savefolder', ensureAuthorized, multipartMiddleware , projets.saveFolder);
router.post('/savefolder/options', ensureAuthorized, projets.saveFolderOptions);


/*Routes taches*/
router.get('/taches/:projetid', ensureAuthorized, taches.getTaches);
router.get('/tache/:id', ensureAuthorized, taches.getTache);
router.post('/taches', ensureAuthorized,taches.create);
router.put('/taches', ensureAuthorized,taches.update);
router.put('/taches/statut', ensureAuthorized,taches.updateStatut);
router.delete('/taches/:tache', ensureAuthorized,taches.delete);
router.post('/taches/commentaires', ensureAuthorized,taches.ajouterCommentaire);
router.delete('/taches/commentaires/:commentaire', ensureAuthorized,taches.deleteCommentaire);
router.delete('/taches/fichiers/:fichier', ensureAuthorized, taches.deleteFile);

/* Routes sur l'échange de message */
/*Interface de monitoring des chats*/
router.get('/chat', ensureAuthorized,chats.index);
router.get('/filechat/:name', ensureAuthorized, multipartMiddleware, chats.fileChat);
router.get('/chats/messagesgroupes/:groupeid', ensureAuthorized, chats.listeMessageGroupe);
router.post('/chats/messagesuser', ensureAuthorized, chats.listeMessageUser);
router.post('/chats/file', ensureAuthorized, chats.fichier);

/* Gestion de son profil*/
router.put('/profil', ensureAuthorized, profils.update);

module.exports = router;
