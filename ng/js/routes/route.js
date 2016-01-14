/**
 * Created by biQuan on 16-1-12.
 */
define(['app'],function(testApp){
    return testApp.config(['$routeProvider',function($routeProvider){
        $routeProvider.when('/',{
            templateUrl:'ng/tpls/loginTpl.html',
            controller:'LoginCtrl'
        }).when('/qins-1',{
            templateUrl:'ng/tpls/qins-1.html',
            controller:'QinsCtrl'
        }).otherwise({redirectTo:'/'})
    }])
});