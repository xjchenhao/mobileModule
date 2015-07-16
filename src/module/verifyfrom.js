/* 表单验证    2.1.0*/

(function (root, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function (exports) {
            return factory(root, exports);
        });
    } else {
        root.Verifyfrom = factory(root, {});
    }
})(this, function (root, Verifyfrom) {

    /*********************** 策略对象 ***********************/
    var strategies = {
            isNonEmpty: function (value, errorMsg) {
                if (value === '') {
                    failure(this, errorMsg);
                    return errorMsg;
                }
                succeed(this);
            },
            minLength: function (value, length, errorMsg) {
                if (value.length < length) {
                    return errorMsg;
                }
            },
            maxLength: function (value, length, errorMsg) {
                if (value.length > length) {
                    return errorMsg;
                }
            },
            isReg: function (value, reg, errorMsg) {
                var reg = new RegExp(reg);
                if (!reg.test(value)) {
                    return errorMsg;
                }
            },
            serverVerify: function (value, requestFunc) {
                var errorMsg = requestFunc(value);
                if (errorMsg) {
                    return errorMsg;
                }
            }
        },
        succeed = null,
        failure = null;

    var Validator = function (obj) {
        this.domCache = [];
        this.funcCache = [];
        this.isBlurVerify = obj.isBlurVerify || false;
        this.succeed = succeed = obj.succeed || null;
        this.failure = failure = obj.failure || null;
    };

    Validator.prototype.add = function (dom, rules) {
        var self = this;

        for (var i = 0, rule; rule = rules[i++];) {
            (function (rule) {
                var verifyFunc = function () {
                    var strategAry = rule.strategy.split(':'),
                        strategy = strategAry.shift();  // 取出规则名

                    strategAry.unshift(dom.value);  // 放入元素的值
                    if (strategy !== 'serverVerify') {
                        strategAry.push(rule.errorMsg);  // 放入错误信息
                    } else {
                        strategAry.push(rule.requestFunc);  // 放入错误信息
                    }
                    return strategies[strategy].apply(dom, strategAry);
                };
                if (self.isBlurVerify) {
                    dom.addEventListener('blur', function () {
                        return verifyFunc();
                    }, false);

                    if (!self._inArray(dom, self.domCache)) {
                        self.domCache.push(dom);
                    }
                }
                self.funcCache.push(verifyFunc);
            }(rule));
        }
    };

    Validator.prototype.start = function () {
        if (this.isBlurVerify) {
            for (var i = 0, dom; dom = this.domCache[i++];) {
                this._trigger(dom);
            }
        } else {
            for (var i = 0, validatorFunc; validatorFunc = this.funcCache[i++];) {
                var errorMsg = validatorFunc();
                if (errorMsg) {
                    return errorMsg;
                }
            }
        }
    };

    Validator.prototype._inArray = function (needle, array) {
        for (var i in array) {
            if (needle === array[i]) {
                return true;
            }
        }
        return false;
    };

    Validator.prototype._trigger = function (obj) {
        var event = document.createEvent('MouseEvents');
        event.initMouseEvent('blur', true, true, document.defaultView, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        obj.dispatchEvent(event);
    };

    return Validator;
});