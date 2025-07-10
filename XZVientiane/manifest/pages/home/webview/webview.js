/**
 *模块组件构造器
 */
(function () {

  let app = getApp();

  app.Page({
    pageId: 'home-webview',
    data: {
      systemId: 'home',
      moduleId: 'webview',
      data: [],
      options: {},
      settings: {},
      language: {},
      pageUrl:''
    },
    methods: {
      onLoad: function (options) {
		  if(options.title){
			  app.setPageTitle(options.title);
			  delete options.title;
		  };
		  if(options.url){
			 let pageUrl = options.url;
			 	delete options.url;
			 pageUrl = app.mixURL(pageUrl,options);
			 if(app.config.client=='wx'){
				 this.setData({ pageUrl:pageUrl});
			 }else{
				 app.redirectTo(pageUrl);
			 };
		  };
      },
      onShow: function () {
      },
      onPullDownRefresh: function () {
        wx.stopPullDownRefresh();
      }
    }
  });
})();