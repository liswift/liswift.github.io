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
                ifPopShow:true,       //点击查看大图
                showPageNum:1,         //中图显示数量
                navPicNum:3,         //nav图显示数量
                model:null ,            //图片数据，没有则查找element下的,
                navSwitch:null,       //nav切换当前聚焦item后触发
                popSwitch:null,         //pop切换当前聚焦item后触发
                bannerSwitch:null       //banner切换当前聚焦item后触发
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
                var self  = this;
                if(!$.isEmptyObject(self.model)){
                    self._createHtml(self.model);
                }
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
                if(self.get("ifPopShow")){
                    self.popShow();
                }
            },
            bannerScroll:function(){
                var self = this;
                var animClass = self.get("animClass");
                var bannerUL = $("ul",self.bannerBox);
                var prevTD = null;
                var animArr = {
                    "fade":fadeAnim,
                    "scroll":scrollAnim,
                    "scaleScroll":scaleScroll
                };
                var xhtml = '';
                var events = {
                    "click li":function(e){
                        var picIndex = $(e.currentTarget).attr("pic-index");
                        if(self.popBox){
                            self.popBox.trigger("show",[[picIndex]]);
                        }
                    },
                    "changed":function(e,data){
                        prevTD = $("li",bannerUL);
                        xhtml = '<li pic-index="'+data[2]+'" newli style="display: none;"><img src="'+data[0]+'" ></li>';
                        bannerUL.append($(xhtml));
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

                function fadeAnim(data){
                    $("li[newli]",bannerUL).fadeIn(function(){$(this).removeAttr("newli")});
                    prevTD.fadeOut(function(){$(this).remove()});
                }

                function scrollAnim(data){
                    var width = prevTD.outerWidth();
                    var op = "-=",newLiOp = "+=";
                    if(data[1] == "prev"){
                        op = "+=";
                        newLiOp = "-=";
                    }
                    prevTD.animate({left:op+width+"px"},300,function(){$(this).remove()});
                    $("li[newli]",bannerUL).css("left",newLiOp+width+"px").show().animate({left:op+width+"px"},300,function(){$(this).removeAttr("newli")});
                }

                function scaleScroll(data){
                    var width = prevTD.outerWidth();
                    var height = prevTD.outerHeight();
                    var op = "-=",newLiOp = "+=";
                    if(data[1] == "prev"){
                        op = "+=";
                        newLiOp = "-=";
                    }
                    prevTD.animate({left:op+width+"px",width:0,height:0},300,function(){$(this).remove()});
                    $("li[newli]",bannerUL).css({left:newLiOp+width+"px",width:0,height:0})
                        .show().animate({left:op+width+"px",width:width+"px",height:height+"px"},300,function(){$(this).removeAttr("newli")});
                }

            },
            navScroll:function(){
                var self = this;
                this.navElement = $(".banner-nav-container",self.element);
                var animClass = self.get("animClass");
                this.is_finish = true;
                var events = {
                    "click .banner-nav-img-prev":function(e){
                        if(self.picIndex < 1 || !this.is_finish){
                            return;
                        }
                        this.is_finish = false;
                        var oldIndex = self.picIndex;
                        self.picIndex -= 1;
                        self.bannerBox.trigger("switch",[self.picIndex,oldIndex]);
                        self.moveNav(self.picIndex,'prev',1);
                        var currentImg = $("li:eq("+self.picIndex+")",self.navElement);
                        currentImg.addClass("active").siblings().removeClass("active");
                        if(self.get("hasBanner")){
//                            $("li img",self.bannerBox).prop("src",currentImg.find("img").data("url"));
                            self.bannerBox.trigger("changed",[[currentImg.find("img").data("url"),"prev",self.picIndex]]);
                        }


                    },
                    "click .banner-nav-img-next":function(e){
                        if(self.picIndex >= self.picNum-1 || !this.is_finish){
                            return;
                        }
                        this.is_finish = false;
                        var oldIndex = self.picIndex;
                        self.picIndex += 1;
                        self.bannerBox.trigger("switch",[self.picIndex,oldIndex]);
                        self.moveNav(self.picIndex,'next',1);
                        var currentImg = $("li:eq("+self.picIndex+")",self.navElement);
                        currentImg.addClass("active").siblings().removeClass("active");
                        if(self.get("hasBanner")){
//                            $("li img",self.bannerBox).prop("src",currentImg.find("img").data("url"));
                            self.bannerBox.trigger("changed",[[currentImg.find("img").data("url"),"next",self.picIndex]]);
                        }

                    },
                    "click li":function(e){
                        if(!this.is_finish){
                            return;
                        }
                        var currentImg = $(e.currentTarget);
                        currentImg.addClass("active").siblings().removeClass("active");
                        currentImg.addClass("active").siblings().removeClass("active");
                        var direct = "",currentIndex=currentImg.index();
                        var oldIndex = self.picIndex;
                        if(self.picIndex > currentImg.index()){
                            direct = 'prev';
                            var prevStep = self.picIndex-currentIndex;
                            self.moveNav(currentIndex,'prev',prevStep);
                            self.bannerBox.trigger("switch",[currentIndex,oldIndex]);
                        }
                        else if(self.picIndex < currentIndex){
                            direct = 'next';
                            var nextStep = currentIndex-self.picIndex;
                            self.moveNav(currentIndex,'next',nextStep);
                            self.bannerBox.trigger("switch",[currentIndex,oldIndex]);
                        }
                        self.picIndex = currentIndex;
                        if(self.get("hasBanner") && direct){
//                            $("li img",self.bannerBox).prop("src",currentImg.find("img").data("url"));
                            self.bannerBox.trigger("changed",[[currentImg.find("img").data("url"),direct,self.picIndex]]);
                        }
                    }
                }

                self.bindEvents(events,self.navElement);
            },
            popShow:function(){
                var self = this;
                var popXhtml = '<div id="img-pop-container" class="img-pop-container"><a class="img-pop-prev"></a><a class="img-pop-next"></a><div class="img-pop-mask"></div>' +
                    '<div class="img-pop-wrap"><img src="../images/loading.gif"><ul></ul></div></div>';
                $("body").append($(popXhtml));
                this.popBox = $("#img-pop-container");
                var imgPopWrap = $(".img-pop-wrap",self.popBox);
                var imgPopUL = $("ul",imgPopWrap);
                var prevLI = null,imgIndex = 0,imgTipHeight = 0,toIndex= 0,fromIndex=0;
                var currentLI = $("li",imgPopUL);
                var imgRealW = 0,
                    imgRealH = 0,
                    currentImg = currentLI.find("img");

                var win_w = $(window).width(),
                    win_h = $(window).height();
                this.popBox.css({
                    width:win_w,
                    height:win_h
                });

                var animArr = {
                    "fade":fadeAnim,
                    "scroll":"",
                    "scaleScroll":""
                };
                var events = {
                    "click":function(e){
                        self.popBox.fadeOut(200,function(){currentLI.empty();});
                    },
                    "click .img-pop-prev":function(e){
                        e.stopPropagation();
                        if(imgIndex <= 0){
                            return;
                        }
                        var oldIndex = imgIndex;
                        imgIndex -= 1;
                        fadeAnim(imgIndex);
                        self.popBox.trigger("switch",[imgIndex,oldIndex]);
                    },
                    "click .img-pop-next":function(e){
                        e.stopPropagation();
                        if(imgIndex >= self.picNum-1){
                            return;
                        }
                        var oldIndex = imgIndex;
                        imgIndex += 1;
                        fadeAnim(imgIndex);
                        self.popBox.trigger("switch",[imgIndex,oldIndex]);
                    },
                    "click li img":function(e){
                        e.stopPropagation();
                    },
                    "show":function(e,data){
                        imgIndex = +data[0];
                        self.popBox.fadeIn(200,function(){
                            if(self.get("hasNav")){
                                var xhtml = '<li style="display: none;"><img src="'+$("li.active img",self.navUL).data("url")+'" ><div class="pop-content">'+
                                    (self.picIndex+1)+"/"+self.picNum+'</div></li>';
                                imgPopUL.append($(xhtml));
                                $(".pop-content",self.popBox).text(self.picIndex+1+"/"+self.picNum);
                                currentLI = $("li",imgPopUL);
                                currentImg = currentLI.find("img");
                                currentImg.load(function(){
                                    currentLI.fadeIn(400);
                                    currentLI.imgW = currentLI.width();
                                    currentLI.imgH = currentLI.height();
                                    imgRealW = currentImg.width();
                                    imgRealH = currentImg.height();
                                    currentImg.attr("ori-width",imgRealW).attr("ori-height",imgRealH);
                                    changePos();
                                });
                            }
                        });
                    }
                }
                var resizeEvent = {
                    "resize":function(){
                        win_w = $(window).width();
                        win_h = $(window).height();
                        this.popBox.css({
                            width:win_w,
                            height:win_h
                        });
                        changePos();
                    }
                }
                self.bindEvents(events,self.popBox);
                self.bindEvents(resizeEvent,$(window));

                var switchEv = self.get("popSwitch");
                self.popBox.on("switch",function(e,to,from){
                    if($.isFunction(switchEv)){
                        switchEv.call(self,e,to,from);
                    }
                });

                function fadeAnim(index){

                    prevLI = $("li",imgPopUL);
                    prevLI.removeAttr("newli");
                    var xhtml = '<li newli style="display: none;"><img src="'+$("li:eq("+index+") img",self.navUL).data("url")+'" ><div class="pop-content"></div></li>';
                    imgPopUL.append($(xhtml));
                    currentLI = $("li[newli]",imgPopUL);
                    currentImg = currentLI.find("img");
                    currentImg.load(function(){
                        currentLI.fadeIn(400,function(){$(this).removeAttr("newli")});
                        currentLI.imgW = currentLI.width();
                        currentLI.imgH = currentLI.height();
                        imgRealW = currentImg.width() || imgRealW;
                        imgRealH = currentImg.height() || imgRealH;
                        currentImg.attr("ori-width",imgRealW).attr("ori-height",imgRealH);
                        changePos();
                    });

                    prevLI.fadeOut(400,function(){$(this).remove()});

                }

                function changePos(){
                    var oriWidth = currentImg.attr("ori-width"),
                        oriHeight = currentImg.attr("ori-height");
                    if(win_w/win_h >= currentLI.imgW/currentLI.imgH){
                        oriWidth = oriWidth*(win_h-imgTipHeight)*0.8/oriHeight;
                        oriHeight = (win_h-imgTipHeight)*0.8;
                        if(oriHeight > imgRealH){
                            oriWidth = imgRealW;
                            oriHeight = imgRealH;
                        }
                        currentImg.css({
                            height:oriHeight,
                            width:oriWidth
                        });
                        currentLI.css({
                            top:(win_h-oriHeight-imgTipHeight)/2,
                            left:(win_w-oriWidth)/2,
                            width:oriWidth,
                            height:oriHeight+imgTipHeight
                        });
                    }
                    else{
                        oriHeight = oriHeight*win_w*0.8/oriWidth;
                        oriWidth = win_w*0.8;
                        if(oriWidth > imgRealW){
                            oriWidth = imgRealW;
                            oriHeight = imgRealH;
                        }
                        currentImg.css({
                            height:oriHeight,
                            width:oriWidth
                        });
                        currentLI.css({
                            top:(win_h-oriHeight-imgTipHeight)/2,
                            left:(win_w-oriWidth)/2,
                            width:oriWidth,
                            height:oriHeight+imgTipHeight
                        });
                    }

                    currentImg.attr("ori-width",oriWidth).attr("ori-height",oriHeight);
                }

            },
            moveNav:function(pic_index,direction,moveStep){
                var self  = this;
                var navPicNum = self.get("navPicNum");
                var picNum = this.picNum;
                var numPool = self.numPool;
                var newNumPool = numPool;
                if(direction == "prev"){
                    newNumPool = [numPool[0]-moveStep,numPool[1]-moveStep];
                }
                else{
                    newNumPool = [numPool[0]+moveStep,numPool[1]+moveStep];
                }

                var delta = 0;
                if(direction == "next"){
                    if(pic_index > numPool[0]+Math.floor(navPicNum/2) && newNumPool[1] <= picNum-1){
                        moveStep = pic_index - numPool[0]-Math.floor(navPicNum/2)
                    }
                    else if(pic_index > numPool[0]+Math.floor(navPicNum/2) && newNumPool[1] > picNum-1){
                        moveStep = moveStep + picNum - 1 -newNumPool[1];
                    }
                    else{
                        moveStep = 0;
                    }

                    numPool[0] = numPool[0]+moveStep;
                    numPool[1] = numPool[1]+moveStep;
                }
                else{
                    if(pic_index < numPool[0]+Math.floor(navPicNum/2) && newNumPool[0] >= 0){
                        moveStep = -pic_index + numPool[0]+Math.floor(navPicNum/2);
                    }
                    else if(pic_index < numPool[0]+Math.floor(navPicNum/2) && newNumPool[0] < 0){
                        moveStep = moveStep + newNumPool[0] ;
                    }
                    else{
                        moveStep = 0;
                    }

                    numPool[0] = numPool[0]-moveStep;
                    numPool[1] = numPool[1]-moveStep;
                }

                delta = (self.navLI.outerWidth()+4)*moveStep;

                this.numPool = numPool;

                switch (direction){
                    case "prev":
                        self.navMoveDiv.animate({left:"+="+delta+"px"},300,function(){self.is_finish = true;});
                        break;
                    case "next":
                        self.navMoveDiv.animate({left:"-="+delta+"px"},300,function(){self.is_finish = true;});
                        break;
                    default :
                        break;
                }

            },
            _createHtml:function(model){

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
            pin:function(pos){

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
            synchModel:function(hoverElem,content){


            },
            show:function(){
                var self = this;
                self.element.stop(false,false).fadeTo(400, 1);
            },
            hide:function(){
                this.element.fadeOut(400);
            },
            destroy:function(){

            }
        };

        return picScroll;
    })(jQuery,window);

    module.exports = picScroller;
});