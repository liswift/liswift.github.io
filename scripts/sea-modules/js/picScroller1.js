/**
 * Created by biQuan on 15-5-25.
 */
define(function(require,exports,module){
    var $ = require("jquery");

    var picScroller = (function($,window){
        var picScroll = function(options){
            var defaults = {
                element:null,
                animClass: "fade",    //小图上方大图区域的动画效果
                parentNode:$("body"), //界定边框的元素,弹出窗只在此元素内定位显示
                hasNav:true,          //小图bar
                hasBanner:true,          //是否显示小图上方大图区域
                showPageNum:1,         //中图显示数量
                navPicNum:3,         //nav图显示数量
                model:null ,            //图片数据，没有则查找element下的,
                navSwitch:null,       //nav切换当前聚焦item后触发
                bannerSwitch:null,       //banner切换当前聚焦item后触发
                urls:[]       //整屏幕翻滚用，每块都是一个iframe
            };
            $.extend(defaults,options);
            this.attrs = defaults;
            this.init();
        }

        picScroll.prototype = {
            init:function(){
                this.element = this.get("element");
                this.model = this.get("model");
                this.picIndex = 0;
                this.animStop = true;
                var self  = this;
                if(self.get("hasBanner")){
                    this.bannerBox = $(".banner-img-container",self.element);
                    self.bannerScroll();
                }
                if(self.get("hasNav")){
                    this.picNum = $(".banner-nav-img-wrap li",self.element).length;
                    this.navUL = $(".banner-nav-img-wrap ul",self.element);
                    this.navMoveDiv = $(".nav-move-wrap",self.element);
                    this.navLI = $("li",self.navUL);
                    this.numPool = [0,self.get("navPicNum")-1];
                    self.navScroll();
                }
            },
            bannerScroll:function(){
                var self = this;
                var animClass = self.get("animClass");
                var bannerUL = $("ul",self.bannerBox);
                var prevTD = null;
                var animArr = {
                    "scroll":scrollAnim
                };
                var xhtml = '';
                var events = {
                    "click li":function(e){
                        var picIndex = $(e.currentTarget).attr("pic-index");
                    },
                    "changed":function(e,data){
                        prevTD = $("li",bannerUL).removeClass('active');
                        var xhtml1 = '<i class="slidedown-icon"></i><i class="slideup-icon"></i>';
                        (data[2]==self.picNum-1) && (xhtml1 = '<i class="slideup-icon"></i>');
                        (data[2]==0) && (xhtml1 = '<i class="slidedown-icon"></i>');
                        xhtml = '<li pic-index="'+data[2]+'" newli style="display: none;"><div><iframe src="'+data[0]+'" frameborder="0"></iframe></div>'+xhtml1+'</li>';
                        bannerUL.append($(xhtml));
                        $('li[newli] .sub-page-wrap',bannerUL).append(data[0]);
                        animArr[animClass].call(self,data);
                    }
                }
                self.bindEvents(events,self.bannerBox);
                var switchEv = self.get("navSwitch");
                self.bannerBox.on("switch",function(e,to,from){
                    if($.isFunction(switchEv)){
                        switchEv.call(self,e,to,from);
                    }
                });
                function scrollAnim(data){
                    self.animStop = false;
                    var height = prevTD.outerHeight();
                    var curLiOpt = "-",nextLiOpt="+";
                    if(data[1] == "prev"){
                        curLiOpt = "+";
                        nextLiOpt = '-';
                    }
                    var $newLi = $("li[newli]",bannerUL);
                    $newLi[0].style.cssText += '-webkit-transform:translate(0,'+nextLiOpt+height+'px) translateZ(0)';
                    $newLi.show();
                    prevTD[0].style.cssText += '-webkit-transform:translate(0,'+curLiOpt+height+'px) translateZ(0)';
                    $newLi[0].style.cssText += '-webkit-transform:translate(0,0) translateZ(0)';
                    var clk = setTimeout(function(){
                        self.animStop = true;
                        prevTD.remove();
                        $newLi.removeAttr("newli");
                        $('i',$newLi).addClass('active');
                    },600);
                }
            },
            navScroll:function(){
                var self = this;
                this.navElement = $(".banner-nav-container",self.element);
                var animClass = self.get("animClass");
                var events = {
                    "click li":function(e){
                        if(!self.animStop){
                            return;
                        }
                        var currentImg = $(e.currentTarget);
                        currentImg.addClass("active").siblings().removeClass("active");
                        var direct = "",currentIndex=currentImg.index();
                        var oldIndex = self.picIndex;
                        if(self.picIndex > currentImg.index()){
                            direct = 'prev';
                            self.bannerBox.trigger("switch",[currentIndex,oldIndex]);
                        }
                        else if(self.picIndex < currentIndex){
                            direct = 'next';
                            self.bannerBox.trigger("switch",[currentIndex,oldIndex]);
                        }
                        self.picIndex = currentIndex;
                        if(self.get("hasBanner") && direct){
//                            var $xhtml = $("#pages-wrap>div").eq(self.picIndex).clone();
//                            var url = $("#pages-wrap>div").eq(self.picIndex).data('url');
                            var url = self.get('urls')[self.picIndex];
                            self.bannerBox.trigger("changed",[[url,direct,self.picIndex]]);
                        }
                    }
                }
                self.bindEvents(events,self.navElement);
            },
            bindEvents:function(events,delegateDom){
                var self = this;
                events || (events = {});
                $.each(events,function(key,value){
                    key = key.replace(/^\s*|\s*$/g,"");
                    var action = key.split(" ")[0];
                    var elem = '';
                    if(key != action){
                        elem = key.split(action+" ")[1];
                    }
                    delegateDom || (delegateDom = self.element);
                    if($.isFunction(value)){
                        if(key == action){
                            delegateDom.on(action,function(e,params){
                                value.call(self,e,params);
                            }) ;
                        }
                        else{
                            delegateDom.on(action,elem,function(e,params){
                                value.call(self,e,params);
                            }) ;
                        }

                    }

                });
            },
            setFocusItem:function(itemIndex){
                var self = this;
                self.navElement = $(".banner-nav-container",self.element);
                $("li",self.navElement).eq(itemIndex).trigger("click");
            },
            get:function(attr){
                return this.attrs[attr] || "";
            },
            set:function(){
                var self = this;
                var len = arguments.length;
                if(!len){
                    return this;
                }
                if($.type(arguments[0]) == "string"){
                    if(!arguments[1]){
                        return this;
                    }
                    this.attrs[arguments[0]] = arguments[1];
                    return this;
                }
                if($.type(arguments[0]) == "object"){
                    $.each(arguments[0],function(key,value){
                        self.attrs[key] = value;
                    });
                    return this;
                }
                throw "参数类型错误。";
            },
            show:function(){
                var self = this;
                self.element.stop(false,false).fadeTo(400, 1);
            },
            hide:function(){
                this.element.fadeOut(400);
            }
        };
        return picScroll;
    })(jQuery,window);

    module.exports = picScroller;
});