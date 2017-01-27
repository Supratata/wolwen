mainApp.factory('groupeChatFactory', [ '$http', '$q', function($http, $q){
    var factory = {
        groupes: [],
        mesgroupes: [],

        creerGroupe : function(val){
            var deferred = $q.defer();
            $http.post('/groupechats/create', {nomGroupe: val})
            .success(function(data, status) {
                deferred.resolve(data);
            }).error(function(data, status){
                deferred.reject("Echec d'enregistrement");
            });
            return deferred.promise;
        },
        putGroupe : function(){
            return true;
        },
        deleteGroupe : function(groupe){
            var deferred = $q.defer();
            $http.delete('/groupechats/'+groupe)
                .success(function(data, status) {
                    deferred.resolve(data);
                }).error(function(data, status){
                deferred.reject("Echec de connexion");
            })
            return deferred.promise;
        },

        getMembreGroupe: function(groupeid) {
            var deferred = $q.defer();
            $http.get('/groupechats/getgroupeid/'+groupeid)
                .success(function(data, status) {
                    var membres = [];
                    angular.forEach(data.data, function(part, key) {
                        part.userid.acces = part.acces;
                        membres.push(part.userid);
                    })
                    deferred.resolve(membres);
                }).error(function(data, status){
                deferred.reject("Echec de connexion");
            })
            return deferred.promise;
        },

        //retourme mes groupes puis arrange le resultat
        /*getGroupe : function() {
            var deferred = $q.defer();
            $http.get('/groupechats/getGroupe')
                .success(function(data, status) {
                    var groupes = []; var existe = -1;
                    angular.forEach(data.data, function(value) {
                        existe = -1;
                        angular.forEach(groupes, function (grp, i) {
                            if (grp._id == value.groupeid._id)
                                existe = i;
                        });
                        if (existe == -1) {
                            if(value.userid._id == $('#userid').val()){
                                groupes.push({ _id: value.groupeid._id, nom: value.groupeid.nom, createur: value.groupeid.createur, acces: value.acces, id: $('#userid').val(),
                                    membres: [{ _id: value.userid._id, nom: value.userid.nom, prenom: value.userid.prenom, acces: value.acces }]
                                    , nombre : 1});
                            }
                            else
                                groupes.push({ _id: value.groupeid._id, nom: value.groupeid.nom, createur: value.groupeid.createur, id: $('#userid').val(),
                                membres: [{ _id: value.userid._id, nom: value.userid.nom, prenom: value.userid.prenom, acces: value.acces }]
                                    , nombre : 1});
                        } else {
                            if(value.userid._id == $('#userid').val()) {
                                groupes[existe].acces = value.acces;
                                groupes[existe].membres.push({_id: value.userid._id, nom: value.userid.nom, prenom: value.userid.prenom,
                                    acces: value.acces });
                            }
                            else {
                                groupes[existe].membres.push({_id: value.userid._id, nom: value.userid.nom, prenom: value.userid.prenom,
                                    acces: value.acces });
                            }
                            groupes[existe].nombre += 1 ;
                        }
                    });
                    factory.mesgroupes = groupes;
                    deferred.resolve(factory.mesgroupes);
                }).error(function(data, status){
                    deferred.reject("Echec de connexion");
                });
            return deferred.promise;
        },
        */
        getAdherant: function(groupeid) {
            var deferred = $q.defer();
            $http.get('/groupechats/listeNonMembre/'+groupeid)
                .success(function(data, status) {
                    deferred.resolve(data);
                }).error(function(data, status){
                deferred.reject("Echec d'enregistrement");
            })
            return deferred.promise;
        },
        addMembre : function(data) {
            var deferred = $q.defer();
            $http.post('/groupechats/ajouterMembre', data)
                .success(function(data, status) {
                    deferred.resolve(data);
                }).error(function(data, status){
                deferred.reject("Echec d'enregistrement");
            })
            return deferred.promise;
        },
        updateGroupe: function(data) {
            var deferred = $q.defer();
            $http.put('/groupechats', data)
                .success(function(data, status) {
                    deferred.resolve(data);
                }).error(function(data, status){
                deferred.reject("Echec de mise à jour");
            })
            return deferred.promise;
        },
        sortirGroupe: function(groupeid,userid) {
            var deferred = $q.defer();
            $http.get('/groupechats/sortir/'+groupeid+'/'+userid)
                .success(function(data, status) {
                    deferred.resolve(data);
                }).error(function(data, status){
                deferred.reject("Echec de mise à jour");
            })
            return deferred.promise;
        }
    };
    return factory;
}]);
