/**
 * Created by biQuan on 15-5-14.
 */
define(function(require,exports,module){

    var anim = (function(window,document){
        var animate = function(options){
            var defaults = {
                trigger:null,
                useTransform:false
            };
            for(var key in options){
                defaults[key] = options[key];
            }
            this.attrs = defaults;
            this.useTransform = defaults.useTransform,
            this.trigger = typeof defaults.trigger === "string" ? document.querySelector(defaults.trigger) : defaults.trigger;
            this.init();
        };

        var easing = {
            bounce:function(x){
                return -5*(Math.pow(x-0.6,2))+1.8;
            },
            linear:function(x){
                return x;
            },
            quickIn:function(x){
                return Math.pow(x,1/3);
            }
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

            move:function(endX,endY,duration,easeFn){

                var self = this;
                var rAF = self.rAF;
                var div = self.trigger;
                easeFn || (easeFn = "quickIn");
                var startX = parseFloat(window.getComputedStyle(div,null).left) || 0,
                    startY = parseFloat(window.getComputedStyle(div,null).top) || 0,
                    startTime = new Date().getTime(),
                    endTime = startTime + duration;

                self.isMoving = true;
                function step(){
                    if(!self.isMoving){
                        return ;
                    }
                    var currentTime = new Date().getTime();
                    var percent = (currentTime - startTime)/duration;
                    if(currentTime>endTime){
                        div.style.left = endX +"px";
                        div.style.top = endY+"px";
                        return;
                    }
                    var ease = easing[easeFn](percent);
                    var currentX = (endX - startX)*ease+startX,
                        currentY = (endY - startY)*ease+startY;

                    div.style.left = currentX +"px";
                    div.style.top = currentY+"px";


                    rAF(step);
                }
                step();
            },

            stop:function(){
                this.isMoving = false;
            }
        }

        return animate;
    })(window,document);

    module.exports = anim;
});