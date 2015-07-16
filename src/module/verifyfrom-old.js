/* 表单验证    1.0.0*/

(function (root, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function (exports) {
            return factory(root, exports);
        });
    } else {
        root.verifyfrom = factory(root, {});
    }
})(this, function (root, slider) {
    var verifyfrom = function (formId, opts) {
        if (document.getElementById(formId)) {
            this.formBox = document.getElementById(formId);
        }else{
            //throw new Error("请设置表单容器id");
            this.formBox = document;
        }
        this._opts = opts;
        this._setting();
        this._bindHandler();
    };
    verifyfrom.prototype._setting = function () {
        var pointer = this,
            opts = pointer._opts || {};

        /*初始化user data*/
        this.isVerify = opts.isVerify || 'required'; 		    //需要校验的表单项
        this.correctStyle = opts.correctStyle || 'correct'; 	//正确添加的样式
        this.errorStyle = opts.errorStyle || 'error';		    //错误添加的样式
        this.isErrorOnParent = opts.isErrorOnParent || false; //是否作用到父级
        this.isRemoveVerify = opts.isRemoveVerify || true;    //是否移出表单元素进行验证
        this.errorAfter = opts.errorAfter || '';				//校验错误以后触发的行为
        this.correctAfter = opts.correctAfter || '';			//校验正确以后触发的行为
        this.before = opts.before || '';					    //表单校验之前，一般用做插件拓展
        this.after = opts.after || '';					        //表单校验之后，返回为true时才提交表单

        /*替换校验规则*/
        if (opts.rule) {
            for (var i in opts.rule) {
                for (var j in opts.rule[i]) {
                    pointer._rule[i][j] = opts.rule[i][j];
                }
            }
        }
        /*表单校验之前，一般用做插件拓展*/
        this.before && this.before(this);
    };
    verifyfrom.prototype.verifyInput = function (obj) {
        var pointer = this,
            reg = obj.getAttribute('pattern'),
            ajaxState = false,
            verifyType = obj.getAttribute('data-type') || obj.getAttribute('type');
        reg=reg && new RegExp('^' + reg + '$');
        //根据type校验相应的格式
        switch (verifyType) {
            case 'mail':
                if (!obj.value) {
                    pointer.error(obj, '请输入邮箱');
                    return false;
                }
                //格式
                reg = reg || pointer._rule.mail.reg;
                if (!reg.test(obj.value)) {
                    pointer.error(obj, '邮箱格式错误');
                    return false;
                }
                //是否存在
                if (pointer._rule.mail.isAjax) {
                    $.ajax({
                        type: 'POST',
                        url: pointer._rule.mail.ajaxUrl,
                        data: 'mail=' + obj.value,
                        dataType: 'json',
                        async: false,
                        success: function (state) {
                            if (pointer._rule.mail.ajaxCallback) {
                                pointer._rule.mail.ajaxCallback(state);
                            } else {
                                ajaxState = state ? false : true;
                            }
                        }
                    });
                    if (ajaxState) {
                        pointer.error(obj, '该邮箱已存在');
                        return false;
                    } else {
                        pointer.correct(obj);
                        return true;
                    }
                }else{
                    pointer.correct(obj);
                    return true;
                }
                break;
            case 'phone':
                if (!obj.value) {
                    pointer.error(obj, '请输入手机号');
                    return false;
                }
                //格式
                reg = reg || pointer._rule.phone.reg;
                if (!reg.test(obj.value)) {
                    pointer.error(obj, '手机格式错误');
                    return false;
                }
                //是否存在
                if (pointer._rule.phone.isAjax) {
                    $.ajax({
                        type: 'POST',
                        url: pointer._rule.phone.ajaxUrl,
                        data: 'phone=' + obj.value,
                        dataType: 'json',
                        async: false,
                        success: function (state) {
                            if (pointer._rule.phone.ajaxCallback) {
                                pointer._rule.phone.ajaxCallback(state);
                            } else {
                                ajaxState = state ? false : true;
                            }
                        }
                    });
                    if (ajaxState) {
                        pointer.error(obj, '该手机已存在');
                        return false;
                    } else {
                        pointer.correct(obj);
                        return true;
                    }
                }else{
                    pointer.correct(obj);
                    return true;
                }
                break;
            case 'mailTel':
                if (!obj.value) {
                    pointer.error(obj, '请输入手机或邮箱');
                    return false;
                }
                //格式
                var regMail = pointer._rule.mail.reg;
                var regTel = pointer._rule.phone.reg;
                if (!regTel.test(obj.value) && !regMail.test(obj.value)) {
                    pointer.error(obj, '请输入正确的手机或邮箱号');
                    return false;
                }
                //是否存在
                if (regMail.test(obj.value)) {
                    if (pointer._rule.mail.isAjax) {
                        $.ajax({
                            type: 'POST',
                            url: pointer._rule.mail.ajaxUrl,
                            data: 'mail=' + obj.value,
                            dataType: 'json',
                            async: false,
                            success: function (state) {
                                if (pointer._rule.mail.ajaxCallback) {
                                    pointer._rule.mail.ajaxCallback(state);
                                } else {
                                    ajaxState = state ? false : true;
                                }
                            }
                        });
                        if (ajaxState) {
                            pointer.error(obj, '该邮箱已存在');
                            return false;
                        } else {
                            pointer.correct(obj);
                            return true;
                        }
                    } else {
                        pointer.correct(obj);
                        return true;
                    }
                } else {
                    if (pointer._rule.phone.isAjax) {
                        $.ajax({
                            type: 'POST',
                            url: pointer._rule.phone.ajaxUrl,
                            data: 'phone=' + obj.value,
                            dataType: 'json',
                            async: false,
                            success: function (state) {
                                if (pointer._rule.phone.ajaxCallback) {
                                    pointer._rule.phone.ajaxCallback(state);
                                } else {
                                    ajaxState = state ? false : true;
                                }
                            }
                        });
                        if (ajaxState) {
                            pointer.error(obj, '该手机已存在');
                            return false;
                        } else {
                            pointer.correct(obj);
                            return true;
                        }
                    } else {
                        pointer.correct(obj);
                        return true;
                    }
                }
                break;
            case 'userName':
                if (!obj.value) {
                    pointer.error(obj, '用户名不能为空');
                    return false;
                }
                //长度
                var userNameMinLen = obj.getAttribute('min') || pointer._rule.userName.minLength,
                    userNameMaxLen = obj.getAttribute('max') || pointer._rule.userName.maxLength,
                    userNameLen = pointer.strLength(obj.value);
                if (userNameLen < userNameMinLen || userNameLen > userNameMaxLen) {
                    pointer.error(obj, '用户名长度只能在' + userNameMinLen + '-' + userNameMaxLen + '位字符之间，中文算两个字符');
                    return false;
                }
                //格式
                reg = reg || pointer._rule.userName.reg;
                if (!reg.test(obj.value)) {
                    pointer.error(obj,'用户名由中文、英文字母、数字、下划线组成,且不能为纯数字');
                    return false;
                }
                //是否存在
                if (pointer._rule.userName.isAjax) {
                    $.ajax({
                        type: 'POST',
                        url: pointer._rule.userName.ajaxUrl,
                        data: 'userName=' + obj.value,
                        dataType: 'json',
                        async: false,
                        success: function (state) {
                            if (pointer._rule.userName.ajaxCallback) {
                                pointer._rule.userName.ajaxCallback(state);
                            } else {
                                ajaxState = state ? false : true;
                            }
                        }
                    });
                    if (ajaxState) {
                        pointer.error(obj, '用户名已存在');
                        return false;
                    } else {
                        pointer.correct(obj);
                        return true;
                    }
                } else {
                    pointer.correct(obj);
                    return true;
                }
                break;
            case 'password':
                if (!obj.value) {
                    pointer.error(obj, '密码不能为空');
                    return false;
                }
                //长度
                var passwordMinLen = obj.getAttribute('min') || pointer._rule.password.minLength,
                    passwordMaxLen = obj.getAttribute('max') || pointer._rule.password.maxLength;
                if (!(obj.getAttribute('affirm')||obj.getAttribute('affirm')==='')) {
                    if (pointer.strLength(obj.value) < passwordMinLen || pointer.strLength(obj.value) > passwordMaxLen) {
                        pointer.error(obj, '密码长度只能在' + passwordMinLen + '-' + passwordMaxLen + '位字符之间');
                        return false;
                    }
                } else {
                    var contrastObj = obj.id.replace(/\d/g, '');
                    if (document.getElementById(contrastObj).value !== obj.value) {
                        pointer.error(obj, '密码输入不一致');
                        return false;
                    }
                }
                pointer.correct(obj);
                return true;
                break;
            default:
                pointer.correct(obj);
                return true;
        }
    };
    verifyfrom.prototype._rule = {
        mail: {
            'isAjax': false,
            'ajaxUrl': 'ajax/boole_true.txt',
            'ajaxCallback': '',
            'reg': /^(\w+(?:[\.|\-]\w+)*)\@([A-Za-z0-9]+(?:[\.|\-][A-Za-z0-9]+)*)\.([A-Za-z0-9]+)$/
        },
        phone: {
            'isAjax': false,
            'ajaxUrl': 'ajax/boole_true.txt',
            'ajaxCallback': '',
            'reg': /^((13[0-9]{9})|(14[0-9]{9})|(15[0-35-9][0-9]{8})|(17[0-9]{9})|(18[0-9]{9}))$/
        },
        userName: {
            'minLength': 7,
            'maxLength': 12,
            'isAjax': false,
            'ajaxUrl': 'ajax/boole_true.txt',
            'ajaxCallback': '',
            'reg': /^([a-zA-Z_\u4e00-\u9fa5]+)(\d+)([a-zA-Z_\u4e00-\u9fa5]+)*|(\d+)([a-zA-Z_\u4e00-\u9fa5]+)(\d+)*$/
        },
        password: {
            'minLength': 8,
            'maxLength': 20
        }
    };
    verifyfrom.prototype._bindHandler = function () {
        var pointer = this,
            input = pointer.formBox.getElementsByTagName('input');  //input表单列表
        if(pointer.isRemoveVerify){
            for (var i = 0, iLength = input.length; i < iLength; i++) {
                input[i].onblur = function () {
                    if (pointer.eval(input[i].getAttribute('data-required'))) {
                        pointer.verifyInput(this);
                    }
                }
            }
        }
    };
    verifyfrom.prototype.run = function () {
        var pointer = this,
            input = this.formBox.getElementsByTagName('input');
        for (var i = 0, iLength = input.length; i < iLength; i++) {
            if (pointer.eval(input[i].getAttribute('data-required'))) {
                if (!pointer.verifyInput(input[i])) {
                    return false;
                }
            }
        }
        return true;
    };
    verifyfrom.prototype.eval = function (val) {
        return !!(new Function("return "+ val))();
    };
    verifyfrom.prototype.correct = function (obj) {
        this.removeClass(obj,this.errorStyle);
        this.addClass(obj,this.correctStyle);
        this.correctAfter && this.correctAfter(obj);
    };
    verifyfrom.prototype.error = function (obj, str) {
        this.removeClass(obj,this.correctStyle);
        this.addClass(obj,this.errorStyle);
        this.errorAfter && this.errorAfter(obj, str);
    };
    verifyfrom.prototype.addClass = function (obj, cls) {
        var targetObj =this.isErrorOnParent?obj.parentElement:obj;
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
    verifyfrom.prototype.removeClass = function (obj, cls) {
        var targetObj =this.isErrorOnParent?obj.parentElement:obj;
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
    verifyfrom.prototype.strLength = function (str) {
        var len = 0,
            a = str.split('');
        for (var i = 0; i < a.length; i++) {
            if (a[i].charCodeAt(0) < 299) {
                len++;
            } else {
                len += 2;
            }
        }
        return len;
    };
    verifyfrom.prototype.destroy = function () {
        //释放内存
    };
    return function(formId, opts){
        //确保该函数作为构造函数被调用
        if(!(this instanceof verifyfrom)){
            return new verifyfrom(formId, opts);
        }else{
            return verifyfrom;
        }
    };



});