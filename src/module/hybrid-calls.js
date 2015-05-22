/**
 * Hybrid交互      1.7.5
 * 此模块用来与原生app进行交互
 * 暴露出去一个方法，调用方式如下：
 * hybridProtocol({
 *     tagName: 'getUrl',
 *     data: {
 *         url: 'ensure.html'
 *     },
 *     callback:function(){
 *          alert('123');
 *     }
 * });
 * 最后生成与原生通信的url并发送请求：`qian://submit?callback=hybrid_1427422528529&url=ensure.html`
 * 原生那边根据这个url，截取前面的tagName知道要做什么，然后再去拿后面需要的参数。注意：参数中的hybrid_1427422528529是暴露给原生的函数，以供原生调用网页函数，调用方式为root.Hybrid[hybrid_1427422528529]。（它是根据调用时的callback自动生成的函数名，并带上了时间戳）
 */
(function (root, factory) {
    if (document.HYLOADED) { return; }
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function (exports) {
            return factory(root, exports);
        });
    } else {
        root.hybridProtocol =root.requestHybrid= factory(root, {});
    }
})(this, function (root, exports) {
    if (document.HYLOADED) {
        return 'Don\'t repeat load hybridProtocol!';
    }

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
    root.Hybrid = {};

    //页面级用户调用的方法
    var hybridProtocol = function (obj) {
        this._params=obj;
        this._getHybridUrl();
        this._bridgePostMessage();
    };

    hybridProtocol.VERSION='1.7';
    hybridProtocol.prototype._bridgePostMessage = function () {
        var self=this,
            ifr = document.createElement("iframe");
        ifr.setAttribute('id', 'hybridRequest');
        ifr.setAttribute('src', self.url);
        document.getElementsByTagName("body")[0].appendChild(ifr);
        ifr.parentNode.removeChild(ifr);
        if(self._params.success){
            self._overtime=setTimeout(function(){
                self._params.error && self._params.error();
            },3000);
        }
    };

    //生成协议url
    hybridProtocol.prototype._getHybridUrl = function () {
        var self=this,
            paramsHandl=null,
            url = 'qian://' + self._params.tagName + '?',
            timeStamp=new Date().getTime(),
            addCallback=function(str){
                var callbackName=str+timeStamp;
                root.Hybrid[callbackName] = function (data) {
                    paramsHandl[str](data);
                    clearTimeout(self._overtime);
                    delete root.Hybrid[callbackName];
                };
                url += str + '=' + encodeURIComponent(callbackName) + '&';
            };
        paramsHandl=(function objectHandl(params){
            for(var key in params){
                var val=params[key];
                if(typeof val =='object' && Object.prototype.toString.call(val).toLowerCase() == "[object object]" && !val.length){
                    objectHandl(val);
                }else{
                    params[key]=encodeURIComponent(val);
                }
            }
            return params;
        }(self._params));
        for (var params in paramsHandl.data) {
            //处理有回调的情况
            if (params =='callback') {
                var callbackName = 'hybrid_' + timeStamp;
                root.Hybrid[callbackName] = function (data) {
                    params.callback(data);
                    delete root.Hybrid[callbackName];
                };
                url += params + '=' + encodeURIComponent(callbackName) + '&';
            }else if(params == 'data'){
                if(paramsHandl.data[params]){
                    url += params + '=' + JSON.stringify(paramsHandl.data[params]) + '&';
                    //url += params + '=' + paramsHandl.data[params] + '&';
                }
            }else{
                url += params + '=' + paramsHandl.data[params] + '&';
            }
        }
        paramsHandl.success && addCallback('success');
        paramsHandl.error && addCallback('error');

        url = url.replace(/^(.+)&$/ig, '$1');
        self.url=url;
    };


    document.HYLOADED = true;

    return function(obj){
        if(!(this instanceof hybridProtocol)){
            return new hybridProtocol(obj);
        }else{
            return hybridProtocol;
        }
    };
});