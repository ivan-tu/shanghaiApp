/**
 *模块组件构造器
 */
(function() {

  let app = getApp();

  app.Page({
    pageId: 'manage-settingInfo',
    data: {
      systemId: 'manage',
      moduleId: 'settingInfo',
			isUserLogin: app.checkUser(),
      data: {},
      options: {},
      settings: {
      },
      language: {},
      form: {
        name:'',
		mobile:'',
		province:'',
		city:'',
		country:'',
		areaname:'',
		address:'',
		content:'',
		cover:'',
		logo:'',
		customerQrcode:'',
      },
	  area:[],
	  myAuthority:app.storage.get('myAuthority'),
      client: app.config.client
			
    },
    methods: {
      
      onLoad:function(options){
		  this.setData({myAuthority:app.storage.get('myAuthority')});
		  if(!this.getData().myAuthority){
			  app.navTo('../../manage/index/index');
		  };
	
		  let _this=this;
		  this.setData({options:options});
		  app.checkUser(function(){
			  _this.setData({isUserLogin:true});
			  _this.load();
		  });		
	 },
	 onShow: function(){
		  let _this=this;
		  //检查用户登录状态
		  let isUserLogin=app.checkUser();
		  if(isUserLogin!=this.getData().isUserLogin){
			  this.setData({isUserLogin:isUserLogin});
			  this.load();
		  };
				
	  },
      onPullDownRefresh: function() {
        this.onShow();
        wx.stopPullDownRefresh();
      },
      load: function() {
		  let _this=this;
		  if(_this.getData().myAuthority.setting){
				  app.request('//shopapi/getShopBasicinfo',{shopid:app.session.get('manageShopId')},function(req){
					  if(req){
						  _this.setData({form:req});
						  setTimeout(function(){
							  _this.selectComponent('#uploadPic').reset(req.logo||'');
							  //_this.selectComponent('#uploadCover').reset(req.cover||req.logo||'');
							  _this.selectComponent('#uploadCliwxpic').reset(req.customerQrcode||'');
						  },200);
					  }
				  });
			  };
      },
	  uploadSuccess: function(e) { //修改头像
          let _this = this,
              file = e.detail.src[0];
          _this.setData({
            'form.logo': file
          });
      },
	  uploadSuccessCover:function(e){
		  let _this = this,
              file = e.detail.src[0];
          _this.setData({
            'form.cover': file
          });
	  },
	  uploadCliwxpic:function(e){
		  let _this = this,
              file = e.detail.src[0];
          _this.setData({
            'form.customerQrcode': file
          });
	  },
	  uploadWxmppic:function(e){
		  let _this = this,
              file = e.detail.src[0];
          _this.setData({
            'form.wxmppic': file
          });
	  },
      submit: function() {
        let _this = this,
			id=_this.getData().options.id,
            formData = _this.getData().form,
            msg = '';
        if (!formData.name) {
          msg = '请输入店铺名称';
        };	
        if (msg) {
          app.tips(msg, 'error');
        } else {
			app.request('//shopapi/saveShopBasicinfo',formData,function(){
				app.tips('信息保存成功');
				setTimeout(app.navBack,500);
			});
		};
      }
    }
  });
})();