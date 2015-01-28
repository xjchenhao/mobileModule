/**
 * 模态框      1.0.6
 * eg:
 * #pop-mask { position: absolute; left: 0; top: 0; bottom: 0; right: 0; z-index: 1000; height: 100%; background-color:
 * rgba(0, 0, 0, 0.1) }
 * #pop-content { position: absolute; left: 50%; top: 50%;transform: translate(-50%, -50%);  z-index: 1001; min-width: 50px; min-height: 50px; max-width:200px; background-color: rgba(0, 0, 0, 0.5); border-radius: 5px;-webkit-animation-duration: .3s;animation-duration: .3s;}
 * #pop-close { position: absolute; right: -10px; top: -10px; width: 20px; height: 20px; background-color: red;
 * border-radius: 100%; -webkit-transform: rotate(45deg); transform: rotate(45deg); }
 *
 * 并引入Animate.css动画库（http://daneden.github.io/animate.css/）
 *
 *
 * var pop = new Pop({
 *     type: 'loading',
 *     content: '<img src="image/loading.gif" />',
 *     callback: function () {
 *         return false;
 *     }
 * });
 * pop.pop();       //前面只是创建类，要用pop()方法执行
 * Ps:
 *  type             string，模态框类别（默认alert）
 *  content          string，填充内容，alert时填充提示文字、loading时填充loading图片，pop时内部填充的dom
 *  pop(str,callback)              function，弹出pop框，可传入string字符串修改pop内容，传入callback替换新建类时的回调函数
 *  callback         function，回调函数，alert时关闭时触发、loading回调函数返回true隐藏图层，pop时先挂载回调函数再显示dom
 *  close            function，关闭弹框
 *  destroy          function，销毁对象内存回收,其实和close函数是一样的。为了跟其他模块统一加上的
 *  class            object，存放选择器和样式(用来创建选择器和添加样式，支持id和class选择器，不支持组合选择器)，默认值如下：
 *           {
 *                mask:'#pop-mask',     //遮罩层
 *                con:'#pop-content',   //pop最外面的容器
 *                close:'#pop-close',   //关闭按钮
 *                inio: '.zoomIn',    //进入动画
 *                out:'.zoomOut'      //转出动画
 *           }
 */
(function (root, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function (exports) {
            return factory(root, exports);
        });
    } else {
        root.Pop = factory(root, {});
    }
})(this, function (root, pop) {
    "use strict";
    var Pop = function (opts) {
        this._opts = opts;
        this._setting();
    };
    /*初始设置*/
    Pop.prototype._setting = function () {
        var opts = this._opts || {},
            self = this,
            $ = root.$ || root.jQuery || root.Zepto;
        this.type = opts.type || 'alert';
        this.content = opts.content;
        this.callback = opts.callback || '';
        /*样式*/
        this.class = {
            mask: opts.clsMask || '#pop-mask',
            con: opts.clsCon || '#pop-content',
            close: opts.clsClose || '#pop-close',
            inio: opts.clsInio || '.zoomIn',
            out: opts.clsOut || '.zoomOut'
        };
        /*事件名称*/
        this.touch = {
            tap: $ && $.fn && $.fn.tap ? 'tap' : 'click'
        };
        /*事件集合*/
        this.event = {
            close: function (force) {       //force为true强制移除
                var box = document.querySelectorAll(self.class.con),           //pop容器
                    closeBtn = document.querySelector(self.class.close),        //关闭按钮
                    maskLayer = document.querySelector(self.class.mask);        //遮罩层
                closeBtn && closeBtn.removeEventListener(self.touch.tap, self.event.close, false);
                if (force === true) {
                    if (box.length !== 0) {
                        box[0].parentNode.removeChild(box[0]);
                        maskLayer.parentNode.removeChild(maskLayer);
                    }
                    return;
                }
                box[0].classList.remove(self.class.inio.slice(1));
                box[0].classList.add(self.class.out.slice(1));
                function destroy() {
                    if (self.type === 'alert' && self.callback) {
                        self.callback();
                    }
                    box[0].removeEventListener('webkitAnimationEnd', destroy);
                    box[0].parentNode.removeChild(box[0]);
                    maskLayer.parentNode.removeChild(maskLayer);
                }

                box[0].addEventListener('webkitAnimationEnd', destroy);
            },
            addDomMask: function () {
                var maskLayer = document.createElement('div');
                switch (self.class.mask.slice(0, 1)) {
                    case '.' :
                        maskLayer.setAttribute('class', self.class.mask.slice(1));
                        break;
                    case '#':
                        maskLayer.setAttribute('id', self.class.mask.slice(1));
                        break;
                }
                document.getElementsByTagName('body')[0].appendChild(maskLayer);
                return maskLayer;
            },
            addDomBox: function () {
                var box = document.createElement('div');
                switch (self.class.con.slice(0, 1)) {
                    case '.' :
                        box.setAttribute('class', self.class.con.slice(1));
                        break;
                    case '#':
                        box.setAttribute('id', self.class.con.slice(1));
                        break;
                }
                var content = document.createElement('div');
                content.setAttribute('class', 'content');
                box.appendChild(content);
                document.getElementsByTagName('body')[0].appendChild(box);
                return box;
            },
            addDomCloseBtn: function () {
                var box = document.querySelectorAll(self.class.con);           //pop容器
                var closeBtn = document.createElement('a');
                closeBtn.setAttribute('href', 'javascript:;');
                switch (self.class.close.slice(0, 1)) {
                    case '.' :
                        closeBtn.setAttribute('class', self.class.close.slice(1));
                        break;
                    case '#':
                        closeBtn.setAttribute('id', self.class.close.slice(1));
                        break;
                }
                box[box.length - 1].appendChild(closeBtn);
                return closeBtn;
            }
        };
    };
    /*主逻辑*/
    Pop.prototype.pop = function (str, callback) {
        var self = this,
            box = null,          //pop容器
            maskLayer = null,    //遮罩层
            closeBtn = null,     //关闭按钮
            boxHeight = 0,
            boxWidth = 0;
        this.event.close(true);
        /*分类执行*/
        switch (this.type) {
            case 'alert' :
                maskLayer = self.event.addDomMask();
                box = self.event.addDomBox();
                closeBtn = self.event.addDomCloseBtn();
                box.style['padding'] = '10px';
                box.getElementsByClassName('content')[0].innerHTML = str || this.content;
                box.classList.add('animated');
                box.classList.add(self.class.inio.slice(1));
                closeBtn.addEventListener(self.touch.tap, self.event.close, false);
                if (callback) {
                    callback();
                } else {
                    this.callback && this.callback();
                }
                break;
            case 'loading' :
                maskLayer = self.event.addDomMask();
                box = self.event.addDomBox();
                box.getElementsByClassName('content')[0].innerHTML = str || this.content;
                box.style['font'] = '0/0 a';
                box.getElementsByClassName('content')[0].style.cssText = 'text-align:center;line-height:' + box.clientHeight + 'px';
                box.getElementsByTagName('img')[0].style['vertical-align'] = 'middle';
                box.classList.add('animated');
                box.classList.add(self.class.inio.slice(1));
                this.callback() && self.event.close();
                break;
            case 'pop' :
                maskLayer = self.event.addDomMask();
                box = self.event.addDomBox();
                box.style.cssText = 'background-color:initial;max-width:initial';
                box.getElementsByClassName('content')[0].innerHTML = str || this.content;
                box.classList.add('animated');
                box.classList.add(self.class.inio.slice(1));
                if (callback) {
                    callback();
                } else {
                    this.callback && this.callback();
                }
                break;
            default :
                throw new Error("不支持的类型!");
        }
        /*居中对齐*/
        boxHeight = box.clientHeight;
        boxWidth = box.clientWidth;
    };
    Pop.prototype.close = Pop.prototype.destroy =
        function () {
            this.event.close(true);
        };
    return Pop;
});
