/**
 * Created by ARISTIDE MARIE on 06/09/2016.
 */

mainApp.factory('mainFactory', ['$cookies' ,function ($cookies) {
    var factory = {
        myId:null,
        connectes:[],
        dialogOpen: [null,null,null,null, null],
        dialogOpenHist:[null,null,null,null, null],
        openHist:[],
        getDialogOpen: function(index){
            return factory.dialogOpen[index];
        },
        initOpenHist: function() {
            if($cookies.dialogOpenHist) {
                factory.dialogOpenHist = $cookies.dialogOpenHist.split(',');
            }
        },
        setDialogOpen:function(index,data){
            factory.dialogOpen[index] = data;
            if(data != null) {
                factory.dialogOpenHist[index] = data.recepteur._id;
            }else {
                factory.dialogOpenHist[index] = data;
            }
            $cookies.dialogOpenHist = factory.dialogOpenHist;
        },
        getConnectes: function(data) {
            factory.connectes = factory.connectes.concat(data);
            return factory.connectes;
        },
        generateConnectionOpen: function(oph) {
            var retour = null;
            angular.forEach(factory.connectes, function(con, k){
                if(con._id == oph) {
                    retour = con;
                }
            });
            return retour;
        },
        getNonConnectes: function(data) {
            angular.forEach(data,function(c,k) {
                c.connecte = false;
                c.newMessage = false;
            });
            factory.connectes = factory.connectes.concat(data);
            return factory.connectes;
        },
        getGroupeConnectes: function(data) {
            var temp = [];
            angular.forEach(data, function(grp) {
                temp.push({_id: grp.groupeid._id, connecte: true, newMessage: false, nom: "GROUPE", prenom: grp.groupeid.nom,
                    photo: "images/groupe.png", acces: grp.acces, nombre: grp.groupeid.nombre, createur: grp.groupeid.createur})
            });
            //console.log(temp);
            factory.connectes = factory.connectes.concat(temp);
            return  factory.connectes;
        },
        ajoutNouveauConnecte: function(data){
            var existe = false;
            if(data._id != factory.myId) {
                angular.forEach(factory.connectes, function(connecte, key){
                    if(connecte._id == data._id) {
                        existe = true;
                        connecte.connecte = true;
                        return;
                    }
                });
                if(!existe) {
                    factory.connectes.push(data);
                }
            }
            return factory.connectes;
        },
        ajoutNouveauGroupe: function(data) {
            delete data.go;
            factory.connectes.push(data);
            return factory.connectes;
        },
        sortirGroupe:function(data){
            angular.forEach(factory.connectes, function(connecte, key){
                //alert(JSON.stringify(connecte._id == data.groupe));
                if(connecte._id == data.groupe) {
                    factory.connectes.splice(key,1);
                    return;
                }
            });
            return factory.connectes;
        },
        nouveauMessage:function(data){
            angular.forEach(factory.openHist, function(dialog, k){
                if(dialog.recepteur._id == data.expediteur._id) {
                    dialog.historique.push(data);
                    return;
                }
            });
        },
        nouveauMessageGroupe:function(data) {
            angular.forEach(factory.openHist, function(dialog, k){
                if(dialog.recepteur._id == data.recepteur) {
                    dialog.historique.push(data);
                    return;
                }
            });
        },
        deconnexion:function(data) {
            var result = null;
            angular.forEach(factory.connectes, function(connecte, key){
                if(data.userid == connecte._id) {
                    connecte.connecte = false;
                    connecte.last = data.last;
                    result = key;
                }
            });
            return result;
        }
    };
    return factory;
}]);