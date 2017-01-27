mainApp.controller('utilisateurCtrl', ['$scope', 'utilisateurFactory', function($scope, utilisateurFactory){
	$scope.creerUserVisible = false;
    $scope.editUserVisible = false;
    $scope.newUser = {actif: "activé", acces: 1};
    $scope.editedUser = {};
    $scope.visibleCreerDep = false;


    utilisateurFactory.getDepartement().then(function(deps){
        //alert(JSON.stringify(deps));
        $scope.departements = deps.data;
    }, function(err){alert(err);});

    utilisateurFactory.getUtilsateurs().then(function(users){
		$scope.users = users;
	}, function(msg) {  });

    $scope.ajouterUtilisateur = function() {
        utilisateurFactory.creerUtilisateur($scope.newUser).then(function (data) {
            $scope.users = data;
        }, function (err) { alert(err); });
        $scope.creerUserVisible = !$scope.creerUserVisible;
        $scope.newUser = {actif: "activé", acces: 1};
    };

    $scope.afficherFormulaireCreerUser = function() {
        $scope.creerUserVisible = !$scope.creerUserVisible;
    };

    $scope.editUserFormVisible = function(id) {
        $scope.editUserVisible = !$scope.editUserVisible;
        $scope.editedUser = angular.copy(utilisateurFactory.getUtilsateur(id));
    };

    $scope.editUser = function() {
        $scope.editedUser.departement = $scope.editedUser.dep;
        delete $scope.editedUser.dep;
        console.log("$scope.editedUser", $scope.editedUser);
        utilisateurFactory.updateUtilisateur($scope.editedUser).then(function(data){
            utilisateurFactory.getUtilsateurs().then(function(users){
                $scope.users = users;
            }, function(msg) { alert(msg);  });
            retour(data.result, "Opération réussie");
        }, function(err){ alert(err); });
        $scope.editUserVisible = !$scope.editUserVisible;
    };

    $scope.deleteUser = function(id) {
        utilisateurFactory.deleteUtilisateur(id).then(function(data){
            $scope.users = data;
            retour(data.result, "Opération réussie");
        }, function(err){alert(err);});
        var index = 0;
    };

    $scope.afficheCreerDep =function() {
        $scope.visibleCreerDep = !$scope.visibleCreerDep;
    };

    $scope.creerDep = function() {
        utilisateurFactory.creerDepartement($scope.newDep).then(function(data){
            $scope.departements.push(data.data);
            $scope.visibleCreerDep = !$scope.visibleCreerDep;
        }, function(err){alert(err)});
    };

    $scope.deleteDep = function(id) {
        utilisateurFactory.deleteDepartement(id).then(function(data){
            angular.forEach($scope.departements, function(dep, key) {
                if(dep._id == id) {
                    $scope.departements[key].actif = "désactivé";
                }
            })
        }, function(err){alert(err)});
    }
}]);
