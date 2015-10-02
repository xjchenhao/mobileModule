define(function(require, exports, module){
    require('jquery');

    function newGuid() {
        var guid = "";
        for (var i = 1; i <= 32; i++) {
            var n = Math.floor(Math.random() * 16.0).toString(16);
            guid += n;
            if ((i == 8) || (i == 12) || (i == 16) || (i == 20)) {
                guid += "-";
            }
        }
        return guid;
    }

    module.exports ={

        /* 没有数据 添加样式 */
        noData: function ($container, str) {
            var des = '<p class="J_no_data_des">' + str + '</p>';
            $container
                .empty()
                .addClass('J_no_data')
                .html(des);
        },

        /* 移除无数据样式 */
        removeNoData: function ($container) {
            $container.empty().removeClass('J_no_data');
        },

        /* 请求失败的时候，显示重试并绑定点击可重试 */
        again: function ($container, loadData) {
            var guid = newGuid();
            var des = '<p class="J_again_des">系统正忙，';
            des += '<a class="J_again_link" href="javascript:;" data-again="' + guid + '">重试</a>';
            des += '</p>';
            $container
                .empty()
                .addClass('J_again')
                .html(des);
            $('[data-again="' + guid + '"]').on('click', function (e) {
                loadData();
            });
        },

        /* 加载动画对象 不写成对象算了*/
        loading: {
            // 显示动画
            show: function ($element) {
                $element.show();
            },

            // 结束动画
            hide: function ($element) {
                $element.hide();
            }
        },

        /* 显示服务端的回调信息 */
        showServerReturn: function ($returnMsg, msg) {
            $returnMsg.html(msg);
        },

        /* 清空服务端的回调信息 */
        emptyServerReturn: function ($returnMsg) {
            $returnMsg.empty();
        }
    };

});