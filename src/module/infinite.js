(function (root, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function (exports) {
            return factory(root, exports);
        });
    } else {
        root.Slider = factory(root, {});
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