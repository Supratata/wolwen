mainApp.controller('groupeChatCtrl', function($scope, groupeChatFactory){
    $scope.afficherAdherant = false;
    $scope.affiche;
    $scope.nomNouveauGroupe = "";
    $scope.adherants = null;
    $scope.newNomGroupe = {};
    $scope.myacces = $('#useracces').val();

    groupeChatFactory.getGroupe().then(function(groupes){
        $scope.mesgroupes = groupes;
    }, function(err){ alert(err) });

    groupeChatFactory.getGroupes().then(function(groupes) {
        $scope.lesgroupes = groupes.data;
    }, function(msg){ alert(msg); });


    $scope.creerGroupe = function() {
        groupeChatFactory.creerGroupe($scope.nomNouveauGroupe).then(function(data){
            $scope.creergroupevisible = !$scope.creergroupevisible;
            groupeChatFactory.getGroupe().then(function(groupes){
                $scope.mesgroupes = groupes;
            }, function(err){ alert(err) });
            groupeChatFactory.getGroupes().then(function(groupes) {
                $scope.lesgroupes = groupes.data;
            }, function(msg){ alert(msg); });
            $scope.nomNouveauGroupe = "";
        }, function(msg){ alert(msg); });
    };

    $scope.formulaireAjouterMembre = function(groupeid) {
        if($scope.afficherAdherant) {
            $scope.afficherAdherant = false;
        } else  {
            $scope.afficherAdherant = true;
            $scope.affiche = groupeid;
            $scope.adherants = groupeChatFactory.getAdherant(groupeid).then(function(data){
                $scope.adherants = data.data;
            }, function(err){ alert(err); });
        }
    };

    $scope.affichermodifierGroupe = function(groupe, id) {
        $scope.newNomGroupe.nom = groupe;
        $scope.newNomGroupe.id = id;
        ancienNom = groupe;
        $scope.titreModifier = groupe;
    };

    $scope.deleteGroupe = function(groupe) {
        groupeChatFactory.deleteGroupe(groupe).then(function(data){
            alert(JSON.stringify(data));
            $scope.mesgroupes = groupeChatFactory.getGroupe().then(function(groupes){
                $scope.mesgroupes = groupes;
            }, function(err){ alert(err) });
            $scope.lesgroupes = groupeChatFactory.getGroupes().then(function(groupes) {
                $scope.lesgroupes = groupes.data;
            }, function(msg){ alert(msg); });
        }, function(err){ alert(err); });
    };

    $scope.ajouterMembre = function(groupeid, userid, acces) {
        groupeChatFactory.addMembre({userid: userid, groupeid: groupeid, acces: acces}).then(function(data){
            //alert(JSON.stringify(data));
            $scope.mesgroupes = groupeChatFactory.getGroupe().then(function(groupes){
                $scope.mesgroupes = groupes;
            }, function(err){ alert(err) });
            $scope.afficherAdherant = false;
        }, function(err){ alert(err); })
    };

    $scope.modifierGroupe = function(id) {
        if(ancienNom != $scope.newNomGroupe.nom) {
            groupeChatFactory.updateGroupe({groupeid: $scope.newNomGroupe.id, nomGroupe: $scope.newNomGroupe.nom}).then(function(data) {
                alert(JSON.stringify(data));
                $scope.newNomGroupe = {};
                ancienNom = "";
                $scope.mesgroupes = groupeChatFactory.getGroupe().then(function(groupes){
                    $scope.mesgroupes = groupes;
                }, function(err){ alert(err) });
                $scope.lesgroupes = groupeChatFactory.getGroupes().then(function(groupes) {
                    $scope.lesgroupes = groupes.data;
                }, function(msg){ alert(msg); });
            }, function(err) { alert(err); });
        }
    };

    $scope.sortirMembre = function(groupeid,userid) {
        groupeChatFactory.sortirGroupe(groupeid,userid).then(function(data){
            alert(JSON.stringify(data));
            $scope.mesgroupes = groupeChatFactory.getGroupe().then(function(groupes){
                $scope.mesgroupes = groupes;
            }, function(err){ alert(err) });
        }, function(err){ alert(err); });
        $scope.afficherAdherant = false;
    };
});