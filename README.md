LTK
===


<h3>LTK 模块开发框架</h3>

实现模块定义和加载，遵循CommonJS标准，参考seajs实现<br/>

<h3>解决问题</h3>
1、解决命名空间冲突的问题；<br/>
2、解决烦琐的文件依赖；<br/>
3、模块按需执行，只有需要引入模块时再运行，解决闭包写法立即运行的问题；<br/>

<h3>seajs问题</h3>
seajs为了解决模块（JS文件）按需加载的问题，为了实现按需加载，做了很多工作，
包括动态加载文件、操作DOM节点、添加DOM事件、解析处理URI和实现自定义事件等；<br/>
实际项目中，大部分页面中的JS，都是合并过的，往往只有很少的JS文件，没有必要按需加载；<br/>
模块定义较少时，问题不太明显，如果有成百上千模块时，效率会明显低下（如奇艺首页）。

<h3>LTK是如何解决问题</h3>
LTK遵循CommonJS标准，自然解决了命名冲突和文件依赖问题；<br/>
LTK的引入模块机制默认不会预先执行，这是基于在实际较大项目中，大部分模块从始至终没有运行过的考虑；<br/>
如果需要预先执行，使用LTK.require方式引入模块；<br/>

<h3>LTK的使用：</h3>
唯一全局模块定义方法：<br/>
<code>
define("core.event", ["modules1", "modules2"], function(require, exports, module) {function(){<br/>
    //模块代码<br/>
})<br/>
</code>

有三个参数组成：
第1参数：模块名称，必选，建议使用JAVA等面向对象的包结构命名；<br/>
第2参数：依赖模块，选填；<br/>
第3参数：模块实例；<br/>

其中模块实例中有三个参数，都是非必填，实际exports和module.exports相同，三个参数使用举例：<br/>
<code>var event = require("core.event");</code>  //require加载模块<br/>
<code>exports.show = function(){};</code> // 导出一个function<br/>
<code>module.exports = {'value':'hello', 'name':'google'}</code> //导出object<br/>
<code>return {'name':'google'}</code> //返回object<br/>

LTK.require预执行方式引入模块；<br/>
LTK.use整个项目中，最好只调用一次，项目入口；<br/>
