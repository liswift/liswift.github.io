/**
 * Created by biQuan on 15-6-9.
 */
define(function(require,exports,module){

    var tranSprite = (function(window,document){

        var pos = {
            fixedP:0,//scrollDirect为“x”时，fixedP为tigger的y方向移动量，固定不变。
            endP:0,  //scrollDirect为“x”时，endP为tigger的x方向移动量,变化。
            x:["pageX","endP","fixedP"],
            y:["pageY","fixedP","endP"],
            oldE:0,
            newE:0,
            oldTime:0,
            v:0
        };
        var touche = null;

        var animate = function(options){
            var defaults = {
                touchElement:null,//出发滚动的touch区域
                trigger:null, //滚动元素
                useTransform:false,//使用css3的transform
                scrollDirect:"x",//水平滚动，“y”垂直滚动
                duration:1000,//动画时间
                easing:"ease",//动画类型
                viewWH:300,////滑动可视区域的宽或高
                wrapWH:300,////滑动总区域的宽或高
                scrollBlock:{  //块状滚动
                    enabled:false,
                    blockWH:0, //单个块状宽度或高度
                    blockWrapWH:0 //所有块总宽度或总高度
                }
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
            this.touchElement = typeof defaults.touchElement === "string" ? document.querySelector(defaults.touchElement) : defaults.touchElement;
            this.touchElement || (this.touchElement = this.trigger);
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
                if(typeof document.body.style.transform == "string"){
                    this.fx.u = true;
                }

                var self = this;
                self._transDirect();
                var touchEv = {
                    touchstart:self._touchstart(),
                    touchmove:self._touchmove(),
                    touchend:self._touchend()
                };
                self.on("touchstart touchmove touchend",self.touchElement,touchEv);
            },
            _transDirect:function(){
                var me = this;
                var regRes = me.trigger.style.WebkitTransform.match(/[+-]?\d+/gi) || ["0","0"];
                console.log(regRes)
                if(me.fx.s == "x"){
                    pos.fixedP = +regRes[1];
                    pos.endP = +regRes[0];
                }
                else{
                    pos.fixedP = +regRes[0];
                    pos.endP = +regRes[1];
                }
            },
            move:function(endX,endY,duration,ease){
                var self = this;
                var el = self.trigger;
                el.style.WebkitTransition = "transform "+duration+"ms "+ease;
                el.style.WebkitTransform = 'translate(' +endX + 'px, '+endY+'px)';
            },
            _touchstart:function(){
                var me = this;
                return function(e){
                    touche = e.touches[0];
                    pos.oldE = touche[pos[me.fx.s][0]];
                    me._transDirect();
                    me.trigger.style.WebkitTransform = 'translate(' +pos[pos[me.fx.s][1]] + 'px, '+pos[pos[me.fx.s][2]]+'px)';

                }

            },
            _touchmove:function(){
                var me = this;
                return function(e){
                    touche = e.touches[0];
                    pos.newE = touche[pos[me.fx.s][0]];
                    var delta = pos.newE - pos.oldE;
                    pos.endP += delta;
                    me.move(pos[pos[me.fx.s][1]],pos[pos[me.fx.s][2]],0,"linear");
                    pos.oldE = pos.newE;
                    pos.oldTime = e.timeStamp;
                }

            },
            _touchend:function(){
                var me = this,
                    wrapWH = me.get("wrapWH"),
                    viewWH = me.get("viewWH");

                return function(e){
                    touche = e.changedTouches[0];
                    pos.newE = touche[pos[me.fx.s][0]];
                    var delta = pos.newE - pos.oldE;
                    pos.v = delta/(e.timeStamp - pos.oldTime+1);
                    pos.endP += delta+pos.v*100;
                    var duration = 5000;
                    if(pos.endP > 0){
                        duration = 3000;
                        pos.endP = 0;
                    }
                    else if(pos.endP < -(wrapWH-viewWH)){
                        duration = 3000;
                        pos.endP = -(wrapWH-viewWH);
                    }
                    me.move(pos[pos[me.fx.s][1]],pos[pos[me.fx.s][2]],duration,"ease-out");
                    pos.oldE = pos.newE;
                }

            },
            on:function(ev,dom,handlers){
                ev = ev.split(/\s+/);
                var len = ev.length,
                    i= 0;
                if(typeof handlers == "function"){
                    var handler = {},j=0;
                    for(;j<len;j++){
                        handler[ev[j]] = handlers;
                    }
                    handlers = handler;
                }
                for(;i<len;i++){
                    dom.addEventListener(ev[i],handlers[ev[i]]);
                }
                return this;
            },
            off:function(ev,dom){
                ev = ev.split(/\s+/);
                var len = ev.length,
                    i= 0;
                for(;i<len;i++){
                    dom.removeEventListener(ev[i]);
                }
                return this;
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