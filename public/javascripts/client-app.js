var app = angular.module('GarageDoor', ['btford.socket-io']);

app.factory('doorSocket', function(socketFactory) {
  return socketFactory();
});

app.controller("GarageCtrl", function($scope, doorSocket, $http) {
  $scope.doorState = "unknown";

  $scope.statusIcon = function() {
    switch($scope.doorState) {
      case 'open':
        return "fa-warning";
      case 'closed':
        return "fa-check";
    }
    return "fa-question";
  };

  // When the door state changes, the server will send us an update
  doorSocket.on('change', function(newDoorState) {
    $scope.doorState = newDoorState;
  });

  // Ask the server for the current door status
  $http.get('/status').then(function(res) {
    $scope.doorState = res.data;
  });
});
