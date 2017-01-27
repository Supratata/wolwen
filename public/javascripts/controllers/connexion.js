/**
 * Created by ARISTIDE MARIE on 02/09/2016.
 */

var mainApp = angular.module('App', [ 'ngCookies' ]);

mainApp.controller('MainCtrl', ['$scope', '$http', '$q', '$timeout', '$cookies',
    function($scope, $http, $q, $timeout, $cookies) {
    $scope.photo = '/images/inconnu.png';
    $scope.state = false;
    $scope.place = 'Compte utilisateur.';
    $scope.niveau = false;
    var count = 0;
    $scope.connexion = function() {
        $http.post('/connexion', {state: $scope.niveau, input:$scope.input, nom:$scope.nom})
            .success(function(data, status) {
                if(data.state){
                    $scope.niveau = true;
                    $scope.photo = data.photo;
                    $scope.input = '';
                    $scope.place = 'Mot de passe.';
                    $scope.nom = data.nom;
                    $scope.prenom = data.prenom;
                } else {
                    if(data.valide){
                        $cookies.deuxiemeEtage = true;
                        $cookies.remember = $scope.remember;
                        $cookies.token = data.token;
                        window.location.reload();
                    } else {
                        $scope.state = true;
                        $scope.input = '';
                        $timeout( function(){ $scope.state = false; }, 5000);
                        count++;
                    }
                }
                if(count == 5) {
                    $scope.niveau = false;
                    $scope.photo = '/images/inconnu.png';
                    $scope.input = '';
                    $scope.place = 'Compte utilisateur.';
                    $scope.nom = '';
                    count = 0;
                }

            }).error(function(data, status){});
    };

    if($cookies.token) {
        window.location.reload();
    }
}]);