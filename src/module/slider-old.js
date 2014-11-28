(function (root, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function (exports) {
            return factory(root, exports);
        });
    } else {
        root.Slider = factory(root, {});
    }
})(this, function (root, slider) {
    var Slider = function (val) {
        var o = {
            slideBox: '#slideBox',              //焦点图容器
            imgChild: '#slideBox li',           //焦点图列表
            pointBoxClass: '',                  //点的容器样式，如果为空不生成'点'列表
            touch: true,                       //触摸事件
            btnBack: '#slideBox .left_btn',     //后退按钮
            btnNext: '#slideBox .right_btn',    //前进按钮
            speed: '3000',                      //动画间隔
            callback: ''                        //转场时触发的回调函数
        };
        var _self = this;           //对象指针
        var slide = {
            distances: 0,                           //滚动的距离，即元素的宽度
            imgLength: 0,                           //轮播图元素个数
            isBack: false,                         //播放方向
            cleanAuto: 0,                           //自动播放的计时器变量
            transitionVal: '',                      //暂存transition属性
            animationInit: '',                      //动画函数
            transitionCallback: '',                 //动画事件回调函数
            eventNext: '',                          //前进事件函数
            eventBack: '',                          //后退事件函数
            eventTouch: {start: '', end: ''}        //触摸事件
        };
        var elm = {
            slideBox: {},
            imgBox: {},
            imgChild: {},
            btnBack: {},
            btnNext: {},
            pointBox: {},
            pointHtml: '',
            pointList: {}
        };
        this.index = 0;
        this._init = function () {
            for (var objVal in val) {
                o[objVal] = val[objVal];
            }
            elm.slideBox = document.querySelector(o.slideBox);
            elm.imgChild = document.querySelectorAll(o.imgChild);
            elm.btnBack = document.querySelector(o.btnBack);
            elm.btnNext = document.querySelector(o.btnNext);
            slide.distances = elm.imgChild[0].clientWidth;
            elm.imgBox = elm.imgChild[0].parentElement;
            slide.imgLength = elm.imgChild.length + 1;
            slide.transitionVal = window.getComputedStyle(elm.imgBox, null)['transition'];
            elm.imgBox.style.width = slide.imgLength * slide.distances + 'px';
            elm.imgBox.appendChild(elm.imgChild[0].cloneNode(true));
            for(var i= 0;i<slide.imgLength-1;i++){
                elm.imgChild[i].style.width=slide.distances+'px';
            }
            if (o.speed) {
                slide.animationInit = function () {
                    clearInterval(slide.cleanAuto);
                    this.timer = function () {
                        _self.transition(_self.index, false);
                    };
                    slide.cleanAuto = setInterval(this.timer, o.speed);
                };
                slide.animationInit();
            }
            if (o.pointBoxClass) {
                elm.pointBox = document.createElement("div");
                elm.pointBox.setAttribute('class', o.pointBoxClass);
                for (var i = 0, l = elm.imgChild.length; i < l; i++) {
                    if (i !== 0) {
                        elm.pointHtml += '<a href="javascript:;">' + i + '</a>';
                    } else {
                        elm.pointHtml += '<a class="on" href="javascript:;">' + i + '</a>';
                    }
                }
                elm.slideBox.appendChild(elm.pointBox);
                elm.pointList = elm.pointBox.getElementsByTagName('a');
                elm.pointBox.innerHTML = elm.pointHtml;
            }
            o.touch && _self.touch();
            if (elm.btnBack) {
                slide.eventBack = function () {
                    _self.transition(_self.index, true);
                };
                elm.btnBack.addEventListener('touchend', slide.eventBack, false);
            }
            if (elm.btnNext) {
                slide.eventNext = function () {
                    _self.transition(_self.index, false);
                };
                elm.btnNext.addEventListener('touchend', slide.eventNext, false);
            }
            slide.transitionCallback = function () {
                if (_self.index >= slide.imgLength - 1) {
                    ['-webkit-transition', 'transition'].forEach(function (attr) {
                        elm.imgBox.style[attr] = 'inherit';
                    });
                    ['-webkit-transform', 'transform'].forEach(function (attr) {
                        elm.imgBox.style[attr] = 'translate(0,0)';
                    });
                    setTimeout(function () {
                        ['-webkit-transition', 'transition'].forEach(function (attr) {
                            elm.imgBox.style[attr] = slide.transitionVal;
                        });
                        _self.index = 0;
                    }, 0);
                }
                o.callback && o.callback(_self);
            };
            elm.imgBox.addEventListener('webkitTransitionEnd', slide.transitionCallback);
        };
        this.transition = function (index, isBack) {
            _self.index = index;
            slide.isBack = isBack;
            o.speed && slide.animationInit();
            slide.isBack ? _self.index-- : _self.index++;
            if (_self.index >= slide.imgLength || _self.index < 0) {
                if (slide.isBack) {
                    _self.index = slide.imgLength - 1;
                    ['-webkit-transition', 'transition'].forEach(function (attr) {
                        elm.imgBox.style[attr] = 'inherit';
                    });
                    ['-webkit-transform', 'transform'].forEach(function (attr) {
                        elm.imgBox.style[attr] = 'translate(' + -(slide.imgLength - 1) * slide.distances + 'px,0)';
                    });
                    setTimeout(function () {
                        ['-webkit-transition', 'transition'].forEach(function (attr) {
                            elm.imgBox.style[attr] = slide.transitionVal;
                        });
                        _self.index = slide.imgLength - 1;
                    }, 0);
                } else {
                    _self.index = '0';
                }
            } else {
                if (_self.index >= slide.imgLength - 1 || _self.index < 0) {
                    _self.point(0);
                } else {
                    _self.point(_self.index);
                }
            }
            ['-webkit-transform', 'transform'].forEach(function (attr) {
                elm.imgBox.style[attr] = 'translate(' + -_self.index * slide.distances + 'px,0)';
            });
        };
        this.point = function (index) {
            for (var i = 0, l = elm.imgChild.length; i < l; i++) {
                if (i == index) {
                    elm.pointList[i].setAttribute('class', 'on');
                } else {
                    elm.pointList[i].setAttribute('class', '');
                }
            }
        };
        this.touch = function () {
            var _this = this;
            this.startX = 0;
            this.endX = 0;
            slide.eventTouch.start = function () {
                _this.startX = event.changedTouches[0].clientX;
            };
            slide.eventTouch.end = function () {
                _this.endX = event.changedTouches[0].clientX;
                if (_this.endX - _this.startX > slide.distances / 4) {
                    _self.transition(_self.index, true);
                } else if (_this.endX - _this.startX < -slide.distances / 4) {
                    _self.transition(_self.index, false);
                }
            };
            elm.slideBox.addEventListener('touchstart', slide.eventTouch.start, false);
            elm.slideBox.addEventListener('touchend', slide.eventTouch.end, false);
        };
        this.destroy = function () {
            elm.btnBack.removeEventListener('touchend', slide.eventBack, false);
            elm.btnNext.removeEventListener('touchend', slide.eventNext, false);
            elm.slideBox.removeEventListener('touchstart', slide.eventTouch.start, false);
            elm.slideBox.removeEventListener('touchend', slide.eventTouch.end, false);
            elm.slideBox.removeEventListener('webkitTransitionEnd', slide.transitionCallback);
            clearInterval(slide.cleanAuto);
            o = elm = _self = slide = null;
        };
        this._init();
    };
    return Slider;
});