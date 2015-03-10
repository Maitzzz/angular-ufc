// create the module and name it scotchApp
var ufcApp = angular.module('ufcApp', ['ngRoute', 'ngAnimate','ngWebsocket']);
var status1 = false;
var timerData = '';
var loadingStatus = true;
var my_data = 'my_data';
var gameStatus = 'draw';
var userData = {};
// configure our routes
ufcApp.config(function ($routeProvider) {
  $routeProvider

    .when('/game', {
      templateUrl: 'pages/game.html',
      controller: 'gameController'
    })

    .when('/leaderboard', {
      templateUrl: 'pages/leaderboard.html',
      controller: 'leaderboardController'
    })

    .when('/draw', {
      templateUrl: 'pages/draw.html',
      controller: 'drawController'
    })

    .when('/players', {
      templateUrl: 'pages/players.html',
      controller: 'playersController'
    })

    .when('/user/:id', {
      templateUrl: 'pages/user.html',
      controller: 'userController'
    })

    .when('/rules', {
      templateUrl: 'pages/rules.html',
      controller: 'rulesController'
    })

    .otherwise({redirectTo: '/players'})

});
// todo add players list separate from leaderboardd
ufcApp.controller('rulesController', function ($scope) {
  $scope.rules = 'Rules!!';
});

ufcApp.controller('leaderboardController', function ($scope, appData) {
  $scope.$watch(function () {
    return appData.getData();
  }, function (data, oldValue) {
    if(data.leaderboard ) {
      $scope.leaderboard = data.leaderboard;
    }
  });

});

ufcApp.controller('userController', function ($scope, appData, $routeParams) {
  var userID = $routeParams.id;

  $scope.$watch(function () {
    return appData.getData();
  }, function (data, oldValue) {
    if(data.userData) {
        $scope.userdata = data.userData[userID];
    }
  });
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
    var dataArray = JSON.parse(localStorage.getItem('playersIn'));
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
    if(newValue) {
      if (newValue.type == 1) {
        $scope.loading = true;
        $scope.message = newValue;
      }
    }
  });

  $scope.clickLoad = function () {
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
    if (newValue.status == controller) {
      $scope.teams = newValue.gameData.teams;
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
      userData = data;
    },
    getUsersData: function() {
      return userData;
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
        appData.setData(message);
        $rootScope.$apply();

      }

      if(message.type == 3) {
        appData.setTimer(message.time);
        $rootScope.$apply();
      }

      if(message.type == 4) {
        appData.setUsersData(message.data);
      }
    })

    .$on('$close', function () {
      console.log('Noooooooooou, I want to have more fun with ngWebsocket, damn it!');
    });
});

function getStatus() {
  return 'game';
}
