/*数据加载 1.0.0*/
(function (root, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function (require, exports, module) {
            require('jquery');
            var Event = require('module/event');
            var Infinite = require('module/infinite');
            var status = require('../../test/load-date/script/status');
            return factory(root, Event, Infinite, status);
        });
    } else {
        root.LoadDate = factory(root);
    }
})(this, function (root, Event, Infinite, status) {
    // 分页接口（这里需要配置）
    var ROWS = 'list', // 条数
        PAGE = 'currentPage', // 当前页
        PAGE_COUNT = 'pages';// 分页总数

    // 类名常量
    var classPrefix = 'ui-load-';

    // 生成类名对象
    var CLASS = (function () {
        return {
            CONTAINER: classPrefix + 'container',
            CONTENT: classPrefix + 'content',
            LOADING_BG: classPrefix + 'bg'
        };
    }());

    //new出多个实例时保证每个实例事件的独立性
    var _eventId = 0;


    var LoadDate = function (opts) {
        var DEFAULT = {
            url: '', // 接口地址(必须)
            container: '', // load-container 容器对象(必须)
            tpl: '', // 可以是模板路径或者是要解析的字符串(必须)
            noListStr: '暂无记录', // 无记录时，显示的文本(缺省)
            sendData: {}, // 默认发送的data数据(缺省)  去除了page :1，不可为null
            pageType: 'none', // 分页类型(缺省)
            tplFn: null,   // 传入data解析成html函数
            callback: null   // 载入完成后的回调函数(缺省)(用于绑定事件，注意尽量事件委托，并注意先off，免得重复绑定)
        };
        this._config = $.extend({}, DEFAULT, opts);
        this._init();
        this._load();
    };

    LoadDate.prototype._init = function () {
        var config = this._config;

        // 设置命名空间
        this._eventId = ++_eventId;

        // 保证容器对象是jquery对象
        config.container = typeof config.container === "object" ? config.container : $(config.container);

        // 添加数据列表容器
        config.container.addClass(CLASS.CONTAINER).html('<div class="' + CLASS.CONTENT + '"></div>');

        //添加事件订阅
        this._addEvent();
    };

    LoadDate.prototype._load = function () {
        var self = this,
            config = self._config,
            eventId = self._eventId;

        // 给容器添加加载中class
        config.container.addClass(CLASS.LOADING_BG);

        $.ajax({
            url: config.url,
            async: true,
            data: config.sendData,
            dataType: 'json',
            success: function (data) {
                var html;

                //if (!data[ROWS] || data[ROWS].length <= 0) {
                //    Event.trigger('noData.' + eventId);
                //    return;
                //}

                html = config.tplFn(data);

                Event.trigger('hasData.' + eventId, data, html);
            },
            error: function () {
                Event.trigger('fail.' + eventId);
            }
        });
    };
    LoadDate.prototype._addEvent = function () {
        var self = this,
            eventId = self._eventId,
            config = self._config,
            container = config.container,
            content = container.children('.' + CLASS.CONTENT),
            callback = config.callback;

        // 有数据,添加dom
        Event.one("hasData." + eventId, function (data, html) {
            removeStatus();
            content.html(html);
            callback && callback.call(null, true, data);
        });

        // 有数据,挂载下拉加载事件
        Event.one("hasData." + eventId, function (data, html) {
            var infinite = new Infinite({
                box: container[0],
                con: content[0],
                callback: function () {
                    var isLoging = false;
                    $.ajax({
                        url: config.url,
                        type: "post",
                        dataType: "json",
                        data: config.sendData,
                        async: false,
                        success: function (data) {
                            var html = config.tplFn(data);
                            content.append(html);
                            isLoging = true;
                        }
                    });
                    return isLoging;
                }
            });
        });

        // 无数据
        Event.one("noData." + eventId, function () {
            removeStatus();
            var noListStr = config.noListStr;
            status.noData(content, noListStr);
            callback && callback.call(null, false);
        });

        // 出错
        Event.one("fail." + eventId, function () {
            removeStatus();
            var reLoad = bind(self._load, self);
            status.again(content, reLoad);
        });

        function removeStatus() {    // 初始化,移除容器的各种状态
            status.removeNoData(content);
            container.removeClass(CLASS.LOADING_BG);
        }
    };

    LoadDate.prototype.destroy = function () {
    };

    return LoadDate;

    // Helper
    // 绑定作用域
    function bind(fn, context) {
        if (arguments.length < 2 && context === undefined) return fn;
        var method = fn,
            slice = Array.prototype.slice,
            args = slice.call(arguments, 2);
        return function () { // 这里传入原fn的参数
            var array = slice.call(arguments, 0);
            return method.apply(context, args.concat(array));
        };
    }
});