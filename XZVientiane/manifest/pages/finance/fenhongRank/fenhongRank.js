(function() {

	let app = getApp();

	app.Page({
		pageId: 'finance-fenhongRank',
		data: {
			systemId: 'finance',
			moduleId: 'fenhongRank',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {},
			language: {},
			form: {
				size:10,
			},
			showLoading:false,
			showNoData:false,
		},
		methods: {
			onLoad: function(options) {
				let _this = this;
				this.setData({
					options:options,
					form:app.extend(this.getData().form,options)
				});
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
			onShow: function() {
				//检查用户登录状态
				let isUserLogin = app.checkUser();
				if (isUserLogin != this.getData().isUserLogin) {
					this.setData({
						isUserLogin: isUserLogin
					});
					if (isUserLogin) {
						this.load();
					};
				};
			},
			onPullDownRefresh: function() {
				if (this.getData().isUserLogin) {
					this.load();
				};
				wx.stopPullDownRefresh();
			},
			load: function() {
				this.getList();
			},
			toUserDetail:function(e){
				app.navTo('../../user/businessCard/businessCard?id='+app.eData(e).id);
			},
			getList:function(){
				let _this = this,
					formData = _this.getData().form;
				_this.setData({'showLoading':true});
				app.request('//financeapi/getDividendRank',formData,function(backData){
					if(backData&&backData.length){
						app.each(backData,function(i,item){
							if(item.userData&&item.userData.headpic){
								item.userData.headpic = app.image.crop(item.userData.headpic,40,40);
							};
						});
						_this.setData({
							data:backData,
							showNoData:false,
						});
					}else{
						_this.setData({
							data:[],
							showNoData:true,
						});
					};
				},'',function(){
					_this.setData({
						'showLoading':false,
					});
				});
			},
		}
	});
})();