/*!
 * app.js v2.0.1-beta.0
 * (c) 2018-20@2 Sean lee
 */

let xzApp;

(function() {

  //略缩图的质量
  let thumbnailQuality = 95;

  //图片最大尺寸
  let maxImgSize = 9999;

  let wxApi = ['setTabBarBadge', 'removeTabBarBadge', 'showTabBarRedDot', 'hideTabBarRedDot', 'setTabBarStyle', 'setTabBarItem', 'showTabBar', 'hideTabBar', 'redirectTo', 'switchTab', 'reLaunch'];

  //支持的视频文件格式
  let videoExtensions = 'mp4,mov,flv,f4v,mpe,vob,wmv,mpg,mlv,mpeg,avi,3gp,ra,rm,rmvb,ram';

  //支持的图片文件格式
  let imageExtensions = 'jpg,jpeg,png,gif';

  let arr = [];

  let getProto = Object.getPrototypeOf;

  let slice = arr.slice;

  let concat = arr.concat;

  let push = arr.push;

  let indexOf = arr.indexOf;

  let class2type = {};

  let toString = class2type.toString;

  let hasOwn = class2type.hasOwnProperty;

  let fnToString = hasOwn.toString;

  let ObjectFunctionString = fnToString.call(Object);

  let app, client, isWX;
  
  let packageA = ['questionnaire/','package/'];


  function isArrayLike(obj) {


    let length = !!obj && "length" in obj && obj.length,
      type = app.type(obj);

    if (type === "function") {
      return false;
    }

    return type === "array" || length === 0 ||
      typeof length === "number" && length > 0 && (length - 1) in obj;
  };


  xzApp = {

    init(App) {

      app = App;

      client = App.config.client;

      isWX = client == 'wx';

      if (!app.gData) {
        app.gData = {
          session: {}
        };
      };
	  
      app.gData.session = wx.getStorageSync('session') || {};

      app.noop = function() {};

      app.getRandom = function(length) {
        let charactors = "ab1cd2ef3gh4ij5kl6mn7opq8rst9uvw0xyz",
          value = '',
          i;
        length = length || 4;
        for (var j = 1; j <= length; j++) {
          i = parseInt(35 * Math.random());

          value += charactors.charAt(i);
        };
        return value;
      };

      app.getNowRandom = function() {
        var j = Math.ceil(Math.random() * 10000).toString(),
          m = j.length;
        if (m < 4) {
          for (var q = 0; q < 4 - m; q++) {
            j += '0';
          };
        };
        return Date.now() + j;
      };

      app.inArray = function(elem, arr, i) {
        return arr == null ? -1 : indexOf.call(arr, elem, i);
      };

      app.isFunction = function(obj) {

        return app.type(obj) === "function";
      };

      app.isPlainObject = function(obj) {
        let proto, Ctor;

        if (!obj || toString.call(obj) !== "[object Object]") {
          return false;
        };

        proto = getProto(obj);

        if (!proto) {
          return true;
        };

        Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
        return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
      };

      /**
       *检测是否空对象，是返回true，否返回false
       */

      app.isEmptyObject = function(obj) {
        let name;
        for (name in obj) {
          return false;
        };
        return true;
      };

      /**
       *获取对象类型
       */

      app.type = function(obj) {
        if (obj == null) {
          return obj + "";
        };
        return typeof obj === "object" || typeof obj === "function" ?
          class2type[toString.call(obj)] || "object" :
          typeof obj;
      };

      /**
       *遍历数组和对象，回调函数拥有两个参数：第一个为对象的成员或数组的索引，第二个为对应变量或内容。如果需要退出 each 循环可使回调函数返回 false，其它返回值将被忽略。
       */

      app.each = function(obj, callback) {
        let length, i = 0;
        if (isArrayLike(obj)) {
          length = obj.length;
          for (; i < length; i++) {
            if (callback.call(obj[i], i, obj[i]) === false) {
              break;
            }
          }
        } else {
          for (i in obj) {
            if (callback.call(obj[i], i, obj[i]) === false) {
              break;
            }
          }
        };
        return obj;
      };

      app.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),
        function(i, name) {
          class2type["[object " + name + "]"] = name.toLowerCase();
        });

      /**
       *设置转发api
       */
      app.each(wxApi, function(i, item) {

        if (app.isFunction(wx[item])) {
          app[item] = wx[item];
        } else {
          app[item] = function(obj) {
            obj = obj || {};
            app.trigger(obj.fail, {
              errMsg: 'app.' + item + ' is undefined'
            });
            app.trigger(obj.complete);
          }
        };
      });

      /**
       *用一个或多个其他对象来扩展一个对象，返回被扩展的对象。
       */
      app.extend = function() {
        let options, name, src, copy, copyIsArray, _clone,
          target = arguments[0] || {},
          i = 1,
          length = arguments.length,
          deep = false;

        if (typeof target === "boolean") {
          deep = target;

          target = arguments[i] || {};
          i++;
        };

        if (typeof target !== "object" && !app.isFunction(target)) {
          target = {};
        };

        if (i === length) {
          target = this;
          i--;
        };

        for (; i < length; i++) {
          if ((options = arguments[i]) != null) {
            for (name in options) {
              src = target[name];
              copy = options[name];

              if (target === copy) {
                continue;
              };

              if (deep && copy && (app.isPlainObject(copy) ||
                  (copyIsArray = Array.isArray(copy)))) {

                if (copyIsArray) {
                  copyIsArray = false;
                  _clone = src && Array.isArray(src) ? src : [];

                } else {
                  _clone = src && app.isPlainObject(src) ? src : {};
                }

                target[name] = app.extend(deep, _clone, copy);

              } else if (copy !== undefined) {
                target[name] = copy;
              }
            }
          }
        }
        return target;
      };
			
			/**
			 *url转为json
			 */
			 app.urlToJson=function(str) {

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
        };

      //添加双向绑定事件
      let model = function(e) {
        let _this = this,
          data = {},
          key, value;
        if (e.detail && e.detail.model) {
          key = e.detail.model;
          value = e.detail.value;
          data[key] = value;
          _this.setData(data);
        } else {
          key = app.eData(e).model;
          value = app.eValue(e);
          if (key) {
            data[key] = value;
            _this.setData(data);
          }
        };
      };

      /**
       *扩展app
       */

      app.extend({
        Page: function(obj) {


          if (!obj.methods) {
            obj.methods = {};
          };

          obj.methods.__onLoad = obj.methods.onLoad;

          obj.methods.onLoad = function(options) {
						
						let pageLoaded=app.storage.get('pageLoaded')||0;
						pageLoaded++;
						app.storage.set('pageLoaded',pageLoaded);
						
            if (options) {
              this.__options = options;
            };
            if (options.pocode) {
              app.session.set('vcode', options.pocode);
            };
						
            if (this.__onLoad) {
              this.__onLoad(options);
            }
          };
					obj.methods.gotoIndex=function(){
						app.switchTab({url:'../../'+app.config.projectId+'/index/index'});
					};

          if (isWX) {

            obj.getData = function() {
              return this.data;
            };

            if (obj.methods) {
              app.each(obj.methods, (key, value) => {
                obj[key] = value;
              });
              delete obj.methods;
            };

            /*if (!obj.onPullDownRefresh&&obj.onLoad){
              obj.onPullDownRefresh=function(){
                obj.onLoad();
                wx.stopPullDownRefresh();
              }
            }*/

          } else {
            obj.getData = function() {
              return this._data;
            };
          };

          obj.dialog = function(opts) {
            app.dialog(opts, obj);
          };

          obj.model = model;




          obj.data = app.extend(true, {
            language: app.language,
            assetsPath: isWX ? '/static/' : xzSystem.getSystemDist('assets'),
						staticPath:app.config.staticPath
						
          }, obj.data);

          //如果页面需要登录
          Page(obj);


        },

        Component: function(obj) {
          if (!obj.methods) {
            obj.methods = {};
          };
          obj.methods.model = model;

          obj.data = app.extend(true, {
            language: app.language,
						assetsPath: isWX ? '/static/assets/' : xzSystem.getSystemDist('assets'),
						staticPath:app.config.staticPath
          }, obj.data);

          if (isWX) {
            obj.methods.getData = function() {
              return this.data;
            };
            obj.methods.pEvent = function(event, e) {
              this.triggerEvent(event, e);
            }
          } else {
            obj.methods.getData = function() {
              let data = app.extend(true, this._data, this._props);
              return data;
            };
            obj.methods.pEvent = function(event, e) {
              this.$emit(event, {
                detail: e
              });
            }
          };
					obj.methods.gotoIndex=function(){
						app.switchTab({url:'../../'+app.config.projectId+'/index/index'});
					};
          Component(obj);
        },

        /**
         *注册引入的js模块
         */
        register(module, success) {
          if (isWX) {
            if (app.isFunction(success)) {
              success();
            };
          } else {
            register(module, success);
          };
        },

        /**
         *获取触发事件表单元素的以data-为前缀的所有属性和值
         <div data-id="123" data-index="1"></div>
         app.eData(e);
         返回：{"id":"123","index":"1"}
         */

        eData: function(e) {
          if (isWX) {
            return e.currentTarget.dataset;
          } else {
            if (e.currentTarget.attributes.length) {
              let _this = this,
                data = {};
              _this.each(e.currentTarget.attributes, function(i, item) {
                if (item.nodeName.indexOf('data-') == 0) {
                  data[item.nodeName.substring(5)] = item.nodeValue
                };
              });
              return data;
            } else {
              return {};
            };
          };
        },

        /**
         *获取触发事件表单元素的value
         */

        eValue: function(e) {
          if (isWX) {
            return e.detail.value;
          } else {

            if (app.eData(e)['switch'] == 'switch') {
              return e.currentTarget.checked;
            } else if (app.eData(e)['checkbox'] == 'checkbox') {
              let values = [];
              $(e.target).parents('checkbox-group:first').find('input[type="checkbox"]').each(function() {
                if ($(this).prop('checked')) {
                  values.push($(this).val());
                };
              });
              return values;
            } else if (app.eData(e)['radio'] == 'radio') {
              let value = '';
              $(e.target).parents('radio-group:first').find('input[type="radio"]').each(function() {
                if ($(this).prop('checked')) {
                  value = ($(this).val());
                };
              });
              return value;
            };

            return e.currentTarget.value
          };
        },

        /**
         *删除数组中的第几个值，返回新的数组
         app.removeArray(["a","b","c"],2);
         返回["a","b"]
         */
        removeArray: function(array, index) {
          let list = [];
          app.each(array, function(i, item) {
            if (i != index) {
              list.push(item);
            }
          });
          return list;
        },

        /**
         *执行函数
         app.trigger(callback);
         */

        trigger: function(fn, param) {
          if (typeof fn == 'function') {
            fn(param);
          };
        },

        /**
         *将json数据转换成字符串
         */

        toJSON: function(obj) {
          if (typeof obj == 'object') {
            return JSON.stringify(obj);
          } else {
            return obj;
          };
        },


        /**
         *设置语言包
         */

        setLanguage(lan) {

          app.language = lan;

        },

        /**
         *混合链接参数,输入固定链接和参数值，返回完整链接
         mixURL('p-user-list',{size:3,page:1});
         返回p-user-list?size=3&page=1
         */
        mixURL(url, obj) {
          if (typeof obj != 'object') {
            return url;
          } else {
            let parm = [];
            for (let key in obj) {
              parm.push(key + '=' + obj[key]);
            };
            parm = parm.join('&');
            let start = '?';
            if (url.indexOf('?') > -1) {
              start = '&';
            }
            return url + start + parm;
          };
        },

        /**
         *打开页面
         */

        navTo(url) {
		  if(app.config.client=='wx'){
			  let isPackageUrl = false;
			  app.each(packageA,function(i,item){
				  if(url.indexOf(item)>=0){
					  isPackageUrl = true;
					  return;
				  };
			  });
			  if(isPackageUrl){
				  url = url.replace('../../','/packageA/');
				  url = url.replace('/p/','/packageA/');
			  };
		  };
          wx.navigateTo({
            url: url
          });
        },


        /**
         *关闭当前页面，跳转到应用内的某个页面。
         */
        redirectTo(url) {
		  if(app.config.client=='wx'){
			  let isPackageUrl = false;
			  app.each(packageA,function(i,item){
				  if(url.indexOf(item)>=0){
					  isPackageUrl = true;
					  return;
				  };
			  });
			  if(isPackageUrl){
				  url = url.replace('../../','/packageA/');
				  url = url.replace('/p/','/packageA/');
			  };
		  };
          wx.redirectTo({
            url: url
          });
        },

        /**
         *关闭所有页面，打开到应用内的某个页面。
         */
        reLaunch(url) {
          console.log('🔄 [app.reLaunch] 准备跳转到:', url);
		  if(app.config.client=='wx'){
			  let isPackageUrl = false;
			  app.each(packageA,function(i,item){
				  if(url.indexOf(item)>=0){
					  isPackageUrl = true;
					  return;
				  };
			  });
			  if(isPackageUrl){
				  url = url.replace('../../','/packageA/');
				  url = url.replace('/p/','/packageA/');
			  };
		  };
          console.log('🔄 [app.reLaunch] 调用wx.reLaunch:', url);
          wx.reLaunch({
            url: url,
            success: function(res) {
              console.log('✅ [app.reLaunch] 跳转成功', res);
            },
            fail: function(err) {
              console.log('❌ [app.reLaunch] 跳转失败', err);
            }
          });
        },

        /**
         *跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面。
         */
        switchTab(obj) {
          if (client == 'app' && typeof obj.url == 'string') {
            obj = {
              url: obj.url
            };
          };
          wx.switchTab(obj);
        },

        /**
         *页面后退,num为后退的层级，不传则为1
         */

        navBack(num) {
          if (!num) {
            num = 1;
          };
          wx.navigateBack({
            delta: num
          });
        },

        /**
         *设置页面标题
         */

        setPageTitle(title) {
          wx.setNavigationBarTitle({
            title: title
          });
        },

        /**
         *获取页面栈实例
         */

        getCurrentPages() {
          if (isWX) {
            return getCurrentPages();
          } else {
            let ps = [];
            app.each(this.xzpInstances, function(k, v) {
              ps.push(v);
            });
            return ps;
          }
        },

        /**
         *重载当前页面以外的所有页面
         */
        reloadOtherPages() {
          console.log('🔄 [app.reloadOtherPages] 开始重载其他页面');
          if (isWX) {
            console.log('🔄 [app.reloadOtherPages] 微信小程序环境，暂不处理');
            /* app.each(getCurrentPages(), function (i, item) {

             });*/
          } else {
            if (isApp) {
              console.log('🔄 [app.reloadOtherPages] app环境，调用原生方法');
              wx.app.call('reloadOtherPages', {
                success: function(res) {
                  console.log('✅ [app.reloadOtherPages] 原生调用成功', res);
                },
                fail: function(err) {
                  console.log('❌ [app.reloadOtherPages] 原生调用失败', err);
                }
              });
            } else {
              console.log('🔄 [app.reloadOtherPages] 非app环境，无需处理');
            }
          }
        },

        /**
         *获取请求头信息
         */

        getHeader() {
          /*return {
            'content-type': 'application/x-www-form-urlencoded',
            'isWeixin': client == 'web' && isWeixin ? '1' : '0',
            'isWeixinMini': isWX ? '1' : '0',
            xzAppId:app.config.xzAppId,
			thisAppId:client=='web'?'user':app.config.thisAppId,
            session: app.toJSON(app.storage.get('session'))
          };*/
		  let fromclient = 'h5',
		      sessionData = app.storage.get('session');
		  if(app.config.client=='wx'){
			  fromclient = 'wxapp';
		  }else if(app.config.client=='app'){
			  if(isIos){
				  fromclient = 'ios';
			  }else{
				  fromclient = 'android';
			  };
		  }else if(isWeixin){
			  fromclient = 'wxh5';
		  };
		  return {
			  'content-type': 'application/json',//'application/x-www-form-urlencoded',
			  'clientKey':sessionData.clientKey,
			  'managerSession':sessionData.managerSession||'',
			  'userSession':sessionData.userSession||'',
			  'fromclient':fromclient,
			  'xzAppId': app.config.xzAppId,
			  'isWeixin': client == 'web' && isWeixin ? '1' : '0',
			  'vcode':sessionData.vcode||'',
			  'session':app.toJSON(app.storage.get('session')),
		  };
        },


        /**
         *验证用户是否登录
         */

        checkUser(obj) {
          let flag = !!app.session.get('userSession'),
            timeout = true;
						
					/*if(app.config.client=='web'&&!app.storage.get('userLoginV2')){
						app.storage.remove('user_expires_in');
						app.storage.remove('pocode');
						app.session.remove('userSession');
						app.storage.set('userLoginV2',Number(new Date().getTime()));
						return false;
					};*/

          //验证时间是否过期    
          if (app.storage.get('user_expires_in')) {
            if (!flag) {
              app.storage.remove('user_expires_in');
            } else {
              if ((Number(new Date().getTime()) - Number(app.storage.get('user_expires_in'))) / 1000 < 60 * 60 * 24* 365) {
                timeout = false;
              };
            };
          };

          if (obj) {
            if (app.isFunction(obj)) {
              obj = {
                success: obj
              };
            };
            obj = app.extend({
              success: app.noop,
              fail: app.noop,
              goLogin: true
            }, obj);
            if (flag) {

              if (timeout) {
                app.request('api/userapi/checkUserSession', function() {
                  app.storage.set('user_expires_in', new Date().getTime());
                  obj.success();
                }, function() {
                  app.storage.remove('user_expires_in');
                  app.storage.remove('pocode');
                  app.session.remove('userSession');
                  if (obj.goLogin) {
                    app.userLogin(obj);
                  } else {
                    obj.fail();
                  }
                });
              } else {
                obj.success();
              };
            } else if (obj.goLogin) {
              app.userLogin(obj);
            } else {
              obj.fail();
            };
          } else {
			if(flag && !timeout && (!app.storage.get('pocode')||app.storage.get('pocode')=='undefined')){//已登录并且没有pocode
				app.request('//userapi/info',{},function(backData){
					if(backData.invitationNum){
						console.log('设置pocode成功');
						app.storage.set('pocode',backData.invitationNum);
					};
				},function(){});
			};
            return flag && !timeout;
          };
        },

        /**
         *验证管理员是否登录
         */

        checkManager(obj) {
          let flag = !!app.session.get('managerSession'),
            timeout = true;

          //验证时间是否过期      
          if (app.storage.get('manager_expires_in')) {
            if (!flag) {
              app.storage.remove('manager_expires_in');
            } else {
              if ((Number(new Date().getTime()) - Number(app.storage.get('manager_expires_in'))) / 1000 < 60 * 60) {
                timeout = false;
              };
            };
          };

          if (obj) {
            if (app.isFunction(obj)) {
              obj = {
                success: obj
              };
            };
            obj = app.extend({
              success: app.noop,
              fail: app.noop,
              goLogin: true
            }, obj);
            if (flag) {

              if (timeout) {
                app.request('api/managerapi/checkManagerSession', function() {
                  app.storage.set('manager_expires_in', new Date().getTime());
                  obj.success();
                }, function() {
                  app.storage.remove('manager_expires_in');
                  app.session.remove('managerSession');
                  if (obj.goLogin) {
                    app.managerLogin(obj);
                  } else {
                    obj.fail();
                  }
                });
              } else {
				  
                obj.success();
              };
            } else if (obj.goLogin) {
              app.managerLogin(obj);
            } else {
              obj.fail();
            };
          } else {
            return flag && !timeout;
          };
        },

        /**
         *用户登录
         */

        userLogin(obj) {

          let _this = this;
          if (isWX) {
            if (!_this.userLoginCallback) {
              _this.userLoginCallback = [obj.success];
            } else {
              _this.userLoginCallback.push(obj.success);
            };

            delete obj.success;

            if (!app.userLogining) {
              app.userLoginSuccess = function() {
                if (_this.userLoginCallback) {
                  app.each(_this.userLoginCallback, function(i, item) {
                    item();
                  });
                  app.userLogining = false;
                };
                _this.userLoginCallback = null;
              };
              app.weixinLogin(obj);
              setTimeout(function() {
                app.userLogining = false;
              }, 5000);
            };
          } else {
            let backUrl = pageURL;
            app.userLoginSuccess = function() {
              app.userLogining = false;
              app.redirectTo(backUrl);
              app.userLoginSuccess = null;
			  //APP管理端登录就获取店铺
			 /* if(app.config.client=='app'){
				  app.request('//shopapi/getManagerShop', function (res) {
					  let manageShopId, manageShopShortId;
					  if (res.my && res.my.length) {
						  manageShopId = res.my[0].shopid;
						  manageShopShortId = res.my[0].shortid;
					  } else if (res.manage && res.manage.length) {
						  manageShopId = res.manage[0].shopid;
						  manageShopShortId = res.manage[0].shortid;
					  };
					  if (manageShopId) {
						  app.session.set('manageShopId', manageShopId);
						  app.session.set('manageShopShortId', manageShopShortId);
					  };
				  },function(){});
			  };*/
            };
			//生成客户端秘钥
			let clientKey = app.session.get('clientKey');
			if (!clientKey) {
			  clientKey = app.getNowRandom();
			  app.session.set('clientKey', clientKey);
			};
            if (client == 'web' && isWeixin) {
              app.weixinLogin();
            } else {
              app.redirectTo('../../user/login/login');
            };
          };
          app.userLogining = true;
        },

        /**
         *存储用户登录信息
         */

        setUserSession(obj) {
          app.storage.set('user_expires_in', new Date().getTime());
          app.storage.set('pocode', obj.pocode);
          app.session.set('userSession', obj.userSession);
		  
		  //更新注册时填写的头像昵称
		  let userLoginInfo = app.storage.get('userLoginInfo')||{};
		  if(userLoginInfo.username){
			  app.request('//userapi/setting',userLoginInfo,function(){
			  },function(){
			  },function(){
				  app.storage.remove('userLoginInfo');
			  });
		  };
          /*if (app.config.client == 'app') {
			let headerData = this.getHeader();
			app.request('//tximapi/getUserInfo',{},function(backData){
			  wx.app.call('userLogin', {
				  data: {
					header:headerData,
					imData:backData
				  },
				  complete:function(){
					  app.reloadOtherPages();
				  },
			  });
		  	});
          }else{		
          	app.reloadOtherPages();
		  };*/
		  app.reloadOtherPages();
        },

        /**
         *删除用户登录信息
         */
        removeUserSession() {
		  console.log('🔄 [removeUserSession] 开始执行退出登录');
		  app.storage.remove('user_expires_in');
          app.storage.remove('pocode');
          app.session.remove('userSession');
		  app.session.remove('manageShopId');
		  app.session.remove('manageShopShortId');
          if (app.config.client == 'app') {
            console.log('🔄 [removeUserSession] 调用原生userLogout方法');
            wx.app.call('userLogout', {
              data: {
                header: app.getHeader()
              },
              success: function(res) {
                console.log('✅ [removeUserSession] userLogout调用成功', res);
              },
              fail: function(err) {
                console.log('❌ [removeUserSession] userLogout调用失败', err);
              },
			  complete:function(){
                console.log('🔄 [removeUserSession] 调用reloadOtherPages');
				app.reloadOtherPages();
			  }
            });
          }else{
            console.log('🔄 [removeUserSession] 非app环境，直接调用reloadOtherPages');
			app.reloadOtherPages();
		  };
        },

        /**
         *管理员登录
         */

        managerLogin(obj) {

          let _this = this;
          app.managerLogining = true;
          if (isWX) {
            app.weixinLogin(obj);
          } else {

            if (!_this.managerLoginCallback) {
              _this.managerLoginCallback = [obj.success];
            } else {
              _this.managerLoginCallback.push(obj.success);
            };

            app.managerLoginSuccess = function(backData) {
              app.storage.set('manager_expires_in', new Date().getTime());
              if (_this.managerLoginCallback) {
                app.each(_this.managerLoginCallback, function(i, item) {
                  item();
                });
                app.managerLogining = false;
              };
              _this.managerLoginCallback = null;
            };
            xzSystem.loadPage('../../manager/login/login');
          }
        },

        /**
         *微信登录
         */

        weixinLogin(obj) {
          obj = app.extend({
            fail: app.fail
          }, obj);
          if (obj.success) {
            app.userLoginSuccess = obj.success;
          } else {
            obj.success = app.noop;
          };
          app[client].weixinLogin(obj);
        },

        /**
         *本地存储，除key为session以外的数据，仅存储在本地，不发送到服务器
         app.storage.set('userId','123456');
         */

        storage: {
          //设置一个session，如果session已经存在，会修改值
          set: function(key, value) {
            wx.setStorageSync(key, value);
          },
          //获取一个session，不存在则为undefined
          get: function(key) {
            return wx.getStorageSync(key);
          },
          //清除所有存储
          clear: function() {
            wx.clearStorageSync();
          },
          //删除某个session
          remove: function(key) {
            wx.removeStorageSync(key);
          }
        },

        /**
         *应用session，请求数据时会将session从header中发生给服务器
         app.session.get(key);
         */

        session: {
          //设置一个session，如果session已经存在，会修改值
          set: function(key, value) {
            let session=app.storage.get('session')||{};
				session[key]=value;
				app.gData.session=session;
            app.storage.set('session', session);
			//新增针对“各店”,修改店铺管理id时，通知app
			/*if(app.config.client=='app'&&key=='manageShopId'){
				let headerData = {
					'content-type': 'application/x-www-form-urlencoded',
					'isWeixin': '0',
					'isWeixinMini': '0',
					xzAppId: app.config.xzAppId,
					session: app.toJSON(app.storage.get('session'))
				};
				let sessionData = app.storage.get('session');
				if(sessionData.manageShopId){
					wx.app.call('refreshSession', {
						data:{
							header:headerData
						}
					});
				};
			};*/		
          },
          //获取一个session，不存在则为undefined
          get: function(key) {
			  let session=app.storage.get('session');
			  if(session){
				   return session[key];
			  }else{
				  return '';
			  };
          },
          //清除所有session
          clear: function() {
            app.gData.session = {};
            app.storage.remove('session');
          },
          //删除某个session
          remove: function(key) {
						let session=app.storage.get('session')||{};
						delete session[key];
            app.gData.session=session;
            app.storage.set('session', session);
          }
        },
        /**
         *ajax获取json数据
         ap.request('/api/user/login',{account:123,password:abc},function(){loginSuccess();});
         */
		request(url, data, success, fail, complete, getKey) {

          if (app.isFunction(data)) {
            getKey = complete;
            complete = fail;
            fail = success;
            success = data;
            data = {};
          };

          //生成客户端秘钥
          let _this = this,
            clientKey = app.session.get('clientKey'),
            clientKeySuccess = function() {
              if (_this.clientKeySuccess) {
                app.each(_this.clientKeySuccess, function(i, item) {
                  item();
                });
              };
              _this.clientKeySuccess = null;
            };

          if (!clientKey) {
            clientKey = app.getNowRandom();
            app.session.set('clientKey', clientKey);
          };

          if (url.indexOf('/') == 0) {
            url = url.substring(1);
          };

          let urls = url.split('/');


          if (urls.length > 2) {
            let aData = data,
			/*{
                requestSystem: urls[0],
                requestUri: '/' + urls[1] + '/' + urls[2],
                requestData: data
              },*/
              showLoading,
              timeout,
              requestTask,
              error = function(errorMessage) {
                if (typeof fail == 'function') {
                  fail(errorMessage);
                } else {
                  app.tips(typeof errorMessage == 'string' ? errorMessage : '网络请求失败');
                };
              },
              onSuccess = function(res) {
                //app.alert(app.toJSON(res));
                if (res.data.code == '0') {
                  app.trigger(success, res.data.data);
                } else if (res.data.code == '1001' || res.data.errorMessage == '请先登录') {
                  if (isWX) {
                    app.removeUserSession();
                    app.userLogin({
                      success: function() {
                        app.request(url, data, success, fail, complete, getKey);
                      }
                    });
                  } else {
                    if (pageType == 'show' && !app.userLogining) {
                      let backUrl = pageURL;
                      app.removeUserSession();
                      app.userLogin({
                        success: function() {
                          if (isApp) {
                            xzSystem.loadPage(backUrl);
                          } else {
                            window.location.href = backUrl;
                          };
                        }
                      });
                    } else if (pageType == 'manage' && !app.managerLogining) {
                      let backUrl = pageURL;
                      app.managerLogin({
                        success: function() {
                          if (isApp) {
                            xzSystem.loadPage(backUrl);
                          } else {
                            window.location.href = backUrl;
                          };
                        }
                      });
                    }
                  }
                } else {
                  error(res.data.errorMessage);
                }
              },
              onComplete = function() {
                clearTimeout(timeout);
                if (showLoading) {
                  clearTimeout(showLoading);
                } else {
                  wx.hideLoading();
                };
                app.trigger(complete);

              };

            timeout = setTimeout(function() {
              error();
              onComplete();
              if (isWX) {
                requestTask.abort();
              };
            }, app.config.networkTimeout.request);

            showLoading = setTimeout(function() {
              wx.showLoading();
              showLoading = null;
            }, 1000);

            /*aData = {
                data: JSON.stringify(aData)
            };*/
			let requestURL = '/' + urls[1] + '/' + urls[2];
			if(isWX){
				requestURL = app.config.host+requestURL;
			};
            //发起请求          
            requestTask = wx.request({
              url: requestURL,//app.config.ajaxJSON,
              method: 'POST',
              header: this.getHeader(),
              data: JSON.stringify(aData),
              success: onSuccess,
              fail: error,
              complete: onComplete
            });

          };

        },
        request_a(url, data, success, fail, complete, getKey) {

          if (app.isFunction(data)) {
            getKey = complete;
            complete = fail;
            fail = success;
            success = data;
            data = {};
          };

          //生成客户端秘钥
          let _this = this,
            clientKey = app.session.get('clientKey'),
            clientKeySuccess = function() {
              if (_this.clientKeySuccess) {
                app.each(_this.clientKeySuccess, function(i, item) {
                  item();
                });
              };
              _this.clientKeySuccess = null;
            };

          if (!clientKey) {
            clientKey = app.getNowRandom();
            app.session.set('clientKey', clientKey);
          };

          // if (!clientKey && !getKey) {
          //     if (!_this.clientKeySuccess) {
          //         _this.clientKeySuccess = [function() {
          //             app.request(url, data, success, fail, complete);
          //         }];
          //         app.request('api/api/getClientKey', {}, function(backData) {
          //             app.session.set('clientKey', backData);
          //             clientKeySuccess();
          //         }, function() {
          //             app.session.set('clientKey', 'error');
          //             clientKeySuccess();
          //         }, '', true);
          //     } else {
          //         _this.clientKeySuccess.push(function() {
          //             app.request(url, data, success, fail, complete);
          //         });
          //     };

          //     return;
          // };



          if (url.indexOf('/') == 0) {
            url = url.substring(1);
          };

          let urls = url.split('/');



          if (urls.length > 2) {
            let aData = {
                requestSystem: urls[0],
                requestUri: '/' + urls[1] + '/' + urls[2],
                requestData: data
              },
              showLoading,
              timeout,
              requestTask,
              error = function(errorMessage) {
                if (typeof fail == 'function') {
                  fail(errorMessage);
                } else {
                  app.tips(typeof errorMessage == 'string' ? errorMessage : '网络请求失败');

                };
              },
              onSuccess = function(res) {
                //app.alert(app.toJSON(res));
                if (res.data.code == '0') {
                  app.trigger(success, res.data.data);
                } else if (res.data.code == '1001' || res.data.errorMessage == '请先登录') {
                  if (isWX) {
                    app.removeUserSession();
                    app.userLogin({
                      success: function() {
                        app.request(url, data, success, fail, complete, getKey);
                      }
                    });
                  } else {
                    if (pageType == 'show' && !app.userLogining) {
                      let backUrl = pageURL;
                      app.removeUserSession();
                      app.userLogin({
                        success: function() {
                          if (isApp) {
                            xzSystem.loadPage(backUrl);
                          } else {
                            window.location.href = backUrl;
                          };
                        }
                      });
                    } else if (pageType == 'manage' && !app.managerLogining) {
                      let backUrl = pageURL;
                      app.managerLogin({
                        success: function() {
                          if (isApp) {
                            xzSystem.loadPage(backUrl);
                          } else {
                            window.location.href = backUrl;
                          };
                        }
                      });
                    }
                  }
                } else {
                  error(res.data.errorMessage);
                }
              },
              onComplete = function() {
                clearTimeout(timeout);
                if (showLoading) {
                  clearTimeout(showLoading);
                } else {
                  wx.hideLoading();
                };
                app.trigger(complete);

              };

            timeout = setTimeout(function() {
              error();
              onComplete();
              if (isWX) {
                requestTask.abort();
              };
            }, app.config.networkTimeout.request);

            showLoading = setTimeout(function() {
              wx.showLoading();
              showLoading = null;
            }, 1000);

            if (isWX) {
              aData = {
                data: JSON.stringify(aData)
              };
            };

            //发起请求          
            requestTask = wx.request({
              url: app.config.ajaxJSON,
              method: 'POST',
              header: this.getHeader(),
              data: aData,
              success: onSuccess,
              fail: error,
              complete: onComplete
            });

          };

        },

        /*
         *弹出消息提示
         app.tips('成功');
         */
        tips(title, type,duration) {
          if (!title) return;
          let obj = {
            title: title,
            icon: 'none',
            duration: duration||1000
          };
          if (type == 'success' || type == 'loading') {
            obj.icon = type;
          };
          wx.showToast(obj);
        },


        /*
         *弹出Alert提示对话框
         */
        alert(content, success) {
          if (typeof content == 'string') {
            content = {
              content: content,
              success: function(res) {
                if (res.confirm) {
                  app.trigger(success);
                }
              }
            };
          };
          content.showCancel = false;
          wx.showModal(content);
        },

        /*
         *弹出Alert提示对话框
         */
        confirm(content, success, cancel) {
          if (typeof content == 'string') {
            content = {
              content: content,
              success: function(res) {
                if (res.confirm) {
                  app.trigger(success);
                } else if (res.cancel) {
                  app.trigger(cancel);
                }
              }
            };
          };
          wx.showModal(content);
        },

        /*
         *弹出底部列表菜单，第一个参数为菜单名称数组，第二个为点击菜单的成功回调，返回点击的菜单序号，第三个参数回点击取消时的回调
         app.actionSheet(['美国', '中国', '巴西', '日本'],function(index){
                        console.log(index);
                      },function(){
                        console.log('cancel');
                        });
         */
        actionSheet(itemList, success, cancel) {
          if (itemList.length && typeof success == 'function') {
            itemList = {
              itemList: itemList,
              success: function(res) {
                if (res.errMsg && res.errMsg != 'showActionSheet:ok') {
                  app.trigger(cancel);
                } else if (res.tapIndex != undefined) {
                  app.trigger(success, res.tapIndex);
                }
              }
            };
          };
          wx.showActionSheet(itemList);
        },

        /**
         *在web中打开一个对话框加载页面，在app和小程序中则新开页面
         */

        dialog(obj, page) {
          if (obj.url) {
            obj.url = app.mixURL(obj.url, {
              dialogPage: 1
            });
            app[client].dialog(obj, page || {});
          };
        },

        /**
         *与上一个页面通讯，在web中，弹窗与页面的通讯
         */

        dialogBridge(data, success, fail) {
          app[client].dialogBridge(data, success, fail);
        },

        /**
         *返回数据并关闭弹窗
         */

        dialogSuccess(data) {
          this.dialogBridge(data);
          app[client].dialogSuccess();
        },


        /**
         *文字转图标
         */
        stringToIcon(str) {

          let icons = {
            'x': 'close',
            '<': 'left',
            '>': 'right',
            '...': 'ellipsis1',
            'y': 'check',
            'i': 'about',
            '<-': 'arrowleft'
          };

          if (icons[str]) {
            return '<i class="xzicon-' + icons[str] + '"></i>';
          } else {
            return str;
          };

        },


        /**
         *选择文件
         mimeType为文件类型,多个文件类型用,号分割，
         也可以直接使用image,video,audio,file
         image：支持的全部图片类型image/png,image/jpeg,image/gif,image/bmp,image/tiff,image/x-icon
         video：支持的全部视频类型video/mpeg,video/quicktime,video/x-msvideo,video/x-sgi-movie,video/x-ms-asf
         audio：支持的全部音频类型audio/mpeg,audio/mid,audio/x-aiff,audio/x-pn-realaudio
         file：支持的全部文件类型application/msword,application/vnd.ms-powerpoint,application/pdf,application/zip,application/vnd.ms-excel,application/kswps,application/kset,application/ksdps,application/x-rar-compressed         
         */

        chooseFile(obj) {
			let options = app.extend({
				count: 1,
				mimeType: 'image',
				success: app.noop,
				fail: app.noop,
				complete: app.noop
			}, obj);
		
			if (isWX) {
				options.success = function(res) {
					let i = 0, files = [], getInfo = function() {
						let src = res.tempFilePaths[i], file = {
							path: src,
							size: res.tempFiles[i].size
						};
						wx.getImageInfo({
							src: src,
							success: function(req) {
								file.width = req.width;
								file.height = req.height;
								file.orientation = req.orientation;
								files.push(file);
								i++;
								if (i < res.tempFiles.length) {
									getInfo();
								} else {
									obj.success(files);
								}
							}
						})
					};
					getInfo();
				};
				if (options.mimeType == 'image') {
					wx.chooseImage(options);
				} else if (options.mimeType == 'video') {
					wx.chooseVideo({
						success: function(res) {
							let files = [];
							files.push({
								width: res.width,
								height: res.height,
								size: res.size,
								path: res.tempFilePath,
								orientation: 'up',
							});
							obj.success(files);
						}
					});
				};
			} else {
				app[client].chooseFile(options);
			}
		},

        /**
         *上传文件
          //文件开始上传时，返回上传任务，执行res.task.stop可停止上传
           start:function(res){
             res.task.stop();
           },
           //文件上传进行中
           res={
             loaded:123//已上传数据大小
             size:123214//文件总大小
             percent:已上传进度0-100
            }
           progress：function(res){
             
           },
           //文件上传成功后
           res={
              key:1233.jpg//已成功上传的文件地址
             }
           success: function (res) {
             
           },
         */

        uploadFile(obj) {
          obj = app.extend({
            max_file_size: 1000000 * 1024 * 1024,
            start: app.noop,
            success: app.noop,
            fail: app.noop,
            complete: app.noop
          }, obj);
         
         
           
            if (obj.file.size > obj.max_file_size) {
            app.alert(app.language.sizeExceed + ' ' + this.converFileSize(obj.max_file_size), function() {
              obj.fail({
                errMsg: 'max_file_size_error'
              });
            });
          } else {
            let success = obj.success;
            obj.success = function(res) {
               let type = res.key.split('.')[1],
                   name = res.key.split('.')[0],
                   isVideo=app.config.uploadFileType && app.config.uploadFileType.video && app.config.uploadFileType.video.indexOf(type) > -1 ;
              if (isVideo) {
                app.request('//upload/index', {
                  key: res.key
                }, function(backData) {
                  res.key = name + '.mp4';
                  res.cover = name + '.png';
                  success(res);
                });
              } else {
                success(res);
              };
            };
            app[client].uploadFile(obj);
          };
        },
				//删除文件
				deleteFile:function(file,callback){
					if(file){
						app.request('//upload/deleteFile',{file:file},function(){
							if(typeof callback=='function'){
								callback();
							};
						},function(){
						});
					};
				},

        /**
         *上传文件
         {
           //上传文件个数，默认为1
           count:0,
           //上传文件类型,默认为'image/*'。
           mimeType: [],
           //选择文件成功后
           choose:function(files){
             
           },
           //文件开始上传时，返回上传任务，执行res.task.stop可停止上传
           res={
             index:0,//第几个文件
             task:{}//上传任务实例
           }
           start:function(res){
             res.task.stop();
           },
           //文件上传进行中
           res={
             index:0,//第几个文件
             loaded:123//已上传数据大小
             size:123214//文件总大小
             percent:已上传进度0-100
            }
           progress：function(res){
             
           },
           //文件上传成功后
           res={
              index:0,//第几个文件
              key:1233.jpg//已成功上传的文件地址
             }
           success: function (res) {
             
           },
           //所有文件上传完成时,返回全部上传成功的文件名数组和文件地址数组
           res={
            key: ['1.jpg','2.jpg']
            src:['http://abc.com/1.jpg']
           }
           complete:function(res){
             
           },
           //出错时
           fail:function(err){
             
           }
         }
         */

        upload(obj) {
          obj = app.extend({
            count: 1,
            mimeType: 'image',
            fail: app.noop,
            choose: app.noop,
            start: app.noop,
            progress: app.noop,
            success: app.noop,
            fail: app.noop,
            complete: app.noop
          }, obj);
          app.chooseFile({
            count: obj.count,
            mimeType: obj.mimeType,
            success: function(files) {
              let num = 0,
                key = [],
                src = [],
                upload = function() {
                  app.uploadFile({
                    mimeType: obj.mimeType,
                    file: files[num],
                    start: function(res) {
                      res.index = num;
                      obj.start(res);
                    },
                    progress: function(res) {
                      res.index = num;
                      obj.progress(res);
                    },
                    success: function(res) {
                      res.index = num;
                      obj.success(res);
                      key.push(res.key);
                      src.push(app.config.filePath + res.key);
                      num++;
                      if (num < files.length) {
                        upload();
                      } else {
                        obj.complete({
                          key: key,
                          src: src
                        });
                      };
                    },
                    fail: function(err) {
                      err.index = num;
                      obj.fail(err);
                    }
                  });
                };
              obj.choose(files);
              upload();
            },
            fail: obj.fail
          });
        },

        /**
         *转换文件大小单位
         */

        converFileSize(limit) {
          let size = "";
          if (limit < 0.1 * 1024) { //如果小于0.1KB转化成B  
            size = limit.toFixed(2) + "B";
          } else if (limit < 0.1 * 1024 * 1024) { //如果小于0.1MB转化成KB  
            size = (limit / 1024).toFixed(2) + "KB";
          } else if (limit < 0.1 * 1024 * 1024 * 1024) { //如果小于0.1GB转化成MB  
            size = (limit / (1024 * 1024)).toFixed(2) + "MB";
          } else { //其他转化成GB  
            size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB";
          };
          let sizestr = size + "";
          let len = sizestr.indexOf("\.");
          let dec = sizestr.substr(len + 1, 2);
          if (dec == "00") { //当小数点后为00时 去掉小数部分  
            return sizestr.substring(0, len) + sizestr.substr(len + 3, 2);
          };
          return sizestr;
        },

        /**
         *保存图片，小程序和app中保存到相册，电脑上为下载
         filePath:图片网络地址
         */

        saveImage(obj) {
          if (app.type(obj) == 'string') {
            obj = {
              filePath: obj
            };
          };
          obj = app.extend({
            success: app.noop,
            fail: app.noop,
            complete: app.noop
          }, obj);

          obj.filePath = obj.filePath.split('?imageMogr2')[0];

          if (isWX) {
            wx.downloadFile({
              url: obj.filePath,
              fail: obj.fail,
              success: function(res) {
                obj.filePath = res.tempFilePath;
                wx.saveImageToPhotosAlbum(obj);
              }
            });
          } else {
            app[client].saveImage(obj);
          }
        },



        /**
         *使用富文本编辑器,仅web中有效
         app.htmlEditor({
              title:'编辑内容',
              content:'<div>不错的说</div>',
              success:function(content){
                console.log(content);
              }
            });
         */

        htmlEditor(obj) {
          if (isWX) {
            if (obj.fail) {
              obj.fail({
                errMsg: 'Not support!'
              });
            };
          } else {
            wx.htmlEditor(obj);
          }
        },


        /**
         *解析使用编辑器编辑的html数据,
         imageWidth为图片显示最大宽度，如果没有传，则为窗口宽度
         */

        parseHtmlData(html, imageWidth) {
          let imageMogr = app.image.width('image', imageWidth).split('?')[1];
          if (html) {
            html = html.replace(/data-imagesrc/g, 'src').replace(/imagesrc/, imageMogr);
            return html;
          } else {
            return '';
          };
        },


        /**
         *预览图片
         obj为单张图片路径，或object，object时参考微信小程序
         {
           current:String,当前显示图片的链接，不填则默认为 urls 的第一张
           urls:StringArray,需要预览的图片链接列表
           success:,
           fail:,
           complete:
           }
         */
        previewImage(obj) {
          if (!obj) return;
          if (typeof obj == 'string') {
            obj = {
              urls: [obj]
            }
          };
          wx.previewImage(obj);
        },


        /**
         *支付
         */
        pay(obj) {
          if (!obj) return;

          obj = app.extend({
            success: app.noop,
            fail: app.noop,
            complete: app.noop
          }, obj);
          app.request('/finance/finance/createPayOrder', obj.data, function(backData) {
            obj.payOrderNum = backData;
            app[client].pay(obj);
          }, obj.fail);
        },

        /**
         *获取分享链接
         */

        getSharePath(path) {
          if (!path) {
            if (isWX) {
              let pages = getCurrentPages(),
                page = pages[pages.length - 1];
              path = page.route,
                options = app.extend({}, page.__options);
              delete options.pocode;
              path = app.mixURL(path, options);
            } else {
              path = pageURL;
            };
          };
          if (app.storage.get('pocode')) {
            path = app.mixURL(path, {
              pocode: app.storage.get('pocode')
            });
          };
          return path;
        },

        /**
         *分享
         */

        share(obj) {

          if (!isWX) {
            if (!obj) {
              obj = {};
            };

            let typeList = [{
              title: '微信好友',
              type: 'weixin'
            }, {
              title: '微信朋友圈',
              type: 'moments'
            }, {
              title: '微博',
              type: 'weibo'
            }, {
              title: 'QQ',
              type: 'qq'
            }, {
              title: 'QQ空间',
              type: 'qqZone'
            }, {
              title: '复制链接',
              type: 'copy'
            }];

            if (client == 'web') {
              typeList.push({
                title: '二维码',
                type: 'qrCode'
              });
            };

            obj = app.extend({
              type: typeList,
              path: this.getSharePath(obj.path)
            }, obj);
            wx.openShare(obj);
          }

        },

        /**
         *获取二维码图片
         */

        getQrCodeImg(path) {
          return 'https://' + app.config.domain + '/api/qrcode/?data=' + encodeURIComponent(path);
        },
        /**
         *获取距离今天多少天的日期time可以为负，不填为获取当天
         */

        getNowDate: function(time,hasTime) {
          let date = new Date();
          if (time && (time > 0 || time < 0)) {
            date.setTime(date.getTime() + (time * 24 * 60 * 60 * 1000));
          };
          let seperator1 = '-',
		      seperator2 = ':',
              year = date.getFullYear(),
              month = date.getMonth() + 1,
              strDate = date.getDate(),
			  hour = date.getHours(),
			  minute = date.getMinutes(),
			  second = date.getSeconds();
          if (month >= 1 && month <= 9) {
            month = "0" + month;
          };
          if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
          };
		  if (hour >= 0 && hour <= 9) {
            hour = "0" + hour;
          };
		  if (minute >= 0 && minute <= 9) {
            minute = "0" + minute;
          };
		  if (second >= 0 && second <= 9) {
            second = "0" + second;
          };
		  if(hasTime){
			return year + seperator1 + month + seperator1 + strDate +' '+hour + seperator2 + minute + seperator2 + second;
		  }else{
          	return year + seperator1 + month + seperator1 + strDate;
		  };
        },
		/**
         *时间戳转日期
         */

        getThatDate: function(time,time2,hasTime) {//时间戳，增加多少天，是否显示时分秒
		  if(!time)return;
          let date = new Date(time);
          if (time2 && (time2 > 0 || time2 < 0)) {
            date.setTime(date.getTime() + (time2 * 24 * 60 * 60 * 1000));
          };
          let seperator1 = '-',
		      seperator2 = ':',
              year = date.getFullYear(),
              month = date.getMonth() + 1,
              strDate = date.getDate(),
			  hour = date.getHours(),
			  minute = date.getMinutes(),
			  second = date.getSeconds();
          if (month >= 1 && month <= 9) {
            month = "0" + month;
          };
          if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
          };
		  if (hour >= 0 && hour <= 9) {
            hour = "0" + hour;
          };
		  if (minute >= 0 && minute <= 9) {
            minute = "0" + minute;
          };
		  if (second >= 0 && second <= 9) {
            second = "0" + second;
          };
		  if(hasTime){
			return year + seperator1 + month + seperator1 + strDate +' '+hour + seperator2 + minute + seperator2 + second;
		  }else{
          	return year + seperator1 + month + seperator1 + strDate;
		  };
        },
        /*获取字符串长度*/
        getLength: function(s) {
          var l = 0;
          var a = s.split("");
          for (var i = 0; i < a.length; i++) {
            if (a[i].charCodeAt(0) < 299) {
              l++;
            } else {
              l += 2;
            }
          };
          return l;
        },
		/*获取保留2位小数的价格*/
		getPrice(value,notRound){
			if(notRound){//不四舍五入
				value = Math.floor(parseFloat(value) * 100) / 100;
				value = Number(value.toString().match(/^\d+(?:\.\d{0,2})?/));
				return value;
			}else{//四舍五入
				value = Math.round(parseFloat(value) * 100) / 100;
				var xsd = value.toString().split(".");
				if (xsd.length == 1) {
					value = value.toString() + ".00";
					return value;
				};
				if (xsd.length > 1) {
					if (xsd[1].length < 2) {
						value = value.toString() + "0";
					};
					return value;
				};
			};
		},
		/*数据深拷贝*/
		deepCopy(o){
			let _this = this;
			if (o instanceof Array) {
				var n = [];
				for (var i = 0; i < o.length; ++i) {
					n[i] = _this.deepCopy(o[i]);
				}
				return n;
			} else if (o instanceof Function) {
				var n = new Function("return " + o.toString())();
				return n
			} else if (o instanceof Object) {
				var n = {}
				for (var i in o) {
					n[i] = _this.deepCopy(o[i]);
				}
				return n;
			} else {
				return o;
			};
		},
		/*设置滚动菜单栏自动滑动到合适位置*/
		setSearchCategory(opts){//传父级jquery
			if(app.config.client!='wx'&&opts){
				if(opts.find('.active').length){
					let $this = opts.find('.active'),
						grandFather = $this.parent().parent(),
						parent = $this.parent(),
						scrollWidth = grandFather[0].scrollWidth,
						windowWidth = $('body').width(),
						offsetLeft = $this.offset().left+28;
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
				};
			};
		},
        /*添加访问记录*/
        addpv: function(data) {
          let client = app.config.client,
            requestData = app.extend({
              clientKey: app.session.get('clientKey'),
              area: app.storage.get('area') || '',
              from: app.config.client
            }, data),
            toAdd = function() {
							let urlJson=app.urlToJson(data.page);
							if(urlJson.rewardId){
								requestData.rewardId=urlJson.rewardId;
							};
              app.request('/visitingstatistic/visitingstatistic/addpv', requestData, function() {
              }, function() {
              });
            };
					if(app.checkUser()){	
						toAdd();
					};
					return false;	
          if (!requestData.uid) return false;
          if (requestData.area) {
            toAdd();
          } else {
            var getPosition = function(callback) { //定位获取经纬度
                if (client == 'web') {
                  /*if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      function(position) {
                        let location = position.coords.longitude + ',' + position.coords.latitude;
                        app.storage.set('position', location);
                        callback(location);
                      },
                      function(e) {
                        console.log('web端定位失败' + app.toJSON(e));
                        toAdd();
                      }
                    );
                  }else{
										toAdd();
									};*/
									toAdd();
                } else if (client == 'wx') {
                  wx.getLocation({
                    type: 'wgs84',
                    success: function(res) {
                      app.tips(res);
                      let location = res.longitude + ',' + res.latitude;
                      app.storage.set('location', location);
                      callback(location);
                    },
										fail:toAdd
                  });
                } else if (client == 'app') {
                  wx.app.call('getLocation', {
                    success: function(res) {
                      let location = res.lng + ',' + res.lat;
                      app.storage.set('location', location);
                      toAdd();
                    },
					fail:toAdd
                  });
                };
              },
              getCity = function(location, callback) { //经纬度转地址
                var location = location;
                if (client == 'wx') {
                  let amapFile = require('../js/amap-wx.js');
                  let myAmapFun = new amapFile.AMapWX({
                    key: 'f6fc91f51e335f14a9e1c1a8322b942b'
                  });
                  myAmapFun.getRegeo({
                    location: location,
                    success: function(data) {
                      let addressComponent = data[0].regeocodeData.addressComponent,
                        addressText = '';
                      if (addressComponent.province && addressComponent.province.length) {
                        addressText = addressComponent.province;
                      };
                      if (addressComponent.city && addressComponent.city.length) {
                        addressText += '-' + addressComponent.city;
                      };
                      if (addressComponent.district && addressComponent.district.length) {
                        addressText += '-' + addressComponent.district;
                      };
                      app.storage.set('area', addressText);
                      if (callback) {
                        callback(addressText);
                      };
                    },
                    fail: function(info) {
                      toAdd();
                    }
                  });
                } else {
                  let amapFile = require(app.config.staticPath + 'js/amap-wx.js');
                  register('AMapWX', () => {
                    let myAmapFun = new AMapWX({
                      key: 'f6fc91f51e335f14a9e1c1a8322b942b'
                    });
                    myAmapFun.getRegeo({
                      location: location,
                      success: function(data) {
                        let addressComponent = data[0].regeocodeData.addressComponent,
                          addressText = '';
                        if (addressComponent.province && addressComponent.province.length) {
                          addressText = addressComponent.province;
                        };
                        if (addressComponent.city && addressComponent.city.length) {
                          addressText += '-' + addressComponent.city;
                        };
                        if (addressComponent.district && addressComponent.district.length) {
                          addressText += '-' + addressComponent.district;
                        };
                        app.storage.set('area', addressText);
                        if (callback) {
                          callback(addressText);
                        };
                      },
                      fail: function(info) {
                        toAdd();
                      }
                    });
                  });
                };
              };
            getPosition(function(location) {
              var location = location;
              getCity(location, function(city) {
                requestData.area = city;
                toAdd();
              });
            });
          };
        },
		getFullUrl:function(url,options,filters){
			let uJson=app.extend(app.urlToJson(url),options);
			delete uJson['url'];
			if(filters&&filters.length){
				app.each(filters,function(i,item){
					if(uJson[item]){
						delete uJson[item];
					};
				});
			};
			return app.mixURL(url.split('?')[0],uJson);
		},
		//访问商城
		visitShop:function(shopId){
			if(shopId){
				shopId=shopId.toString();
			};
			app.session.set('visitShopShortId',shopId);
			let visitShops=app.storage.get('visitShops')||[];
			if(app.inArray(shopId,visitShops)>=0){
				visitShops.splice(app.inArray(shopId,visitShops),1);
			};
			visitShops.unshift(shopId);
			app.storage.set('visitShops',visitShops);
		},
		getNumberText:function(num){
			if(num){
				num = Number(num);
				if(num<10){
					num = '00'+num;
				}else if(num<100){
					num = '0'+num;
				};
				return num;
			}else{
				return '';
			};
		},
		wxSecCheck:function(requestData,scene,success){//小程序检测输入内容安全scenc1 资料；2 评论；3 论坛；4 社交日志
			  if(app.config.client!='wx'||!requestData||!requestData.length){
				  if(typeof success == 'function'){
					  success();
				  };
			  }else{
				  wx.login({
					  success:function(req) {
						if(req.code){
							app.request('//userapi/getWxOpenid',{code:req.code},function(backData){
								if(backData.openid){
									app.request('//wxapp/msgSecCheck',{data:requestData,openid:backData.openid,scene:scene},function(){
										if(typeof success == 'function'){
											success();
										};
									});
								}else{
									if(typeof success == 'function'){
										success();
									};
								};
							});
						}else{
							if(typeof success == 'function'){
								success();
							};
						};
					  }
				  });
			  };
		  },
      });

    }
  };

  module.exports = xzApp;

})();