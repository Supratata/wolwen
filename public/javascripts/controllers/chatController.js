/**
 * Created by ARISTIDE MARIE on 06/09/2016.
 */

mainApp.controller("chatCtrl", ['$scope', '$timeout', '$filter', 'chatFactory','mainFactory', '$rootScope','Upload', '$cookies','$interval',
    function($scope, $timeout, $filter, chatFactory,mainFactory, $rootScope,Upload, $cookies,$interval) {
    $scope.message = chatFactory.getMess();
    $scope.smile_visible = false;
       //$scope.tabSelected = 0;
    //$scope.addstr

    $scope.sendMess = function() {
        if(chatFactory.getIndex() != -1)
            chatFactory.setMess($('#message_input').html().replace("&nbsp;", ""));
        $('#message_input').html("");
    };

    $scope.dialogOpen = function(index) {
        openDialog(index);
        chatFactory.setIndex(index);
        $rootScope.lesMessagesChats = mainFactory.getDialogOpen(index-1).historique;
    };

    $scope.smilieSelected = function(text) {
        var temp = $('#message_input').html().replace("&nbsp;", "");
        $('#message_input').html( $filter('emoticons')(temp +":"+text+":") + " &nbsp;")
        $scope.smile_visible = false;
    };

    $scope.afficherSmile = function() {
        $scope.smile_visible = !$scope.smile_visible;
    };

    $("#message_input").keypress(function (event) {
        if (event.which == 13) {
            event.preventDefault();
            //alert('You pressed enter!');
            $scope.sendMess();
            $scope.envoyerMessageDialog();
            $('#message_input').html("");
        }
        moi = JSON.parse($cookies.user);
        socket.emit("ilecrit", {expediteur: mainFactory.getDialogOpen(chatFactory.getIndex()-1).recepteur._id,
            moi: {nom: moi.nom, prenom: moi.prenom, _id:moi._id } });
    });

    $scope.clickSendMess = function() {
        $scope.sendMess();
        $scope.envoyerMessageDialog();
        $('#message_input').html("");
    };
    $scope.envoyerMessageDialog = function() {
        var message = {recepteur: mainFactory.getDialogOpen(chatFactory.getIndex()-1).recepteur._id,
            expediteur: {_id: $('#userid').val(), photo : $('#userphoto').val()},
            message: chatFactory.getMess()};
        if(mainFactory.getDialogOpen(chatFactory.getIndex()-1).recepteur.nom == "GROUPE") {
            socket.emit('message groupe', message);
        }else {
            socket.emit('message', message);
        }
        message.dateEnvoi = new Date();
        mainFactory.getDialogOpen(chatFactory.getIndex()-1).recepteur.newMessage = false;
        $rootScope.$apply(function(){
            mainFactory.getDialogOpen(chatFactory.getIndex()-1).historique.push(message);
        });
        chatFactory.setMess(chatFactory.getIndex(),"");
    };

    $scope.getFocus = function() {

    };

    $scope.sendFile = function(file, type) {
        var ext = file.name.split('.'); ext = ext[ext.length-1];
        var preview = "";
        if(type == "doc") {
            if(!(ext == 'pdf' || ext == 'docx' || ext == 'xlsx' || ext == 'doc' || ext == 'odt' ||
                ext == 'xml' || ext == 'xlsx' || ext == 'sql' || ext == 'pptx')) {
                alert("Ce fichier n'est pris en charge");
                //toastr["info"]("I was launched via jQuery!")
                return;
            }
        }else if(type == "audio") {
            if(!(ext == 'mp3' || ext == 'wav' || ext == 'wma' || ext == 'aac' || est == 'ogg')) {
                alert("Ce fichier n'est pas un fichier audio");
                return;
            }
        } else if(type == 'video'){
            if(!(ext == 'flv' || ext == 'mp4' || ext == 'avi' || ext == '3gp' || ext == 'mov')) {
                alert("Ce fichier n'est pas un fichier vidéo");
                return;
            }
        }else{
            if(!(ext == 'png' || ext == 'jpg' || ext == 'bmp' || ext == 'gif' || ext == 'jpeg' || ext == 'tiff')) {
                alert("Ce fichier n'est pas un fichier image");
                return;
            }
        }

        Upload.upload({ url: '/chats/file', data: {fichier: file, type:type} })
            .then(function (data) {
                var message = {recepteur: mainFactory.getDialogOpen(chatFactory.getIndex()-1).recepteur._id,  expediteur: {_id:$scope.myId, photo : $('#userphoto').val()},
                    fichier: {type: type, preview:  data.data.preview} , message: data.data.data};
                if(mainFactory.getDialogOpen(chatFactory.getIndex()-1).recepteur.nom == "GROUPE") {
                    socket.emit('message groupe', message);
                }else {
                    socket.emit('message', message);
                }
                mainFactory.getDialogOpen(chatFactory.getIndex()-1).recepteur.newMessage = false;
                mainFactory.getDialogOpen(chatFactory.getIndex()-1).historique.push(message);
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
                //var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                //console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            });
    };

    $scope.closeDialog = function (index) {
        $('.tab-' + index).css('display', 'none');
        mainFactory.openHist.push(mainFactory.getDialogOpen(index - 1));
        mainFactory.setDialogOpen(index - 1, null);
        var count = 0,  lastOpen;
        angular.forEach(mainFactory.dialogOpen, function(dial, key) {
            if (dial == null)
                count++;
            else
                lastOpen = key;
        });
        if (count == 5) {
            $('.tab-dialog').css('display', 'none');
            $('.tdiscussion').css('display', 'none');
        } else {
            $('.tab-'+chatFactory.getIndex()).removeClass('mytabactive');
            $('.tab-'+(lastOpen+1)).addClass('mytabactive');
            chatFactory.setIndex(lastOpen+1);
            $rootScope.lesMessagesChats = mainFactory.getDialogOpen(lastOpen).historique;
        }
    };
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        var timer = $interval(function() {
            if(mainFactory.connectes.length != 0) {
                $scope.dialogZone(0);
                $interval.cancel(timer);
            }
        }, 2000, false);
    });

    $scope.onEnd = function(){
        $timeout(function() {
            var scroller = document.getElementById("teste_juste");
            if(scroller)
                scroller.scrollTop = scroller.scrollHeight;
        }, 0, false);
    };


    $scope.dialogZone = function(position) {
        if(position == 5) return;

        var recept = mainFactory.generateConnectionOpen(mainFactory.dialogOpenHist[position]);
        if(recept == null) {
            $scope.dialogZone(++position);
            return;
        }
        recept.newMessage = false;

        var existe = -1;
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

                    $scope.dialogZone(++position);
                    $scope.onEnd();
                }, function (err) { alert(err); });
            }else{
                chatFactory.getMessage({recepteur: recept._id, expediteur: $scope.myId}).then(function(data){
                    mainFactory.getDialogOpen(chatFactory.getIndex()-1).historique = data.data;
                    $rootScope.lesMessagesChats = data.data;
                    openDialog(chatFactory.getIndex());
                    $scope['titre_'+chatFactory.getIndex()] = recept.nom +" "+recept.prenom;

                    $scope.dialogZone(++position);
                    $scope.onEnd();
                }, function(err){ alert(err); });
            }
        }else {
            $rootScope.lesMessagesChats = mainFactory.getDialogOpen(existe).historique;
            openDialog(existe+1);
            if(recept.nom == "GROUPE") {
                $scope['titre_'+(existe+1)] = recept.prenom;
            }else {
                $scope['titre_'+(existe+1)] = recept.nom +" "+recept.prenom;
            }
            chatFactory.setIndex(existe+1);
            $scope.dialogZone(++position);
            $scope.onEnd();
        }
    };

    socket.on("ilecrit", function(data){
        var index = 0;
        angular.forEach(mainFactory.dialogOpen, function(dial, key) {
            if(dial && dial.recepteur._id == data._id) {
                index = dial.index+1;
            }
        });

        if(index != 0) {
            $scope.$apply(function () {
                $scope["ecrit"+index] = true;
            });
            $timeout(function() {
                $scope.$apply(function () {
                    $scope["ecrit"+index] = false;
                });
            }, 5000, false);
        }
    });

}]);