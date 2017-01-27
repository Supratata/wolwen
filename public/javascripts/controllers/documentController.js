mainApp.controller('documentCtrl', function($scope){
    $scope.addDocumentVisible = false;
    $scope.doc = {bibliotheque: 'Ashdown'};

    $scope.afficherAddocument = function() {
        $scope.addDocumentVisible =! $scope.addDocumentVisible;
    }
});