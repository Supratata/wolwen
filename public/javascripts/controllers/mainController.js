
mainApp.controller("AppController", ['$scope', 'chatFactory', 'Upload', '$cookies' ,'groupeChatFactory', 'profilFactory','mainFactory',
	'$rootScope', '$state','growl', 'ngAudio', 
	function($scope, chatFactory, Upload, $cookies ,groupeChatFactory, profilFactory, mainFactory, $rootScope,$state,growl, ngAudio) {
	$scope.connectes = mainFactory.connectes;
	$scope.affiche_choix = "connecte";
	$scope.myId = $('#userid').val();
	mainFactory.myId = $scope.myId;
	mainFactory.initOpenHist();
	$scope.connecte_compte = true;
	$scope.affiche_connecte_compte = false;
	$scope.newMessage = 'rien';
	$scope.moi = {nom : $('#usernom').val(),_id: $('#userid').val(),prenom: $('#userprenom').val(), acces: $('#useracces').val(),
		photo: $('#userphoto').val(), mdp: "", confirmemdp:"", departement: $('#userdep').val(), actif: "activé", email:$('#useremail').val()} ;
	$cookies.user = JSON.stringify($scope.moi);
	$scope.nom_prenom = $scope.moi.nom + "  "+ $scope.moi.prenom;
	$scope.sound = ngAudio.load("sound/message.mp3");
	$scope.sound.volume = 0.5;


	socket.emit("nouveau_client", $scope.moi);
	//connexion d'un nouveau client
	socket.on("nouveau_client", function(data){
		$scope.$apply(function () {
			$scope.connectes = mainFactory.ajoutNouveauConnecte(data);
		});
		var config = angular.copy(vm.message);
		delete config.title;
		delete config.type;
		//growl.general(vm.message.title, config, vm.message.type);
		growl.info('Un nouveau message.', {title: 'Info!'});
	});
	var vm = this;
	vm.message = {type: 'success', ttl: -1};
	vm.showMessage = " js sjds sdnjd ";

	//affichage des participants
	socket.on('connectes', function(data){
		$scope.$apply(function () {
			$scope.connectes = mainFactory.getConnectes(data);
		});
	});
	socket.on('non connectes', function(data){
		$scope.$apply(function () {
			$scope.connectes = mainFactory.getNonConnectes(data);
		});
	});

	socket.on('connectes groupes', function(data) {
		$scope.$apply(function () {
			$scope.connectes = mainFactory.getGroupeConnectes(data);
		});
	});

	socket.on('ajoute a un groupe', function(data) {
		$scope.$apply(function () {
			$scope.connectes = mainFactory.ajoutNouveauGroupe(data);
		});
	});

	socket.on('sortir groupe',function(data) {
		$scope.$apply(function () {
			$scope.connectes = mainFactory.sortirGroupe(data);
		});
	});

	// Quand on reçoit un message, on l'insère dans la page
	socket.on('message', function(data) {
		var current = false;
		angular.forEach($scope.connectes, function(connecte, key){
			if(connecte._id == data.expediteur._id) {
				current = true;
				angular.forEach(mainFactory.dialogOpen, function(dialog, k){
					if(dialog && dialog.recepteur._id == data.expediteur._id) {
						//alert(JSON.stringify(data));
						$rootScope.$apply(function () {
							mainFactory.getDialogOpen(dialog.index).historique.push(data);
						});
						return;
					}
				});
				$scope.$apply(function () { connecte.newMessage = true; $scope.newMessage = 'contact'; $scope.sound.play();});
				return;
			}
		});
		if(!current)
			mainFactory.nouveauMessage(data);
	});
	socket.on('message de groupe', function(data){
		var current = false;
		angular.forEach($scope.connectes, function(connecte){
			if(connecte._id == data.recepteur) {
				current = true;
				angular.forEach(mainFactory.dialogOpen, function(dialog, k){
					if(dialog && dialog.recepteur._id == data.recepteur) {
						$rootScope.$apply(function () {
							mainFactory.getDialogOpen(dialog.index).historique.push(data);
						});
						return;
					}
				});
				$scope.$apply(function () { connecte.newMessage = true; $scope.newMessage = 'groupe'; });
				return;
			}
		});
		if(!current)
			mainFactory.nouveauMessageGroupe(data);
	});

	//déconnexion d'un client
	socket.on('deconnexion_client', function(data) {
		$scope.$apply(function () {
			var r = mainFactory.deconnexion(data);
			if($scope.connectes[r])
				$scope.connectes[r].connecte = false;
		});
	});

	$scope.dialogZone = function(recept) {
		recept.newMessage = false;
		var existe = -1, hist=false;
		angular.forEach(mainFactory.openHist, function(dial, key) {
			if(dial.recepteur._id == recept._id) {
				chatFactory.setIndex(-1);
				for(var i=0; i<5; i++) {
					if(!mainFactory.dialogOpen[i]) {
						mainFactory.setDialogOpen(i,dial);
						chatFactory.setIndex(i+1);
						break;
					}
				}
				if(chatFactory.getIndex() == -1) {
					chatFactory.setIndex(1);
					mainFactory.setDialogOpen(0,dial);
				}
				$rootScope.lesMessagesChats = dial.historique;
				openDialog(chatFactory.getIndex());
				hist = true;
				mainFactory.openHist.splice(key,1);
				return;
			}
		});
		if(hist){return;}
		angular.forEach(mainFactory.dialogOpen, function(dial, key) {
			if(dial && dial.recepteur._id == recept._id) {
				existe = key;
				return;
			}
		});
		if(existe == -1) {
			chatFactory.setIndex(-1);
			for(var i=0; i<5; i++) {
				if(!mainFactory.dialogOpen[i]) {
					mainFactory.setDialogOpen(i,{recepteur: recept, index: i});
					chatFactory.setIndex(i+1);
					break;
				}
			}
			if(chatFactory.getIndex() == -1) {
				chatFactory.setIndex(1);
				mainFactory.setDialogOpen(0,{recepteur: recept, index: 0});
			}
			if(recept.nom == "GROUPE") {
				chatFactory.getMessageGroupe(recept._id).then(function (data) {
					mainFactory.getDialogOpen(chatFactory.getIndex()-1).historique = data.data;
					$rootScope.lesMessagesChats = data.data;
					openDialog(chatFactory.getIndex());
					$scope['titre_'+chatFactory.getIndex()] = recept.prenom;
				}, function (err) { alert(err); });
			}else{
				chatFactory.getMessage({recepteur: recept._id, expediteur: $scope.myId}).then(function(data){
					mainFactory.getDialogOpen(chatFactory.getIndex()-1).historique = data.data;
					$rootScope.lesMessagesChats = data.data;
					openDialog(chatFactory.getIndex());
					$scope['titre_'+chatFactory.getIndex()] = recept.nom +" "+recept.prenom;
				}, function(err){ alert(err); });
			}
		}else {
			$rootScope.lesMessagesChats = mainFactory.getDialogOpen(existe).historique;
			openDialog(existe+1);
			$scope.newMessage = 'rien';
		}
	};

	$scope.projet_chat = function() {
		if($cookies.deuxiemeEtage == 'false') {
			$scope.affiche_connecte_compte = false;
			$scope.connecte_compte = false;
			$('.active_mess').removeClass('my-active');
		}
	};

	$scope.deuxiemeEtage = $cookies.deuxiemeEtage;
	$scope.projet_chat();

	$scope.menu_pum = 2;
	$scope.sectionActive = function(index) {
		if(index == 1) {
			$scope.affiche_connecte_compte = false;
			$scope.connecte_compte = false;
			$scope.deuxiemeEtage = false;
			$cookies.deuxiemeEtage = false;
			$cookies.level = 1;
			$scope.menu_pum=1;
			$state.go('projets');
		}else if(index == 2){
			$scope.connecte_compte = true;
			$scope.deuxiemeEtage = true;
			$cookies.deuxiemeEtage = true;
			$cookies.level = 2;
			$scope.menu_pum=2;
			$state.go('chat');
		} else if(index == 3){
			$cookies.level = 3;
			$scope.menu_pum=3;
			$state.go('utilisateurs');
		}
	};
	$scope.sectionActive(parseInt($cookies.level));

	$scope.changeActive = function(index) {
		switch (index) {
			case 1:
				$scope.affiche_choix = "connecte";
				$('.active_groupe').removeClass('chat-active');
				$('.active_user').addClass('chat-active');
				$('.active_dep').removeClass('chat-active');
				if($scope.newMessage == "contact") {
					$scope.newMessage = 'rien';
				}
				break;
			case 2:
				$('.active_user').removeClass('chat-active');
				$('.active_dep').removeClass('chat-active');
				$('.active_groupe').addClass('chat-active');
				$scope.affiche_choix = "groupe";
				if($scope.newMessage == "groupe") {
					$scope.newMessage = 'rien';
				}
				break;
			case 3:
				$scope.affiche_choix = "dep";
				$('.active_groupe').removeClass('chat-active');
				$('.active_user').removeClass('chat-active');
				$('.active_dep').addClass('chat-active');
				if($scope.newMessage == "dep") {
					$scope.newMessage = 'rien';
				}
		}
	};

	/*
	 * Gestiion du profil
	 */
	$scope.myImage='';
	$scope.myCroppedImage='';
	$scope.afficheEditImage = false;
	$scope.choix_connecte = true;

	$scope.affiche_profile = function() {
		$scope.affiche_connecte_compte = !$scope.affiche_connecte_compte;
		$scope.connecte_compte = false;
		$scope.choix_connecte = false;
		if(!$scope.affiche_connecte_compte) {
			$scope.afficheEditImage = false;
			$scope.connecte_compte = true;
			$scope.choix_connecte = true;
		}
		$scope.myImage=null;
		$scope.myCroppedImage=null;
	};

	$scope.$watch('photo', function(){
		if($scope.photo) {
			$scope.afficheEditImage = true;
			var file = $scope.photo;
			var reader = new FileReader();
			reader.onload = function (evt) {
				$scope.$apply(function(){
					$scope.myImage = evt.target.result;
				});
			};
			reader.readAsDataURL(file);
		}
	});

	$scope.deconnexion = function() {
		delete $cookies.token;
		delete $cookies.user;
		delete $cookies;
		delete $cookies.projet;
		delete $cookies.deuxiemeEtage;
	};

	$scope.update = function() {
		temp = angular.copy($scope.moi);

		delete temp.photo;
		if(temp.mdp == "") {
			delete temp.mdp;
			delete temp.confirmemdp;
		}
		if(temp.nom == $('#usernom').val())
			delete temp.nom;
		if(temp.prenom == $('#userprenom').val())
			delete temp.prenom;
		if(temp.actif == "activé")
			delete temp.actif;
		var send = null;
		if($scope.myImage)
			send = $scope.myCroppedImage;
		profilFactory.updateProfil(send, temp).then(function(data){
			$scope.moi = data.data;
			$scope.nom_prenom = $scope.moi.nom + "  "+ $scope.moi.prenom;
			$('#usernom').val(data.data.nom);
			$('#userprenom').val(data.data.prenom);
			$('#userphoto').val(data.data.photo);
			$cookies.user = JSON.stringify($scope.moi);
			growl.success('This is a success mesage.',{title: 'Success!'});

			$scope.afficheEditImage = false;
			$scope.myImage=null;
			$scope.myCroppedImage=null;
		}, function(err){
			growl.error('This is a error mesage.',{title: 'Error!'});
		});
	};

	/*
	* GEstion des groupes de chats
	* */

	$scope.visibleCreerGroupe = false;
	$scope.addMembre = null;
	$scope.editeGroupe = null;
	$scope.membres = [];
	var groupeOpen= null;
	var editeGroupeOpen = null;

	$scope.visibleGroupe = function(){
		$scope.afficheGestionGroupe = false;
		$scope.affiche_connecte_compte = false;
		$scope.affiche_choix = "groupe";

		$('.active_user').removeClass('my-active');
		$('.active_groupe').addClass('my-active');
	};

	$scope.afficheCreerGroupe = function() {
		$scope.visibleCreerGroupe = !$scope.visibleCreerGroupe;
		$scope.addMembre = null;
		$scope.editeGroupe = null;
	}

	$scope.creerGroupe = function() {
		groupeChatFactory.creerGroupe($scope.nomNouveauGroupe).then(function(data){
			$scope.connectes.push({_id: data.data.groupe._id, connecte: true, newMessage: false, nom: "GROUPE",
				prenom: data.data.groupe.nom, photo: "images/groupe.png", acces: data.data.part.acces, nombre: 1, createur: $scope.myId});
				$('.addgroupe button span').removeClass('fa-close');
				$('.addgroupe button span').addClass('fa-plus');
			$scope.visibleCreerGroupe = !$scope.visibleCreerGroupe;
			$scope.nomNouveauGroupe = "";
		}, function(msg){ alert(msg); });
	};

	$scope.formulaireAjouterMembre = function(groupe) {
		$scope.addMembre = groupe._id;
		$scope.editeGroupe = null;
		$scope.deuxiemeEtage = false;
		groupeOpen = groupe;
		groupeChatFactory.getAdherant(groupeOpen._id).then(function(data){
			//alert(JSON.stringify(data.data));
			$scope.adherants = data.data;
		}, function(err){ alert(err); });
	};

	$scope.ajouterMembre = function(userid, acces) {
		groupeChatFactory.addMembre({userid: userid, groupeid: groupeOpen._id, acces: acces}).then(function(data){
			//alert(JSON.stringify(data));
			$scope.addMembre = null;
			groupeOpen.nombre += 1;
			socket.emit('membre ajoute', {_id: groupeOpen._id, connecte: true, newMessage: false, nom: "GROUPE",
				prenom:  groupeOpen.prenom, photo: "images/groupe.png", acces: acces, nombre: groupeOpen.nombre, createur: groupeOpen.createur, go: userid});
		}, function(err){ alert(err); })
	};

	$scope.closeAddMembre = function() {
		$scope.addMembre = null;
		$scope.deuxiemeEtage = true;
	};

	$scope.afficheEditeGroupe = function(groupe) {
		$scope.editeGroupe = groupe._id;
		$scope.addMembre = null;
		editeGroupeOpen = groupe;
		groupeChatFactory.getMembreGroupe(groupe._id).then(function(data) {
			//alert(JSON.stringify(data));
			$scope.membres = data;
			groupe.nombre = $scope.membres.length;
		}, function(err) {alert(err)})
	};


	$scope.closeGestionGroupe = function() {
		$scope.editeGroupe = null;
		$scope.deuxiemeEtage = true;
	};

	$scope.sortirMembre = function(groupeid,userid) {
		groupeChatFactory.sortirGroupe(groupeid,userid).then(function(data){
			//alert(JSON.stringify(data));
			editeGroupeOpen.nombre -=1 ;
			socket.emit('sortir groupe', {userid: userid, groupeid: groupeid});
			$scope.editeGroupe = null;
		}, function(err){ alert(err); });
		$scope.afficherAdherant = false;
	};

	$scope.fermerGroupe = function(connecte) {
		$scope.groupetoclose = connecte;
	};

	$scope.supprimerGroupe = function() {
		angular.forEach($scope.membres, function(mem) {
			socket.emit('sortir groupe', {userid: mem._id, groupeid: $scope.groupetoclose._id});
		});
		$scope.connectes.splice($scope.connectes.indexOf($scope.groupetoclose),1);
	};
	//$scope.smilies = ' :bowtie: :smile: :laughing: :blush: :smiley: :relaxed: :smirk: :heart_eyes: :kissing_heart:
	// :kissing_closed_eyes: :flushed: :relieved: :satisfied: :grin: :wink: :stuck_out_tongue_winking_eye: :stuck_out_tongue_closed_eyes:
	// :grinning: :kissing: :winky_face: :kissing_smiling_eyes: :stuck_out_tongue: :sleeping: :worried: :frowning: :anguished: :open_mouth:
	// :grimacing: :confused: :hushed: :expressionless: :unamused: :sweat_smile: :sweat: :wow: :disappointed_relieved: :weary: :pensive:
	// :disappointed: :confounded: :fearful: :cold_sweat: :persevere: :cry: :sob: :joy: :astonished: :scream: :neckbeard: :tired_face: :angry:
	// :rage: :triumph: :sleepy: :yum: :mask: :sunglasses: :dizzy_face: :imp: :smiling_imp: :neutral_face: :no_mouth: :innocent: :alien: :yellow_heart:
	// :blue_heart: :purple_heart: :heart: :green_heart: :broken_heart: ';
}]);

function openDialog(index) {
	$('.tab-dialog').css('display', 'block');
	$('.tdiscussion').css('display', 'block');
	$('.tab-'+index).css('display', 'block');

	$('.tab-1').removeClass('mytabactive');
	$('.tab-2').removeClass('mytabactive');
	$('.tab-3').removeClass('mytabactive');
	$('.tab-4').removeClass('mytabactive');
	$('.tab-5').removeClass('mytabactive');

	$('.tab-'+index).addClass('mytabactive');
	$('#message_input').focus();
};

function retour(state, message) {
	if(state == true){
	 	$('.retour').css('background-color', 'green');
	}else {
	 	$('.retour').css('background-color', 'red');
	}
	$('.retour').text(message);
	$(".retour").slideDown("slow");
	setTimeout(function(){
	 	$('.retour').css('display', 'none');
	}, 3000);
}

