/**
 * 无缝滚动      1.0.0
 *
 * eg:
 *
 * // 初始化抽奖模块
 * var rolling = new Rolling({
 *     parentElm: document.getElementById('rolling'),
 *     direction: 'up',
 *     distance: 100,
 *     speed: 1000
 * });
 *
 * ps:
 *  1. parentElm [object] 容器元素,它的父级是写了溢出隐藏的元素容器
 *  2. direction [string] 滚动的方向,默认值为up
 *  3. distance [Number] 滚动距离,px为单位,默认值为1
 *  4. speed [Numerb] 滚动速度,ms为单位,默认值为30
 *
 */

(function (root, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function (require, exports, module) {
            return factory(root, {});
        });
    } else {
        root.Rolling = factory(root, {});
    }
})(this, function (root) {
    var Rolling = function (opts) {
        // 存储设置对象
        this._opts = opts;

        // 执行逻辑
        this._setting();
        this._bindHandler();
    };

    Rolling.prototype._setting = function () {
        var opts = this._opts;

        // 基本设置
        this.containerElm = opts.containerElm;    // 容器元素,写了溢出隐藏的元素(可不填,不填的话通过`this.parentElm`获取它的父节点)
        this.parentElm = opts.parentElm; // 父元素
        this.direction = opts.direction || 'up';  // 滚动方向
        this.distance = opts.distance || 1;  //步长,每次移动的距离
        this.speed = opts.speed || 30;  //触发间隔

        // 设置容器元素
        if (!this.containerElm) {
            this.containerElm = this.parentElm.parentNode;
        }
    };

    Rolling.prototype._bindHandler = function () {
        var self = this,
            timer = null,   // 计时器
            distance = 0,   // 移动的距离
            critical = 0,   // 临界值
            childNodes = [],    // 子节点集合
            firstChildNodes = null;   //第一个子节点

        var getChildNodes = function () {
            var ele = self.parentElm;
            var childArr = ele.children || ele.childNodes,  //兼容更多的浏览器
                childArrTem = [];  //  临时数组，用来存储符合条件的节点
            for (var i = 0, len = childArr.length; i < len; i++) {
                if (childArr[i].nodeType == 1) {
                    childArrTem.push(childArr[i]);
                }
            }
            return childArrTem;
        };

        childNodes = getChildNodes();

        self.parentElm.innerHTML += self.parentElm.innerHTML;

        firstChildNodes = getChildNodes()[0];

        if (self.direction == 'up' || self.direction == 'down') {
            self.parentElm.style.height = firstChildNodes.offsetHeight * childNodes.length * 2 + 'px';
            critical = firstChildNodes.offsetHeight * childNodes.length;
        }

        if (self.direction == 'left' || self.direction == 'right') {
            self.parentElm.style.width = firstChildNodes.offsetWidth * childNodes.length * 2 + 'px';
            critical = firstChildNodes.offsetWidth * childNodes.length;
        }

        timer = setInterval(function () {

            switch (self.direction) {
                case 'up':
                    if (distance <= 0) {
                        distance = critical;
                    }
                    distance -= self.distance;
                    self.parentElm.style.marginTop = -distance + 'px';
                    break;
                case 'down':
                    distance += self.distance;
                    self.parentElm.style.marginTop = -distance + 'px';
                    if (distance >= critical) {
                        distance = 0;
                    }
                    break;
                case 'left':
                    distance += self.distance;
                    self.parentElm.style.marginLeft = -distance + 'px';
                    if (distance >= critical) {
                        distance = 0;
                    }
                    break;
                case 'right':
                    if (distance <= 0) {
                        distance = critical;
                    }
                    distance -= self.distance;
                    self.parentElm.style.marginLeft = -distance + 'px';
                    break;
            }
        }, self.speed);
    };

    return Rolling;
});