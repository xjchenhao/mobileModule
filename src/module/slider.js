(function (root, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function (exports) {
            return factory(root, exports);
        });
    } else {
        root.Slider = factory(root, {});
    }
})(this, function (root, slider) {
    "use strict";
    var Slider = function (opts) {
        if (!opts.dom) {
            throw new Error("没有定义要插入的dom节点!");
        }
        if (!opts.data || !opts.data.length) {
            throw new Error("没有传入数据!");
        }
        this._opts = opts;
        this._setting();
        this._renderHTML();
        this._bindHandler();
    };
    /*初始设置*/
    Slider.prototype._setting = function () {
        var opts = this._opts;

        /*初始化user data*/
        this.wrap = opts.dom;                            //容器
        this.data = opts.data;                           //数据
        this.type = opts.type || 'pic';                  //焦点图类型
        this.isVertical = opts.isVertical || false;     //是否垂直
        this.duration = opts.duration || 2000;           //自动滑动时的间隔时间(毫秒)

        /*基本设置*/
        this.axis = this.isVertical ? 'Y' : 'X';
        this.width = this.wrap.clientWidth;
        this.height = this.wrap.clientHeight;
        this.ratio = this.height / this.width;
        this.scale = opts.isVertical ? this.height : this.width;
        this.sliderIndex = this.sliderIndex || 0;

        /*回调函数*/
        this.callback = {
            onslidestart: opts.onslidestart,      //触摸开始时
            onslideend: opts.onslideend,          //触摸结束时
            onslidemove: opts.onslidemove,        //触摸滑动过程中
            onslidechange: opts.onslidechange     //切换前
        };

        /*数量决定是否切换*/
        if (this.data.length < 2) {
            this.isLooping = false;             //循环播放
            this.isAutoplay = false;            //自动播放
        } else {
            this.isLooping = opts.isLooping || false;
            this.isAutoplay = opts.isAutoplay || false;
        }

        /*是否自动切换*/
        if (this.isAutoplay) {
            this.play();
        }
        /*todo：挂载第一张和最后的回弹*/
        //this._setUpDamping();
        /*动画类型*/
        this._animateFunc = (opts.animateType in this._animateFuncs) ? this._animateFuncs[opts.animateType] : this._animateFuncs['default'];
        /*防止安卓在转出后也自动播放*/
        this._setPlayWhenFocus();
    };
    /*生成图片列表*/
    Slider.prototype._renderHTML = function () {
        var outer, i, li;
        /*生成或获取ul节点*/
        if (this.outer) {
            this.outer.innerHTML = '';
            outer = this.outer;
        } else {
            outer = document.createElement('ul');
        }

        this.els = [];          //元素数组，用来进行后期的置换操作
        for (i = 0; i < 3; i++) {
            li = document.createElement('li');
            li.style['width'] = this.width + 'px';
            li.style['height'] = this.height + 'px';
            this._animateFunc(li, this.axis, this.scale, i, 0);
            this.els.push(li);      //把元素推入this.els数组
            outer.appendChild(li);
            if (this.isVertical && (this._opts.animateType == 'rotate' || this._opts.animateType == 'flip')) {
                li.innerHTML = this._renderItem(1 - i + this.sliderIndex);  //todo:rotate和flip状态的动画待写，这里的dom生成逻辑不一样
            } else {
                li.innerHTML = this._renderItem(i - 1 + this.sliderIndex);
            }
        }
        /*ul节点插入到容器中*/
        if (!this.outer) {
            this.outer = outer;
            this.wrap.appendChild(outer);
        }
    };
    /*插入li的内容*/
    Slider.prototype._renderItem = function (i) {
        var item, html;
        var len = this.data.length;
        if (!this.isLooping) {
            item = this.data[i] || {empty: true};
        } else {
            if (i < 0) {
                item = this.data[len + i];
            } else if (i > len - 1) {
                item = this.data[i - len];
            } else {
                item = this.data[i];
            }
        }
        if (item.empty) {
            return '';
        }
        if (this.type === 'pic') {
            html = item.height / item.width > this.ratio
                ? '<img height="' + this.height + '" src="' + item.content + '">'
                : '<img width="' + this.width + '" src="' + item.content + '">';
        } else if (this.type = 'dom') {
            //todo:插入dom后面待补充
        } else if (this.type === 'overspread') {
            //todo:插入背景图片后面待补充
        }
        return html;
    };
    /*元素定位and动画*/
    Slider.prototype._animateFuncs = {
        'default': function (dom, axis, scale, i, offset) {
            dom.style.webkitTransform = 'translateZ(0) translate' + axis + '(' + (offset + scale * (i - 1)) + 'px)';
        }
        //todo:切它动画类别待补充
    };
    /*主逻辑*/
    Slider.prototype._slide = function (n) {
        var data = this.data,
            els = this.els,
            idx = this.sliderIndex + n;
        if (data[idx]) {
            this.sliderIndex = idx;
        } else {
            if (this.isLooping) {
                this.sliderIndex = n > 0 ? 0 : data.length - 1;
            } else {
                n = 0;
            }
        }
        /*置换dom*/
        var sEle;
        if (this.isVertical) {
            //todo:rotate和flip动画垂直的处理
        } else {
            if (n > 0) {
                sEle = els.shift();
                els.push(sEle);
            } else if (n < 0) {
                sEle = els.pop();
                els.unshift(sEle);
            }
        }
        /*置换位置的dom禁止动画*/
        if (n !== 0) {
            sEle.innerHTML = this._renderItem(idx + n);
            sEle.style.webkitTransition = 'none';
            sEle.style.visibility = 'hidden';

            setTimeout(function () {
                sEle.style.visibility = 'visible';
            }, 200);

            this.callback.onslidechange && this.callback.onslidechange(this.sliderIndex);
        }

        /*li通过样式置换顺序*/
        for (var i = 0; i < 3; i++) {
            if (els[i] !== sEle) {
                els[i].style.webkitTransition = 'all .3s ease';
            }
            this._animateFunc(els[i], this.axis, this.scale, i, 0);
        }
        /*是否需要停止自动播放*/
        if (this.isAutoplay) {
            if (this.sliderIndex === data.length - 1 && !this.isLooping) {
                this.pause();
            }
        }
    };
    /*事件绑定*/
    Slider.prototype._bindHandler = function () {
        var self = this,
            isMoving = false,         //是否在触摸过程中
            outer = this.outer,
            hasTouch = (function () {
                return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
            })();
        this.touch = {
            hasTouch: hasTouch,
            startEvt: hasTouch ? 'touchstart' : 'mousedown',
            moveEvt: hasTouch ? 'touchmove' : 'mousemove',
            endEvt: hasTouch ? 'touchend' : 'mouseup',
            sizeEvt: hasTouch ? 'orientationchange' : 'resize'
        };
        this.event = {
            start: function (evt) {
                evt.preventDefault();
                self.pause();
                isMoving = true;
                self.callback.onslidestart && self.callback.onslidestart();
                /*记录开始时间和坐标*/
                self.startTime = new Date().getTime();
                self.startX = self.touch.hasTouch ? evt.targetTouches[0].pageX : evt.pageX;
                self.startY = self.touch.hasTouch ? evt.targetTouches[0].pageY : evt.pageY;
            },
            move: function (evt) {
                if (isMoving) {
                    evt.preventDefault();
                    self.onslide && self.onslide();
                    var axis = self.axis,
                        currentPoint = self.touch.hasTouch ? evt.targetTouches[0]['page' + axis] : evt['page' + axis],
                        offset = currentPoint - self['start' + axis];
                    /*todo:开头结尾的回弹*/
                    if (!self.isLooping) {
                        if (offset > 0 && self.sliderIndex === 0 || offset < 0 && self.sliderIndex === self.data.length - 1) {
                            //offset = self._damping(offset);
                        }
                    }
                    /*根据offset，位置调整*/
                    for (var i = 0; i < 3; i++) {
                        var item = self.els[i];
                        item.style.webkitTransition = 'all 0s';
                        self._animateFunc(item, axis, self.scale, i, offset);
                    }
                    self.callback.onslidemove && self.callback.onslidemove();
                    self.offset = offset;       //记录偏移量
                }
            },
            end: function (evt) {
                evt.preventDefault();
                isMoving = false;
                var boundary = self.scale / 2,                               //切换的临界值
                    metric = self.offset,                                    //获取偏移量
                    endTime = new Date().getTime();                         //结束时的时间
                boundary = endTime - self.startTime > 300 ? boundary : 14;   //即使是快速切换也要距离大于14

                /*执行主逻辑置换顺序*/
                if (metric >= boundary) {
                    self._slide(-1);
                } else if (metric < -boundary) {
                    self._slide(1);
                } else {
                    self._slide(0);
                }
                self.isAutoplay && self.play();             //开启自动播放
                self.offset = 0;                            //偏移量归零
                self.callback.onslideend && self.callback.onslideend();
            },
            orientation: function (evt) {
                //setTimeout(function () {
                self.reset();
                //}, 100);
            }
        };
        outer.addEventListener(self.touch.startEvt, self.event.start);
        outer.addEventListener(self.touch.moveEvt, self.event.move);
        outer.addEventListener(self.touch.endEvt, self.event.end);
        window.addEventListener(self.touch.sizeEvt, self.event.orientation);
    };
    /*禁止安卓不在当前页面也自动播放*/
    Slider.prototype._setPlayWhenFocus = function () {
        var self = this;
        window.addEventListener('focus', function () {
            self.isAutoplay && self.play();
        }, false);
        window.addEventListener('blur', function () {
            self.pause();
        }, false);

    };
    /*自动播放*/
    Slider.prototype.play = function () {
        var self = this;
        clearInterval(this.autoPlayTimer);
        this.autoPlayTimer = setInterval(function () {
            self._slide(1);
        }, self.duration);
    };
    /*清除计时器*/
    Slider.prototype.pause = function () {
        clearInterval(this.autoPlayTimer);
    };
    //重置
    Slider.prototype.reset = function () {
        this.pause();
        this._setting();
        this._renderHTML();
        this.isAutoplay && this.play();
    };
    /*内存回收*/
    Slider.prototype.destroy = function () {
        var self = this,
            outer = this.outer;
        this.pause();
        outer.removeEventListener(self.touch.startEvt, self.event.start);
        outer.removeEventListener(self.touch.moveEvt, self.event.move);
        outer.removeEventListener(self.touch.endEvt, self.event.end);
        window.removeEventListener(self.touch.sizeEvt, self.event.orientation);
    };
    return Slider;
});
