/*!
 * xzPage.js v2.0.1-beta.0
 * (c) 2018-20@2 Sean lee
 */
let xzPage;
(function () {

  let app;
  //响站页面管理类

  let xzPageClass = class {

    /**
     *初始化构造
     */

    constructor(page) {


      if (page.selectAllComponents) {
        page.components = page.selectAllComponents('.tag');
        page.getData = function () {
          return page.data;
        };
        page.dialog = function (obj) {
          app.dialog(obj, page);
        };
      } else {
        page.components = page.components || [];
        page.pageXzp.getData = function () {
          return page.pageXzp._data;
        };
        page.pageXzp.dialog = function (obj) {
          app.dialog(obj, page.pageXzp);
        };
      };
      page.components.forEach(function (item, i) {
        let app = getApp(),
          data = {};

        if (page.selectAllComponents) {
          data = app.extend(true, { language: app.language }, item.data);
          item.getData = function () {
            return this.data;
          };

        } else {

          data = app.extend(true, { language: app.language }, item._data);

          item.getData = function () {
            return this._data;
          };
        };

        if (page.tags && page.tags[i] && page.tags[i].data) {
          app.extend(true, data, page.tags[i].data);
        };
        app.extend(true, data, { options: page.options });
				
        item.setData(data);
      });

      //设置本页面所有组件的事件
      this.trigger = function (fn, data) {
        page.components.forEach(function (item, i) {
          if (typeof item[fn] == 'function') {
            item[fn](page.pageXzp ? page.pageXzp : page, data);
          }
        });
      };
    };


    /**
     *通知本页面所有组件的页面准备完成
     */

    onReady() {
      this.trigger('pageReady');
    };


    /**
     *通知本页面所有组件的页面显示
     */

    onShow() {
      this.trigger('pageShow');
    };

    /**
     *通知本页面所有组件的页面隐藏
     */

    onHide() {
      this.trigger('pageHide');
    };

    /**
     *通知本页面所有组件的页面被卸载
     */

    onUnload() {
      this.trigger('pageUnload');
    };

    /**
    *通知本页面所有组件的页面下拉刷新
    */

    onPullDownRefresh() {
      this.trigger('pagePullDownRefresh');
    };

    /**
    *通知本页面所有组件的页面上拉触底
    */

    onReachBottom() {
      this.trigger('pageReachBottom');
    };

    /**
    *通知本页面所有组件用户点击转发事件
    */

    onShareAppMessage() {
      this.trigger('pageShareAppMessage');
    };

    /**
    *通知本页面所有组件的页面滚动
    */

    onPageScroll(obj) {
      this.trigger('pageScroll', obj);
    };

    /**
    *通知本页面所有组件页面切换选项卡
    */

    onTabItemTap(item) {
      this.trigger('pageTabItemTap', item);
    };


  };

  xzPage = {
    init(App) {
      app=App;
      app.xzPage = xzPageClass;
    }
  };

  //注入初始化模块
  module.exports = xzPage;
})();
