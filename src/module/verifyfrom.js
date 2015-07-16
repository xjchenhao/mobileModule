/* 表单验证    2.0.0*/

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
                return errorMsg;
            }
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
    };

    /*********************** Validator类 ***********************/
    var Validator = function () {
        this.cache = [];
    };

    Validator.prototype.add = function (dom, rules) {
        var self = this;

        for (var i = 0, rule; rule = rules[i++];) {
            (function (rule) {
                self.cache.push(function () {
                    var strategAry = rule.strategy.split(':'),
                        strategy = strategAry.shift();  // 取出规则名

                    strategAry.unshift(dom.value);  // 放入元素的值
                    if (strategy !== 'serverVerify') {
                        strategAry.push(rule.errorMsg);  // 放入错误信息
                    } else {
                        strategAry.push(rule.requestFunc);  // 放入错误信息
                    }
                    return strategies[strategy].apply(dom, strategAry);
                });
            }(rule));
        }
    };

    Validator.prototype.start = function () {
        for (var i = 0, validatorFunc; validatorFunc = this.cache[i++];) {
            var errorMsg = validatorFunc();
            if (errorMsg) {
                return errorMsg;
            }
        }
    };

    return Validator;
});