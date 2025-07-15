/**
 *模块组件构造器
 */
(function () {

  let app = getApp();

  app.Page({
    pageId: 'home-wxScan',
    data: {
      systemId: 'home',
      moduleId: 'wxScan',
      data: [],
      options: {},
      settings: {},
      language: {},
      form: {},
      client: app.config.client,
      filePath:app.config.filePath,
	  qrcodeSrc:app.config.filePath+'15623271770213105.jpg'
    },
    methods: {
      onLoad: function (options) {
		  if(options.src){
			  this.setData({
				  qrcodeSrc:app.config.filePath+options.src
			  });
		  };
	  },
      onShow: function () {
        this.load();
      },
      onPullDownRefresh: function () {
        this.load();
        wx.stopPullDownRefresh();
      },
      load: function () {},
      saveImage: function () {
        app.saveImage({
          filePath: this.getData().qrcodeSrc,
          success: function () {
            app.tips('保存成功');
          }
        });
      },
      toSaosao: function () {
        let _this = this;
		wx.setWxConfig(['checkJsApi', 'scanQRCode'],function(){
			wx.scanQRCode({
				 success: function(res) {},
				 fail: function(res) {}
			});
		});
      }
    }
  });
})();