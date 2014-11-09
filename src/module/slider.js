(function (root, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function (exports) {
            return factory(root, exports);
        });
    } else {
        root.Slider = factory(root, {});
    }
})(this, function (root, Slider) {
    var Slider = function (val) {
        var o = {
            slideBox: '#sildeBox',              //焦点图容器
            imgChild: '#sildeBox li',           //焦点图列表
            cycle: true,                        // 是否循环播放
            pointBoxClass: '',               //点的容器样式，如果为空不生成'点'列表
            event: "mouseenter",            //点的事件类型
            btnBack: '#sildeBox .left_btn',
            btnNext: '#slideBox .right_btn',
            type: 'slide',
            speed: '3000',
            hoverStop: true,
            callback: ''
        };
        var _self = this,           //对象指针
            showIndex = 0,          //显示编号
            distances = 0,          //slide模式下滚动的距离，即元素的宽度
            imgLength = 0,           //元素个数
            imgBox = {},            //图片列表点父级，通常是ul
            cleanAuto = 0,            //自动播放的计时器变量
            transitionVal = '';     //暂存transition属性
        this._init = function () {
            for (var objVal in val) {
                o[objVal] = val[objVal];
            }
            var slideBox = document.querySelector(o.slideBox),
                imgChild = document.querySelectorAll(o.imgChild),
                btnBack = document.querySelector(o.btnBack),
                btnNext = document.querySelector(o.btnNext);
            if (o.type === 'slide') {
                imgBox = imgChild[0].parentElement;
                imgLength = imgChild.length;
                distances = imgChild[0].clientWidth;
                transitionVal = window.getComputedStyle(imgBox, null)['transition'];
                imgBox.style.width = o.cycle ? (imgLength + 1) * distances + 'px' : imgLength * distances + 'px';
                o.cycle && function () {
                    var elm = imgChild[0].cloneNode(true);
                    imgBox.appendChild(elm);
                }();
                if (o.speed) {
                    var animationInit = function () {
                        clearInterval(cleanAuto);
                        cleanAuto = setInterval(function () {
                            _self.transition(showIndex);
                        }, o.speed);
                    };
                    animationInit();
                }
                btnBack && btnBack.addEventListener('click', function () {
                    _self.transition(showIndex, 'back');
                    o.speed && animationInit();
                }, false);
                btnNext && btnNext.addEventListener('click', function () {
                    _self.transition(showIndex, 'next');
                    o.speed && animationInit();
                }, false);
            }
        };
        this.transition = function (index, direction) {
            showIndex = index;
            if (direction === undefined || direction === 'next') {
                showIndex++;
            } else if (direction === 'back') {
                showIndex--;
            }
            if (o.type === 'slide') {
                if (showIndex == imgLength + 1 || showIndex < 0) {
                    if (direction === undefined || direction === 'next') {
                        showIndex = 0;
                    } else if (direction === 'back') {
                        showIndex = imgLength;
                    }
                    ['-webkit-transition', 'transition'].forEach(function (attr) {
                        imgBox.style[attr] = 'inherit';
                    });
                    ['-webkit-transform', 'transform'].forEach(function (attr) {
                        imgBox.style[attr] = 'translate(0,0)';
                    });
                    setTimeout(function () {
                        ['-webkit-transition', 'transition'].forEach(function (attr) {
                            imgBox.style[attr] = transitionVal;
                        });
                    }, 0);
                }
                ['-webkit-transform', 'transform'].forEach(function (attr) {
                    imgBox.style[attr] = 'translate(' + -showIndex * distances + 'px,0)';
                });
            }
        };
        this._init();
    };
    return Slider;
});