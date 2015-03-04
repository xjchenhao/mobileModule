/**
 * 钱庄网
 * @name 基础js
 * @description ajax映射表
 * @date 2015-02-27
 */
define(function (require, exports, module) {
    require('mock');
    /*返回true*/
    Mock.mock('returnTrue.html',true);
    /*返回false*/
    Mock.mock('returnFalse.html',false);
});