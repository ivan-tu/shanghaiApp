/*!
 * xzSystem.js v2.0.1-beta.0
 * (c) 2018-20@2 Sean lee
 */
//记录全局app
let app, currentPage, pageURL;

(function(global, $) {

    //客户端类型
    let clients = ['web', 'app', 'wx', 'ali', 'bai'];

    //记录最新页面id
    let topPageId = 0;

    //页面模块包裹容器
    let pageWrapper = '#pageWrapper';

    //页面标题包裹容器
    let pageTitleWrapper = '#pageTitleWrapper';

    //缓存组件
    let pages = {};

    //最近打开的页面
    let recentPage;

    //上拉触底触发事件距离
    let onReachBottomDistance = isIos ? 100 : 20;

    //页面框架元素
    let pageFrameEl = null;

    //记录页面地址
    pageURL = pageUrl;


    /**
     *响站系统
     */
    xzSystem = {


        /**
         *资源加载，并初始化完成后事件
         */

        init() {

            app.onLaunch();

            if (!global.pageData) {

                global.pageData = {
                    url: window.location.href
                };

            } else {
                pageURL = global.pageData.url;
            };



            let _this = this,
                ready = function() {
                    _this.loadPage(global.pageData);
                };

            if (isApp && !wx.app.call) {
                wx.app.connect(ready);
            } else {
                ready();
            };
            _this.preventA();
        },

        /**
         *注册App
         */

        App(obj) {
            app = obj;
            app.Component = function(obj) {
                if (!obj.methods) {
                    obj.methods = {};
                };
                obj.methods.model = function(e) {
                    let _this = this,
                        key = app.eData(e).model,
                        value = app.eValue(e);
                    if (key) {
                        let data = {};
                        data[key] = value;
                        _this.setData(data);
                    }
                };
                Component(obj);
            };
            app.system = {
                pixelRatio: window.devicePixelRatio || 1,
                language: navigator.browserLanguage ? navigator.browserLanguage : navigator.language,
                windowWidth: $(window).width(),
                windowHeight: $(window).height()
            };
            $(window).resize(function() {
                app.system.windowWidth = $(window).width();
                app.system.windowHeight = $(window).height();
            });
        },

        /**
         *获取App
         */

        getApp() {
            return app;
        },

        /**
         *注册页面
         */

        Page(obj) {

            obj.pageId = obj.pageId.toLowerCase();
            if (!pages[obj.pageId]) {
                pages[obj.pageId] = {};
            };

            let methods = obj.methods || {};
            for (key in obj) {
                if (typeof obj[key] == 'function') {
                    methods[key] = obj[key];
                    delete obj[key];
                }
            };
            methods.setData = function(obj) {
                for (key in obj) {
                    let value = obj[key];
                    if (key.split('.').length > 1) {
                        let ts = key.split('.'),
                            target;
                        switch (ts.length) {
                            case 2:
                                target = this[ts[0]];
                                break;
                            case 3:
                                target = this[ts[0]][ts[1]];
                                break;
                            case 4:
                                target = this[ts[0]][ts[1]][ts[2]];
                                break;
                            case 5:
                                target = this[ts[0]][ts[1]][ts[2]][ts[3]];
                                break;
                            case 6:
                                target = this[ts[0]][ts[1]][ts[2]][ts[3]][ts[4]];
                                break;
                            case 7:
                                target = this[ts[0]][ts[1]][ts[2]][ts[3]][ts[4]][ts[5]];
                                break;
                        };
                        key = ts[ts.length - 1];
                        this.$set(target, key, value);
                    } else {
                        this.$set(this, key, value);
                    };
                };
            };
            methods = $.extend({
                onLoad: $.noop,
                onReady: $.noop,
                onShow: $.noop,
                onHide: $.noop,
                onUnload: $.noop,
                onPullDownRefresh: $.noop,
                onReachBottom: $.noop,
                onShareAppMessage: $.noop,
                onPageScroll: $.noop,
                onTabItemTap: $.noop,
                selectComponent: function(selector) {
                    let children = this.$children,
                        el;
                    if (children && children.length) {
                        if (!selector) {
                            el = children[0];
                        } else {
                            if (selector.indexOf('#') == 0) {
                                selector = selector.substring(1);
                                $.each(children, function(i, item) {
                                    if (item.$attrs.id == selector) {
                                        el = item;
                                    };
                                    return;
                                });
                            } else if (selector.indexOf('.') == 0) {
                                selector = selector.substring(1);
                                $.each(children, function(i, item) {
                                    if (item.$attrs.class == selector) {
                                        el = item;
                                    };
                                    return;
                                });
                            };
                        };
                    };
                    return el;
                }
            }, methods);

            obj.methods = methods;

            if (obj.data instanceof Array) {
                obj.data = {};
            };

            pages[obj.pageId].obj = obj;
        },

        /**
         *加载页面
         */

        loadPage(obj, wrapper, dialogSuccess) {



            if (!obj) return;

            let url;

            if (typeof obj == 'string') {
                url = obj;
            } else {
                url = obj.url;
            };

            url = this.getFullUrl(url);

            pageURL = url;

            let _this = this,
                route = _this.getPageRoute(url),
                pData = _this.parseURL(url),
                pageId = _this.getPageId(pData).toLowerCase();

            pData.pageId = pageId;

            _this.host = _this.getHost(pageURL);
			
			if (pData.params.pocode) {
              app.session.set('vcode', pData.params.pocode);
            };

            if (pData.params.userSession && pData.params.weixinLogin) {
                app.setUserSession({
                    userSession: pData.params.userSession,
                    pocode: pData.params.pcode
                });
								pageURL=pageURL.replace('weixinLogin=1','');
								pageURL=pageURL.replace('userSession='+pData.params.userSession,'');
								window.location.href=pageURL;
								return;
            };

            //如果页面已经存在，则激活页面        
            if ($('div[route="' + route + '"]').length && !wrapper) {
                //_this.activePage(route,url);
                return;
            }

            //如果页面数据已经存在，则渲染页面
            else if (typeof obj == 'object' && obj.template) {

                if (obj.template) {
                    let template = obj.template;
                    if (typeof template == 'object' && template.html) {
                        template = template.html;
                    };
                    if (global.xzParse) {
                        template = xzParse(template);
                    };

                    pages[pageId].template = template;
                    delete obj.template;
                };

                obj.wrapper = wrapper;
                obj.dialogSuccess = dialogSuccess;
                obj.pageId = pageId;
                _this.createPage(obj);
            } else {

                //如果是站点发布项目，则获取页面数据
                if (projectId == 'pub' && (pData.url || pData.systemId == 'pub')) {
                    let pUrl = pData.url || pData.moduleId;
                    app.request('/pub/api/getPageData', {
                        url: pUrl,
                        client: client,
                        xzAppId: xzAppId
                    }, function(backData) {
                        backData.wrapper = wrapper;
                        backData.dialogSuccess = dialogSuccess;
                        backData.pageId = pageId;
                        _this.createPage(backData);
                    });
                }

                //获取页面组件数据
                else {

                    let next = function() {
                        _this.createPage({
                            url: url,
                            wrapper: wrapper,
                            dialogSuccess: dialogSuccess,
                            pageId: pageId
                        });
                    };

                    //如果页面数据存在，创建页面
                    if (pages[pData.pageId]) {
                        next();
                        //如果不存在，则加载页面数据         
                    } else {
                        _this.loadPageData(pData, next);
                    };
                };

            };

        },

        /**
         *加载页面数据，
         tData:页面参数
         {
             systemId:系统id
             moduleId:模块id
             templateId:模板id
        }
        callback:回调事件
         */

        loadPageData(tData, callback) {


            let _this = this,
                dist = this.getModuleSrc(tData.systemId, tData.moduleId),
                src = dist + tData.moduleId;;


            let page = pages[tData.pageId],
                getTemplate = function() {
                    if (tData.template) {
                        setTemplate(tData.template);
                    } else {
                        _this.get(dist + tData.templateId + '.html', function(html) {
                            if (html) {
                                setTemplate(html);
                            } else {
                                console.log('no template');
                            };
                        });
                    };
                },
                setTemplate = function(html) {

                    if (global.xzParse) {
                        html = xzParse(html);
                    };
                    pages[tData.pageId].template = html;
                    done();
                },
                done = function() {
                    _this.loadSrc(src + '.js', function() {
                        callback(pages[tData.pageId]);
                    });
                };

            if (page) {
                done();
            } else {
                pages[tData.pageId] = {
                    json: {}
                };
                _this.loadSrc(src + '.css');
                _this.get(src + '.json', function(backData) {
                    try {
                        let json = JSON.parse(backData),
                            fn = function() {
                                if (json.usingComponents && !$.isEmptyObject(json.usingComponents)) {
                                    let i = 0,
																				l = 0;
																		$.each(json.usingComponents, function(key, value) {
																				i++;
																		});
                                    $.each(json.usingComponents, function(key, value) {
                                        _this.getComponent(key, app.config.staticPath + value.substring(1), function() {
                                            l++;
                                            if (l == i) {
                                                getTemplate();
                                            }
                                        });
                                    });
                                } else {
                                    getTemplate();
                                };
                            };
                        pages[tData.pageId].json = json;
                        fn();

                    } catch (e) {
                        getTemplate();
                    }
                }, getTemplate);
            };

        },

        /**
         *创建页面
         */

        createPage(opts) {

            let _this = this;

            if (!pages[opts.pageId].obj) return;

            //如果页面需要登录后操作，当前未登录，则跳转到登录页
            if (_this.pageType == 'manage' && app.config.managerSession && pages[opts.pageId].obj.managerSession !== false && !app.checkManager()) {

                let backUrl = pageURL;

                app.checkManager({
                    success: function() {
                        app.navTo(backUrl);
                        app.managerLoginSuccess = null;
                    }
                });

                return;
            };


            let json = pages[opts.pageId].json || {};
            if (!isApp) {
                if ((xzSystemConfig.pageFrame && !json.removeFrame) || (!xzSystemConfig.pageFrame && json.addFrame)) {
                    if (pageFrameEl) {
                        pageFrameEl.show();
                        $('body').addClass('hasPageFrame');
                    } else {
                        _this.addPageFrame(function() {
                            _this.createPage(opts);
                        });
                        return;
                    };
                } else if (pageFrameEl) {
                    pageFrameEl.hide();
                    $('body').removeClass('hasPageFrame');
                };

            };



            topPageId++;

            opts.pId = 'page' + topPageId;

            let route = this.getPageRoute(opts.url || pageURL);

            if (opts.wrapper) {
                route = opts.wrapper.replace('#', '') + '_' + route;
            };

            opts.route = route;

            let dialogSuccess = opts.dialogSuccess;

            if (dialogSuccess) {
                delete opts.dialogSuccess;
            };

            //创建页面
            let newPage = new page(opts);


            //执行页面准备完成事件
            newPage.pageXzp.onReady();

            //缓存页面xzp实例
            this.xzpInstances[route] = {
                page: newPage
            };


            //如果不是弹出页面则显示本页面
            if (!opts.wrapper) {
                xzSystem.activePage(route, opts.url);
            } else if (dialogSuccess) {
                dialogSuccess(this.xzpInstances[route]);
            };
        },

        /**
         *激活页面
         */

        activePage(url, full) {

            let Anchor;

            if (full.split('#').length > 1) {
                Anchor = full.split('#')[1];
            };

            if (currentPage) {
                /*currentPage.scrollTop=$(window).scrollTop();
                currentPage.page.hide();
                recentPage=currentPage;*/
                currentPage.page.remove();

            };
            currentPage = this.xzpInstances[url];
            currentPage.page.show();
            app.trigger(global.onPageShow, full);


            let scrollTop = currentPage.scrollTop;

            if (scrollTop == undefined && Anchor) {
                setTimeout(function() {
                    if ($('#' + Anchor).length) {
                        scrollTop = $('#' + Anchor).offset().top;

                        $(window).scrollTo(scrollTop);
                    };
                }, 200);
            } else {
                setTimeout(function() {
                    $(window).scrollTo(scrollTop || 0);
                }, 5);
            };


        },

        /**
         *加载页面框架
         */

        addPageFrame(callback) {
            let _this = this,
                dist = _this.getModuleSrc('assets', 'pageFrame'),
                src = dist + 'pageFrame';
            _this.loadSrc(src + '.css');
            _this.get(src + '.html', function(html) {
                pageFrameEl = $(html);
                $('body').prepend(pageFrameEl).addClass('hasPageFrame');
                _this.loadSrc(src + '.js', function() {
                    callback();
                });
            });
        },

        /**
         *缓存组件数据
         */

        useComponents: {},

        componentsLoad: {},

        xzpInstances: {},


        /**
         *加载组件数据
         */

        getComponent(name, src, success) {
            let _this = this;

            if (_this.useComponents[name]) {
                success();
            } else {
                _this.componentsLoad[name] = 0;
                _this.useComponents[name] = {};

                let loaded = function() {
                    _this.componentsLoad[name]++;
                    if (_this.componentsLoad[name] == 2) {
                        delete _this.componentsLoad[name];
                        _this.loadSrc(src + '.js', success);
                    };
                };
                _this.loadSrc(src + '.css');
                _this.get(src + '.html', function(backData) {
                    _this.useComponents[name] = backData;
                    loaded();
                });
                _this.get(src + '.json', function(backData) {
                    try {
                        let json = JSON.parse(backData);
                        if (json.usingComponents && !$.isEmptyObject(json.usingComponents)) {
                            let i = 0,
                                l = 0;
                            $.each(json.usingComponents, function(key, value) {
                                i++;
                            });
                            $.each(json.usingComponents, function(key, value) {
                                _this.getComponent(key, app.config.staticPath + value.substring(1), function() {
                                    l++;
                                    if (l == i) {
                                        loaded();
                                    }
                                });
                            });
                        } else {
                            loaded();
                        };
                    } catch (e) {
                        loaded();
                    }
                }, loaded);
            };
        },


        /**
         *注册组件
         */

        Component(opts) {

            let template = xzSystem.useComponents[opts.comName];

            if (!template) {
                console.log(opts.comName + ' template is undefined');
                return;
            } else if (global.xzParse) {

                template = global.xzParse(template);

            };


            opts.comName = opts.comName.toLowerCase();

            //设置标签的setData函数
            $.extend(true, opts, {
                methods: {
                    setData: function(obj) {
                        for (key in obj) {
                            let value = obj[key];
                            if (key.split('.').length > 1) {
                                let ts = key.split('.'),
                                    target;
                                switch (ts.length) {
                                    case 2:
                                        target = this[ts[0]];
                                        break;
                                    case 3:
                                        target = this[ts[0]][ts[1]];
                                        break;
                                    case 4:
                                        target = this[ts[0]][ts[1]][ts[2]];
                                        break;
                                    case 5:
                                        target = this[ts[0]][ts[1]][ts[2]][ts[3]];
                                        break;
                                    case 6:
                                        target = this[ts[0]][ts[1]][ts[2]][ts[3]][ts[4]];
                                        break;
                                    case 7:
                                        target = this[ts[0]][ts[1]][ts[2]][ts[3]][ts[4]][ts[5]];
                                        break;
                                };
                                key = ts[ts.length - 1];
                                this.$set(target, key, value);
                            } else {
                                this.$set(this, key, value);
                            };
                        };
                    }
                }
            });

            if (opts.ready) {
                opts.methods.ready = opts.ready;
            };
            if (opts.properties) {
                $.each(opts.properties, function(name, type) {
                    if (typeof type == 'object' && type.value) {
                        type.default = type.value;
                        delete type.value;
                    };
                });
            };
						

            let comOpts = {
                props: opts.properties,
				watch:opts.watch,
                data: function() {
                    let data = $.extend(true, {
                        language: app.language
                    }, opts.data);
                    return data;
                },
                methods: opts.methods,
                template: opts.notTemplate ? '' : template
            };

            Xzp.component(opts.comName, comOpts);

        },

        getHost(url) {
            return url.split('://').length > 1 ? url.split('://')[0] + '://' + url.split('://')[1].split('/')[0] : '';
        },

        /**
         *获取完整链接
         */

        getFullUrl(url) {


            let host = this.getHost(pageURL);

            if (url.indexOf('/') == 0) {
                url = host + url;
            } else {
                url = xzSystem.getFullSrc(url, pageURL)
            };

            return url;
        },

        /**
         *解析链接
         */

        parseURL(url) {

            let Anchor = '',
                options = {};

            if (url.indexOf('#') >= 0) {
                Anchor = url.split('#')[1];
                url = url.split('#')[0];
            };

            if (url.indexOf('?') > -1) {
                let start = url.indexOf('?');
                options = this.urlToJson(url);
                url = url.substring(0, start);
            };

            if (url.indexOf('://') > -1) {
                url = url.substring(url.indexOf('://') + 3);
                if (url.indexOf('/') > -1) {
                    url = url.substring(url.indexOf('/') + 1);
                };
            };

            if (url.substring(url.length - 5) == '.html') {
                url = url.substring(0, url.length - 5);
            };

            if (url.indexOf('/') > -1 && $.inArray(url.split('/')[0], clients) > -1) {
                url = url.substring(url.indexOf('/') + 1);
            };

            if (!url) {
                url = 'index';
            };

            let urls = url.split('/'),
                obj = {
                    pageType: pageType || this.pageType,
                    params: options,
                    Anchor: Anchor
                },
                key;

            if (urls[0].length == 1 && !independent && projectId == 'pub') {
                obj.url = url;
            } else {
                if (urls.length > 2) {
                    obj.pageType = urls[0];
                    obj.systemId = urls[1];
                    obj.moduleId = urls[2];
                    if (urls.length > 3) {
                        obj.templateId = urls[3];
                    }
                } else if (urls.length > 1) {
                    obj.systemId = urls[0];
                    obj.moduleId = urls[1];
                } else {
                    obj.systemId = projectId;
                    obj.moduleId = urls[0];
                };
            };

            if (obj.pageType == 'p') {
                obj.pageType = 'show';
            };
            if (!obj.templateId) {
                obj.templateId = obj.moduleId;
            };

            if (!obj.pageType) {
                obj.pageType = 'show';
            };
            this.pageType = obj.pageType;

            return obj;

        },

        /**
         *url参数转json
         */

        urlToJson(str) {

            str = decodeURIComponent(str);
            let data = {},
                name = null,
                value = null,
                num = str.indexOf("?");
            if (num > -1) {
                str = str.substr(num + 1);
            };
            let arr = str.split("&");
            for (let i = 0; i < arr.length; i++) {
                num = arr[i].indexOf("=");
                if (num > 0) {
                    name = arr[i].substring(0, num);
                    value = arr[i].substr(num + 1);
                    data[name] = value;
                }
            };
            return data;
        },

        /**
         *获取url传参
         */

        getUrlParams(url) {
            return this.parseURL(url).params;
        },


        /**
         *根据系统id获取系统的资源地址
         */

        getSystemDist(systemId) {
            let path = projectId == systemId ? localDistPath : distPath;
            return path.replace('{{systemId}}', systemId).replace('{{pageType}}', this.pageType).replace('{{client}}', client);
        },


        /**
         *根据系统id和模块id获取模块的资源地址
         */

        getModuleSrc(systemId, moduleId) {

            if (isApp) {
                return this.getSystemDist(systemId) + moduleId + '/';
            } else {

                if (independent) {
                    return this.getSystemDist(systemId) + moduleId + '/';
                } else {
                    return this.getSystemDist(systemId) + (projectId == systemId ? '' : this.pageType + '/' + client + '/') + moduleId + '/';
                };
            };

        },

        /**
         *获取页面路由
         */

        getPageRoute(url) {
            let options = url.split('?').length > 1 ? '?' + url.split('?')[1] : '';
            url = this.parseURL(url);
            return url.systemId + '/' + url.moduleId + '/' + url.templateId + options;

        },


        /**
         *获取页面名称
         */

        getPageId(obj) {

            return obj.systemId + '-' + obj.moduleId;

        },


        /**
         *获取模板数据
         */

        get(url, data, success, fail) {

            if ($.isFunction(data)) {
                fail = success;
                success = data;
                data = {};
            };

            let aData = {
                    requestUri: url,
                    requestData: data
                },
                error = function(backData) {
                    if ($.isFunction(fail)) {
                        fail(backData);
                    } else {

                    };
                };

            if (isApp) {
				//$.get(url, success); 旧版本（ios升级到wk webview后用不了了。）
				if(isIos){
					wx.app.call('nativeGet', {
						data :url,
						success:success
					});
				}else{
					$.get(url, success);
				};
            } else {
                $.ajax({
                    type: "GET",
                    dataType: 'html',
                    url: ajaxURL,
                    data: aData,
                    success: success,
                    error: fail
                });
            };

        },

        /**
         *获取当前最高层级
         */

        getTopIndex() {
            if (!this.topIndex) {
                this.topIndex = 1000;
            };
            return this.topIndex++;
        },

        /**
         *获取当前最高id
         */

        getTopId() {
            if (!this.topId) {
                this.topId = 100;
            };
            return this.topId++;
        },

        /**
         *创建透明蒙层，防止点击穿透
         */

        getMaskEl(background) {
            return $('<div style="z-index:' + this.getTopIndex() + ';' + (background ? 'background:' + background : '') + '" class="xzui-mask"></div>');
        },

        /**
         *根据相对路径获取绝对路径
         */
        getFullSrc(src, currentSrc) {
            if (currentSrc) {
                currentSrc = currentSrc.split('?')[0];
            };
            if (src.indexOf('./') == 0) {
                let end = currentSrc.lastIndexOf("/"),
                    u = currentSrc.substring(0, end);
                src = u + src.substring(1);
            } else if (src.indexOf('../') == 0) {
                if (currentSrc.indexOf('../') == 0) {
                    $.each(currentSrc.split('../'), function(i, item) {
                        if (i > 0) {
                            src = '../' + src;
                        };
                    });
                } else if (currentSrc.indexOf('./') != 0) {
                    let host = '',
                        start = currentSrc.indexOf('://');

                    if (start > -1) {
                        host = currentSrc.substring(0, start) + '://';
                        currentSrc = currentSrc.substring(start + 3);
                    };
                    let lens = src.split('../'),
                        st = lens.length,
                        tsrc = lens[st - 1],
                        ct = currentSrc.split('/').length;

                    if (ct > 1) {
                        let ns = '';
                        if (ct > st) {
                            $.each(currentSrc.split('/'), function(i, item) {
                                if (i < ct - st) {
                                    ns += item + '/';
                                };
                            });
                            src = host + ns + tsrc;
                        } else {
                            if (currentSrc.indexOf('/') == 0) {
                                src = '/' + tsrc;
                            };
                        }
                    };
                };
            };

            return src;
        },
        /**
         *加载单个资源，可加载js和css，加载成功后执行事件
         srcs:'a.css'//资源
         callback:fn//执行事件
         */

        loadSrc(src, callback, require) {
            if (!src) return;
            if (require) {
                let currentSrc = $('script:not(.require):last').attr('src');
                src = xzSystem.getFullSrc(src, currentSrc);
            };
			let v = src.indexOf('?')>=0?'&v='+Math.random():'?v='+Math.random(),
				type = src.split('?')[0].split('.')[src.split('.').length - 1],
				vsrc = src+v,
				lsrc = type.indexOf('js') == 0 ? document.querySelector('script[src="' + vsrc + '"]') : document.querySelector('link[href="' + vsrc + '"]');

            if (typeof callback != 'function') {
                callback = function() { return null };
            };

            if (lsrc) {
                if (lsrc.loadeds) {
                    if (lsrc.loaded == 'yes') {
                        callback(lsrc);
                    } else {
                        lsrc.loadeds.push(callback);
                    }
                } else {
                    callback(lsrc);
                };
            } else {
                let newscr;
                if (type == 'css') {
					newscr = document.createElement("link");
                    newscr.href = vsrc;
                    newscr.rel = "stylesheet";
                    newscr.type = "text/css";
                } else {
                    newscr = document.createElement("script");
                    newscr.src = vsrc;
                    if (require == 'require') {
                        newscr.className = 'require';
                    };
                };
                newscr.loadeds = [callback];
                let jsonload = function() {
                    newscr.loaded = 'yes';
                    for (var i = 0; i < newscr.loadeds.length; i++) {
                        newscr.loadeds[i](newscr);
                    };
                };
                if (document.all) {
                    newscr.onreadystatechange = function() {
                        if (newscr.readyState == 'loaded' || newscr.readyState == 'complete') {
                            jsonload();
                        }
                    }
                } else {
                    newscr.onload = jsonload;
                    newscr.onerror = jsonload;
                };
                document.head.appendChild(newscr);
            }

        },

        /**
         *加载多个资源，加载成功后执行事件
         srcs:['a.css','b.js']//资源数组
         callback:fn//执行事件
         */

        loadSrcs(srcs, callback) {
            if (!srcs) return;
            var i = 0,
                _this = this,
                loads = function() {
                    _this.loadSrc(srcs[i], function() {
                        i++;
                        if (i < srcs.length) {
                            loads();
                        } else {
                            callback ? callback() : '';
                        };
                    });
                };

            loads();

        },

        /**
         *处理a链接为应用跳转事件
         */

        preventA() {
            let _this = this,
                arr = ['tel', 'sms', 'javascript', 'add', 'mail', 'mailto'];
            $('body').delegate('a', 'click', function(e) {
                let href = $(this).attr('href') || 'javascript:;';
                if (href.indexOf('#') != 0 && $.inArray(href.split(':')[0], arr) < 0) {
                    if (isApp || $(this).attr('target') != '_blank') {
                        let type = $(this).attr('open-type') || 'navigate';
                        href = xzSystem.getFullUrl(href);
                        switch (type) {
                            case 'navigate':
                                app.navTo(href);
                                break;

                            case 'redirect':
                                app.redirectTo(href);
                                break;

                            case 'switchTab':
                                app.switchTab(href);
                                break;

                            case 'reLaunch':
                                app.reLaunch(href);
                                break;

                            case 'navigateBack':
                                app.navBack();
                                break;
                        };

                        e.preventDefault();
                    };
                };
            }).delegate('select,input[type="range"]', 'change', function() {
                $(this).blur();
            });
        },

        /**
         *更改页面标题
         */

        setPageTitle(obj) {
            $(pageTitleWrapper).text(obj.title);
        },

        /**
         *滚动触底触发事件
         */
        reachBottom(target, container, success) {
            let bt = 0;
            target.scroll(function() {
                if (target.scrollTop() + onReachBottomDistance >= container.height() - target.height()) {
                    bt++;
                    if (bt == 1) {
                        success();
                        setTimeout(function() {
                            bt = 0;
                        }, 1000);
                    };
                };
            });
        }


    };

    /**
     *响站系统页面
     */
    class page {

        //构造页面
        constructor(opts) {

            let _this = this,
                options = xzSystem.getUrlParams(opts.url),
                pageData = $.extend(true, {}, pages[opts.pageId]),
                pageObj = pageData.obj;

            if (!pageObj) {
                console.log('page was not find');
                return null;
            };
												
            let pageEl = $('<div class="page ' + (opts.wrapper ? 'active' : '') + '"  id="' + opts.pId + '" route="' + opts.route + '"><div id="' + opts.pId + '_xzp">' + pageData.template + '</div></div>');

            //设置页面html
            pageEl.appendTo(opts.wrapper || pageWrapper);

            //创建页面xzp实例

            let pageXzp = new Xzp({
                el: '#' + opts.pId + '_xzp',
                data: pageObj.data,
                methods: pageObj.methods
            });

            _this.route = opts.route;
            _this.options = options;
            _this.pageXzp = pageXzp;
            _this.hide = function() {
                pageEl.removeClass('active');
                pageXzp.onHide();
            };
            _this.show = function() {
                pageEl.addClass('active');
                pageXzp.onShow();
            };
            _this.remove = function() {
                pageEl.remove();
                pageXzp.onUnload();
                pageXzp.$destroy();
            };

            let ready = function(xz) {
                $.each(xz.$children, function(i, item) {
                    if (app.isFunction(item.ready)) {
                        item.ready();
                    };
                    if (item.$children.length) {
                        ready(item);
                    };
                })
            };

            ready(pageXzp);		
						if(!isApp&&(options&&!options.dialogPage)&&pages[opts.pageId].json&&pages[opts.pageId].json.navigationBarTitleText){
								app.setPageTitle(pages[opts.pageId].json.navigationBarTitleText);
						};

            pageXzp.onLoad(options);

        };

    };

    $(document).ready(function() {

        $('#lowerBrowser').remove();

        xzSystem.init();

        xzSystem.reachBottom($(window), $('body'), function() {
            currentPage.page.pageXzp.onReachBottom();
        });
		
		//点击滑动菜单栏自动滑出隐藏部分
		$(document).delegate('.searchCategory-box .list','click',function(){
			let grandFather = $(this).parent().parent(),
				parent = $(this).parent(),
				scrollWidth = grandFather[0].scrollWidth,
				windowWidth = $('body').width(),
				offsetLeft = $(this).offset().left+28;
			if(scrollWidth>windowWidth){
				let scrollNum = '';
				if(offsetLeft<windowWidth*0.5){//靠左
					scrollNum = grandFather.scrollLeft() - (windowWidth*0.5 - offsetLeft);
				}else if(offsetLeft>windowWidth*0.5){//靠右
					scrollNum = grandFather.scrollLeft() + (offsetLeft - windowWidth*0.5);
				};
				if(scrollNum<=0){
					scrollNum = 0;
				}else if(scrollNum>=scrollWidth){
					scrollNum = scrollWidth;
				};
				grandFather.animate({ 
					scrollLeft: scrollNum
				}, 300);
			};
		});
		
		//兼容安卓微信浏览器字体设置太大导致页面错乱的问题
		function handleFontSize(){
			//设置网页字体为默认大小
			WeixinJSBridge.invoke('setFontSizeCallback', { 'fontSize' : 0 });
			//重写设置网页字体大小的事件
			WeixinJSBridge.on('menu:setfont', function() {
				WeixinJSBridge.invoke('setFontSizeCallback', { 'fontSize' : 0 });
			});
		};
		if(typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function"){
			handleFontSize();
		}else{
			if(document.addEventListener){
				document.addEventListener("WeixinJSBridgeReady", handleFontSize, false);
			}else if(document.attachEvent){
				document.attachEvent("WeixinJSBridgeReady", handleFontSize);
				document.attachEvent("onWeixinJSBridgeReady", handleFontSize);  
			};
		};
    });

    $(window).scroll(function() {
        currentPage.page.pageXzp.onPageScroll({ scrollTop: $(window).scrollTop() });
    });

})(this, jQuery);