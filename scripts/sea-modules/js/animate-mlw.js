/**
 * Created by biQuan on 15-5-14.
 */
define(function(require,exports,module){

    var anim = (function(window,document){
        var animate = function(options){
            var defaults = {
                trigger:null,
                itemFocusHeight:0, //当前聚焦的item宽或高
                itemWrapHeight:0, //可滚动范围的宽或高，一般是所有item的总和
                selectorMode:false,  //是否selector模式,类似iOS的默认select标签选择
                scrollDirect:"x"   //水平移动，“y”垂直移动
            };
            for(var key in options){
                defaults[key] = options[key];
            }
            this.attrs = defaults;
            this.trigger = typeof defaults.trigger === "string" ? document.querySelector(defaults.trigger) : defaults.trigger;

            this.item = [defaults.itemWrapHeight,defaults.itemFocusHeight];

            this.init();
        };

        var c =1.1,b=c-Math.sqrt(c*c-c),a=-c/(b*b);
        var easing = {
            bounce:function(x){
                var resX = a*(Math.pow(x-b,2))+c,
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
                var self = this;
                var vendors = {
                    Webkit: "webkit",
                    Moz: "Moz",
                    O: "o",
                    ms: "ms"
                };
                for(var key in vendors){
                    if(self.trigger.style[vendors[key] + "TransitionProperty"] !== undefined){
                        self.cssPrefix = vendors[key]==""? "":("-"+vendors[key]+"-");
                    }
                }
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
            translate:function(endX,endY,duration,easeFn,noJudge){
                var self = this;
                var div = self.trigger;
                easeFn || (easeFn = "cubic-bezier(.32,.38,.35,.72)");
                div.style.cssText += self.cssPrefix + 'transition-timing-function:'+easeFn+";"+
                    self.cssPrefix + 'transition-duration:' + duration +'ms;' +
                    self.cssPrefix + 'transform: translate3D('+endX +'px, '+endY+'px,0);' ;
                self.isMoving = true;
                if(self.get("selectorMode") && !noJudge){
                    self.transItemFocus1(endX,endY,duration);
                }
            },
            transItemFocus:function(){
                var self = this,res,
                    initRes = self.getTransPos();
                self.clk && clearTimeout(self.clk);
//                self.inter && clearInterval(self.inter);
//                res = self.getTransPos();
//                self.itemFocus(self.direct=="x"?res.x:res.y);
                self.clk = setTimeout(function(){
                    self.inter = setInterval(function(){
                        res = self.getTransPos();
                        if(res.x == initRes.x && res.y == initRes.y){
                            self.isMoving = false;
                            clearInterval(self.inter);
//                            console.log(self.itemFocusIndex)
                            return;
                        }
                        initRes = res;
                        self.itemFocus(self.direct=="x"?res.x:res.y);
                    },100);
                },20);


            },
            transItemFocus1:function(endX,endY,duration){
                var self = this,res,
                    initRes = self.getTransPos(),
                    rAF = self.rAF,
                    initTime = new Date().getTime(),
                    oldTime =initTime,
                    currentTime = initTime;

               /* step();
                function step(){
                    rAF(step);
                    if(!self.isMoving){
                        return ;
                    }
                    res = self.getTransPos();
                    var currentTime = new Date().getTime();
                    if(currentTime-oldTime>=20){
                        oldTime = currentTime;
                        if(res.x == endX && res.y == endY && (currentTime-initTime>=duration)){
                            self.isMoving = false;
                            return;
                        }
                        initRes = res;
                        self.itemFocus(self.direct=="x"?res.x:res.y);
                    }
                }*/
                do{
                    if(!self.isMoving){
                        break ;
                    }
                    res = self.getTransPos();
                    var currentTime = new Date().getTime();
                    if(currentTime-oldTime>=20){
                        oldTime = currentTime;
                        if(res.x == endX && res.y == endY && (currentTime-initTime>=duration)){
                            self.isMoving = false;
                            break;
                        }
                        initRes = res;
                        self.itemFocus(self.direct=="x"?res.x:res.y);
                    }
                }while(currentTime-initTime>=duration)
            },
            stop:function(){
                this.isMoving = false;
                return this;
            },
            stopTrans:function(){
                var self = this;
                var pos = self.getTransPos();
                self.translate(pos.x,pos.y,0,"linear",true);
                self.isMoving = false;
                return this;
            },
            isStopped:function(){
                return !this.isMoving;
            },
            getTransPos:function(dom){
                dom || (dom = this.trigger);
                var self = this;
                var res = window.getComputedStyle(dom).getPropertyValue(self.cssPrefix+"transform")||"",pos={x:0,y:0};

                res = res.match(/([-0-9.]+,\s*[-0-9.]+)\)/);
                if(res){
                    pos.x = +res[1].split(/,\s*/)[0];
                    pos.y = +res[1].split(/,\s*/)[1];
                    console.log(pos.x,pos.y)
                }
                return pos;
            },
            setPosition:function(left,top){
                this.translate(left,top,200,null,true);
                return this;
            },
            itemFocus:function(currentY){ //selector模式用到
                var self = this;
                var num = -1;
                if(currentY >= self.item[1]/2 || currentY < -self.item[0] + self.item[1]/2){
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
            setItemNewWH:function(wrapNewWH,focusNewWH){
                this.item = [wrapNewWH,focusNewWH];
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
            setFocusItem:function(itemIndex){ //selector模式用到
                var self = this.stopTrans();
                if(self.direct=="x"){
                    self.setPosition(-self.item[1]*itemIndex,0);
                }
                else{
                    self.setPosition(0,-self.item[1]*itemIndex);
                }

                var i = 0;
                for(;i<self.childCount;i++){
                    self.removeClass(self.trigger.children[i],"focus");
                }
                self.addClass(self.trigger.children[itemIndex],"focus");
                self.itemFocusIndex = itemIndex;
                return self;
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
