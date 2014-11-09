(function (root, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function (exports) {
            return factory(root, exports);
        });
    } else {
        root.Slider = factory(root, {});
    }
})(this, function (root, Slider) {
    var Slider = function (userVal) {
        var o = {
            slideBox: '#sildeBox',             //焦点图容器
            imgChild: '#sildeBox li',        //焦点图列表
            pointBoxClass: '',               //点的容器样式，如果为空不生成'点'列表
            cycle: true,                     // 是否循环播放
            event: "mouseenter",
            btnLeft: '#sildeBox .left_btn',
            btnRight: '#slideBox .right_btn',
            animation: 'slide',
            speed: '3000',
            hoverStop: true,
            callback: ''
        };
        var _self = this,
            showIndex = 1,
            distances = 0,
            imgLength = 0,
            imgBox = {},
            animationAuto = new Function(),
            cleanAuto;
        this._init = function () {
            for (var objVal in userVal) {
                o[objVal] = userVal[objVal];
            }
            var slideBox = document.querySelector(o.slideBox),
                imgChild = document.querySelectorAll(o.imgChild),
                btnLeft = document.querySelector(o.btnLeft),
                btnRight = document.querySelector(o.btnRight);
            if (o.animation === 'slide') {
                imgBox = imgChild[0].parentElement;
                imgLength = imgChild.length;
                distances = imgChild[0].clientWidth;
                imgBox.style.width = o.cycle ? (imgLength + 1) * distances + 'px' : imgLength * distances + 'px';
                o.cycle && function () {
                    var elm = imgChild[0].cloneNode(true);
                    imgBox.appendChild(elm);
                }();
                if (o.speed) {
                    animationAuto = function () {
                        _self.transition(showIndex);
                    };
                    cleanAuto = setInterval(animationAuto, o.speed);
                }
            }
        };
        this.transition = function (index) {
            console.dir(imgBox);
            if (o.animation === 'slide') {
                ['-webkit-transform', 'transform'].forEach(function (attr) {
                    imgBox.style[attr] = 'translate(' + -index * distances + 'px,0)';
                });
                if (showIndex !== imgLength) {
                    showIndex++;
                } else {
                    showIndex = 0;
                }
            }
        };
        this._init();
    };
    return Slider;
});