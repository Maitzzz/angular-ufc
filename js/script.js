// create the module and name it scotchApp
var ufcApp = angular.module('ufcApp', ['ngRoute', 'ngAnimate','ngWebsocket']);
var status1 = false;
var timerData = '';
var loadingStatus = true;
var my_data = 'test';
var gameStatus = 'draw';
// configure our routes
ufcApp.config(function ($routeProvider) {
  $routeProvider

    // route for the home page
    .when('/game', {
      templateUrl: 'pages/game.html',
      controller: 'gameController'
    })

    .when('/draw', {
      templateUrl: 'pages/draw.html',
      controller: 'drawController'
    })

    .when('/players', {
      templateUrl: 'pages/players.html',
      controller: 'playersController'
    })

    .when('/rules', {
      templateUrl: 'pages/rules.html',
      controller: 'rulesController'
    })

    .otherwise({redirectTo: '/players'})

});

ufcApp.controller('rulesController', function ($scope) {
  $scope.rules = 'Rules!!';
});

ufcApp.controller('playersController', function (appData, $location, $scope, $http) {
  var controller = 'players';
  if (appData.getStatus() != controller) {
    $location.path(appData.getStatus());
    return;
  }

  $scope.$watch(function () {
    return appData.getStatus();
  }, function (status, oldValue) {
    if (status != controller) {
      $location.path(status)
    }
  });

  getPlayers();

  $scope.addPlayer = function (uid) {
    //localStorage.clear();
    var inGame = JSON.parse(localStorage.getItem('playersIn'));

    if (inGame != null) {

      var index = $.inArray(parseInt(uid), inGame);

      if (index != -1) {
        inGame.splice(index, 1)
      } else {
        inGame.push(parseFloat(uid));
      }

      localStorage.setItem('playersIn', JSON.stringify(inGame));

    } else {
      var inGame = [parseFloat(uid)];
      localStorage.setItem('playersIn', JSON.stringify(inGame));
    }
    getPlayers();
  };

  function getPlayers() {
    console.log('getPlayers');
    $http.defaults.headers.common['Authorization'] = 'Basic ' + 'YWRtaW46YWRtaW4=';
    $http({
      method: 'GET',
      url: 'http://ufc8.mait.fenomen.ee/ufc_players'
      //url: 'http://angular-node.mait.fenomen.ee/players.json'

    }).success(function (data, status) {
      var array = JSON.parse(localStorage.getItem('playersIn'));
      for (var key in data) {
        if ($.inArray(parseInt(key), array) != -1) {
          data[key]['in'] = 'player-in';
        }
      }
      $scope.players = data;
    }).error(function () {
      console.error('Error plaryr datas')
    });
  }

  $scope.postPlayers = function () {
    var data = localStorage.getItem('playersIn');
    var dataArray = JSON.parse(localStorage.getItem('playersIn'))
    if (Array.isArray(dataArray) && dataArray.length > 3) {
      console.log(1);
      $http({
        method: 'POST',
        data: data,
        url: 'http://ufc8.mait.fenomen.ee/ufc_start_game'
      }).success(function (data, status) {
        localStorage.clear();
      }).error(function () {
        console.error('POST error')
      });
    } else {
    }
  };

  $scope.clear = function () {
    localStorage.removeItem('playersIn');
    getPlayers();
  };

});

ufcApp.controller('drawController', function (appData, $location, $scope) {
  var controller = 'draw';
  $scope.timerLoader = false;

  var data = appData.getStatus();

  var time = appData.getTimer();
  console.log(time + 'time');

  $scope.$watch(function () {
    return appData.getTimer();;
  }, function (newValue, oldValue) {
     $scope.timeData = newValue;

    if(newValue == 'end') {
      $scope.timerLoader = true;
    }
   if(newValue == 'false')  {
      $scope.timeData = '';
    }
  });

  if (data != controller) {
    $location.path(data);
    return;
  }

  $scope.$watch(function () {
    return appData.getStatus();
  }, function (status, oldValue) {
    if (status != controller) {
      $location.path(status)
    }
  });


});

ufcApp.controller('mainController', function (appData, $location, $scope) {
  var loadstate = appData.getLoading();
  $scope.$watch('loadstate',
    function (newValue, oldValue) {
      $scope.loading = newValue;
    });

  $scope.$watch(function () {
    return appData.getStatus();
  }, function (newValue, oldValue) {
    if (newValue.type == 1) {
      $scope.loading = true;
      $scope.message = newValue;
    }
  });

  $scope.clickLoad = function () {
    console.log(timerData);
    $scope.loading = !$scope.loading;
  }
});

ufcApp.controller('gameController', function ($scope, $location, appData) {
  appData.setLoading(true)
  var controller = 'game';

  if (appData.getStatus() != controller) {
    $location.path(appData.getStatus());
    return;
  }
  appData.setLoading(false);
  $scope.$watch(function () {
    return appData.getStatus();
  }, function (status, oldValue) {
    if (status != controller) {
      $location.path(status)
    }
  });

  $scope.$watch(function () {
    return appData.getData();
  }, function (newValue, oldValue) {
    console.log(newValue)
    if (newValue.status == controller) {
      $scope.teams = newValue.teams;
    }
  });
});

ufcApp.factory('appData', function () {

  return {
    setStatus: function (data) {
      gameStatus = data;
    },
    getStatus: function () {
      return gameStatus;
    },
    setData: function (data) {
      my_data = data;
    },
    getData: function () {
      return my_data;
    },
    setLoading: function(data)  {
      loadingStatus = data;
    },
    getLoading: function() {
      return loadingStatus;
    },
    setTimer: function (time) {
      timerData = time;
    },
    getTimer: function() {
      return timerData;
    },
    setUsersData: function(data) {

    },
    getUsersData: function() {

    }
  };
});

ufcApp.run(function ($rootScope, $websocket, appData, $rootScope) {
  var ws = $websocket.$new('ws://192.168.1.67:8080')
    .$on('$open', function () {
      console.log('Connected');
      ws.$emit('getStatus');
    })

    .$on('pong', function (data) {
      console.log('The websocket server has sent the following data:');
      console.log(data);
      console.log('Oh my gosh, websocket is really open! Fukken awesome!');

      ws.$close();
    })

    .$on('$message', function (message) {
      var message = message;
      if (message.type == 1) {
        status1 = message.status;
        appData.setStatus(status1);
        $rootScope.$apply();
      }

      if (message.type == 2) {
        appData.setData(message.data);
      }

      if(message.type == 3) {
        appData.setTimer(message.time);
        $rootScope.$apply();

      }
    })

    .$on('$close', function () {
      console.log('Noooooooooou, I want to have more fun with ngWebsocket, damn it!');
    });
});

function getStatus() {
  return 'game';
}


