/**
 *模块组件构造器
 */
(function() {

  let app = getApp();

  app.Page({
    pageId: 'manage-settingPageModuleSelect',
    data: {
      systemId: 'manage',
      moduleId: 'settingPageModuleSelect',
	  isUserLogin: app.checkUser(),
      data: {},
      options: {},
      settings: {},
      language: {},
      form: {},
	  modules:[{
			type:'text',
			name:'文字',
			needEdit:true,
			settings:{},
			content:'',
		},{
		  type:'image',
		  name:'图片',
		  needEdit:true,
		  settings:{column:1},
		  content:''
		},
		{
			type:'article',
			name:'文章列表',
			settings:{
				size:6,
				paddingSize: 15,
				paddingTop: "1",
				paddingLeft: "1",
				paddingBottom: "1",
				paddingRight: "1",
				template: "1",
			},
			content:''
		},
		{
			type:'goods',
			name:'商品列表',
			settings:{
				size:6,
				paddingSize: 10,
				paddingTop: "1",
				paddingLeft: "1",
				paddingBottom: "1",
				paddingRight: "1",
				template: "1",
			},
			content:''
		},
		{
			type:'search',
			name:'搜索框',
			settings:{
			},
			content:'搜索商品'
		}/*,
		{
			type:'info',
			name:'店铺信息',
			settings:{},
			content:'',
		},
		{
			type:'service',
			name:'联系客服',
			settings:{},
			content:'',
		},
		{
			type:'tab',
			name:'选项卡',
			settings:{},
			content:'',
		}*/
	  ],
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
		  if(_this.getData().myAuthority.setting){};
      },	
      onSelect: function(e) {
        let _this = this,
			index=app.eData(e).index,
			module=_this.getData().modules[index]; 
		if(_this.getData().options.dialogPage){
			delete module.name;
			app.dialogSuccess(module);
		};
      }
    }
  });
})();