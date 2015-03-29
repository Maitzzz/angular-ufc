var key = '671a495dadaa411bba961df0543ec18a';
var tag = 'eesti';

var drupalUrl = 'ufc8.mait.fenomen.ee';
var nodeUrl = 'http://localhost:8081';
ufcApp.service('appService', function($http) {
  this.getInstagram = function() {
    console.log('https://api.instagram.com/v1/tags/' + tag + '/media/recent?client_id=' + key);
    return ($http.get('http://localhost:8081/status'));
    //  return ($http.jsonp('https://api.instagram.com/v1/tags/'+ tag +'/media/recent?client_id=' + key))
  };

  this.postPlayers = function (players) {
    console.log(players)
    return ($http.post(drupalUrl + '/', players));
  };

  this.addUser = function (player) {
    console.log('adduserservice')
    console.log(player)
    return ($http.post(nodeUrl + '/add-user', player));
  };

  this.iAmIn = function(user) {
    return($http.post(nodeUrl+ '/participating', user))
  };

  this.removeUser = function (user) {
    return($http.post(nodeUrl + '/remove-user' ,user))
  };

  this.register = function (user) {
    return($http.post(nodeUrl + '/validate-user' ,user))
  };

  this.startTimer = function () {
    return($http.get(nodeUrl + '/timer'))
  }
});
