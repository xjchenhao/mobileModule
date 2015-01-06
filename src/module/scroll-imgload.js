/**
 * scroll-imgload图片滚动加载      1.0.2
 * eg:
 *
 * <ul>
 *     <li><img data-src="image/img-load1.jpg" src="image/placeholder-img.gif" alt=""></li>
 *     <li><img data-src="image/img-load2.jpg" src="image/placeholder-img.gif" alt=""></li>
 *     <li><img data-src="image/img-load3.jpg" src="image/placeholder-img.gif" alt=""></li>
 *     <li><img data-src="image/img-load4.jpg" src="image/placeholder-img.gif" alt=""></li>
 *     <li><img data-src="image/img-load5.jpg" src="image/placeholder-img.gif" alt=""></li>
 * </ul>
 * var ImgLoad = new ImgLoad({
 *    ele: document.querySelectorAll("ul img"),
 *    attr: 'data-src',
 *    container: window,
 *    callback: ''
 * });
 * //ImgLoad.destroy();        //销毁类，内存回收
 * Ps:
 *  ele              elementList，哪些图片需要懒加载（必填）
 *  attr             string，存储图片真实地址的增强属性(默认data-src)
 *  container        elementObj，是什么容器在滚动
 *  callback         function，执行图片加载后的回调函数(一个参数，当前的图片节点对象)
 *  destroy          function，销毁对象内存回收
 */
(function (root, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function (exports) {
            return factory(root, exports);
        });
    } else {
        root.ImgLoad = factory(root, {});
    }
})(this, function (root, slider) {
    var ImgLoad = function (opts) {
        this._opts = opts;
        this._setting();
        this._bindHandler();
    };
    ImgLoad.prototype._setting = function () {
        var opts = this._opts;

        /*初始化user data*/
        this.ele = opts.ele;
        this.attr = opts.attr;
        this.container = opts.container;
        this.callback = opts.callback;

        /*数据存储*/
        ImgLoad.cache = [];
        for (var i = 0, l = this.ele.length; i < l; i++) {
            var oThis = this.ele[i],
                node = oThis.nodeName.toLowerCase(),
                url = oThis.getAttribute(this.attr);
            var data = {
                node: oThis,
                tag: node,
                url: url
            };
            ImgLoad.cache.push(data);
        }
        this.boxHeight = this.container === window ?
            this.container.innerHeight :
            this.container.clientHeight;
    };
    ImgLoad.prototype._bindHandler = function () {
        var self = this,
            isMoving = 0,              //是否在触摸过程中
            scrollTop = post = posb = 0;
        var hasTouch = (function () {
            return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
        })();
        this.event = {
            start: function (e) {
                clearTimeout(isMoving);
            },
            end: function (e) {
                isMoving = setTimeout(function () {
                    self.event.scroll();
                }, 300);
            },
            scroll: function (e) {
                var attr='';
                ImgLoad.cache.forEach(function (data) {
                    if (data.node) {
                        scrollTop = self.container === window ?
                            self.container.scrollY :
                            self.container.scrollTop;
                        post = data.node.offsetTop - scrollTop;
                        posb = post + data.node.clientHeight;
                        if (post >= 0 && post < self.boxHeight || posb > 0 && posb <= self.boxHeight) {
                            if (data.tag === 'img') {
                                data.node.setAttribute('src', data.url);
                                this.callback && this.callback(data.node);
                            }else{
                                attr=data.node.getAttribute('style') ?
                                    data.node.getAttribute('style')+';':
                                    '';
                                data.node.setAttribute('style', attr+'background-image:url('+data.url+')');
                                this.callback && this.callback(data.node);
                            }
                            data.node = null;
                        }
                    }
                });
            }
        };
        if (hasTouch) {
            self.container.addEventListener('touchstart', self.event.start, false);
            self.container.addEventListener('touchend', self.event.end, false);
        } else {
            self.container.addEventListener('scroll', self.event.scroll, false);
        }
        self.event.scroll();
    };
    ImgLoad.prototype.destroy = function () {
        var self = this;
        self.container.removeEventListener('touchstart', self.event.start, false);
        self.container.removeEventListener('touchend', self.event.end, false);
        self.container.removeEventListener('scroll', self.event.scroll, false);
    };
    return ImgLoad;
});