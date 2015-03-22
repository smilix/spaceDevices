'use strict';

angular.module('spaceDevicesApp').controller('MainCtrl', function ($scope, $http, $q, $timeout) {

  $scope.ajax = true;
  $scope.errorMsg = false;
  $scope.macData = {};
  $scope.form = {
    name: ''
  };

  function handleRequest(promise, errorText) {
    $scope.ajax = true;
    $scope.errorMsg = false;
    return $q.all([
      promise,
      $timeout(angular.noop, 1000)
    ]).then(
      function ok(data) {
        console.log('ok');
        $scope.ajax = false;
        return data;
      },
      function error(err) {
        console.log(err);
        $scope.ajax = false;
        $scope.errorMsg = errorText;
        return err;
      });
  }

  $scope.saveName = function () {
    var data = {
      name: $scope.form.name
    };
    handleRequest($http.put('/api/macs', data),
      'Fehler beim Speichern :(').then(
      function ok() {
        $scope.macData.name = $scope.form.name;
      });
  };

  $scope.deleteName = function () {
    handleRequest($http.delete('/api/macs'),
      'Fehler beim Löschen :(').then(
      function ok() {
        $scope.form.name = '';
        $scope.macData.name = null;
      }
    );
  };

  // load
  $http.get('/api/macs').then(
    function ok(result) {
      $scope.ajax = false;
      $scope.macData = result.data;
      $scope.form.name = result.data.name;
    }, function error(err) {
      console.log(err);
      $scope.ajax = false;
      $scope.errorMsg = 'Konnte nichts laden :(';
    });


});
