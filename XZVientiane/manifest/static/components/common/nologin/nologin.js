/**
 *模块组件构造器
 */
(function () {

  let app = getApp();

  app.Component({

    //组件名称，不需要改变
    comName: 'nologin',

    /**
     * 组件的属性列表
     */
    properties: {
      
    },

    /**
     * 组件的初始数据
     */
    data: {
      client: app.config.client,
	  showPhoneLogin:false
    },

    /**
     *组件布局完成时执行
     */

    ready: function () {
	   if(app.config.client=='web'&&isWeixin){
		   this.setData({showPhoneLogin:true});
	   }
    },

    /**
     * 组件的函数列表
     */
    methods: {
	  onShow:function(){
			  
	  },
      toLogin:function(){
		  let _this = this;
		  app.userLogining = false;
		  app.userLogin({
			  success: function() {
				  _this.setData({
					isUserLogin: true
				  });
				  _this.pEvent('loginsuccess');
			  }
		  });
	  }
    }
  });
})();