/**
 * Created by biQuan on 15-6-5.
 */
define(function(require,exports,module){
    var $ = require("zepto");
    var animate = require("animate");

    var picSlider = function(options){
        var defaults = {
            scrollDirect:"x",//水平移动，“y”垂直移动
            scrollType:"linear", //连续移动，“block”块状移动,
            duration:180 //动画时间,
        };
        $.extend(defaults,options);

        var directArr = {
            x:["left","pageX"],
            xp:"top",
            y:["top","pageY"],
            yp:"left"
        };

        var typeArr = {
            linear:judgeLinear,
            block:judgeBlock,
            selector:judgeSelector
        };

        var isSelectorType = defaults.scrollType == "selector";

        var ulAnim = new animate(options);

        ulAnim.touchDur = 0;var startTimeStamp = 0;

        var pos = $(ulAnim.trigger).css("position");
        if(pos !="relative" && pos != "absolute" && pos != "fixed"){
            $(ulAnim.trigger).css({position:"relative",left:0,top:0});
        }

        var end_p = parseFloat(window.getComputedStyle(ulAnim.trigger,null)[directArr[defaults.scrollDirect+"p"]]);
        var ulWidth = ulAnim.item[0];
        var liWidth = ulAnim.item[1];
        var oldEX = 0 ,newEX = 0, touches = null;
        var endV = 0,oldTimeStamp = 0;
        var itemsBox = $(ulAnim.trigger);
        var ease = "quickIn";

        itemsBox.on("touchstart",function(e){
            $(document).on("touchmove",function(e){
                e.preventDefault();
            });
            touches = e.touches || e.originalEvent.touches ;
            ulAnim.stop();
            oldEX = touches[0][directArr[defaults.scrollDirect][1]];
            oldTimeStamp = e.timeStamp;
            startTimeStamp = e.timeStamp;
            endV = 0;
        });

        var p = 0,delta = 0;
        itemsBox.on("touchmove",function(e){
            touches = e.touches || e.originalEvent.touches ;
            p = parseFloat(window.getComputedStyle(ulAnim.trigger,null)[directArr[defaults.scrollDirect][0]]);
            newEX = touches[0][directArr[defaults.scrollDirect][1]];
            delta = newEX - oldEX;
            ulAnim.trigger.style[directArr[defaults.scrollDirect][0]] = p+delta +"px";

            oldEX = newEX;
            endV = delta/(e.timeStamp - oldTimeStamp);
            oldTimeStamp = e.timeStamp;
        });

        itemsBox.on("touchend",function(e){
            $(document).off("touchmove");
            ulAnim.touchDur = e.timeStamp - startTimeStamp;
            touches = e.changedTouches || e.originalEvent.changedTouches ;
            var endX = parseFloat(window.getComputedStyle(ulAnim.trigger,null)[directArr[defaults.scrollDirect][0]]);
            newEX = touches[0][directArr[defaults.scrollDirect][1]];
            endX = endX+endV*100;
            ulAnim.endV = endV;
            if(ulAnim.touchDur<=100 && !ulAnim.endV){
                return;
            }

            defaults.duration = Math.abs(parseInt(endV*300))+300;

            endX = typeArr[defaults.scrollType].call(this,endX,isSelectorType?ulWidth:liWidth);
            oldEX = newEX;
            if(defaults.scrollDirect == "x"){
                ulAnim.move(endX,end_p,defaults.duration,ease);
            }
            else{
                ulAnim.move(end_p,endX,defaults.duration,ease);
            }

        });


        function judgeLinear(endX){
            if(endX > 0){
                endX = 0;
                defaults.duration = 300;
            }
            else if(endX < -(ulWidth-liWidth)){
                endX = -(ulWidth-liWidth);
                defaults.duration = 300;
            }

            return endX;
        }

        function judgeBlock(endX,width){
            if(endX > 0){
                endX = 0;
            }
            else if(endX < -width*2){
                endX = -width*2;
            }

            var _delta = endX%width;
            if(_delta != 0){
                if(Math.abs(_delta) >= width/2){
                    endX = endX - _delta - width;
                }
                else{
                    endX = endX - _delta;
                }

            }

            return endX;
        }
        function judgeSelector(endX,width){
            if(endX > 0){
                endX = 0;
                defaults.duration = 300;
            }
            else if(endX < -(width-liWidth)){
                endX = -(width-liWidth);
                defaults.duration = 300;
            }

            var _delta = endX%liWidth;
            if(_delta != 0){
                if(Math.abs(_delta) >= liWidth/2){
                    endX = endX - _delta - liWidth;
                }
                else{
                    endX = endX - _delta;
                }

            }

            return endX;
        }

        return ulAnim;
    }

    module.exports = picSlider;

});