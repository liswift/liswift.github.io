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
        "router" : "libs/angular-ui-router.min",
        "app" : "js/controllers/app"
    },
    shim: {

    }
});


require(['jquery','angular'],function ($,angular){
    $(function () {
        angular.bootstrap(document,["testApp"]);
    })

});