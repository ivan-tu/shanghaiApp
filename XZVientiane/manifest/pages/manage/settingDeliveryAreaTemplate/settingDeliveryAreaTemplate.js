/**
 *模块组件构造器
 */
(function() {

	let app = getApp();

	app.Page({
		pageId: 'manage-settingDeliveryAreaTemplate',
		data: {
			systemId: 'manage',
			moduleId: 'settingDeliveryAreaTemplate',
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
					app.request('//shopapi/getDeliveryArea', {},function(res){
						if(res&&res.length){
							_this.setData({data:res});
						};
					});
				};
			},
			submit: function() {
				let _this = this;
				this.dialog({
					url:'../../manage/settingDeliveryArea/settingDeliveryArea?isDialog=1',
					title:'设置可配送区域',
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
					app.navTo('../../manage/settingDeliveryArea/settingDeliveryArea?id='+app.eData(e).id);
				};
			},
		}
	});
})();