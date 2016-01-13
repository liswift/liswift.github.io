/**
 * Created by biQuan on 16-1-12.
 */
/**
 * 入口文件
 */
require.config({
    baseUrl: "ng/",
    paths: {
        "jquery": "libs/jquery203",
        "angular" : "libs/angular.min",
        "angular-router" : "libs/angular-route.min",
        "app" : "js/controllers/app",
        "myfooter" : "js/directives/footer",
        "loginCtrl" : "js/controllers/loginCtrl",
        "route" : "js/routes/route"
    },
    shim: {
        angular:{
            exports:'angular'
        },
        'angular-router':{
            deps: ["angular"],
            exports: 'angular-router'
        }
    }
});


require(['jquery','angular','angular-router','app','myfooter',"loginCtrl",'route'],function ($,angular){
    $(function () {
        angular.bootstrap(document,["testApp"]);
    })

});