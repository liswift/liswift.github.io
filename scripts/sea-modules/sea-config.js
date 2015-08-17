/**
 * Created by biQuan on 15-4-30.
 */
!function(){var a=seajs.data;seajs.log=function(b,c){window.console&&(c||a.debug)&&console[c||(c="log")]&&console[c](b)},define("seajs/seajs-log/1.0.1/seajs-log",[],{})}();
!function(){var a,b=/\W/g,c=document,d=document.getElementsByTagName("head")[0]||document.documentElement;seajs.importStyle=function(e,f){if(!f||(f=f.replace(b,"-"),!c.getElementById(f))){var g;if(!a||f?(g=c.createElement("style"),f&&(g.id=f),d.appendChild(g)):g=a,g.styleSheet){if(c.getElementsByTagName("style").length>31)throw new Error("Exceed the maximal count of style tags in IE");g.styleSheet.cssText+=e}else g.appendChild(c.createTextNode(e));f||(a=g)}},define("seajs/seajs-style/1.0.2/seajs-style",[],{})}();
!function(){

    var mySeaJsAlias = {
        "$":'jquery/jquery/1.9.1/jquery-debug',
        "jquery":'jquery/jquery/1.9.1/jquery',
        "dialog":'arale/dialog/1.3.1/dialog',
        "animate":'js/animate-mlw',
        "picSlider":'js/picSlider',
        "tranSprite":'js/tranSprite',
        "picScroller":'js/picScroller',
        "zepto":'zepto/zepto'

    }

    var tempAlias = {};
    for (var alias in mySeaJsAlias){
        var debugAlias = alias+'-debug';
        tempAlias[debugAlias] = mySeaJsAlias[alias]+'-debug';
    }
    for (var alias in tempAlias){
        mySeaJsAlias[alias] = tempAlias[alias];
    }
    seajs.config({
        base: "../scripts/sea-modules",
        alias: mySeaJsAlias,
        debug:true
    });

}()