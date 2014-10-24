var app = angular.module('GarageDoor', []);

app.controller("GarageCtrl", function($scope) {
  $scope.doorImage = "images/unknown.png";
  $scope.doorState = "unknown";
});
