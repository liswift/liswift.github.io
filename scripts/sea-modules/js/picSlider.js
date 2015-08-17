/**
 * Created by biQuan on 15-6-5.
 */
define(function(require,exports,module){
    require("zepto");
    var animate = require("animate");

    var picSlider = function(options){
        var defaults = {
            scrollDirect:"x",//水平移动，“y”垂直移动
            scrollType:"linear", //连续移动。“block”块状移动。“selector”连续移动，但会定位聚焦的元素
            duration:180, //动画时间,一般需要设置
            bodyScroll:true
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
        var touchElem = typeof defaults.touchElement === "string" ? $(defaults.touchElement) : defaults.touchElement;

        var ulAnim = new animate(options);

        ulAnim.touchDur = 0;
        ulAnim.bodyScroll = defaults.bodyScroll;
        var startTimeStamp = 0,scrollDirect = ulAnim.get("scrollDirect");

        var pos = $(ulAnim.trigger).css("position");
        if(pos !="relative" && pos != "absolute" && pos != "fixed"){
            $(ulAnim.trigger).css({position:"relative",left:0,top:0});
        }

        var end_p = ulAnim.getTransPos()[defaults.scrollDirect == "x"? "y":"x"];
        var ulWidth = ulAnim.item[0];
        var liWidth = ulAnim.item[1];
        var oldEX = 0 ,newEX = 0, touches = null,judgeOldEX=0,judgeOldEY=0;
        var endV = 0,oldTimeStamp = 0;
        var itemsBox = touchElem||$(ulAnim.trigger);
        var ease = ["cubic-bezier(.22,.71,.8,.9)","cubic-bezier(0.18, 0.89, 0.32, 1.28)"],usedEase=ease[0];

        var p= 0,delta = 0,isJudged = false;
        itemsBox.on("touchstart",function(e){
            isJudged = false;
            touchMove();
            $(document).on("touchmove",function(e){
                e.preventDefault();
            });
            p = ulAnim.getTransPos()[defaults.scrollDirect];
            touches = e.touches || e.originalEvent.touches ;
            ulAnim.stopTrans();
            oldEX = touches[0][directArr[scrollDirect][1]];
            oldTimeStamp = e.timeStamp;
            startTimeStamp = e.timeStamp;
            endV = 0;
            judgeOldEX = touches[0].pageX;
            judgeOldEY = touches[0].pageY;
        });

        function touchMove(){
            itemsBox.on("touchmove",function(e){
                touches = e.touches || e.originalEvent.touches ;
                if(ulAnim.bodyScroll){
                    if(!isJudged){
                        var angle = Math.abs((touches[0].pageY-judgeOldEY)/(touches[0].pageX-judgeOldEX));
                        if(scrollDirect=="x" ? angle>=1 : angle<=1){
                            itemsBox.off("touchmove");
                            $(document).off("touchmove");
                            return;
                        }
                        else{
                            isJudged = true;
                        }
                    }
                }

                newEX = touches[0][directArr[scrollDirect][1]];
                delta = newEX - oldEX;
                if(p>0 || p< -(ulWidth-liWidth)){
                    p += delta/3;
                }
                else{
                    p += delta;
                }

                if(scrollDirect == "x"){
                    ulAnim.translate(p,end_p,0,"linear",true);
                }
                else{
                    ulAnim.translate(end_p,p,0,"linear",true);
                }
                oldEX = newEX;
                endV = delta/(e.timeStamp - oldTimeStamp);
                oldTimeStamp = e.timeStamp;
            });
        }

        var lastV = 0;
        itemsBox.on("touchend",function(e){
            itemsBox.off("touchmove");
            $(document).off("touchmove");
            touches = e.changedTouches || e.originalEvent.changedTouches ;
            newEX = touches[0][directArr[scrollDirect][1]];
//            lastV = Math.abs(endV) <=0.1 ? endV : (endV<0 ? (endV*250-50):(endV*250+50));
            lastV = endV*300;
//            lastV = endV*260;
            p += lastV;
//            defaults.duration =Math.abs(endV*400)+300;
            defaults.duration =Math.abs(endV*300)+300;
            ulAnim.touchDur = e.timeStamp - startTimeStamp;
            ulAnim.endV = endV;
            if(ulAnim.touchDur<=100 && !ulAnim.endV){
                return;
            }
            ulWidth = ulAnim.item[0];
            liWidth = ulAnim.item[1];
            ulWidth<=liWidth && (liWidth=ulWidth);
            p = typeArr[defaults.scrollType].call(this,p,isSelectorType?ulWidth:liWidth);
//            alert(Math.abs(endV))
//            Math.abs(endV) < 1 && (usedEase = "cubic-bezier(.16,.15,.79,.76)");
            oldEX = newEX;
            if(scrollDirect == "x"){
                ulAnim.translate(p,end_p,defaults.duration,usedEase);
            }
            else{
                ulAnim.translate(end_p,p,defaults.duration,usedEase);
            }

        });


        function judgeLinear(endX){
            var oldP = endX - lastV;
            if((endX > 0 && oldP>=0)){
                endX = 0;
                defaults.duration = 300;
                usedEase=ease[0];
            }
            else if(oldP<-(ulWidth-liWidth) && endX < -(ulWidth-liWidth)){
                endX = -(ulWidth-liWidth);
                defaults.duration = 300;
                usedEase=ease[0];
            }
            else if(endX > 0 && oldP<0){
                endX = 0;
                defaults.duration = 500;
                usedEase=ease[1];
            }
            else if(oldP>=-(ulWidth-liWidth) && endX < -(ulWidth-liWidth)){
                endX = -(ulWidth-liWidth);
                defaults.duration = 500;
                usedEase=ease[1];
            }
            else{
                usedEase=ease[0];
            }

            return endX;
        }

        function judgeBlock(endX,width){
            defaults.duration = 300;
            if(endX > 0){
                endX = 0;
            }
            else if(endX < -(ulWidth-width)){
                endX = -(ulWidth-width);
            }

            var _delta = endX%width;
            if(_delta != 0){
                if(Math.abs(_delta) >= width/2){
                    endX += count*width - width;
                }
                else{
                    endX = count*width;
                }

            }

            return endX;
        }
        function judgeSelector(endX,width){
            var oldP = endX - lastV;
            if(endX > 0 && oldP>=0){
                endX = 0;
                defaults.duration = 300;
                usedEase=ease[0];
            }
            else if(oldP<-(width-liWidth) && endX < -(width-liWidth)){
                endX = -(width-liWidth);
                defaults.duration = 300;
                usedEase=ease[0];
            }
            else if(endX > 0 && oldP<0){
                endX = 0;
                defaults.duration = Math.abs(endV*250)+100;
                usedEase=ease[1];
            }
            else if(oldP>=-(width-liWidth) && endX < -(width-liWidth)){
                endX = -(width-liWidth);
                defaults.duration = Math.abs(endV*250)+100;
                usedEase=ease[1];
            }
            else{
                usedEase=ease[0];
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