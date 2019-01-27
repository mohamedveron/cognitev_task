(function(angular) {
  'use strict';
var app = angular.module('cognitevApp', []);
app.controller('tableCtrl', function MainCtrl($http, $window) {

  var ctrl = this;

  ctrl.genders = ['male', 'female', 'other'];
  ctrl.gender = "";
  ctrl.fName = "";
  ctrl.lName = "";
  ctrl.phone = "";
  ctrl.code = "";
  ctrl.bDate = "";
  ctrl.email = "";
  ctrl.phone2 = "";
  ctrl.password = "";
  ctrl.token = "";

  ctrl.onSubmitForm = () => {

     ctrl.file = document.getElementById('file').files[0];

    var data = {
      "fName": ctrl.fName,
      "lName": ctrl.lName,
      "phone": ctrl.phone,
      "code": ctrl.code,
      "gender": ctrl.gender,
      "date": ctrl.bDate,
      "email": ctrl.email,
      "file": ctrl.file
    };

    $http({
      url: "/addUser",
      method: "POST",
      data: data
    }).then(function successCallback(response) {
              // this callback will be called asynchronously
              // when the response is available
              ctrl.data = response.data;

          }, function errorCallback(response) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
              this.error = response.statusText;
        });
  }

  ctrl.generateToken = () => {
    var data = {
      "phone": ctrl.phone2,
      "password": ctrl.password
    };

    $http({
      url: "/generateToken",
      method: "POST",
      data: data
    }).then(function successCallback(response) {
              // this callback will be called asynchronously
              // when the response is available
              ctrl.token = response.data.token;

          }, function errorCallback(response) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
              this.error = response.statusText;
        });
  }

});

})(window.angular);