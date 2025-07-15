(function () {

  let app = getApp();
  app.Page({
    pageId: 'user-index',
    data: {
      systemId: 'user',
      moduleId: 'index',
      isUserLogin: app.checkUser(),
      data: {
        username: '未命名',
        tuigeId: '*********'
      },
      options: {},
      settings: {},
      language: {},
      form: {},
      financeData: {
        balance: 0,
        beans: 0
      },
      myVisitor: {},
      client: app.config.client,
      bindData: {},
      canShowCoin: app.config.client != 'app' ? true : isIos ? false : true,
      unRead: 0
    },
    methods: {
      onLoad: function (options) {
        let _this = this;
        _this.setData({ options: options });
        app.checkUser(function () {
          _this.setData({ isUserLogin: true });
          _this.load();
        });

      },
      onShow: function () {
        //检查用户登录状态
        let isUserLogin = app.checkUser();
        if (isUserLogin != this.getData().isUserLogin) {
          this.setData({ isUserLogin: isUserLogin });
        };
        if (isUserLogin && this.isLoaded) {
          this.load();
        };
      },
      onPullDownRefresh: function () {
        if (this.getData().isUserLogin) {
          this.load();
        };
        wx.stopPullDownRefresh();
      },
      load: function () {
        let _this = this,
          isUserLogin = app.checkUser();
        if (isUserLogin) {
          _this.getHome();
          app.request('/user/userapi/getUserBind', {}, function (backData) {
            _this.setData({
              bindData: backData
            });
          });

          app.request('//messageapi/getWaitReadCount', function (res) {
            _this.setData({ unRead: res.count });
          });
        } else {
          _this.setData({
            isUserLogin: false
          });
        };
      },
      getHome: function () {
        let _this = this;
        app.request('/user/userapi/info', {}, function (res) {
          if (!res.pocode) {
            app.session.remove('userSession');
            _this.load();
            return;
          };
          if (res.headpic) {
            res.headpic = app.image.crop(res.headpic, 60, 60);
          };
          _this.setData({
            data: res
          });
          _this.getShareData();
          _this.isLoaded = true;
        });
        app.request('/my/my/getFinance', {}, function (res) {
          _this.setData({
            'financeData.balance': res.balance || 0,
            'financeData.beans': res.beans || 0,
            'financeData.coins': res.coins || 0,
          });
          if (res.canShowCoin) {
            app.storage.set('canShowCoin', true);
            _this.setData({ canShowCoin: true });
          } else {
            app.storage.set('canShowCoin', false);
            _this.setData({ canShowCoin: false });
          };

        });
        //获取访客统计
        app.request('/visitingstatistic/visitingstatistic/myVisitor', {}, function (res) {
          if (res) {
            _this.setData({
              myVisitor: res
            });
          };
        });
      },
      toLogin: function () {
        let _this = this;
        app.userLogining = false;
        app.userLogin({
          success: function () {
            _this.setData({
              isUserLogin: true
            });
            _this.load();
          }
        });
      },
      toInfo: function () {
        app.navTo('../../user/info/info');
      },
      toFriend: function () {
        app.navTo('../../friend/index/index');
      },
      toPersonal: function () {
        app.navTo('../../user/profile/profile?uid=' + this.getData().data._id);
      },
      add: function () {
        app.navTo('../../personal/add/add');
      },
      identityAdd: function () {
        app.navTo('../../identity/selectVocation/selectVocation?action=add');
      },
      toBindAccount: function () {
        app.navTo('../../user/bindAccount/bindAccount');
      },

      getPhoneNumber: function (e) {
        let _this = this;
        if (e.detail.errMsg == 'getPhoneNumber:ok') {
          app.request('//userapi/wxGetPhoneNumber', { sessionKey: app.session.get('sessionKey'), detail: e.detail }, function (res) {
            if (res.phoneNumber) {
              app.request('//userapi/bindAccountWxapp', { mobile: res.phoneNumber, webBind: 1 }, function () {
                app.navTo('../../user/setting/setting');
              }, function () {
                app.navTo('../../user/bindAccount/bindAccount');
              });
            } else {
              app.navTo('../../user/bindAccount/bindAccount');
            };
          }, function () {
            app.navTo('../../user/bindAccount/bindAccount');
          });
        } else {
          app.navTo('../../user/bindAccount/bindAccount');
        };
      },
      loginsuccess: function () {
        this.onShow();
      },
      toPage: function (e) {
        let page = app.eData(e).page;
        if (page) {
          app.navTo(page);
        };
      },
      getShareData: function () {
        let _this = this;
        app.request('/push/push/wxappShareContent', {
          type: 1
        }, function (res) {
					let newData = {
								pocode: app.storage.get('pocode'),
								uid: res.uid
							 },
              pathUrl = app.mixURL('/p/user/profile/profile', newData),
							shareData={
									shareData: {
									title: res.title,
									content: res.describe || '',
									path: 'https://' + app.config.domain + pathUrl,
									pagePath: pathUrl,
									img: res.pic || '',
									imageUrl: res.pic || '',
									weixinH5Image: res.weixinH5Image || '',
									showMini: res.showMini,
									showQQ: res.showQQ,
									showWeibo: res.showWeibo
								},
								loadPicData: {
									ajaxURL: '/push/push/businessCard',
									requestData: {
										uid: res.uid
									}
								}
							},
							reSetData=function(){
							setTimeout(function(){
								if(_this.selectComponent('#newShareCon')){
									//app.tips(_this.selectComponent('#newShareCon'));
									_this.selectComponent('#newShareCon').reSetData(shareData);
								}else{
									reSetData();
								};
							},500);
						};
						
					reSetData();
        });
      },
      toShare: function () {
        this.selectComponent('#newShareCon').openShare();
      },
      onShareAppMessage: function () {
        return app.shareData;
      }
    }
  });
})();