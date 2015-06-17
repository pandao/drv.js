(function(factory) {
    
    "use strict";
    
	if(typeof exports === "object" && typeof module === "object")
    {
		module.exports = factory();
    }
    else if(typeof define === "function" && (define.amd || define.cmd))
    {
        window.Drv = factory();
    }
    else
    {
        window.Drv = factory();
    }
    
})(function() {
    
    /**
     * Object extention
     * 
     * @param   {Object}  dest    dest object
     * @param   {Object}  source  source object
     * @returns {Object}  dest    dest object
     */

    function extend(dest, source) {
        for (var property in source) {
            if (source[property] && source[property].constructor &&
                source[property].constructor === Object) {
                dest[property] = dest[property] || {};
                arguments.callee(dest[property], source[property]);
            } else {
                dest[property] = source[property];
            }
        }
        
        return dest;
    }
    
    "use strict";

    /**
     * Add event listener
     * 
     * @param  {Object}   obj             DOM / BOM Object
     * @param  {String}   type            Event type
     * @param  {Function} handler         Event handler
     * @param  {Boolean}  [capture=false] Use capture
     * @return {void}
     */
    
    function addEvent(obj, type, handler, capture) {
        capture = capture || false;

        obj.eventHandler = handler;
        
        if (obj.attachEvent) // IE6~8
        {
            obj.attachEvent("on" + type, function(e) {

                if (capture) {
                    e.cancelBubble = true;
                }

                if (false === handler(e)) {
                    return false;
                }
            });
        }
        else if (obj.addEventListener)
        {
            obj.addEventListener(type, function(e) {

                if (capture) {
                    e.cancelBubble = true;
                }

                if (false === handler(e)) {
                    if (e && e.preventDefault) { // W3C  
                        e.preventDefault();  
                    } else {  
                        e.returnValue = false; // IE  
                    }  
                }
            }, capture);
        } 
        else
        {
            obj["on" + type] = handler;
        }
    }

    /**
     * Remove event listener
     * 
     * @param  {Object}   obj             DOM / BOM Object
     * @param  {String}   type            Event type
     * @param  {Function} callback        Removed callback
     * @param  {Boolean}  [capture=false] Use capture
     * @return {void}
     */

    function removeEvent(obj, type, callback, capture) {
        capture = capture || false;

        // IE6~8
        if (obj.detachEvent) {
            obj.detachEvent("on" + type, obj.eventHandler);
        } else if (obj.removeEventListener) {
            obj.removeEventListener(type, obj.eventHandler, capture);
        } else {
            obj.eventHandler = null;
            obj["on" + type] = null;
        }

        callback.call(obj);
    }

    var $singleton     = null;
    var runInMainFile  = false;
    
    /**
     * Drv Object
     */

    var Drv            = {};

    Drv.name           = "Drv.js";
    Drv.version        = "0.1.0";
    Drv.homePage       = "https://github.com/pandao/drv.js";
    Drv.description    = "The Combined Type JavaScript MVVM / MVC / SPA Development Framework, Based on Director.js, Require.js and Vue.js.";    
    Drv.http           = null;
    Drv.usingSingleton = false;
    
    /**
     * Get app instance (singleton)
     * 
     * @returns {Object} $singleton  Drv.App singleton instance
     */

    Drv.getApp = function() {
        this.usingSingleton = true;

        return $singleton;
    };
    
    /**
     * App hooks
     */

    var $hooks    = {
        "run.before"    : function () {},
        "run.after"     : function () {},
        "route.on"      : function () {},
        "route.before"  : function () {},
        "route.after"   : function () {},
        "render.before" : function () {},
        "render.after"  : function () {},
        "action.before" : function () {},
        "action.after"  : function () {},
        "require.error" : function(e) {
            console.error("Drv.js Require Error: ", e);
        }
    };
        
    var bowerPath = "bower_components/";
    
    /**
     * Default configure
     */
    
    var $defaults = {
        path            : "./",              // Application basic path
        cssPath         : "css/",
        viewPath        : "views/",
        libPath         : "lib/",
        imagesPath      : "images/",
        routeInit       : "/",
        viewSuffix      : ".html",
        useHistory      : false,             // Using HTML5 History API for Director.js 
        bowerPath       : bowerPath,
        controllerPath  : "controllers/",
        directorConfigs : null,
        requireConfigs  : {
            urlArgs     : "",
            waitSeconds : 60,
            baseUrl     : "./",
            paths       : {
                vue          : bowerPath + "vue/dist/vue.min",
                hammerjs     : bowerPath + "hammerjs/hammer.min",
                text         : bowerPath + "requirejs-text/text",
                css          : bowerPath + "require-css/css",
                httpx        : bowerPath + "httpx.js/dist/httpx.min",
                jquery       : bowerPath + "jquery/dist/jquery.min",
                vuetouch     : bowerPath + "vue-touch/vue-touch",
                vuevalidator : bowerPath + "vue-validator/dist/vue-validator",
                underscore   : bowerPath + "underscore/underscore-min",
                tiletemplate : bowerPath + "tiletemplate/dist/tiletemplate.min",
                director     : bowerPath + "director/build/director.min"
            },
        },
        routes : {
            "/" : function() {
                console.log("Hello Drv.js!");
            }
        }
    };
    
    Drv.hooks    = Object.create($hooks);    // read only for Drv.App  
    Drv.defaults = Object.create($defaults); // read only for Drv.App

    /**
     * Drv.App object constructor
     * 
     * @param   {Object}   options   Configure options
     * @returns {Object}
     */

    function DrvApp(options) {
        $singleton = (!$singleton) ? DrvApp.prototype.init(options) : $singleton;

        return $singleton;
    }
    
    /**
     * Drv.App prototype
     */
    
    DrvApp.prototype = {

        /**
         * Initialization
         * 
         * @param  {Object}   options   Configure options
         * @return {Object}   this
         */
        
        init : function(options) {

            options       = options || {};

            this.settings = extend($defaults, options);

            var $this = this;

            addEvent(window, "error", function(e) {
                if (e.message.indexOf("requirejs") > -1) {
                    $this.trigger("require.error", e);
                }
            });

            require.config(this.settings.requireConfigs);

            return this;
        },

        /**
         * Create controller
         * 
         * @param  {String}   name   Controller name
         * @return {void}
         */

        controller : function(name) {
            var $this    = this;
            var settings = this.settings;

            return function() {
                $this.trigger("action.before", this);
                
                this.$ctl        = name;
                this.$controller = name.split("/")[0];
                this.$action     = name.split("/")[1];
                this.$params     = arguments;
                var ctl          = settings.path + settings.controllerPath + name + ".js";

                require.undef(ctl);
                require([ctl], function() {
                    $this.trigger("route.after");
                    $this.trigger("action.after");
                });
            };
        },

        /**
         * HTTP / RESTful Client (httpx) Object
         * 
         * @return {void}
         */

        http : {},

        /**
         * ViewModel (Vue) Object
         * 
         * @return {void}
         */
        
        viewModel : {},

        /**
         * Router (Director) Object
         * 
         * @return {void}
         */
        
        router : {},

        /**
         * Add hook handle
         * 
         * @param  {String}   event  Hook name
         * @return {void}
         */

        on : function(event, handle) {
            $hooks[event] = handle;
        },

        /**
         * Remove hook handle
         * 
         * @param  {String}   event  Hook name
         * @return {void}
         */

        off : function(event) {
            $hooks[event] = null;

            delete $hooks[event];
        },

        /**
         * Trigger hook
         * 
         * @param  {String}   event  Hook name
         * @return {void}
         */

        trigger : function(event) {
        
            if ($hooks.hasOwnProperty(event)) 
            {
                if (typeof $hooks[event] !== "function") 
                {
                    throw new TypeError("Hook " + event + " is not callable");
                }

                $hooks[event].bind(this)(arguments);
            }

        },

        /**
         * Self extensions
         * 
         * @param  {Object}   ext  Extention object
         * @return {void}
         */

        extend : function (ext) {
            if (typeof ext !== "object") {
                throw new TypeError("extend(ext) param must be Object tpye.");
            }

            extend(this, ext);
        },

        /**
         * Add event listener
         * 
         * @param  {Object}   obj             DOM / BOM Object
         * @param  {String}   type            Event type
         * @param  {Function} handler         Event handler
         * @param  {Boolean}  [capture=false] Use capture
         * @return {void}
         */

        addEvent    : addEvent,

        /**
         * Remove event listener
         * 
         * @param  {Object}   obj             DOM / BOM Object
         * @param  {String}   type            Event type
         * @param  {Function} callback        Removed callback
         * @param  {Boolean}  [capture=false] Use capture
         * @return {void}
         */

        removeEvent : removeEvent,

        /**
         * Route not found handle
         * 
         * @return {Boolean} false
         */

        notFound    : function () {
            console.error("HTTP 404 Not Found.", this);

            return false;
        },

        /**
         * Using Require.js text plugin require file
         * 
         * @param  {String}   name      file name
         * @param  {Function} callback  Loaded callback
         * @return {void}
         */

        requireFile : function(name, callback) {
            callback = callback || function() {};

            var settings = this.settings;
            var file     = settings.path + settings.viewPath + name + settings.viewSuffix;

            require(["text!" + file], function(content) {
                callback(content, file, name);
            });
        },

        /**
         * Using Require.js css plugin require css file
         * 
         * @param  {String}   css       CSS file name
         * @param  {Function} callback  Loaded callback
         * @return {void}
         */
        
        requireCSS : function(css, callback) {
            callback = callback || function() {};

            var settings = this.settings;
            var file     = settings.path + settings.cssPath + css;

            require(["css!" + file], function() {
                callback(file);
            });
        },    

        /**
         * Render view (model) template
         * 
         * @param  {String} tpl      Temaplate file name
         * @param  {Object} vm       View Model (Vue) options
         * @return {void}
         */

        render : function(tpl, vm) {

            this.trigger("render.before");

            var $this    = this;
            var settings = $this.settings;
            var tplFile  = "text!" + settings.path + settings.viewPath + tpl + settings.viewSuffix;

            require([tplFile], function(tpl) {
                vm.template = tpl;

                $this.$vm = new $this.viewModel(vm);

                $this.trigger("render.after");
            });
        }
    };

    /**
     * Require main callback
     * 
     * @param {Object}  Director Director object
     * @param {Object}  Vue      Vue object
     * @param {Object}  httpx    httpx object
     */

    function requireMain(Director, Vue, httpx) { 

        this.http = Drv.http  = Vue.prototype.$http = httpx;
        this.http.constructor = function httpx() {};
        this.viewModel        = Vue;

        var $routes  = {};
        var settings = this.settings;
        var routes   = settings.routes;

        if (!settings.directorConfigs.resource)
        {
            for (var i in routes)
            {
                if (typeof routes[i] === "string")
                {
                    routes[i] = this.controller(routes[i]);
                }

                $routes[i] = routes[i];
            }
        }

        this.router = Router(routes);

        var directorConfigs = {
            resource     : $routes,
            html5history : settings.useHistory,
            on           : $hooks["route.on"],
            before       : $hooks["route.before"],
            after        : $hooks["route.after"],
            notfound     : this.notFound
        };

        directorConfigs = (settings.directorConfigs) ? settings.directorConfigs : directorConfigs;

        this.router.configure(directorConfigs).init(settings.routeInit);

        this.trigger("run.after");
    }
    
    /**
     * Drv.App bootstrap
     * 
     * @param   {Object}  routes    Routes object
     * @returns {Object}  Drv.App   Drv.App instance object
     */

    DrvApp.prototype.run = function(routes) {

        this.trigger("run.before");

        routes = extend(this.settings.routes, routes || {});

        this.$data           = {};
        this.settings.routes = routes;

        require(["director", "vue", "httpx"], requireMain.bind(this));
        
        return this;
    };
    
    DrvApp.prototype.constructor = DrvApp;
    
    Drv.App      = DrvApp;
    Drv.mainAttr = "drv-main";
    
    /**
     * Run form main file
     * 
     * @return {void}
     */

    function runFromMainFile() {

        if (typeof document !== "undefined")
        {
            var drvMain = document.querySelector("[" + Drv.mainAttr + "]");

            if (drvMain) 
            {
                require([drvMain.getAttribute(Drv.mainAttr)], function() {
                    runInMainFile = true;
                });
            }
        }
    }
    
    runFromMainFile();
    
    return Drv;
});