/**
 * handlebars的基础elper封装   1.0.0
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
    Handlebars.registerHelper("equal", function (arg, value, options) {
        return arg === value ? options.fn(this) : options.inverse(this)
    });
    Handlebars.registerHelper("less", function (arg, value, options) {
        return parseFloat(arg) < parseFloat(value) ? options.fn(this) : options.inverse(this)
    });
    Handlebars.registerHelper("lessEqual", function (arg, value, options) {
        return parseFloat(arg) <= parseFloat(value) ? options.fn(this) : options.inverse(this)
    });
    Handlebars.registerHelper("stringify",function(obj){
        return JSON.stringify(obj);
    });
});