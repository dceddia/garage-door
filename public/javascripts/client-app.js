var app = angular.module('GarageMonitor', ['btford.socket-io', 'ui.bootstrap']);

app.factory('doorSocket', function(socketFactory) {
  return socketFactory({
    ioSocket: io.connect('https://garage.dceddia.com', {secure: true})
  });
});

app.controller("LoginCtrl", function($scope, GarageDoor) {
  $scope.data = {};

  $scope.tryLogin = function(password) {
    $scope.errorMsg = "";

    GarageDoor.login(password).then(function(res) {
      console.log('login was successful', res);
      $scope.$close();
    }, function(res) {
      console.log('bad password', password, res);
      $scope.errorMsg = res.data.error;
    });
  };
});

app.service("LoginService", function($http) {
  var methods = {
    login: function(password) {
      return $http.post('/login', {password: password});
    }
  };

  return methods;
});

app.controller("GarageCtrl", function($scope, GarageDoor, $q, $modal) {
  $scope.doorState = "unknown";

  function promptForLogin() {
    var theModal = $modal.open({
      templateUrl: 'login',
      controller: 'LoginCtrl'
    });

    return theModal.result;
  }

  function validateLogin() {
    var deferred = $q.defer();

    var proceed = function() { console.log('login ok!'); deferred.resolve(); };
    var halt = function() { console.log('login invalid'); deferred.reject(); };

    // Check the login
    GarageDoor.checkLogin().then(proceed, function() {
      // We are not logged in yet. Show the login dialog.
      // If it succeeds, we're all set.
      promptForLogin().then(proceed, halt);
    });

    return deferred.promise;
  }

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
    var icons = {
      open    : 'fa fa-warning',
      opening : 'fa fa-long-arrow-up',
      closed  : 'glyphicon glyphicon-ok',
      closing : 'fa fa-long-arrow-down',
      stopped : 'fa fa-pause',
      unknown : 'fa fa-question'
    }

    return $scope.doorState + ' status-icon ' + icons[$scope.doorState];
  };

  $scope.buttonText = function() {
    var direction = $scope.withState($scope.doorState, "down", "up", "");
    if($scope.doorState === 'stopped') {
      direction = 'down';
    }

    var leftArrow = "<i class='glyphicon glyphicon-arrow-" + direction + " arrow arrow-left'></i>";
    var rightArrow = "<i class='glyphicon glyphicon-arrow-" + direction + " arrow arrow-right'></i>";

    var options = {
      open    : leftArrow + " CLOSE IT " + rightArrow,
      opening : " CANCEL ",
      closed  : leftArrow + " OPEN IT " + rightArrow,
      closing : " CANCEL ",
      stopped : leftArrow + " CLOSE IT " + rightArrow,
      unknown : leftArrow + " MYSTERY " + rightArrow
    };

    return options[$scope.doorState];
  };

  $scope.buttonClass = function() {
    return $scope.withState($scope.doorState, "btn-b", "btn-c", "btn-a");
  }

  $scope.changeDoorState = function() {
    validateLogin().then(function() {
      $scope.withState($scope.doorState, GarageDoor.close, GarageDoor.open, GarageDoor.trigger);
    });
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
    },

    checkLogin: function() {
      return $http.post('/check-login');
    },

    login: function(password) {
      return $http.post('/login', {password: password});
    }
  };

  return methods;
});

app.filter("sanitize", function($sce) {
  return function(htmlCode) {
    return $sce.trustAsHtml(htmlCode);
  };
});
