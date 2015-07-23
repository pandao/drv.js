# Drv.js

The Combined Type JavaScript MVVM / MVC / SPA Development Framework, Based on Director.js, Require.js and Vue.js.

### Install

```shell
bower install drv.js --save
```

### Framework & Dependents

- Router / Controller - [Director.js](https://github.com/flatiron/director)
- Module Loader - [Require.js](https://github.com/jrburke/requirejs)
- ViewModel (Two-way bindings) - [Vue.js](https://github.com/yyx990803/vue)
- HTTP / RESTful Client - [httpx.js](https://github.com/pandao/httpx.js)
- Template Engine - [tileTemplate.js](https://github.com/pandao/tileTemplate)

> `bower.json` other dependencies `vue-touch, vue-validator, jquery, requirejs-text, underscore, require-css, tiletemplate` default no load .
> If you not need other dependencies, you can edit `bower.json` or execute command `bower uninstall vue-touch vue-validator jquery requirejs-text underscore require-css tiletemplate`.

### Compatibility

- Firefox 4.0+
- Chrome 7+
- IE 9+
- Opera 11.60+
- Safari 5.1.4+

> Drv.js based on ES5 (ECMAScript 5), supported other ES5+ browsers .
> ECMAScript 5 compatibility table : [http://kangax.github.io/compat-table/es5/](http://kangax.github.io/compat-table/es5/).

### Directory structure

    you-app/
        bower_components/
        controllers/
        configs/
        images/
        views/
        css/
		lib/
        ...
        bower.json
        index.html
        main.js

### Usage

index.html :

```html
<div id="layout"></div>
<script src="./bower_components/requirejs/require.js"></script>
<script drv-main="./main" src="./bower_components/drv.js/dist/drv.min.js"></script>
```

main.js :

```javascript
define(["./configs/routes"], function(routes) {
    var app = Drv.App(); // or Drv.App({your-configs ...});
    app.run(routes, function() {
        console.log(this);
    });
});
```

> Configuration options reference => `console.log(Drv.defaults);` or `console.log(app.settings);`

routes.js :

```javascript
define({
    "/"          : function() {},  // Director.js original way
    "/books"     : "book/index",   // Using Drv.App.Controller, autoload you-app/controllers/book/index.js
    "/books/:id" : "book/view",
    "/author"    : "author",
    "/about"     : "about"
});
```

> Router (Director.js) API Documentation [https://github.com/flatiron/director#api-documentation](https://github.com/flatiron/director#api-documentation)

Controller `book/view.js` :

```javascript
// You can use Require.js css / text plugin for deps
define(["your-deps"], function() {
    var app    = Drv.getApp(); // Get app instance, On current page is singleton.
    var router = app.router;   // router.getRoute(), router.getPath()
    var params = router.$params;

    // Vue ViewModel Options
    var vmOptions = {
        el   : "#layout",
        data : {
            id : params[0],
            name : "Drv.js"
        },
        ready : function() {
            console.log("Vue.$http", this.$http);
        },
        methods : {
            clickDiv : function(e) {
                console.log(e.target);
            }
        }
    };

    // render you-app/views/index.html
    app.render("index", vmOptions);
});
```

> ViewModel (Vue.js) Guide [http://vuejs.org/guide/](http://vuejs.org/guide/)

View `views/index.html` :

```html
<h1>View index.html {{name}} id={{id}}</h1>
<input v-model="name" />

<div style="width:100px;height:100px;background:green;color:#fff;" v-on="click:clickDiv">Drv.js</div>
```

> ViewModel directives [http://vuejs.org/api/directives.html](http://vuejs.org/api/directives.html)

### Documentations

- Director.js API Documentation [https://github.com/flatiron/director#api-documentation](https://github.com/flatiron/director#api-documentation)
- Require.js API Documentation [http://requirejs.org/docs/api.html](http://requirejs.org/docs/api.html)
- Require.js 中文 API 文档 [http://requirejs.cn/docs/api.html](http://requirejs.cn/docs/api.html)
- Vue.js Guide [http://vuejs.org/guide/](http://vuejs.org/guide/)
- Vue.js API Documentation [http://vuejs.org/api/](http://vuejs.org/api/)
- Vue.js 中文开发指南 [http://cn.vuejs.org/guide/](http://cn.vuejs.org/guide/)
- Vue.js 中文 API 文档 [http://cn.vuejs.org/api/](http://cn.vuejs.org/api/)

### Changes

[Change logs](https://github.com/pandao/drv.js/blob/master/CHANGE.md)

### License

The [MIT License](https://github.com/pandao/drv.js/blob/master/LICENSE).

Copyright (c) 2015 Pandao
