/**
 * Created by ARISTIDE MARIE on 05/08/2016.
 */

mainApp.factory('projetFactory', [ '$http', '$q', 'Upload', '$state', function($http, $q, Upload, $state) {
    var factory = {
        projets: null,
        projet: null,
        node: {tree: null, current: null, isDirectory: false},
        projetGet: function() {
            return factory.projet;
        },
        getProjet: function(id) {
            var deferred = $q.defer();
            $http.get('/projets/projet/'+id)
                .success(function(data, status) {
                    if(!data.result) {
                        $state.go('projets');
                        return;
                    }
                    factory.projet = data.data;
                    angular.forEach(factory.projets, function(prj, key){
                        if(prj._id == factory.projet._id){
                            factory.projets[key] = factory.projet;
                        }
                    });
                    factory.projet.tree = data.tree;
                    deferred.resolve(factory.projet);
                }).error(function(data, status){
                deferred.reject("Echec de connexion");
            });
            return deferred.promise;
        },
        getProjetLocal: function() {
          return factory.projet;
        },
        setProjet: function(projet) {
          factory.projet = projet;
        },
        creerProjet : function(projet) {
            var deferred = $q.defer();
            $http.post('/projets', {projet: projet})
                .success(function(data, status) {
                    factory.projets.push(data.data);
                    deferred.resolve(factory.projets);
                }).error(function(data, status){
                deferred.reject("Echec d'enregistrement");
            });
            return deferred.promise;
        },
        updateProjet: function(projet, temp) {
            var deferred = $q.defer();
            $http.put('/projets', {projetid: projet._id, projet: projet})
                .success(function(data, status) {
                    factory.projet.nom = projet.nom;
                    factory.projet.description = projet.description;
                    factory.projet.priorite = projet.priorite;
                    factory.projet.dateCreation = projet.dateCreation;
                    factory.projet.dateFin = projet.dateFin;
                    if(projet.createur) {
                        angular.forEach(temp.membres, function(mem, key) {
                            if(projet.createur == mem._id) {
                                factory.projet.createur = mem;
                                return;
                            }
                        });
                    } else {
                        factory.projet.createur = temp.createur;
                    }
                    factory.projet.membres = temp.membres;
                    deferred.resolve(data);
                }).error(function(data, status){
                deferred.reject("Echec d'enregistrement");
            });
            return deferred.promise;
        },
        getmesProjets: function() {
            var deferred = $q.defer();
            $http.get('/projets/mesprojets')
                .success(function(data, status) {
                    factory.projets = data.data;
                    deferred.resolve(factory.projets);
                }).error(function(data, status){
                deferred.reject("Echec de connexion");
            });
            return deferred.promise;
        },
        supprimer: function(groupeid) {
            var deferred = $q.defer();
            $http.delete('/projets/'+groupeid)
                .success(function(data, status) {
                    angular.forEach(factory.projets, function(proj, key) {
                        if(proj._id == groupeid)
                            factory.projets.splice(key,1);
                    });
                    deferred.resolve(data);
                }).error(function(data, status){
                deferred.reject("Echec de connexion");
            });
            return deferred.promise;
        },
        //liste des utilisateurs pouvant etre pris dans le projet
        adherants: function(projet) {
            var deferred = $q.defer();
            $http.post('/projet/adherants', {projet: projet})
                .success(function(data, status) {
                    deferred.resolve(data);
                }).error(function(data, status){
                deferred.reject("Echec d'enregistrement");
            });
            return deferred.promise;
        },
        //enregistrement des personnes retenues pour le projet
        adherer: function(pris, id) {
            var deferred = $q.defer();
            $http.post('/projet/adherer', {projetid: id,pris: pris})
                .success(function(data, status) {

                    deferred.resolve(data);
                }).error(function(data, status){
                deferred.reject("Echec d'enregistrement");
            });
            return deferred.promise;
        },
        enregistrerFichier: function(fichier, data) {
            return Upload.upload({ url: '/projet/savefile', data: {fichier: fichier, data: data} });
        },
        getFichierProjet: function(id) {
            var deferred = $q.defer();
            $http.get('/projet/'+id+'/fichiers')
                .success(function(data, status) {
                    deferred.resolve(data);
                }).error(function(data, status){
                deferred.reject("Echec de connexion");
            });
            return deferred.promise;
        },
        retirerDuProjet: function(projetid, membres) {
            var deferred = $q.defer();
            $http.post('/projet/retirerMembre',{projetid: projetid, membres: membres})
                .success(function(data, status) {
                    deferred.resolve(data);
                }).error(function(data, status){
                deferred.reject("Echec de connexion");
            });
            return deferred.promise;
        },
        changerChef: function(id, chef, mbres) {
            var deferred = $q.defer();
            $http.post('/projet/newchef',{projetid: id, chef: chef, membres: mbres})
                .success(function(data, status) {
                    angular.forEach(factory.projets,function(proj, key) {
                        if(proj._id == id) {
                            factory.projets[key].membres = mbres;
                            factory.projets[key].createur = chef;
                        }
                    });
                    deferred.resolve(data);
                }).error(function(data, status){
                deferred.reject("Echec de connexion");
            });
            return deferred.promise;
        },
        projetStatut: function(statut){
            var deferred = $q.defer();
            console.log(statut);
            projet:factory.projet.statut = statut;
            $http.put('/projet/statut',{projet:factory.projet._id, statut: statut})
                .success(function(data, status) {
                    deferred.resolve(data);
                }).error(function(data, status){
                deferred.reject(data);
            });
            return deferred.promise;
        },
        saveFileProjet: function(description,first,projetid ,t) {
            var deferred = $q.defer();
            $http.post('/savefolder/options',{description: description, isFile: t, first:first, projet:projetid})
                .success(function(data, status){
                    factory.projet.tree = data.tree;
                    deferred.resolve(data)
                }).error(function(data, status){
                deferred.reject(data);
            });
            return deferred.promise;
        },
        deleteNode: function(r){
            var deferred = $q.defer();
            $http.delete('/projet/delete/'+r)
                .success(function(data, status) {
                    factory.projet.tree = data.tree;
                    deferred.resolve(data);
                }).error(function(data, status){
                deferred.reject("Echec de connexion");
            });
            return deferred.promise;
        }
    };
    return factory;
}]);

mainApp.factory('tacheFactory', [ '$http', '$q', 'Upload', 'projetFactory','$cookies', '$filter' ,
    function($http, $q, Upload, projetFactory, $cookies, $filter) {
    var factory = {
        taches: [],
        parentOpen: null,
        sousOpen: null,
        tachesGantts: [],
        setParentOpen: function(tache) {
            factory.parentOpen = tache;
        },
        setSousOpen: function(tache){
          factory.sousOpen = tache;
        },
        getTache: function(projet) {
            var deferred = $q.defer();
            $http.get('/taches/'+projet)
                .success(function(data, status) {
                    var taille = 0;
                    angular.forEach(data.taches, function(tache, key) {
                        data.taches[key].fichiers = [];
                        data.taches[key].commentaires = [];
                        taille = data.fichiers.length;
                        for(var i = 0; i<taille; i++) {
                            if(tache._id == data.fichiers[i].tache) {
                                data.taches[key].fichiers.push(data.fichiers[i]);
                                data.fichiers.splice(i,1);
                                taille -=1; i -=1;
                            }
                        }
                        taille = data.commentaires.length;
                        for(var i = 0; i<taille; i++) {
                            if(tache._id == data.commentaires[i].tache) {
                                data.taches[key].commentaires.push(data.commentaires[i]);
                                data.commentaires.splice(i,1);
                                taille -=1; i -=1;
                            }
                        }
                    });
                    taille = data.taches.length;
                    for(key = 0; key<taille; key ++) {
                        data.taches[key].soustaches = [];
                        for(var i = key+1; i<taille; i++) {
                            t = data.taches[i];
                            if(data.taches[key]._id == t.parent) {
                                delete t.soustaches;
                                data.taches[key].soustaches.push(t);
                                data.taches.splice(i,1);
                                taille -=1; i -=1;
                            }
                        }
                    }
                    factory.taches = data.taches;
                    deferred.resolve(factory.taches);
                }).error(function(data, status){
                deferred.reject(data);
            });
            return deferred.promise;
        },
        creerTache : function(tache, commentaire) {
            var deferred = $q.defer();
            $http.post('/taches',{tache: tache, commentaire: commentaire})
                .success(function(data, status) {
                    var createur = projetFactory.projetGet().createur, moi = JSON.parse($cookies.user);
                    delete moi.mdp; delete moi.actif; delete moi.acces; delete moi.confirmemdp;
                    data.tache.fichiers = [];
                    if(data.tache.responsable == createur._id) {
                        data.tache.responsable = createur;
                    }else {
                        if(moi._id == data.tache.responsable) {
                            data.tache.responsable =  moi;
                        }
                    }
                    if(!commentaire) {
                        data.tache.commentaires = [];
                    }else {
                        if(commentaire.auteur == createur._id) {
                            data.commentaire.auteur = createur;
                        }else {
                            if(moi._id == commentaire.auteur) {
                                data.commentaire.auteur = moi;
                            }
                        }
                        data.tache.commentaires = [data.commentaire];
                    }
                    if(!data.tache.parent) {
                        data.tache.soustaches = [];
                        factory.taches.push(data.tache);
                        factory.updateProjetStatut();
                    } else {
                        factory.parentOpen.soustaches.push(data.tache);
                        factory.updateStatut();
                    }
//alert('zzz'+JSON.stringify(data));
                    deferred.resolve(data.tache);
                }).error(function(data, status){
                deferred.reject(data);
            });
            return deferred.promise;
        },
        deleteTache: function(tache) {
            var deferred = $q.defer();
            $http.delete('/taches/'+tache._id)
                .success(function(data, status) {
                    if(!tache.parent) {
                        factory.taches.splice(factory.taches.indexOf(tache),1);
                        factory.updateProjetStatut();
                    } else {
                        factory.parentOpen.soustaches.splice(factory.parentOpen.soustaches.indexOf(tache),1);
                        factory.updateStatut();
                    }
                    deferred.resolve(data);
                }).error(function(data, status){
                deferred.reject(data);
            });
            return deferred.promise;
        },
        updateTache: function(tache){
            var deferred = $q.defer();
            $http.put('/taches',{editedTask: tache})
                .success(function(data, status) {
                    if(!tache.parent) {
                        factory.parentOpen.nom = tache.nom;
                        factory.parentOpen.description = tache.description;
                        factory.parentOpen.dateDebut = tache.dateDebut;
                        factory.parentOpen.dateFin = tache.dateFin;
                        factory.parentOpen.numero = tache.numero;
                        factory.parentOpen.priorite = tache.priorite;
                        if(tache.statut) {
                            factory.parentOpen.statut = tache.statut;
                            factory.updateProjetStatut();
                        }
                    }else {
                        factory.sousOpen.nom = tache.nom;
                        factory.sousOpen.description = tache.description;
                        factory.sousOpen.dateDebut = tache.dateDebut;
                        factory.sousOpen.dateFin = tache.dateFin;
                        factory.sousOpen.statut = tache.statut;
                        factory.sousOpen.numero = tache.numero;
                        factory.sousOpen.priorite = tache.priorite;
                        factory.updateStatut();
                    }
                    deferred.resolve(data);
                }).error(function(data, status){
                deferred.reject("Echec de connexion");
            });
            return deferred.promise;
        },
        addComment: function(comment, t) {
            var deferred = $q.defer();
            $http.post('/taches/commentaires', {commentaire: comment})
                .success(function(data, status) {
                    var moi = JSON.parse($cookies.user);
                    delete moi.mdp; delete moi.actif; delete moi.acces; delete moi.confirmemdp;
                    data.data.auteur = moi;
                    if(!t.parent) {
                        factory.parentOpen.commentaires.push(data.data);
                    }else {
                        factory.sousOpen.commentaires.push(data.data);
                    }
                    deferred.resolve(data.data);
                }).error(function(data, status){
                deferred.reject("Echec d'enregistrement");
            });
            return deferred.promise;
        },
        deleteComment: function(comment, tache) {
            var deferred = $q.defer();
            $http.delete('/taches/commentaires/'+comment._id)
                .success(function(data, status) {
                    if(!tache.parent) {
                        factory.parentOpen.commentaires.splice(factory.parentOpen.commentaires.indexOf(comment),1);
                    }else {
                        factory.sousOpen.commentaires.splice(factory.sousOpen.commentaires.indexOf(comment),1);
                    }
                    deferred.resolve(data);
                }).error(function(data, status){
                deferred.reject(data);
            });
            return deferred.promise;
        },
        addFile: function(file, tache){
            if(!tache.parent) {
                factory.parentOpen.fichiers.push(file);
            }else {
                factory.sousOpen.fichiers.push(file);
            }
        },
        deleteFile: function(file, tache) {
            var deferred = $q.defer();
            $http.delete('/taches/fichiers/'+file._id)
                .success(function(data, status) {
                    if(!tache.parent) {
                        factory.parentOpen.fichiers.splice(factory.parentOpen.fichiers.indexOf(file),1);
                    } else {
                        factory.sousOpen.fichiers.splice(factory.sousOpen.fichiers.indexOf(file),1);
                    }
                    deferred.resolve(data);
                }).error(function(data, status){
                deferred.reject(data);
            });
            return deferred.promise;
        },
        updateStatut: function(){
            var deferred = $q.defer();
            var coeff = 0, taux = 0;
            angular.forEach(factory.parentOpen.soustaches, function(tache, key){
                coeff += tache.priorite;
                taux = taux + tache.statut*tache.priorite;
            });
            factory.parentOpen.statut = Math.ceil(taux/coeff);
            $http.put('/taches/statut',{tache:factory.parentOpen._id, statut: factory.parentOpen.statut})
                .success(function(data, status) {
                    factory.updateProjetStatut();
                    deferred.resolve(data);
                }).error(function(data, status){
                deferred.reject(data);
            });

            return deferred.promise;
        },
        updateProjetStatut: function(){
            var coeff = 0, taux = 0;
            coeff = 0; taux = 0;
            angular.forEach(factory.taches, function(tache, key){
                coeff += tache.priorite;
                taux = taux + tache.statut*tache.priorite;
            });
            projetFactory.projetStatut(Math.ceil(taux/coeff));
        },
        doTask: function(){
            var prj = projetFactory.getProjetLocal();
            factory.tachesGantts = [];
            var taille = 0, count = 0;
            factory.tachesGantts.push({id: prj._id, text: prj.nom, start_date:moment(prj.dateCreation).format("DD-MM-YYYY"), duration:diffTime(prj.dateFin,prj.dateCreation),order:10,
                progress:prj.statut, open: true});

            angular.forEach(factory.taches, function(tache,key){
                factory.tachesGantts.push({id:tache._id, text:tache.nom, start_date:moment(tache.dateDebut).format("DD-MM-YYYY"), duration:diffTime(tache.dateFin,tache.dateDebut), order:10,
                    progress:tache.statut, parent:prj._id});
                angular.forEach($filter('orderBy')(tache.soustaches,'numero'), function(st,k){
                    factory.tachesGantts.push({id:st._id, text:st.nom, start_date:moment(st.dateDebut).format("DD-MM-YYYY"), duration:diffTime(st.dateFin,st.dateDebut), order:20,
                        progress:st.statut, parent:tache._id});
                });
            });
            return {data:factory.tachesGantts};
        }
    };
    return factory;
}]);

