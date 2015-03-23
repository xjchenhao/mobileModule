/**
 * 资源预加载      1.0.0
 *
 */
(function (root, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function (exports) {
            return factory(root, exports);
        });
    } else {
        root.PreLoad = factory(root, {});
    }
})(this, function (root, preLoad) {
    "use strict";
    var PreLoad = function (opts, callback) {
        this._opts = opts;
        this._callback = callback;
        this._setting();
    };
    PreLoad.prototype._setting = function () {
        var self = this,
            opts = self._opts || {};
        this.resource = opts.resource || [];       //预加载资源url
        this.loadType = {                        //预加载加载的文件类型
            'style': 'css',
            'script': 'js',
            'image': ['png', 'jpg', 'gif']
        };
        this.load();
    };
    PreLoad.prototype.load = function () {
        var self = this,
            loadLength = 0;
        this.loadNumber = 0;
        loadLength = self.resource.length;
        self.resource.forEach(function (url) {
            switch (judgementType(url)) {
                case 'style' :
                    console.log('样式表');
                    break;
                case 'script' :
                    console.log('js表');
                    break;
                case 'image' :
                    console.log('图片');
                    break;
                default:
                    console.log(judgementType(url));
                    break;
            }
        });
        function judgementType(url) {
            var loadType = self.loadType,
                regType = /^.*\.(\w+)$/g,        //截取url后缀正则
                fileSuffix = '';                  //截取url后缀
            url.match(regType);
            fileSuffix = RegExp.$1;
            for (var type in loadType) {
                if (loadType[type] instanceof Array) {
                    for (var i = 0, l = loadType[type].length; i < l; i++) {
                        if (loadType[type][i] === fileSuffix) return type;
                    }
                } else {
                    if (loadType[type] === fileSuffix) return type;
                }
            }
        }

        function calcNumber() {
            self.loadNumber++;
            if (self.loadNumber == loadLength) {
                self._callback();
            }
        }
    };
    PreLoad.prototype.destroy = function () {
    };
    //确保该函数作为构造函数被调用
    return function (opts, callback) {
        if (!(this instanceof PreLoad)) {
            return new PreLoad(opts, callback);
        } else {
            return PreLoad;
        }
    };
});
