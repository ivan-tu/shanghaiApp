/**
 *模块组件构造器
 */
(function() {

	let app = getApp();

	app.Page({
		pageId: 'manage-settingFreightTemplate',
		data: {
			systemId: 'manage',
			moduleId: 'settingFreightTemplate',
			isUserLogin: app.checkUser(),
			data:[],
			options: {select:0,id:''},//select是否为选择模式
			settings: {},
			language: {},
			form: {},
			myAuthority: app.storage.get('myAuthority'),
			client: app.config.client,
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
			},
			onShow: function() {
				let _this = this;
				//检查用户登录状态
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
			onPullDownRefresh: function() {
				this.onShow();
				wx.stopPullDownRefresh();
			},
			load: function() {
				let _this = this;
				if (_this.getData().myAuthority.setting) {
					app.request('//shopapi/getFreightSetup', {},function(res){
						if(res&&res.length){
							_this.setData({data:res});
						};
					});
				};
			},
			submit: function() {
				let _this = this;
				this.dialog({
					url:'../../manage/settingFreight/settingFreight?isDialog=1',
					title:'设置配送模板',
					success:function(){
						_this.load();
					},
				});
			},
			selectThis:function(e){
				let options = this.getData().options;
				if(options.select==1){
					app.dialogSuccess({
						id:app.eData(e).id,
						name:app.eData(e).name
					});
				}else{
					app.navTo('../../manage/settingFreight/settingFreight?id='+app.eData(e).id);
				};
			},
		}
	});
})();