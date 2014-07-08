/**
 * @file 声明LTK（Letv ToolKit）命名空间
 * @desc 实现模块定义和加载，遵循CommonJS标准，参考seajs实现
 * 解决问题：
 * 1、模块定义不立即执行;
 * 2、解决命名空间问题;
 * 3、模块化开发；
 * 
 * 使用LTK.require加载会预执行，使用require则不会
 * 模块名前加-号，表示预执行，如：define("-player", function(require)
 * @author liubin
 */

(function(global) {

    if (global.LTK) return;

    var LTK = global.LTK = {
        version: "1.0.0"
    };

    var mods = LTK.mods = {};
    var data = LTK.data = {};

    function isType(type) {
        return function(obj) {
            return {}.toString.call(obj) === "[object " + type + "]";
        };
    }

    var isArray = Array.isArray || isType("Array");
    var isFunction = isType("Function");
    var isString = isType("String");
    var isObject = isType("Object");

    var SLASH_RE = /\\\\/g,
        IDEXEC_RE = /^\-([\w\.\/\-]*)$/;

    var DOT_RE = /\w+\.\//g;
    var DOUBLE_DOT_RE = /\w+\.\w+\.\.\//;

    function parsePaths(id, path) {
        if (!/^\./.test(id)) return id;

        path = (path+id).replace(DOT_RE, "");

        while (path.match(DOUBLE_DOT_RE)) {
            path = path.replace(DOUBLE_DOT_RE, "");
        }

        return path;
    }

    function parseAlias(id) {
        var alias = data.alias;
        return alias && isString(alias[id]) ? alias[id] : id;
    }

    function parseId(id, path) {
        if (!id) return "";

        id = parseAlias(id);
        id = parsePaths(id, path);

        return id;
    }

    function exec(meta) {
        if (meta.exports !== null) return meta.exports;
		
		for(var key in meta.deps){
			exec(mods[meta.deps[key].id]);
		};
		/*
        meta.deps.forEach(function(id) {
            exec(mods[id]);
        });
		*/

        function require(id) {
            id = parseId(id, meta.id);
            if (!mods[id]) throw new Error(id +' not found.');
            return exec(mods[id]);
        }

        require.async = require;

        var factory = meta.factory;

        var exports = isFunction(factory) ?
            factory(require, meta.exports = {}, meta) :
            factory;

        if (exports === undefined) {
            exports = meta.exports;
        }

        meta.exports = exports;

        delete meta.factory;

        return exports;
    }

    LTK.define = function(id, deps, factory) {
        var argsLen = arguments.length;

        if (argsLen === 1) {
            throw "module must has a id and factory.";
        } else if (argsLen === 2) {
            factory = deps;
            deps = [];
        }

        if (IDEXEC_RE.test(id)) id = RegExp.$1;

        /*if (mods[id]) {
            throw "module " + id + " has been defined.";
        }*/

        var meta = {
            id: id,
            deps: deps,
            factory: factory,
            exports: null
        };

        mods[id] = meta;

        RegExp.$1 == id && LTK.exec(id, true)
    };

    LTK.exec = function(id) {
        return exec(mods[id]);
    };

    LTK.use = function(ids, callback) {
        if (!isArray(ids)) ids = [ids];

        var exports = [];

        for (var i = 0; i < ids.length; i++) {
            exports[i] = LTK.exec(ids[i]);
        }

        if (callback) {
            callback.apply(global, exports);
        }
    };

    LTK.config = function(configData) {
        for (var key in configData) {
            var curr = configData[key];
            var prev = data[key];

            if (prev && isObject(prev)) {
              for (var k in curr) {
                prev[k] = curr[k];
              }
            }
            else {
              if (isArray(prev)) {
                curr = prev.concat(curr);
              }

              data[key] = curr;
            }
        }

        return LTK;
    };

    LTK.require = function(id) {
        return LTK.exec(id);
    };

    // public API
    global.define   = LTK.define;

})(this);
