 /**
 * Created by ARISTIDE MARIE on 05/08/2016.
 */

mainApp.controller('projetsCtrl', ['$scope','projetFactory', '$state','utilisateurFactory','$cookies', '$rootScope',
    function($scope, projetFactory, $state, utilisateurFactory, $cookies, $rootScope) {
    $cookies.deuxiemeEtage = false;
    $scope.formProjetVisible = false;
    $scope.newProjet = {priorite: 1, dateFin: '', dateCreation: ''};
    $scope.myid = $('#userid').val();
    $scope.users = [];

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if(projetFactory.projet != null) {
            $state.go('projets.projet',{projetid: projetFactory.projet._id});
        }
    });

    projetFactory.getmesProjets().then(function(data) {
        $scope.projets = data;
    });

    utilisateurFactory.getUtilsateurs().then(function(users){
        angular.forEach(users, function(u,k){
            if(u.actif == 'activé')
                $scope.users.push(u);
        });
    }, function(msg) { alert(msg); });

    $scope.afficherFormCreerProjet = function() {
        $scope.formProjetVisible = !$scope.formProjetVisible;
        $scope.newProjet = {priorite: 1, dateFin: '', dateCreation: ''};
    };
    $scope.creerProjet = function() {
        var diffDays = Math.ceil((new Date($scope.newProjet.dateFin).getTime() - new Date($scope.newProjet.dateCreation).getTime()) / (1000 * 3600 * 24));
        if(diffDays < 0) {
            alert("Date de début supérieure à la date de fin");
            return;
        }
        if(!$scope.newProjet.createur) {
            $scope.newProjet.createur = $scope.myid;
        }
        projetFactory.creerProjet($scope.newProjet).then(function(data) {
            $scope.newProjet = {priorite: 1, dateFin: '', dateCreation: ''};
            $scope.formProjetVisible = !$scope.formProjetVisible;
        }, function(err){alert(err)});
    };

    $scope.supprimer = function(groupeid) {
        projetFactory.supprimer(groupeid).then(function(data) {
        }, function(err) { alert(err);})
    };

    $rootScope.$on('fileUploaded', function(data) {
        console.log("cool");
    })

}]);

mainApp.controller('projetCtrl', ['$scope', 'projetFactory', 'utilisateurFactory', 'tacheFactory','$cookies', '$state',
    function($scope, projetFactory, utilisateurFactory, tacheFactory, $cookies, $state) {
    //rend visible le formulaire d'ajout de fichier
    $scope.formAjouterFichierVisible = false;
    $scope.projetUpdate = null;
    $scope.visibleCreerTache = false;
    $scope.plusOptions = 'rien';
    $scope.taches = [];
    $scope.myid = $('#userid').val();
    $scope.formEdit = true;
    $scope.filesProjet = false;
    $scope.adminTache = false;
    $scope.taux = 0;
    $scope.path = "http://localhost:3000/";

    $scope.editProjet = function() {
        $scope.formEdit = !$scope.formEdit;
        if($scope.formEdit ) {
            $scope.filesProjet = false;
            $scope.adminTache = false;
            $scope.zoneTacheDetail = false;
            $scope.gantt = false;
            $('#zoneTache').removeClass('col-md-8 col-sm-8');
            $('.adminTache').removeClass('active-control');
            $('.adminFiles').removeClass('active-control');
            $('.adminGantt').removeClass('active-control');

        }else {
            projetFactory.getProjet($('#idprojet').val()).then(function(data) {
                $scope.projetAfficher = data;
                $scope.nom = data.nom;
            });
        }
    };

    $scope.visibleTache = function() {
        $scope.adminTache = !$scope.adminTache ;
        if($scope.adminTache) {
            $scope.formEdit = false;
            $scope.gantt = false;
            $scope.filesProjet = false;
            $scope.zoneTacheDetail = false;
            $('#zoneTache').removeClass('col-md-8 col-sm-8');
            $('.adminTache').addClass('active-control');
            $('.adminFiles').removeClass('active-control');
            $('.adminGantt').removeClass('active-control');
        }
    };

    $scope.visibleFile = function() {
        $scope.filesProjet = !$scope.filesProjet;
        if($scope.filesProjet) {
            $scope.formEdit = false;
            $scope.gantt = false;
            $scope.adminTache = false;
            $scope.zoneTacheDetail = false;
            $('#zoneTache').removeClass('col-md-8 col-sm-8');
            $('.adminFiles').addClass('active-control');
            $('.adminTache').removeClass('active-control');
            $('.adminGantt').removeClass('active-control');
            projetFactory.getFichierProjet($scope.projetAfficher._id).then(function(data) {
                $scope.filesprojets = data.data;
                $scope.nbres = data.data.length;
            }, function(err) {alert(err);});
        }
    };
        $scope.roleList = [
            { "roleName" : "User", "roleId" : "role1", "children" : [
                { "roleName" : "subUser1", "roleId" : "role11", "collapsed" : true, "children" : [] },
                { "roleName" : "subUser2", "roleId" : "role12", "collapsed" : true, "children" : [
                    { "roleName" : "subUser2-1", "roleId" : "role121", "children" : [
                        { "roleName" : "subUser2-1-1", "roleId" : "role1211", "children" : [] },
                        { "roleName" : "subUser2-1-2", "roleId" : "role1212", "children" : [] }
                    ]}
                ]}
            ]},

            { "roleName" : "Admin", "roleId" : "role2", "children" : [
                { "roleName" : "subAdmin1", "roleId" : "role11", "collapsed" : true, "children" : [] },
                { "roleName" : "subAdmin2", "roleId" : "role12", "children" : [
                    { "roleName" : "subAdmin2-1", "roleId" : "role121", "children" : [
                        { "roleName" : "subAdmin2-1-1", "roleId" : "role1211", "children" : [] },
                        { "roleName" : "subAdmin2-1-2", "roleId" : "role1212", "children" : [] }
                    ]}
                ]}
            ]},

            { "roleName" : "Guest", "roleId" : "role3", "children" : [
                { "roleName" : "subGuest1", "roleId" : "role11", "children" : [] },
                { "roleName" : "subGuest2", "roleId" : "role12", "collapsed" : true, "children" : [
                    { "roleName" : "subGuest2-1", "roleId" : "role121", "children" : [
                        { "roleName" : "subGuest2-1-1", "roleId" : "role1211", "children" : [] },
                        { "roleName" : "subGuest2-1-2", "roleId" : "role1212", "children" : [] }
                    ]}
                ]}
            ]}
        ];

    projetFactory.getProjet($('#idprojet').val()).then(function(data) {
        //alert("zzzz"+JSON.stringify(data))
        $scope.projetAfficher = data;
        $scope.nom = data.nom;
        $scope.projetId = null;
        $cookies.projet = data.nom;
        $scope.structure = data.tree;

        projetFactory.getFichierProjet($scope.projetAfficher._id).then(function(data) {
            $scope.filesprojets = data.data;
            $scope.nbres = data.data.length;
        }, function(err) {alert(err);});

        tacheFactory.getTache($scope.projetAfficher._id).then(function(data){
            //alert(JSON.stringify(data));
            $scope.taches = data;
        }, function(err){alert(err);});

        if(! ($scope.projetAfficher.createur._id == $scope.myid)) {
            $(".datedisabled").addClass('nonactive');
        }
    }, function(err) {alert (err);});


    $scope.updateProjet = function() {
        if($scope.projetAfficher.createur._id == $scope.myid) {
            if(diffTime($scope.projetAfficher.dateFin,$scope.projetAfficher.dateCreation) < 0) {
                alert("Date de début supérieure à la date de fin");
                return;
            }
            var temp = {membres: $scope.projetAfficher.membres,  createur: $scope.projetAfficher.createur};
            delete $scope.projetAfficher.membres;
            if($scope.projetAfficher.newCreateur) {
                $scope.projetAfficher.createur = $scope.projetAfficher.newCreateur;
                delete $scope.projetAfficher.newCreateur;
            }else {
                delete $scope.projetAfficher.createur;
            }
            projetFactory.updateProjet($scope.projetAfficher, temp).then(function(data){
                $scope.nom = $scope.projetAfficher.nom;
                if(!($scope.projetAfficher.createur._id == $scope.myid)) {
                    $(".datedisabled").addClass('nonactive');
                }
            }, function(err){});
        }
    };

    $scope.onEnd = function() {
        if(!($scope.projetAfficher.createur._id == $scope.myid)) {
            $('.nonactive').attr('disabled', 'disabled');
        }
    };

    $scope.descriptionFile  = false;
    $scope.ajouterFichier = function (b) {
            if(b && !projetFactory.node.isDirectory) {
                $scope.formAjouterFichierVisible = true;
            }
            $scope.formAjouterFichierVisible = !$scope.formAjouterFichierVisible;
            if($scope.formAjouterFichierVisible ) {
                $scope.newFile = {};
                if(!b) {
                    projetFactory.node.tree = null;
                    $scope.descriptionFile  = true;
                }else{
                    $scope.descriptionFile = false;
                    $scope.newFile.description = "cool";
                }
            }else{
                $scope.$flow.cancel();
            }
    };

    $scope.saveFile = function() {
        $scope.$flow.resume();
    };

    $scope.retirerDuProjet = function(idmembre) {
        var temp = $scope.projetAfficher.membres;
        if($scope.projetAfficher.createur._id == $scope.myid) {
            angular.forEach(temp, function(membre, key) {
                if(membre._id == idmembre) {
                    temp.splice(key,1);
                }
            });
            projetFactory.retirerDuProjet($scope.projetAfficher._id, temp).then(function(data) {
                $scope.projetAfficher.membres = temp;
            }, function(err){alert(err);} );
        }

    };

    $scope.changerChefProjet = function() {
        var chef = null, membres = $scope.projetAfficher.membres;
        if($scope.projetAfficher.createur._id == $scope.myid) {
            angular.forEach(membres,function(mbre, key) {
                if(mbre.pris) {
                    chef = mbre;
                    membres.splice(key,1);
                    membres.push($scope.projetAfficher.createur);
                }
            });
            projetFactory.changerChef($scope.projetAfficher._id,chef, membres).then(function(data) {
                $scope.projetAfficher.membres = membres;
                $scope.projetAfficher.createur = chef;
            }, function(err){alert(err);});
        }
    };

    $scope.ajouterMembre = function() {
        if($scope.projetAfficher.createur._id == $scope.myid) {
            projetFactory.adherants($scope.projetAfficher).then(function(data) {
                //alert(JSON.stringify(data.data))
                $scope.adherants = data.data;
            }, function(err) { alert(err); });
        }
    };

    $scope.adherer = function() {
        var pris = [], temp = [];
        angular.forEach($scope.adherants, function(ad, key) {
            if(ad.pris == true) {
                pris.push(ad._id);
                temp.push(ad);
            }
        });
        projetFactory.adherer(pris, $scope.projetAfficher._id).then(function(data) {
            if(data.result)
                $scope.projetAfficher.membres = $scope.projetAfficher.membres.concat(temp);
            else
                alert("Echec");
        }, function(err){alert(err)})
    };

    $scope.afficherCreerTache = function() {
        $scope.visibleCreerTache = !$scope.visibleCreerTache;
        if(!$scope.visibleCreerTache) {
            $scope.newTache = {};
        }
    };

    $scope.afficherPlusOption = function(type) {
        if($scope.plusOptions == 'rien') {
            if(type == 'new') {
                $('#plusnewoptions i').removeClass("fa-plus");
                $('#plusnewoptions i').addClass('fa-close');
                $scope.plusOptions = 'new';
            }else{
                $('#plussousoptions i').removeClass("fa-plus");
                $('#plussousoptions i').addClass('fa-close');
                $scope.plusOptions = 'sous';
            }
        }else {
            if($scope.plusOptions == 'new') {
                $scope.plusOptions = 'rien';
                $('#plusnewoptions i').removeClass('fa-close');
                $('#plusnewoptions i').addClass('fa-plus');
            }else{
                $scope.plusOptions = 'rien';
                $('#plussousoptions i').removeClass('fa-close');
                $('#plussousoptions i').addClass('fa-plus');
            }
        }
    };

    $scope.creerTache = function(type) {
        //alert(JSON.stringify($scope.newTache));
        var commentaire = null;
        if(type == "sous") {
            $scope.newSousTache.parent = $scope.parentOpen._id;
            $scope.newSousTache.numero = $scope.parentOpen.soustaches.length+1;
            $scope.newTache = angular.copy($scope.newSousTache);
            var diff1 = diffTime($scope.newTache.dateDebut,$scope.parentOpen.dateCreation);
            var diff2 = diffTime($scope.newTache.dateFin,$scope.parentOpen.dateFin);
            if(diff1 < 0 || diff2 > 0) {
                alert("Erreur dates hors intervalle de la tâche parent");
                return;
            }
        }
        var diff1 = diffTime($scope.newTache.dateDebut,$scope.projetAfficher.dateCreation);
        var diff2 = diffTime($scope.newTache.dateFin,$scope.projetAfficher.dateFin);
        if(diff1 < 0 || diff2 > 0) {
            alert("Erreur dates hors intervalle du projet");
            return;
        }
        if(diffTime($scope.newTache.dateFin,$scope.newTache.dateDebut) < 0) {
            alert("Date de début supérieure à la date de fin");
            return;
        }

        if(!$scope.newTache.responsable) {
            $scope.newTache.responsable = $scope.myid;
        }
        if(!$scope.newTache.description){
            $scope.newTache.description = $scope.newTache.nom;
        }
        if(!$scope.newTache.statut) {
            $scope.newTache.statut = 0;
        }
        if(!$scope.newTache.priorite) {
            $scope.newTache.priorite = 1;
        }
        if(!($scope.newTache.rappel && $scope.newTache.rappel.text)) {
            delete $scope.newTache.rappel;
        }else{
            // + "T"+ $scope.newTache.rappel.heure
            $scope.newTache.rappel = {date: new Date($scope.newTache.rappel.date), text: $scope.newTache.rappel.text}
        }
        if($scope.newTache.commentaires) {
            commentaire = {date:new Date(), auteur: $scope.myid, projet: $scope.projetAfficher._id,
                commentaire: $scope.newTache.commentaires};
            delete $scope.newTache.commentaires;
        }
        if(!$scope.newTache.numero) {
            var max = 0;
            angular.forEach($scope.taches, function(value, key){
                if(value.numero > max) {
                    max = value.numero;
                }
            });
            $scope.newTache.numero = max+1;
        }

        $scope.newTache.projet = $scope.projetAfficher._id;

        tacheFactory.creerTache($scope.newTache, commentaire).then(function(data){
            $scope.newTache = null;
            $scope.newSousTache = null;
            $scope.visibleCreerTache = false;
        }, function(err){alert(err);});
    };

    $scope.deleteTache = function(tache) {
        tacheFactory.deleteTache(tache).then(function(data){

        }, function(err){});
    };

    $scope.openTache = function(tache) {
        if( $scope.parentOpen == tache) {
            $scope.tacheOpen = null;
            $scope.parentOpen = null;
            tacheFactory.setParentOpen(null);
            $scope.zoneTacheDetailEditable = false;
            $('#zoneTache').removeClass('col-md-8 col-sm-8');
            $scope.zoneTacheDetail = false;
        }else {
            $scope.tacheOpen = angular.copy(tache);
            $scope.parentOpen = tache;
            tacheFactory.setParentOpen(tache);
            $('#zoneTache').addClass('col-md-8 col-sm-8');
            $scope.zoneTacheDetail = true;
            if($scope.projetAfficher.createur._id == $scope.myid) {
                $scope.zoneTacheDetailEditable = true;
            }
        }
    };

    $scope.openSousTache = function(soustache) {
        if($scope.tacheOpen && $scope.tacheOpen._id == soustache._id) {
            $scope.tacheOpen = null;
            $scope.parentOpen = null;
            $scope.zoneTacheDetailEditable = false;
            tacheFactory.setSousOpen(null);
            $('#zoneTache').removeClass('col-md-8 col-sm-8');
            $scope.zoneTacheDetail = false;
        } else {
            $scope.tacheOpen = angular.copy(soustache);
            tacheFactory.setSousOpen(soustache);
            $scope.zoneTacheDetail = true;
            $('#zoneTache').addClass('col-md-8 col-sm-8');
            if($scope.projetAfficher.createur._id == $scope.myid || $scope.tacheOpen.responsable._id == $scope.myid) {
                $scope.zoneTacheDetailEditable = true;
            }
        }
    };

    $scope.addComment = function() {
        $scope.newCommentaire = {commentaire: $scope.newCommentaire};
        $scope.newCommentaire.tache = $scope.tacheOpen._id;
        $scope.newCommentaire.projet = $scope.tacheOpen.projet;
        $scope.newCommentaire.auteur = $scope.myid;

        tacheFactory.addComment($scope.newCommentaire, $scope.tacheOpen).then(function(data){
            $scope.tacheOpen.commentaires.push(data);
            $scope.newCommentaire = '';
        }, function(err){});
    };

    $scope.deleteComment = function(comment) {
        tacheFactory.deleteComment(comment,$scope.tacheOpen).then(function(data){
            $scope.tacheOpen.commentaires.splice($scope.tacheOpen.commentaires.indexOf(comment),1);
        }, function(err){});
    };

    $scope.addFile = function(){
        projetFactory.enregistrerFichier($scope.tacheFile.fichier, {description:$scope.tacheFile.description,
        projetid:$scope.projetAfficher._id, tache: $scope.tacheOpen._id})
            .then(function(data) {
                var moi = JSON.parse($cookies.user);
                delete moi.mdp; delete moi.actif; delete moi.acces; delete moi.confirmemdp;
                var prj = data.data.data;
                delete prj.actif;
                prj.createur = moi;

                tacheFactory.addFile(prj,$scope.tacheOpen);
                console.log(prj);
                $scope.tacheOpen.fichiers.push(prj);
                $scope.tacheFile.fichier = null;
                $scope.tacheFile.description = null;
            }, function(err) { alert(err);})
    };

    $scope.deleteFile = function(file) {
        tacheFactory.deleteFile(file,$scope.tacheOpen).then(function(data){
            $scope.tacheOpen.fichiers.splice($scope.tacheOpen.fichiers.indexOf(file),1);
        }, function(err){});

    };

    $scope.closeProjet = function() {
        projetFactory.projet = null;
        $state.go('projets');
    };

    $scope.updateTache = function() {
        var temp = angular.copy($scope.tacheOpen);

        delete temp.commentaires;
        delete temp.fichiers;
        delete temp.responsable;
        delete temp.projet;
        if(!temp.priorite) {
            temp.priorite = 1;
            $scope.tacheOpen.priorite = 1;
        }
        if(temp.soustaches && temp.soustaches.length != 0) {
            delete temp.statut;
        }
        delete temp.soustaches;
        tacheFactory.updateTache(temp).then(function(data){
            //console.log(data);
        }, function(err){});

    };

    $scope.$watch('newSousTache.dateDebut',function() {
        if($scope.tacheOpen && $scope.newSousTache) {
            $scope.date_deb_validator =  diffTime($scope.tacheOpen.dateDebut, $scope.newSousTache.dateDebut) > 0;
        }
    });
    $scope.$watch('newSousTache.dateFin',function() {
        if($scope.tacheOpen && $scope.newSousTache) {
            $scope.date_fin_validator = diffTime($scope.tacheOpen.dateFin, $scope.newSousTache.dateFin) < 0;
        }
    });

    $scope.visibleGantt = function(){
        $scope.gantt = !$scope.gantt;
        if($scope.gantt) {
            $scope.formEdit = false;
            $scope.adminTache = false;
            $scope.filesProjet = false;
            $scope.zoneTacheDetail = false;
            $('#zoneTache').removeClass('col-md-8 col-sm-8');
            $('.adminFiles').removeClass('active-control');
            $('.adminTache').removeClass('active-control');
            $('.adminGantt').addClass('active-control');
            $scope.tasks = tacheFactory.doTask();
        }
    };
    $scope.closeDetail = function() {
        $('#zoneTache').removeClass('col-md-8 col-sm-8');
        $scope.zoneTacheDetail = false;
    };

    $scope.$flow.on('complete', function(event) {
        projetFactory.saveFileProjet($scope.newFile.description,$scope.newFile.first,$scope.projetAfficher._id,
            !projetFactory.node.tree).then(function(data) {
            if(!projetFactory.node.tree) {
                var file = data.data;
                file.createur = {_id: file.createur, nom: $('#usernom').val(), prenom: $('#userprenom').val()};
                $scope.filesprojets.push(file);
            }
            $scope.formAjouterFichierVisible = false;
            $scope.structure = projetFactory.projet.tree;
            $scope.newFile = {};
            $scope.$flow.cancel();
            $scope.taux = 0;
        }, function(err) { alert(err);});

    });


    $scope.deleteNode = function(r) {
        r = 'tree_1_2_' + r;
        projetFactory.deleteNode(r).then(function(data){
            $scope.structure = projetFactory.projet.tree;
        },function(err){console.log('err',err);})
    };

    $scope.$flow.on('fileSuccess', function(event) {
        $scope.taux += (event.size*100/$scope.$flow.getSize());
    });

    $scope.$flow.on('filesSubmitted', function(event) {
        var taille = event[0].relativePath.split('/');
        $scope.newFile.first = taille[taille.length-1];
    });

    $scope.$flow.on('fileAdded', function(event) {
        if(projetFactory.node.tree) {
            event.relativePath = $scope.projetAfficher.nom +'/'+projetFactory.node.tree.join('/') +'/'+event.relativePath;
        }else {
            event.relativePath = $scope.projetAfficher.nom +'/fichiers/'+event.relativePath;
        }
    });

    $scope.options = {
        onNodeSelect: function (node, breadcrums) {
            $scope.breadcrums = breadcrums;
            projetFactory.node.tree = angular.copy(breadcrums);
            projetFactory.node.current = node;
            $scope.downloadtree = projetFactory.node.tree.join('_1_2_');
            $scope.downloadname = node.name;
            if(node.files) {
                $scope.downloadtree = $scope.downloadtree + '_1_2_dossier';
                projetFactory.node.isDirectory = true;
            }else {
                projetFactory.node.isDirectory = false;
            }
            if($scope.formAjouterFichierVisible) {
                $scope.formAjouterFichierVisible = false;
            }

        }
    };
}]);
