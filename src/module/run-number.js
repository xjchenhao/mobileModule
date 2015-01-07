/**
 * 数字跑动      1.0.1
 * eg:
 * <div id="number" data-val="43456.4433"></div>
 *
 *
 * //创建类&基础设置
 *  var oRunNumber = new runNumber({
 *      step: 19,          //分成几步完成
 *      decimal: 3,       //保留小数点后几位（包含在span标签内）
 *      speed: 50         //滚动速度
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
    };
    runNumber.prototype.run=function(opts){
        var self=this,
            obj=opts.obj,
            val=obj.getAttribute('data-val'),
            arr=[],
            page=0;
        this.domArr.push(obj);
        for(var i=self.step;i>=0;i--){
            arr.push((Number(val)/i).toFixed(self.decimal)+"");
        }
        function roll(){
            var reg=new RegExp('([0-9]+).([0-9]{'+self.decimal+'})[0-9]*'),
                integer=arr[page].replace(reg,"$1"),
                decimal=arr[page].replace(reg,"$2");
            if(page<self.step){
                if(self.decimal){
                    obj.innerHTML=integer+'.<span>'+decimal+'</span>';
                }else{
                    obj.innerHTML=integer;
                }
                page++;
                setTimeout(roll,self.speed);
            }else{
                if(self.decimal){
                    obj.innerHTML=val.replace(reg,"$1")+'.<span>'+val.replace(reg,"$2")+'</span>';
                }else{
                    obj.innerHTML=val.replace(reg,"$1");
                }
            }
        }
        setTimeout(roll,self.speed);
    };
    runNumber.prototype.destroy = function () {
        roll=null;
        this.domArr.forEach(function(obj){
            obj.innerHTML='';
        });
    };
    return runNumber;
});