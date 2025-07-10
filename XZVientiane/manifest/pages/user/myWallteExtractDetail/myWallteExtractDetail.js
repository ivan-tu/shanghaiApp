/**
 *模块组件构造器
 */
(function() {

	let app = getApp();

	app.Page({
		pageId: 'user-myWallteExtractDetail',
		data: {
			systemId: 'user',
			moduleId: 'myWallteExtractDetail',
			isUserLogin: app.checkUser(),
			data: {},
			options: {},
			settings: {},
			language: {},
			form: {},
			checkTimeText:'',
		},
		methods: {
			onLoad: function(options) {
				let _this = this;
				_this.setData({
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
				let _this = this,
					checkTimeText = '',
					options = this.getData().options;
				app.request('//homeapi/getBeansApplyInfo', options, function(res) {
					if(res){
						checkTimeText = '预计审核时间：'+_this.getCheckDate(res.addtime);
						_this.setData({
							data: res
						});
					};
				});
			},
			getCheckDate:function(date){//根据日期，获取预计审核日期
				let _this = this;
				if(!date)return;
				date = date.replace(/-/g, '/');
				let newDate = (new Date(date)).getTime(),
					week = (new Date(date)).getDay(),
					addTime = 0;
				switch(week){
					case 5://星期五
					addTime = 3;
					break;
					case 6://星期六
					addTime = 2;
					break;
					default:
					addTime = 1;
				};
				return app.getThatDate(newDate,addTime);
			},
			toCancel:function(){
				let _this = this, 
					data = _this.getData().data;
				app.confirm('确定要撤销吗？', function() {
					app.request('//homeapi/cancelBeansWith', {
						id: data.id
					}, function() {
						app.tips('操作成功');
						_this.load();
					});
				});
			},
		}
	});
})();