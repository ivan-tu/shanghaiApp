/**
 *模块组件构造器
 */
(function () {

   let app = getApp();

   app.Component({

      //组件名称，不需要改变
      comName: 'newShare',

      /**
       * 组件的属性列表
       */
      properties: {
         list: {
            type: String,
            value: ''
         },
         noanimation: {
            type: String,
            value: ''
         }
      },

      /**
       * 组件的初始数据
       */
      data: {
         open: false,
         shareData: {
            title: '',
            path: '',
            pagePath: '',
            img: '',
            imageUrl: '',
            shareType: '',
            fullTitle: ''
         },
         client: app.config.client,
         loadPicData: { //获取海报
            ajaxURL: '',
            requestData: '',
         },
         loadCodeData: { //获取小程序码
            ajaxURL: '',
            requestData: '',
         },
         //获取商品码
         loadGoodsCodeData: {
            requestData: ''
         },
         urLink: 'url',
         loadOk: false,
         loadPic: '',
         loadPicUrl: '',
         showSharePic: false, //分享海报
         picWidth: app.system.windowWidth - 120,
         showShareCode: false, //小程序码
         codeWidth: app.system.windowWidth - 120,
         loadCode: '',
         loadCodeUrl: '',
         showShareGoodsCode: false, //商品码
         loadGoodsCodeUrl: '',
      },

      /**
       *组件布局完成时执行
       */

      ready: function () {},
      /**
       * 组件的函数列表
       */
      methods: {
         openShare: function (e) {
            this.setData({
               'open': true
            });
         },
         reSetData: function (data) {
            /*this.setData({
               loadCode: '',
               loadPic: '',
               loadPicUrl: '',
               loadCodeUrl: '',
               loadGoodsCodeUrl: '',
               loadGoodsCode: '',
               loadOk: false,
               showSharePic: false,
               showShareCode: false,
               showShareGoodsCode: false
            });*/
            if (data.shareData) {
               data.shareData.fullTitle = data.shareData.title + (data.shareData.content ? '|' + data.shareData.content : '');
               if (app.config.client == 'app') {
                  data.shareData.showQQ = false;
                  data.shareData.showWeibo = false;
               };
               if (app.config.client == 'web') {
                  data.shareData.ePath = encodeURIComponent(data.shareData.path);
               } else {
                  data.shareData.ePath = data.shareData.path;
               };
               this.setData({
                  shareData: data.shareData
               });
			   //因为小程序的分享图片比例是5:4，所以在这里做一下统一处理。
			   if(app.config.client=='wx'){
				   let realImgData = {imgUrl: data.shareData.imageUrl};
				   try {
					  if (realImgData.imgUrl && realImgData.imgUrl.indexOf('https://static.gedian.shop/') >= 0) {
						 realImgData.imgUrl = realImgData.imgUrl.replace('https://static.gedian.shop/', '');
						 realImgData.imgUrl = (realImgData.imgUrl.split('?'))[0];
						 realImgData.imgUrl = app.image.crop(realImgData.imgUrl, 210, 168);
						 data.shareData.imageUrl = realImgData.imgUrl;
					  };
				   } catch (err) {
					  console.log('newShare解析图片地址出错了');
				   };
			   };
               app.shareData = {
                  title: data.shareData.title,
                  path: data.shareData.pagePath, //'p/home/index/index?sharePage=' + encodeURIComponent(data.shareData.pagePath),
                  pagePath: data.shareData.pagePath,
                  imageUrl: data.shareData.imageUrl
               };
               console.log(app.toJSON(data.shareData));
               if (app.config.client == 'web' && isWeixin) { //微信浏览器改变分享数据
                  let setWxConfig = function () {
                     setTimeout(function () {
                        wx.setWxConfig(['updateAppMessageShareData','updateTimelineShareData','onMenuShareAppMessage','onMenuShareTimeline'], function () {
							
                           wx.updateAppMessageShareData({
                              title: data.shareData.title,
                              desc: data.shareData.content || '',
                              link: data.shareData.path,
                              imgUrl: data.shareData.weixinH5Image || data.shareData.imageUrl,
                              success: function () {
								 console.log('updateAppMessageShareData 成功');
                              },
                              fail: function (msg) {
                                 console.log('updateAppMessageShareData 失败');
                                 //setWxConfig();
                              }
                           });
                           wx.updateTimelineShareData({
                              title: data.shareData.fullTitle,
                              link: data.shareData.path,
                              imgUrl: data.shareData.weixinH5Image || data.shareData.imageUrl,
                              success: function () {
								  console.log('updateTimelineShareData 成功');
							  },
							  fail: function (msg) {
                                 console.log('updateTimelineShareData 失败');
                                 //setWxConfig();
                              }
                           });
                        });
                     }, 100);
                  };
                  setWxConfig();

               };

            };
            if (data.loadPicData) {
               this.setData({
                  loadPicData: data.loadPicData
               });
            };
            if (data.loadCodeData) {
               this.setData({
                  loadCodeData: data.loadCodeData
               });
            };
            if (data.loadGoodsCodeData) {
               this.setData({
                  loadGoodsCodeData: data.loadGoodsCodeData
               });
            };
         },
         closeShare: function (e) {
            this.setData({
               'open': false,
               showSharePic: false
            });
            this.close();
         },
         close: function () {
            this.pEvent('close', this.getData());
         },
         toShare: function (e) {
            let client = app.config.client,
               type = app.eData(e).type,
               _this = this,
               shareData = this.getData().shareData;
            this.closeShare();

            function eqCodeDialog(wx) {
               var ewmDialog = (wx ? '<p class="h4 black">请打开微信扫描二维码进行分享</p>' : '') + '<div class="qrcodeBox mt10"><img style="width:200px;" src="' + app.getQrCodeImg(shareData.path) + '"/></div>';
               app.alert(ewmDialog);
            };

            function winxinShareFn() {
               var dialogEl = '<div>请点击右上角菜单按钮进行分享</div>';
               app.alert(dialogEl);
            };
            switch (type) {
               case 'weixin':
                  if (client == 'app') {
                     _this.callAppShare(type);
                  } else if (app.config.client == 'web' && isWeixin) {
                     winxinShareFn();
                  } else if (app.config.client == 'web') {
                     eqCodeDialog(true)
                  };
                  break;
               case 'moments':
                  if (client == 'app') {
                     _this.callAppShare(type);
                  } else if (app.config.client == 'web' && isWeixin) {
                     winxinShareFn();
                  } else if (app.config.client == 'web') {
                     eqCodeDialog(true)
                  };
                  break;
               case 'qq':
                  if (client == 'app') {
                     _this.callAppShare(type);
                  };
                  break;
               case 'weibo':
                  if (client == 'app') {
                     _this.callAppShare(type);
                  };
                  break;
               case 'copy':
                  if (client == 'wx') {
                     wx.setClipboardData({
                        data: shareData.path,
                        success: function () {
                           app.tips('复制成功', 'success');
                        },
                     });
                  } else if (client == 'app') {
                     wx.app.call('copyLink', {
                        data: {
                           url: shareData.path
                        },
                        success: function (res) {
                           app.tips('复制成功', 'success');
                        }
                     });
                  } else {
                     $('body').append('<input class="readonlyInput" value="'+shareData.path+'" id="readonlyInput" readonly />');
					  var originInput = document.querySelector('#readonlyInput');
					  originInput.select();
					  if(document.execCommand('copy')) {
						  document.execCommand('copy');
						  app.tips('复制成功','error');
					  }else{
						  app.tips('浏览器不支持，请手动复制','error');
					  };
					  originInput.remove();
                  };
                  break;
               case 'h5':
                  _this.callAppShare(type);
                  break;
               case 'friend':
                  _this.callAppShare(type);
                  break;
            };
         },
         callAppShare: function (type) {
            let shareData = this.getData().shareData;
            //因为小程序的分享图片比例是5:4，所以在这里做一下统一处理。
            let realImgData = {
               imgUrl: shareData.img
            };
            if (type == 'weixin') {
               try {
                  if (realImgData.imgUrl && realImgData.imgUrl.indexOf('https://static.gedian.shop/') >= 0) {
                     realImgData.imgUrl = realImgData.imgUrl.replace('https://static.gedian.shop/', '');
                     realImgData.imgUrl = (realImgData.imgUrl.split('?'))[0];
                     realImgData.imgUrl = app.image.crop(realImgData.imgUrl, 210, 168);
                  };
               } catch (err) {
                  console.log('newShare解析图片地址出错了');
               };
            };
            if (type == 'h5' || type == 'moments') {
               wx.app.call('share', {
                  data: {
                     type: type == 'h5' ? 'weixin' : type,
                     pagePath: shareData.pagePath,
                     shareType: 2,
                     title: type == 'h5' ? shareData.title : shareData.fullTitle,
                     content: shareData.content || '',
                     url: shareData.path,
                     img: shareData.weixinH5Image || shareData.img,
                  }
               });
            } else if (type == 'weixin') {
               wx.app.call('share', {
                  data: {
                     type: type,
                     pagePath: shareData.pagePath,
                     shareType: 1,
                     title: shareData.title,
                     content: shareData.content || '',
                     url: shareData.path,
                     img: realImgData.imgUrl,
                     wxid: shareData.wxid || ''
                  }
               });
            } else {
               wx.app.call('share', {
                  data: {
                     type: type,
                     pagePath: shareData.pagePath,
                     shareType: 1,
                     title: shareData.title,
                     content: shareData.content || '',
                     url: shareData.path,
                     img: shareData.img,
                     wxid: shareData.wxid || ''
                  }
               });
            };
         },
         toSave: function (e) {
            let _this = this,
               loadPicData = this.getData().loadPicData,
               shareData = this.getData().shareData,
               loadPic = this.getData().loadPic,
               picWidth = this.getData().picWidth;
            if (loadPicData.pageURL) { //点击海报跳转到特定地址,不生成海报
               _this.closeShare();
               setTimeout(function () {
                  app.navTo(loadPicData.pageURL);
               }, 500);
               return;
            };
            if (loadPicData && loadPicData.ajaxURL) {
               this.setData({
                  showSharePic: true
               });
               if (!loadPic) {
                  //loadPicData.requestData.url = shareData.pagePath;
                  loadPicData.requestData.uid = app.urlToJson(shareData.pagePath).uid || '';
                  //console.log(app.urlToJson(shareData.pagePath));
                  //loadPicData.requestData.page = 'p/home/index/index';
                  app.request(loadPicData.ajaxURL, loadPicData.requestData, function (res) {
                     _this.setData({
                        loadPic: app.config.filePath + '' + res,
                        loadPicUrl: app.image.width(res, picWidth)
                     });
                  }, function (msg) {
                     app.tips('海报生成失败，请稍后再试', 'error');
                  });
               };
            };
         },
         saveImage: function () {
            let loadPic = this.getData().loadPic;
            app.saveImage({
               filePath: loadPic,
               success: function () {
                  app.tips('保存成功', 'success');
               }
            });
         },
         loadSuccess: function () {
            this.setData({
               loadOk: true
            });
         },
         getCode: function () { //生成小程序码
            let _this = this,
               loadCodeData = this.getData().loadCodeData,
               shareData = this.getData().shareData,
               loadCode = this.getData().loadCode,
               codeWidth = this.getData().codeWidth;
            if (loadCodeData && loadCodeData.ajaxURL) {
               this.setData({
                  showShareCode: true
               });
               if (!loadCode) {
                  app.request(loadCodeData.ajaxURL, loadCodeData.requestData, function (res) {
                     _this.setData({
                        loadCode: app.config.filePath + '' + res,
                        loadCodeUrl: app.image.width(res, codeWidth)
                     });
                  }, function (msg) {
                     app.tips('小程序码生成失败，请稍后再试', 'error');
                  });
               };
            };
         },
         getGoodsCode: function () { //生成商品码
            let _this = this,
               loadGoodsCodeData = this.getData().loadGoodsCodeData,
               codeWidth = this.getData().codeWidth;
            if (loadGoodsCodeData.requestData.data) {
               let dataObj = loadGoodsCodeData.requestData.data,
			   	   qrType = loadGoodsCodeData.requestData.qrType;
               _this.setData({
                  loadGoodsCodeUrl: app.getQrCodeImg(app.toJSON({qrType,dataObj})),
				  showShareGoodsCode:true
               });
            } else {
               app.tips('商品码生成失败，请稍后再试', 'error');
            };
         },
         saveCodeImage: function () {
            let loadCodeUrl = this.getData().loadCodeUrl;
            app.saveImage({
               filePath: loadCodeUrl,
               success: function () {
                  app.tips('保存成功', 'success');
               }
            });
         },
         saveGoodsCodeImage: function () {
            let loadGoodsCodeUrl = this.getData().loadGoodsCodeUrl;
            app.saveImage({
               filePath: loadGoodsCodeUrl,
               success: function () {
                  app.tips('保存成功', 'success');
               }
            });
         },
         closeShareCode: function () { //关闭小程序码
            this.setData({
               'open': false,
               showShareCode: false
            });
            this.close();
         },
         closeGoodsCodeImage: function () { //关闭商品码
            this.setData({
               'open': false,
               showShareGoodsCode: false
            });
            this.close();
         }
      }
   });
})();