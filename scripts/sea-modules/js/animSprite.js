/**
 * Created by biQuan on 15-6-9.
 */
define(function(require,exports,module){

    var tranSprite = (function(window,document){
        var animate = function(options){
            var defaults = {
                trigger:null, //滚动元素
                useTransform:false,//使用css3的transform
                scrollDirect:"x",//水平滚动，“y”垂直滚动
                duration:1000,//动画时间
                easing:"ease"//动画类型
            };
            for(var key in options){
                defaults[key] = options[key];
            }
            this.attrs = defaults;
//            this.useTransform = defaults.useTransform;
            this.fx = {
                u:defaults.useTransform,
                s:defaults.scrollDirect,
                d:defaults.duration,
                e:defaults.easing
            };
            this.trigger = typeof defaults.trigger === "string" ? document.querySelector(defaults.trigger) : defaults.trigger;
            this.init();
        };
        animate.prototype = {
            init:function(){
                this.rAF = window.requestAnimationFrame	||
                    window.webkitRequestAnimationFrame	||
                    window.mozRequestAnimationFrame		||
                    window.oRequestAnimationFrame		||
                    window.msRequestAnimationFrame		||
                    function (callback) { window.setTimeout(callback, 1000 / 60); };

                this.isMoving = false ;
            },
            stop:function(){
                this.isMoving = false;
            },
            isStopped:function(){
                return !this.isMoving;
            },
            setPosition:function(left,top){
                this.trigger.style.left = left + "px";
                this.trigger.style.top = top + "px";
                return this;
            },
            addClass:function(dom,cls){
                var clsName = dom.className,
                    reg = new RegExp("^\\s*"+cls+"\\s+|"+"\\s+"+cls+"\\s+"+"|"+"\\s+"+cls+"\\s*$"+"|^"+cls+"$");
                if(reg.test(clsName)){
                    return this;
                }
                dom.className = clsName+" "+cls;
                return this;
            },
            removeClass:function(dom,cls){
                var clsName = dom.className,
                    reg = new RegExp("^\\s*"+cls+"\\s+|"+"\\s+"+cls+"\\s+"+"|"+"\\s+"+cls+"\\s*$"+"|^"+cls+"$","g");

                dom.className = clsName.replace(reg," ");
                return this;
            },
            get:function(attr){
                return this.attrs[attr]||"";
            },
            set:function(attr,value){
                this.attrs[attr] = value;
                return this;
            }
        };



        var easing = {
            bounce:function(x){
                var resX = 1,
                    resY = -5*(Math.pow(x-0.6,2))+1.8;
                return [resX,resY];
            },
            linear:function(x){
                var resX = 1,
                    resY = x;
                return [resX,resY];
            },
            quickIn:function(x){
                var resX = 1,
                    resY = Math.pow(x,1/3);
                return [resX,resY];
            }
        };

        return animate;
    })(window,document);

    module.exports = tranSprite;
});