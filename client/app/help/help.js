'use strict';

angular.module('spaceDevicesApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/help', {
        templateUrl: 'app/help/help.html',
        controller: 'HelpCtrl'
      });
  });
