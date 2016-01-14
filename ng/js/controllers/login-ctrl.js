/**
 * Created by biQuan on 16-1-12.
 */
define(['jquery','angular','app'],function($,angular,testApp){
    testApp.controller('LoginCtrl',['$scope',function($scope){
        $scope.user = {
            username:'',
            password:'',
            code:'',
            remember:false
        };
        $scope.submit = function(){

        }
        $scope.ifValid = function(name){
            if(!$scope[name]){

            }
        }
    }]);
});