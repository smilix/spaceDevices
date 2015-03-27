'use strict';

angular.module('spaceDevicesApp').controller('HelpCtrl', function ($scope, $location) {
  $scope.back = function () {
    $location.path('/');
  };
});
