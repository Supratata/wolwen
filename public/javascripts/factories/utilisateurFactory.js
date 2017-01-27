mainApp.factory('utilisateurFactory', ['$http','$q',  function($http, $q){
	var factory =  {
		utilisateurs : [],
		getUtilsateurs : function() {
			var deferred = $q.defer();
			$http.get('/utilisateurs')
				.success(function(data, status) {
					factory.utilisateurs = data.data;
					deferred.resolve(factory.utilisateurs);
				})
				.error(function(data, status) {
					deferred.reject('Impossible de charger les utilisateurs');
				});

			return deferred.promise;
			//return factory.Utilisateurs;
		},
		creerUtilisateur : function(user) {
			var deferred = $q.defer();
			$http.post('/utilisateurs', {user: user})
				.success(function(data, status){
					factory.utilisateurs.push(data.data);
					deferred.resolve(factory.utilisateurs);
				})
				.error(function(data, status){
					deferred.reject('Echec de la mise à jour ');
				});
			return deferred.promise;
		},
		getUtilsateur : function(id) {
			var user = {};
			angular.forEach(factory.utilisateurs, function(value, key){
				if(value._id == id)
					user = value;
			}); 
			return user;
		},
		deleteUtilisateur : function(id) {
			var deferred = $q.defer();
			$http.delete('/utilisateurs/'+id)
				.success(function(data,status){
					angular.forEach(factory.utilisateurs, function(value, key){
						if(value._id == id)
							factory.utilisateurs[key].actif = "désactivé";
					});
					deferred.resolve(factory.utilisateurs);
				}).error(function(data, status){
				deferred.reject('Echec de suppression de l\'utilisateur');
			});
			return deferred.promise;
		},
		updateUtilisateur : function(user) {
			var deferred = $q.defer();
			$http.put('/utilisateurs', user)
				.success(function(data, status){
					deferred.resolve(data);
				})
				.error(function(data, status){
					deferred.reject('Echec de la mise à jour ');
				});
			return deferred.promise;
		},
		getDepartement: function() {
			var deferred = $q.defer();
			$http.get('/departements')
				.success(function(data,status){
					deferred.resolve(data);
				}).error(function(data, status){
				deferred.reject('Echec de lecture des départements');
			});
			return deferred.promise;
		},
		creerDepartement: function(departement) {
			var deferred = $q.defer();
			$http.post('/departement', {departement: departement})
				.success(function(data, status){
					//alert(JSON.stringify(data));
					deferred.resolve(data);
				})
				.error(function(data, status){
					deferred.reject('Echec de la création');
				});
			return deferred.promise;
		},
		deleteDepartement: function(id) {
			var deferred = $q.defer();
			$http.delete('/departement/'+id)
				.success(function(data,status){
					deferred.resolve(data);
				}).error(function(data, status){
				deferred.reject('Echec de lecture des départements');
			});
			return deferred.promise;
		}

	};
	return factory;
}]);

mainApp.factory('profilFactory', ['$http', '$q', 'Upload',  function($http, $q, Upload){
	var factory = {
		updateProfil: function(photo, user) {
			var deferred = $q.defer();
			var base64Data = false;
			if(photo)
				var base64Data = photo.replace(/^data:image\/png;base64,/, "");
			delete user.actif;
			delete user.acces;
			delete user.departement;
			$http.put('/profil', {photo: base64Data, user: user})
				.success(function(data, status){
					//alert(JSON.stringify(data));
					deferred.resolve(data)
				}).error(function(data, status){
				deferred.reject('Echec de recupération des messages');
			});
			return deferred.promise;
		}
	};
	return factory;
}]);