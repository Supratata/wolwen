var mainApp = angular.module('App', ['ui.router', 'ngFileUpload','ngImgCrop', 'ngEmoticons','angular-growl',
    'jkuri.datepicker', 'jkuri.timepicker', 'ngCookies', 'flow', 'angularTreeview', 'ngAudio']);

mainApp.directive("repeatEnd", function(){
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            if (scope.$last) {
                scope.$eval(attrs.repeatEnd);
            }
        }
    };
});

mainApp.config(['growlProvider', function(growlProvider) {
    growlProvider.globalTimeToLive({success: 3000, error: 3000, warning: 3000, info: 4000});
}]);

mainApp.config(['$httpProvider', function($httpProvider) {
    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
        $httpProvider.defaults.headers;
    }

    // Answer edited to include suggestions from comments
    // because previous version of code introduced browser-related errors

    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
}]);


mainApp.config(['flowFactoryProvider', function (flowFactoryProvider) {
    flowFactoryProvider.defaults = {
        target: '/savefolder',
        permanentErrors: [404, 500, 501],
        maxChunkRetries: 10,
        chunkRetryInterval: 5000,
        simultaneousUploads: 5
    };
    flowFactoryProvider.on('catchAll', function (event) {
        //console.log('catchAll', arguments);
    });
}]);

mainApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider' ,function($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/chat');
    $stateProvider
        .state('chat', {
            url: '/chat',
            templateUrl: "/chat",
            controller: 'chatCtrl'
        })
        .state('projets', {
            url: '/projets',
            templateUrl: "projets",
            controller: 'projetsCtrl'
        })
        .state('projets.projet',{
            url: '/projet/:projetid',
            templateUrl: function ($stateParams){
                return "projet/"+$stateParams.projetid;
            },
            controller: 'projetCtrl'
        })
        .state('utilisateurs', {
            url: '/utilisateurs/index',
            templateUrl: "utilisateurs/index",
            controller: 'utilisateurCtrl'
        })
        .state('groupechats',{
            url: '/groupechats',
            templateUrl: "groupechats",
            controller: 'groupeChatCtrl'
        });
   // $locationProvider.html5Mode(true);
}]);


var socket = io.connect('http://127.0.0.1:3000/');

diffTime = function(init, end){
    var diffDays =  Math.ceil((new Date(init).getTime() - new Date(end).getTime()) / (1000 * 3600 * 24));
    return diffDays;
};

mainApp.directive('dhxGantt', function() {
    return {
        restrict: 'A',
        scope: false,
        transclude: true,
        template: '<div ng-transclude></div>',

        link:function ($scope, $element, $attrs, $controller){
            //watch data collection, reload on changes
            $scope.$watch($attrs.data, function(collection){
                gantt.clearAll();
                if(collection)
                    gantt.parse(collection, "json");
            }, true);

            //size of gantt
            $scope.$watch(function() {
                return $element[0].offsetWidth + "." + $element[0].offsetHeight;
            }, function() {
                gantt.setSizes();
            });

            //init gantt
            gantt.init($element[0]);
        }
    };
});

function templateHelper($element){
    var template = $element[0].innerHTML;
    return template.replace(/[\r\n]/g,"").replace(/"/g, "\\\"").replace(/\{\{task\.([^\}]+)\}\}/g, function(match, prop){
        if (prop.indexOf("|") != -1){
            var parts = prop.split("|");
            return "\"+gantt.aFilter('"+(parts[1]).trim()+"')(task."+(parts[0]).trim()+")+\"";
        }
        return '"+task.'+prop+'+"';
    });
}

mainApp.directive('ganttTemplate', ['$filter', function($filter){
    gantt.aFilter = $filter;

    return {
        restrict: 'AE',
        terminal:true,

        link:function($scope, $element, $attrs, $controller){
            var template =  Function('sd','ed','task', 'return "'+templateHelper($element)+'"');
            gantt.templates[$attrs.ganttTemplate] = template;
        }
    };
}]);

mainApp.directive('ganttColumn', ['$filter', function($filter){
    gantt.aFilter = $filter;

    return {
        restrict: 'AE',
        terminal:true,

        link:function($scope, $element, $attrs, $controller){
            var label  = $attrs.label || " ";
            var width  = $attrs.width || "*";
            var align  = $attrs.align || "left";

            var template =  Function('task', 'return "'+templateHelper($element)+'"');
            var config = { template:template, label:label, width:width, align:align };

            if (!gantt.config.columnsSet)
                gantt.config.columnsSet = gantt.config.columns = [];

            if (!gantt.config.columns.length)
                config.tree = true;
            gantt.config.columns.push(config);

        }
    };
}]);