/**
 *模块组件构造器
 */
(function() {

   let app = getApp();

   app.Page({
      pageId: 'manage-settingAddress',
      data: {
         systemId: 'manage',
         moduleId: 'settingAddress',
         isUserLogin: app.checkUser(),
         data: {},
         options: {},
         settings: {},
         language: {},
         form: {
            name: '',
            mobile: '',
            province: '',
            city: '',
            country: '',
            areaname: '',
            address: '',
            content: ''
         },
         area: [],
         myAuthority: app.storage.get('myAuthority'),
         client: app.config.client

      },
      methods: {

         onLoad: function(options) {
            this.setData({
               myAuthority: app.storage.get('myAuthority')
            });
            if (!this.getData().myAuthority) {
               app.navTo('../../manage/index/index');
            };

            let _this = this;
            this.setData({
               options: options
            });
            app.checkUser(function() {
               _this.setData({
                  isUserLogin: true
               });
               _this.load();
            });

         },
         onShow: function() {
            let _this = this;
            //检查用户登录状态
            let isUserLogin = app.checkUser();
            if (isUserLogin != this.getData().isUserLogin) {
               this.setData({
                  isUserLogin: isUserLogin
               });
               this.load();
            };

         },
         onPullDownRefresh: function() {
            this.onShow();
            wx.stopPullDownRefresh();
         },
         load: function() {
            let _this = this;
            if (_this.getData().myAuthority.setting) {
               app.request('//shopapi/getShopReturnaddress', function(req) {
                  if (req) {
                     _this.setData({
                        form: req,
						area:req.areaname?req.areaname.split('-'):[]
                     });
                     setTimeout(function() {
                        _this.selectComponent('#areaPicker').reset();
                     }, 200);
                  }
               });
            };
         },
         bindRegionChange: function(e) { //修改地区
            let _this = this;
			if (app.config.client == 'wx') {
               e.detail.ids = e.detail.code;
            };
            _this.setData({
				area:e.detail.value,
               'form.areaname': e.detail.value.join('-'),
               'form.province': e.detail.ids[0],
               'form.city': e.detail.ids[1],
               'form.country': e.detail.ids[2]
            });
         },
         submit: function() {
            let _this = this,
               id = _this.getData().options.id,
               formData = _this.getData().form,
               msg = '';
            if (!formData.name) {
               msg = '请输入收货人';
            } else if (!formData.mobile) {
               msg = '请输入电话';
            } else if (!formData.areaname) {
               msg = '请选择地区';
            } else if (!formData.address) {
               msg = '请输入地址';
            };

            if (msg) {
               app.tips(msg, 'error');
            } else {
               app.request('//shopapi/saveShopReturnaddress', formData, function() {
                  app.tips('地址保存成功');
                  setTimeout(app.navBack, 500);
               });
            };
         }
      }
   });
})();