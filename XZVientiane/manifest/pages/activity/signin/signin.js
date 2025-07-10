/**
 *模块组件构造器
 */
(function () {

	let app = getApp();

	app.Page({
		pageId: 'activity-signin',
		data: {
			systemId: 'activity',
			moduleId: 'signin',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {},
			language: {},
			showNoData: false,
			showLoading: false,
			account: '',

		},
		methods: {
			onLoad: function (options) {
				this.setData({
					options: options
				});
			},
			onShow: function () {
				let _this = this;
				//检查用户登录状态
				let isUserLogin = app.checkUser();
				if (isUserLogin != this.getData().isUserLogin) {
					this.setData({
						isUserLogin: isUserLogin
					});

				};
				_this.load();

			},
			load: function () {
				let _this = this,
					options = this.getData().options;
				_this.setData({
					'showLoading': true
				});
				app.request('//activityapi/getActivityDetail', {id:options.id},function (backData){
					if (backData.signerList && backData.signerList.length) {
						app.each(backData.signerList, function (i, item) {
							if (item.headpic) {
								item.headpic = app.image.crop(item.headpic, 80, 80);
							};
						});
						_this.setData({
							data: backData.signerList,
							showNoData: false
						});
					} else {
						_this.setData({
							data:[],
							showNoData: true
						});
					};
				}, '', function () {
					_this.setData({
						'showLoading': false
					});
				});
			},
			signinDel:function(e){
				let _this = this,
					options = this.getData().options,
					data = this.getData().data,
					index = Number(app.eData(e).index);
				app.confirm('确定要删除吗？', function () {
					app.request('//activityapi/delActivitySignuesr', {id:options.id,account:data[index]},function (backData){
						app.tips('删除成功','success');
						data.splice(index,1);
						_this.setData({data:data});
					});
				});
			},
			addSignin:function(){
				let _this = this,
					options = this.getData().options,
					account = _this.getData().account;
				if(!account){
					app.tips('请输入账号','error');
				}else{
					app.request('//activityapi/addActivitySignuesr', {id:options.id,account:account}, function (backData) {
						_this.setData({
							account: ''
						});
						_this.load();
					});
				};
			}
		}
	});
})();