/**
 * zepto.tab.js
 * @author sunlan
 */
define(function(require){
    require('zepto');
    "use strict";
    $.fn.tab = function(opt){
        var
            o = $.extend({
                tabNav: ".js-tab-header",
                tabItem: "li",
                contentWrap: ".js-tab-body",
                cotItem: "ul",
                curClass: "active",
                speed: 500,
                startIndex: 0,
                touchAnimation: false
            }, opt),
            curIndex = o.startIndex,
            $this = $(this),
            $tab = $this,
            $tabNav = $(o.tabNav, $tab),
            $tabItem = $(o.tabItem, $tabNav),
            $contentWrap = $(o.contentWrap, $this),
            $cotItem = $(o.cotItem, $contentWrap),
            len = $tabItem.length,
            width = $contentWrap.width()/2;

        function init() {
            function change(index) {
                var
                    transition = 0,
                    startX = 0;

                if (index < 0) {
                    index = 0;
                }

                if (index >= len) {
                    index = len - 1;
                }

                curIndex = index;
                transition = -(index * width) +"px";
                $tabItem.removeClass(o.curClass).eq(index).addClass(o.curClass);

                $cotItem.removeClass(o.curClass).eq(index).addClass(o.curClass);
                $contentWrap.css({'-webkit-transform':'translate('+ transition +')','-webkit-transition': o.speed + 'ms linear'} );
            }
            //初始化tab项的宽度
            $contentWrap.width("200%");
            $cotItem.width("50%");
            //绑定事件
            $tabItem.on('tap',function(){
                change($(this).index());
            });

            $contentWrap.on('swipeLeft',function (e) {
                change(curIndex + 1);
            });
            $contentWrap.on('swipeRight',function (e) {
                change(curIndex - 1);
            });

            //判断是否有触摸动画
            var startX;
            if (o.touchAnimation) {
                $contentWrap.on("touchstart", function (e) {
                    var touch;
//                        e.preventDefault();
                    touch= e.originalEvent.touches[0];
                    startX = touch.pageX;
                });
                $contentWrap.on("swipeLeft,swipeRight", function (e) {
                    var touch = e.touches[0],
                        x = touch.pageX - startX,
                        transform = $contentWrap.css("-webkit-transform").match(/translate\((.*)\)/),
                        translateX = (parseInt(transform && transform[1], 10)) || 0,
                        scale = (translateX < -width * (len - 1) || translateX > 0) ? 0.4 : 1,
                        actTranslateX = translateX + x * scale;

                    startX = touch.pageX;
                    event.preventDefault();
                    $contentWrap.css({'-webkit-transform': 'translate(' + actTranslateX + 'px)', '-webkit-transition': '0ms'} );
                });
            }

            $(window).on("resize", function (e) {
                $contentWrap.css("display", "none");
                width = $tab.width();
                $contentWrap.width(width * len);
                $cotItem.width(width);
                $contentWrap.css("display", "block");
                change(curIndex);
            });
        }

        init();
        return this;
    };

    return $.fn.tab;

});

