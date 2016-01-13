/**
 * Created by biQuan on 16-1-12.
 */
define(['jquery','app'],function($,testApp){
    var name = 'Liswift';
    testApp.directive('myfooter',function($timeout,dateFilter){
        var now = dateFilter(new Date(),'yyyy');
        return {
            restrict:'E',
            template:'<footer class="footer"><p>Written by '+name+' at '+now+'.</p></footer>',
            replace:true
        }
    });

    testApp.directive('myfooter1',function($timeout,dateFilter){
        var now = dateFilter(new Date(),'yyyy');
        return {
            restrict:'E',
            template:'<footer class="footer"><p>hahaahahahhaha</p></footer>',
            replace:true
        }
    });
});