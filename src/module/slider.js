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
        //this._bindHandler();    //todo:绑定事件
    };
    Slider.prototype._setting = function () {
        var opts = this._opts;

        /*初始化user data*/
        this.wrap = opts.dom;                              //容器
        this.data = opts.data;                             //数据
        this.type = opts.type || 'pic';                  //焦点图类型,支持dom和pic
        this.isVertical = opts.isVertical || false;     //是否垂直
        this.duration = opts.duration || 2000;           //自动滑动时的间隔时间(毫秒)

        /*基本设置*/
        this.axis = this.isVertical ? 'Y' : 'X';
        this.width = this.wrap.clientWidth;
        this.height = this.wrap.clientHeight;
        this.ratio = this.height / this.width;
        this.scale = opts.isVertical ? this.height : this.width;
        this.sliderIndex = this.sliderIndex || 0;

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
    return Slider;
});