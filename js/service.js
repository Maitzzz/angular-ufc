var key = '671a495dadaa411bba961df0543ec18a';
var tag = 'eesti';

var drupalUrl = 'http://ufc8.mait.fenomen.ee';
var nodeUrl = 'http://localhost:8081';
ufcApp.service('appService', function ($http) {
  this.getInstagram = function () {
    return ($http.get('http://localhost:8081/status'));
    //  return ($http.jsonp('https://api.instagram.com/v1/tags/'+ tag +'/media/recent?client_id=' + key))
  };

  this.postPlayers = function (players) {
    return ($http.post(drupalUrl + '/', players));
  };

  this.addUser = function (player) {
    return ($http.post(nodeUrl + '/add-user', player));
  };

  this.iAmIn = function (user) {
    return ($http.post(nodeUrl + '/participating', user))
  };

  this.removeUser = function (user) {
    return ($http.post(nodeUrl + '/remove-user', user))
  };

  this.register = function (user) {
    return ($http.post(nodeUrl + '/validate-user', user))
  };

  this.startTimer = function () {
    return ($http.get(nodeUrl + '/timer'))
  };

  this.getPlayers = function () {
    /* $http.defaults.headers.common['Authorization'] = 'Basic ' + 'YWRtaW46YWRtaW4=';
     return($http.get(drupalUrl + '/ufc_players'))*/
    return ($http.get(nodeUrl + '/players-data'));
  };

  this.winningTeam = function (team) {
    return ($http.post(nodeUrl + '/result', {team: team}));
  };

  this.addGoal = function (id) {
    return ($http.post(nodeUrl + '/addgoal', {id: id}));
  };

  this.removeGame = function (gid) {
    console.log(gid);
    return ($http.post(nodeUrl + '/remove-game', {gid: gid}))
  };

});
