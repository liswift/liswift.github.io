/**
 * Created by biQuan on 15-5-14.
 */
define(function(require,exports,module){

    var anim = (function(window,document){
        var animate = function(options){
            var defaults = {
                trigger:null,
                itemFocusHeight:0,
                itemWrapHeight:0,
                selectorMode:true,  //selector模式
                scrollDirect:"x"//水平移动，“y”垂直移动
            };
            for(var key in options){
                defaults[key] = options[key];
            }
            this.attrs = defaults;
            this.trigger = typeof defaults.trigger === "string" ? document.querySelector(defaults.trigger) : defaults.trigger;

            this.item = [defaults.itemWrapHeight,defaults.itemFocusHeight];

            this.init();
        };

        var easing = {
            bounce:function(x){
                var resX = -5*(Math.pow(x-0.6,2))+1.8,
                    resY = resX;
                return [resX,resY];
            },
            linear:function(x){
                var resX = x,
                    resY = resX;
                return [resX,resY];
            },
            quickIn:function(x){
                var resX = Math.pow(x,1/3),
                    resY = resX;
                return [resX,resY];
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
                this.childCount = this.trigger.childElementCount;
                this.itemFocusIndex = 0;
                this.direct = this.get("scrollDirect");
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
                        if(self.get("selectorMode")){
                            self.itemFocus(self.direct=="y"?endY:endX);
                        }
                        self.isMoving = false;
                        return;
                    }
                    var ease = easing[easeFn](percent);
                    var currentX = (endX - startX)*ease[0]+startX,
                        currentY = (endY - startY)*ease[1]+startY;
                    div.style.left = currentX +"px";
                    div.style.top = currentY+"px";

//                    var endStr = "100% {left:"+currentX+"px;top:+"+currentY+"px}";
//                    window.keyFrames.deleteRule("100%");
//                    window.keyFrames.insertRule(endStr);

                    if(self.get("selectorMode")){
                        self.itemFocus(self.direct=="y"?currentY:currentX);
                    }

                    rAF(step);
                }
                step();
            },
            move2D:function (speedX,speedY,duration,easeFn){

                var self = this;
                var rAF = self.rAF;
                var div = self.trigger;
                easeFn || (easeFn = "quickIn");

                var startX = parseFloat(window.getComputedStyle(div,null).left) || 0,
                    startY = parseFloat(window.getComputedStyle(div,null).top) || 0,
                    startTime = new Date().getTime(),
                    endTime = startTime + duration;

                function step(){
                    var currentTime = new Date().getTime();
                    var percent = (currentTime - startTime)/duration;
                    if(currentTime>endTime){
                        return;
                    }
                    var ease = easeFn(percent);
                    var currentX = speedX*ease[0]+startX,
                        currentY = speedY*ease[1]+startY;
                    div.style.left = currentX +"px";
                    div.style.top = currentY+"px";

                    rAF(step);
                }
                step();
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
            itemFocus:function(currentY){
                var self = this;
                var num = -1;
                if(currentY >= self.item[1]/2 || currentY < -self.item[0] + self.item[1]){
                    num = -1;
                }

                else{
                    var delta = currentY%self.item[1];
                    if(delta != 0){
                        if(Math.abs(delta) >= self.item[1]/2){
                            currentY = currentY - delta - self.item[1];
                        }
                        else{
                            currentY = currentY - delta;
                        }
                    }
                    num = Math.abs(parseInt(currentY/self.item[1]));
                }

                var i = 0;
                for(;i<self.childCount;i++){
                    self.removeClass(self.trigger.children[i],"focus");
                }

                if(num == -1){
                    return ;
                }
                self.addClass(self.trigger.children[num],"focus");
                self.itemFocusIndex = num;
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
            setFocusItem:function(itemIndex){
                var self = this;
                self.setPosition(parseFloat(window.getComputedStyle(self.trigger,null).left),-self.item[1]*itemIndex);
                var i = 0;
                for(;i<self.childCount;i++){
                    self.removeClass(self.trigger.children[i],"focus");
                }
                self.addClass(self.trigger.children[itemIndex],"focus");
                return this;
            },
            setItemNewWH:function(wrapNewWH,focusNewWH){
                this.item = [wrapNewWH,focusNewWH];
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

        return animate;
    })(window,document);

    module.exports = anim;
});
