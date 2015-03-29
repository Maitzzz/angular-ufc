// create the module and name it scotchApp
var ufcApp = angular.module('ufcApp', ['ngRoute', 'ngAnimate','ngWebsocket']);
var nodeUrl = 'http://localhost:8081';
var status1 = false;
var timerData = '';
var loadingStatus = true;
var my_data = 'my_data';
var gameStatus = 'draw';
var userData = {};
var drupalUrl = 'drupalurl';
var apiUrl = 'http://localhost:8081';
var userIn;


ufcApp.config(function ($routeProvider) {
  $routeProvider

    .when('/game', {
      templateUrl: 'pages/game.html',
      controller: 'gameController'
    })

    .when('/test', {
      templateUrl: 'pages/test2.html',
      controller: 'testController'
    })

    .when('/leaderboard', {
      templateUrl: 'pages/leaderboard.html',
      controller: 'leaderboardController'
    })

    .when('/login', {
      templateUrl: 'pages/login.html',
      controller: 'loginController'
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
ufcApp.controller('rulesController', function ($scope,$location) {
  if(!loggedIn()) {
    $location.path('login');
  }

  $scope.rules = 'Rules!!';
});


// configure our routes
// todo add players list separate from leaderboardd

ufcApp.controller('loginController', function ($scope, $location, appData, $http, appService) {
  if(loggedIn()) {
    $location.path(appData.getStatus());
  }

  $scope.logIn = function(user) {
    $scope.loading = true;
    var promiseGet = appService.register(user);

    promiseGet.then(function (data) {
      $scope.loading = false;
      var userData = {
        uid: data,
        email: user.email
      };
      localStorage.setItem('user', JSON.stringify(userData));
      $location.path(appData.getStatus())

    }), function (error) {
      $log.error('login Error', error);
      $scope.message = 'Logimine ebaõnnestus';

    };
  }

});

ufcApp.controller('leaderboardController', function ($scope, appData) {
  if(!loggedIn()) {
    $location.path('login');
  }

  $scope.$watch(function () {
    return appData.getData();
  }, function (data, oldValue) {
    if(data.leaderboard ) {
      $scope.leaderboard = data.leaderboard;
    }
  });
});

ufcApp.controller('userController', function ($scope, appData, $routeParams) {
  if(!loggedIn) {
    $location.path('login');
  }
  var userID = $routeParams.id;

  $scope.$watch(function () {
    return appData.getData();
  }, function (data, oldValue) {
    if(data.userData) {
        $scope.userdata = data.userData[userID];
    }
  });
});

ufcApp.controller('playersController', function (appData, $location, $scope, $http,appService) {
  if(!loggedIn()) {
    $location.path('login');
  }

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
  $scope.startTimer = function () {
    console.log('startTimer()');
    var promiseGet = appService.startTimer();

    promiseGet.then(function (data) {
      $location.path(getStatus());
    }), function (error) {
      $log.error('starttimer', error);
    };
  };

  $scope.postPlayers = function () {
    var data = localStorage.getItem('playersIn');
    var dataArray = JSON.parse(localStorage.getItem('playersIn'));
    // If users are less than 3
    if (Array.isArray(dataArray) && dataArray.length > 3) {

      var promiseGet = appService.postPlayers(data);

      promiseGet.then(function (data) {

        //return from users post
      }), function (error) {
        $log.error('postPlayers()', error);
      };
    } else {
      // todo less than 3 message ?
    }
  };

  $scope.clear = function () {
    localStorage.removeItem('playersIn');
    getPlayers();
  };

});

ufcApp.controller('drawController', function (appData, $location, $scope, appService, $rootScope) {
  var controller = 'draw';
  if(!loggedIn()) {
    $location.path('login');
  }

  var user = localStorage.getItem('user');

  var promiseget = appService.iAmIn(user)

  promiseget.then(function (data) {
    if(data.data == 'true') {
      $scope.imin = false;
      $scope.imout = true;
    } else {
      $scope.imin = true;
      $scope.imout = false;
    }
  });

  $scope.timerLoader = false;
  var data = appData.getStatus();

  $scope.$watch(function () {
    return appData.getTimer();
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

  $scope.addPlayer = function() {
    var user = localStorage.getItem('user');
    var promiseGet = appService.addUser(user);

    promiseGet.then(function (data) {
      console.log('then');
    }), function(error) {
      $log.error('fail', error);
    };
  };

  $scope.removePlayer = function () {
    var user = localStorage.getItem('user');
    console.log('user ' + user + ' removed from list');

    var promiseGet = appService.removeUser(user);

    promiseGet.then(function() {

    }), function(error) {
      $log.error('removePlayer', error);
    };
   };
});

ufcApp.controller('mainController', function (appData, $location, $scope, $rootScope) {
  $scope.logout = true;
  $scope.login = false;
  if(!loggedIn()) {
    $location.path('login');
    $scope.login = true;
    $scope.logout = false;
  }

  $scope.user = JSON.parse(loggedIn()).email;
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
    localStorage.removeItem('user');
    $scope.loading = !$scope.loading;
  };

  $scope.logOut = function () {
    localStorage.removeItem('user');
    $rootScope.$apply()
  }
});

ufcApp.controller('gameController', function ($scope, $location, appData) {
  if(!loggedIn()) {
    $location.path('login');
  }

  appData.setLoading(true);
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

ufcApp.run(function ($rootScope, $websocket, appData) {
  var ws = $websocket.$new('ws://192.168.1.67:8080')
    .$on('$open', function () {
      console.log('Connected');
      ws.$emit('getData');
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
      console.log('Cannot connect to websocket');
    });
});

function getStatus() {
  return 'game';
}

function loggedIn() {
  var user = localStorage.getItem('user');

  if (user) {
    return user;
  }

  return false;
}

ufcApp.controller('testController', function($scope,appService ) {
  getData();
  function getData() {
    var promiseGet = appService.getInstagram();

    promiseGet.then(function(data) {
      console.log(data.data)
    });
  }
});
