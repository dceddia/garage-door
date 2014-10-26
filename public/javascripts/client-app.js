var app = angular.module('GarageMonitor', ['btford.socket-io']);

app.factory('doorSocket', function(socketFactory) {
  return socketFactory();
});

app.controller("GarageCtrl", function($scope, GarageDoor) {
  $scope.doorState = "unknown";

  $scope.withState = function(state, ifOpen, ifClosed, ifOther) {
    var choice = ifOther;
    switch(state) {
      case 'open':
        choice = ifOpen;
        break;
      case 'closed':
        choice = ifClosed;
        break;
    }

    // If it's a function, call it
    typeof choice === 'function' && choice();

    return choice;
  };

  $scope.statusIcon = function() {
    return $scope.withState($scope.doorState, "fa-warning", "fa-check", "fa-question");
  };

  $scope.buttonText = function() {
    return $scope.withState($scope.doorState, "Close It", "Open It", "Trigger It");
  };

  $scope.changeDoorState = function() {
    $scope.withState($scope.doorState, GarageDoor.close, GarageDoor.open, GarageDoor.trigger);
  };

  // When the door state changes, the server will send us an update
  GarageDoor.onStatusChange(function(newDoorState) {
    $scope.doorState = newDoorState;
  });

  // On initialization, ask the server for the current door status
  GarageDoor.getStatus().then(function(status) {
    $scope.doorState = status;
  });
});

app.service("GarageDoor", function($http, doorSocket) {
  function extractStatus(res) {
    return res.data;
  }

  var methods = {
    onStatusChange: function(callbackFn) {
      doorSocket.on('change', callbackFn);
    },

    getStatus: function() {
      return $http.get('/status').then(extractStatus);
    },

    open: function() {
      return $http.post('/status/change');
    },

    close: function() {
      return $http.post('/status/change');
    },

    trigger: function() {
      return $http.post('/status/change');
    }
  };

  return methods;
});