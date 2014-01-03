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
    }

    var mods = LTK.mods = {};

    function isType(type) {
        return function(obj) {
            return {}.toString.call(obj) == "[object " + type + "]"
        }
    }

    var isArray = Array.isArray || isType("Array")
    var isFunction = isType("Function")

    var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*LTK\.require|(?:^|[^$])\bLTK\.require\s*\(\s*(["'])(.+?)\1\s*\)/g,
        SLASH_RE = /\\\\/g,
        IDEXEC_RE = /^\-([\w-]*)$/;

    function parseDependencies(code) {
        var ret = []

        code.replace(SLASH_RE, "")
            .replace(REQUIRE_RE, function(m, m1, m2) {
                if (m2) {
                    ret.push(m2)
                }
            })

        return ret
    }

    function exec(meta) {
        if (meta.exports !== null) return meta.exports;

        if (isFunction(meta.factory)) {
            meta.deps = meta.deps.concat(parseDependencies(meta.factory.toString()))
        }

        meta.deps.forEach(function(id) {
            exec(mods[id])
        })

        function require(id) {
            return exec(mods[id])
        }

        var factory = meta.factory

        var exports = isFunction(factory) ?
            factory(require, meta.exports = {}, meta) :
            factory

        if (exports === undefined) {
            exports = meta.exports
        }

        meta.exports = exports

        delete meta.factory

        return exports;
    }

    LTK.define = function(id, deps, factory) {
        var argsLen = arguments.length

        if (argsLen === 1) {
            throw "module must has a id and factory."
        } else if (argsLen === 2) {
            factory = deps
            deps = [];
        }

        if (IDEXEC_RE.test(id)) id = RegExp.$1

        if (mods[id]) {
            throw "module " + id + " has been defined.";
        }

        var meta = {
            id: id,
            deps: deps,
            factory: factory,
            exports: null
        }

        mods[id] = meta

        RegExp.$1 == id && LTK.exec(id, true)
    }

    LTK.exec = function(id) {
        return exec(mods[id]);
    }

    LTK.use = function(ids, callback) {
        !isArray(ids) && (ids = [ids])

        var exports = [];

        for (var i = 0; i < ids.length; i++) {
            exports[i] = LTK.exec(ids[i])
        }

        if (callback) {
            callback.apply(global, exports)
        }
    }

    LTK.require = function(id) {
        return LTK.exec(id);
    }

    // public API
    global.define   = LTK.define

})(this);