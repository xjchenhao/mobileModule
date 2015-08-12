/**
 * handlebars的基础elper封装   1.0.1
 */
(function (root, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function (require, exports, module) {
            var Handlebars = require("handlebars");
            return factory(root, Handlebars);
        });
    } else {
        root.elperBase = factory(root,Handlebars);
    }
})(this, function (root, Handlebars) {
    Handlebars.registerHelper({
        equal:function (arg, value, options) {
            return arg == value ? options.fn(this) : options.inverse(this)
        },
        less: function (arg, value, options) {
            return parseFloat(arg) < parseFloat(value) ? options.fn(this) : options.inverse(this)
        },
        lessEqual: function (arg, value, options) {
            return parseFloat(arg) <= parseFloat(value) ? options.fn(this) : options.inverse(this)
        },
        greater:function (arg, value, options) {
            return parseFloat(arg) > parseFloat(value) ? options.fn(this) : options.inverse(this)
        },
        greaterEqual:function (arg, value, options) {
            return parseFloat(arg) >= parseFloat(value) ? options.fn(this) : options.inverse(this)
        }
    });
    // 对象转字面量
    Handlebars.registerHelper("stringify",function(obj){
        return JSON.stringify(obj);
    });
    // 溢出隐藏
    Handlebars.registerHelper("ellipsis",function(val,len){
        return val.length>len?val.slice(0,len)+'...':val;
    });
    // 保密手机号
    Handlebars.registerHelper("secrecyPhone",function(val){
        return val.substring(0,3)+"****"+val.substring(7,11);
    });
    // 提取纯数字
    Handlebars.registerHelper("parseInt",function(val){
        return parseInt(val);
    });
    return Handlebars;
});