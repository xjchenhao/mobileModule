/**
 * 无限下拉加载      1.0.0
 * eg:
 * <div id="page">
 *      <ul>
 *          <li>我是文章标题</li>
 *          <li>我是文章标题</li>
 *          <li>我是文章标题</li>
 *          <li>我是文章标题</li>
 *          <li>我是文章标题</li>
 *          <li>我是文章标题</li>
 *      </ul>
 * </div>
 *
 * var infinite = new Infinite({
 *     box: document.getElementById('page'),
 *     con: document.querySelector('#page ul'),
 *     callback: function () {
 *         var isLoging = false;
 *         $.ajax({
 *             url: "./ajax/list.json",
 *             type: "post",
 *             dataType: "json",
 *             async: false,
 *             success: function (data) {
 *                 var tpl = document.getElementById('pageDate').innerHTML;
 *                 var myTemplate = Handlebars.compile(tpl);
 *                 document.querySelector('#page ul').innerHTML += myTemplate(data);
 *                 isLoging = true;
 *             }
 *         });
 *         return isLoging;
 *     }
 * });
 * Ps:
 *  box              elementObj，对应的容器dom（必填）
 *  con              elementObj，加载数据的容器（必填）
 *  callback         function，滚动到底部的回调函数，需要return true告诉组件数据加载完毕!
 *  destroy          function，销毁对象内存回收
 */
(function (root, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function (exports) {
            return factory(root, exports);
        });
    } else {
        root.Infinite = factory(root, {});
    }
})(this, function (root, slider) {
    var Infinite = function (opts) {
        this._opts = opts;
        this._setting();
        this._bindHandler();
    };
    Infinite.prototype._setting = function () {
        var opts = this._opts;

        /*初始化user data*/
        this.box = opts.box;
        this.con = opts.con;
        this.callback = opts.callback;
    };
    Infinite.prototype._bindHandler = function () {
        var self = this,
            isLoging=true;
        self.page=0;
        self.event = {
            scroll: function (e) {
                var boxHeight = self.box.clientHeight,
                    contentHeight = self.con.clientHeight,
                    scrollY = Number(e.target.scrollTop);
                if (scrollY >= contentHeight - boxHeight&& isLoging===true) {
                    self.page+=1;
                    isLoging=false;
                    isLoging=self.callback();
                }
            }
        };
        self.box.addEventListener('scroll', self.event.scroll, false);
    };
    Infinite.prototype.destroy = function () {
        var self = this;
        self.box.removeEventListener('scroll', self.event.scroll, false);
    };
    return Infinite;
});