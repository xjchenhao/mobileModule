(function (root, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function (exports) {
            return factory(root, exports);
        });
    } else {
        root.Slider = factory(root, {});
    }
})(this, function (root, pop) {
    "use strict";
    var Pop = function (opts) {
        this._opts = opts;
        this._setting();
        this._pop();
    };
    Pop.prototype._setting = function () {
        var opts = this._opts || {};
        this.type = opts.type || 'alert';
        this.content = opts.content;
        this.additional = opts.additional || '';
        this.width = opts.width || 'auto';
        this.height = opts.height || 'auto';
        this.class = {
            mask: opts.clsMask || '#pop-mask',
            con: opts.clsCon || '#pop-content',
            close: opts.clsClose || '#pop-close',
            inio: opts.clsInio || '.pop-inio',
            out: opts.clsOut || '.pop-out'
        };
    };
    Pop.prototype._addDom = function () {
        var maskLayer = document.createElement('div');
        switch (this.class.mask.slice(0, 1)) {
            case '.' :
                maskLayer.setAttribute('class', this.class.mask.slice(1));
                break;
            case '#':
                maskLayer.setAttribute('id', this.class.mask.slice(1));
                break;
        }
        var closeBtn = document.createElement('a');
        closeBtn.setAttribute('href', 'javascript:;');
        switch (this.class.close.slice(0, 1)) {
            case '.' :
                closeBtn.setAttribute('class', this.class.close.slice(1));
                break;
            case '#':
                closeBtn.setAttribute('id', this.class.close.slice(1));
                break;
        }
        var box = document.createElement('div');
        switch (this.class.con.slice(0, 1)) {
            case '.' :
                box.setAttribute('class', this.class.con.slice(1));
                break;
            case '#':
                box.setAttribute('id', this.class.con.slice(1));
                break;
        }
        box.appendChild(closeBtn);
        var content = document.createElement('div');
        content.setAttribute('class', 'content');
        box.appendChild(content);
        document.getElementsByTagName('body')[0].appendChild(box);
        document.getElementsByTagName('body')[0].appendChild(maskLayer);
    };
    Pop.prototype._pop = function () {
        this._addDom();
        var self = this,
            box = document.querySelector(this.class.con),
            closeBtn = document.querySelector(this.class.close),
            maskLayer = document.querySelector(this.class.mask),
            boxHeight = 0,
            boxWidth = 0;
        this.event = {
            close: function () {
                closeBtn.removeEventListener('click', self.event.close, false);
                box.remove();
                maskLayer.remove();
            }
        };
        switch (this.type) {
            case 'alert' :
                box.getElementsByClassName('content')[0].innerHTML = this.content;
                closeBtn.addEventListener('click', self.event.close, false);
                break;
            case 'loading' :

                break;
            default :
                throw new Error("不支持的类型!");
        }
        boxHeight = box.clientHeight;
        boxWidth = box.clientWidth;
        box.style['margin-left'] = -boxWidth / 2 + 'px';
        box.style['margin-top'] = -boxHeight / 2 + 'px';
        this.additional && this.additional();
    };
    return Pop;
});
