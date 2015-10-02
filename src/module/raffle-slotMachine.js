/**
 * 抽奖-老虎机      1.2.0
 *
 * eg:
 *
 * // 初始化抽奖模块
 *var raffle = new slotMachine({
 *    awardsArr: [elm0,elm1,elm2],  //必填,循环的元素数组,按顺序点亮
 *    cycleIndex: 2 //选填,开始定位到目标元素之前的旋转次数,默认为'2'
 *    currentClass:'on' // 选填,选中元素的class样式,默认为'on'
 *});
 *
 * // 运行抽奖模块
 * raffle.run(targetNumber,callback);   // 第一个参数是目标元素的id(必填),第二个参数是本次抽奖结束后的回调函数(选填)
 *
 * ps:
 *  1. html上参与抽奖的元素节点上需要增加一个增强属性'data-id'做奖品id
 *
 */

(function (root, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function (require, exports, module) {
            return factory(root,{});
        });
    } else {
        root.Raffle = factory(root,{});
    }
})(this, function (root) {

    var Raffle = function (opts) {
        this._opts = opts;
        this._setting();
    };
    Raffle.prototype._setting = function () {
        var opts = this._opts;

        //初始化user data
        this.awardsArr = opts.awardsArr;
        this.cycleIndex = opts.cycleIndex || 2;
        this.currentClass=opts.currentClass || 'on';

    };

    Raffle.prototype._startIndex = 0; //起始奖项

    Raffle.prototype.run = function (awardsId, fn) {
        var self = this,
            awardsArr = self.awardsArr,   //奖项数组
            awardsArrLength = awardsArr.length, //奖品个数
            currentAwards = self._startIndex,    //当前选中的奖品
            circle = '';  //转盘计时器

        var raffle = {
            awardsArr: awardsArr,  // 奖项数组
            cycleIndex: self.cycleIndex,  //循环次数

            highlight: function (index) {       //奖项高亮显示
                for (var i = 0; i < awardsArrLength; i++) {
                    if (i !== index) {
                        self._removeClass.call(null, awardsArr[i], self.currentClass);
                    } else {
                        self._addClass.call(null, awardsArr[i], self.currentClass);
                    }
                }
            },
            cycle: function () {  //奖项循环
                if (currentAwards < awardsArrLength) {
                    raffle.highlight(currentAwards);
                    currentAwards++;

                } else {
                    currentAwards = 0;
                }
                if (self._startIndex == currentAwards) {
                    this.cycleEnd();
                }
            },
            cycleEnd: function () {    //判断高亮循环结束
                this.cycleIndex--;
                if (this.cycleIndex <= 0) {
                    clearInterval(circle);
                    for (var i = 0; i < awardsArrLength; i++) {
                        if (awardsArr[i].getAttribute('data-id') == awardsId) {
                            this.result(i);
                            self._startIndex = i;
                            return false;
                        }
                    }
                }
            },
            result: function (val) { // 最终高亮定位

                var index = self._startIndex,   //当前index
                    step = (function () {  //常规动画结束后距离目标的步长
                        if (val - index > 0) {
                            return val - index;
                        } else {
                            return awardsArrLength - Math.abs(val - index);
                        }
                    }()),
                    accelerate = function () {
                        setTimeout(function () {
                            if (index < awardsArrLength) {
                                raffle.highlight(index);
                                index++;

                            } else {
                                raffle.highlight(0);
                                index = 1;
                            }

                            if (step > 0) {
                                step--;
                                accelerate();
                            } else {
                                raffle.highlight(val);
                                setTimeout(function () {
                                    fn & fn();
                                }, 1000);
                                return false;
                            }
                        }, (awardsArrLength - step) * 100);

                    };

                accelerate();
            }
        };

        circle = setInterval(function () {
            raffle.cycle()
        }, 100);

    };

    Raffle.prototype._removeClass = function (obj, cls) {
        var targetObj = this.isErrorOnParent ? obj.parentElement : obj;
        if (targetObj.className && typeof cls === 'string' && targetObj.nodeType === 1) {
            var classArr = targetObj.className.split(' ');
            for (var i = 0, iLength = classArr.length; i < iLength; i++) {
                if (classArr[i] === cls) {
                    classArr.splice(i, 1);
                }
            }
            targetObj.className = classArr.join(' ');
        }
    };

    Raffle.prototype._addClass = function (obj, cls) {
        var targetObj = this.isErrorOnParent ? obj.parentElement : obj;
        if (typeof cls == 'string' && targetObj.nodeType === 1) {
            if (!targetObj.className) {
                targetObj.className = cls;
            } else {
                var a = (targetObj.className + ' ' + cls).match(/\S+/g);
                a.sort();
                for (var i = a.length - 1; i > 0; --i)
                    if (a[i] == a[i - 1]) a.splice(i, 1);
                targetObj.className = a.join(' ');
            }
        }
    };
    return function (opts) {

        //确保该函数作为构造函数被调用
        if (!(this instanceof Raffle)) {
            return new Raffle(opts);
        } else {
            return Raffle;
        }
    };
});