/**
 * Hybrid交互      1.0.0
 * 此模块用来与原生app进行交互
 * 暴露出去一个方法，调用方式如下：
 * requestHybrid({
 *     tagName: 'getUrl',
 *     data: {
 *         url: 'ensure.html'
 *     },
 *     callback:function(){
 *          alert('123');
 *     }
 * });
 * 最后生成与原生通信的url并发送请求：`qian://submit?callback=hybrid_1427422528529&url=ensure.html`
 * 原生那边根据这个url，截取前面的tagName知道要做什么，然后再去拿后面需要的参数。注意：参数中的hybrid_1427422528529是暴露给原生的函数，以供原生调用网页函数，调用方式为window.Hybrid[hybrid_1427422528529]。（它是根据调用时的callback自动生成的函数名，并带上了时间戳）
 */
(function (root, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function (exports) {
            return factory(root, exports);
        });
    } else {
        root.requestHybrid = factory(root, {});
    }
})(this, function (root, hybrid) {
    //判断浏览器环境
    var browser = {
        versions: function () {
            var u = navigator.userAgent;
            return {
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1,
                ios: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1
            };
        }()
    };

    //暴露给原生的对象
    window.Hybrid = {};

    //封装统一的发送url接口，解决ios、android兼容问题，这里发出的url会被拦截，会获取其中参数，比如：
    //这里会获取getAdressList参数，调用native接口回去通讯录数据，形成json data数据，拿到webview的window执行，window.Hybrid['hybrid12334'](data)
    var bridgePostMessage = function (url) {
        if (browser.versions.ios) {
            window.location = url;
        }
        if (browser.versions.android) {
            var ifr = document.createElement("iframe");
            ifr.setAttribute('id', 'hybridRequest');
            ifr.setAttribute('src', url);
            document.getElementsByTagName("body")[0].appendChild(ifr);
            ifr.remove();
        }
    };

    //根据参数返回满足Hybrid条件的url，比如qian://getAdressList?callback=hybrid12334
    var _getHybridUrl = function (params) {
        var url = '';
        url += 'qian://' + params.tagName + '?';
        if (params.callback) {
            url += 'callback=' + params.callbackName + '&';
        }
        if (params.data) {
            for (x in params.data) {
                url += x + '=' + params.data[x] + '&';
            }
        }
        url = url.replace(/^(.+)&$/ig, '$1');
        return url;
    };

    //页面级用户调用的方法
    var requestHybrid = function (params) {
        //生成唯一执行函数，执行后销毁
        var t = 'hybrid_' + (new Date().getTime());
        //处理有回调的情况
        if (params.callback) {
            params.callbackName = t;
            window.Hybrid[t] = function (data) {
                params.callback(data);
                delete window.Hybrid[t];
            }
        }

        bridgePostMessage(_getHybridUrl(params))
    };

    //模块暴露requestHybrid函数
    return requestHybrid;
});