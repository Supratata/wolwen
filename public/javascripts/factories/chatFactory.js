
mainApp.factory('chatFactory', ['$http','$q' ,function ($http, $q) {
    var factory = {
        message: "",
        historique: [],
        file: null,
        indexSet: -1,
        setIndex: function(index) {
          factory.indexSet = index;
        },
        getIndex: function() {
            return factory.indexSet;
        },
        getMess: function() {
            return factory['message'];
        },
        setMess: function(data) {
            factory.message = data;
        },
        getMessage: function(data) {
            var deferred = $q.defer();
            $http.post('/chats/messagesuser', data)
                .success(function(data, status){
                    deferred.resolve(data)
                }).error(function(data, status){
                    deferred.reject('Echec de recupération des messages');
            });
            return deferred.promise;
        },
        getMessageGroupe: function(data) {
            var deferred = $q.defer();
            $http.get('/chats/messagesgroupes/'+data)
                .success(function(data, status){
                    deferred.resolve(data)
                }).error(function(data, status){
                deferred.reject('Echec de recupération des messages');
            });
            return deferred.promise;
        }
    };
    return factory;
}]);


