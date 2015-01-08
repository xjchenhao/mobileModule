/**
 * 数字跑动      1.0.2
 * eg:
 * <div id="number" data-val="43456.4433"></div>
 *
 *
 * //创建类&基础设置
 *  var oRunNumber = new runNumber({
 *      step: 19,          //分成几步完成
 *      decimal: 3,       //保留小数点后几位（包含在span标签内）
 *      speed: 50         //滚动速度
 *      isCommas || false;   //是否添加美元逗号
 *  });
 *  //运行跑动
 *  oRunNumber.run({
 *      obj: document.getElementById('number')         //需要数字跑动的标签
 *  });
 *  //销毁模块
 *  //        oRunNumber.destroy();
 *  //        oRunNumber='';
 *
 * ps： 提取html标签上data-val内的值进行跑动
 *
 */
(function (root, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function (exports) {
            return factory(root, exports);
        });
    } else {
        root.runNumber = factory(root, {});
    }
})(this, function (root, slider) {
    var runNumber = function (opts) {
        this._opts = opts;
        this.domArr=[];
        this._setting();
    };
    runNumber.prototype._setting = function () {
        var opts = this._opts || {};

        /*初始化user data*/
        this.step = opts.step || 19;          //分成几步完成
        this.decimal = opts.decimal || 0;     //保留小数点后几位（包含在span标签内）
        this.speed=opts.speed || 50;          //滚动速度
        this.isCommas=opts.isCommas || false;   //是否添加美元逗号
    };
    runNumber.prototype.run=function(opts){
        var self=this,
            obj=opts.obj,
            val=obj.getAttribute('data-val'),
            arr=[],
            page=0;
        this.domArr.push(obj);      //存储被添加数字跑动的dom
        for(var i=self.step;i>=0;i--){
            arr.push(this._addArr(Number(val)/i));
        }
        function roll(){
            if(page<self.step){
                obj.innerHTML=arr[page];
                page++;
                setTimeout(roll,self.speed);
            }else{
                obj.innerHTML=self.isCommas ? self._addCommas(val) : val;
            }
        }
        setTimeout(roll,self.speed);
    };
    runNumber.prototype._addArr=function(_val){
        var self=this,
            arrVal=_val.toFixed(self.decimal)+"",
            reg=new RegExp('([0-9]+[,0-9]*)\\.([0-9]{'+self.decimal+'})[0-9]*'),
            str=self.isCommas ? self._addCommas(arrVal) : arrVal,
            integer=str.replace(reg,"$1"),
            decimal=str.replace(reg,"$2");
        if(self.decimal){
            return integer+'.<span>'+decimal+'</span>';
        }else{
            return integer;
        }
    };
    runNumber.prototype._addCommas=function(nStr){
        nStr += ''; //转换字符串
        var x = nStr.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    };
    runNumber.prototype.destroy = function () {
        roll=null;
        this.domArr.forEach(function(obj){
            obj.innerHTML='';
        });
    };
    return runNumber;
});