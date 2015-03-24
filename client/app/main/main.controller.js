'use strict';

angular.module('spaceDevicesApp').controller('MainCtrl', function ($scope, $http, $q, $timeout) {

  $scope.ajax = true;
  $scope.errorMsg = false;
  $scope.mac = '';
  $scope.name = '';
  $scope.form = {
    name: '',
    visibility: 'show'
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
    handleRequest($http.put('/api/macs', $scope.form),
      'Fehler beim Speichern :(').then(
      function ok() {
        $scope.name = $scope.form.name;
      });
  };

  $scope.deleteName = function () {
    handleRequest($http.delete('/api/macs'),
      'Fehler beim Löschen :(').then(
      function ok() {
        $scope.form.name = '';
        $scope.form.visibility = 'show';
        $scope.name = '';
      }
    );
  };

  // load
  $http.get('/api/macs').then(
    function ok(result) {
      $scope.ajax = false;
      $scope.name = result.data.name;
      $scope.mac = result.data.mac;
      $scope.form.name = result.data.name;
      $scope.form.visibility = result.data.visibility;
    }, function error(err) {
      console.log(err);
      $scope.ajax = false;
      $scope.errorMsg = 'Konnte nichts laden :(';
    });


});
