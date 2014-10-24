var app = angular.module('GarageDoor', []);

app.controller("GarageCtrl", function($scope) {
  $scope.doorState = "unknown";
  $scope.doorState = "open";
  $scope.doorState = "closed";
  $scope.statusIcon = function() {
    switch($scope.doorState) {
      case 'open':
        return "fa-warning";
      case 'closed':
        return "fa-check";
    }
    return "fa-question";
  };
});
