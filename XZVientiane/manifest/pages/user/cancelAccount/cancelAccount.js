/**
 *模块组件构造器
 */
(function () {

	let app = getApp();

	app.Page({
		pageId: 'user-cancelAccount',
		data: {
			systemId: 'user',
			moduleId: 'cancelAccount',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {},
			language: {},
			form: {
				account: '',
				content: "",
			},
		},
		methods: {
			onLoad: function (options) {
				let _this = this;
				app.checkUser(function () {
					_this.setData({
						isUserLogin: true
					});
					app.request('//homeapi/getMyInfo', {}, function(res) {
						_this.setData({'form.account':res.account||''});
					});
				});
			},
			onShow: function () {
			},
			cancel: function (loadMore) {
				let _this = this,
					form = _this.getData().form
				if (!form.account) {
					app.tips('请输入联系方式');
				} else if (!form.content){
					app.tips('请填写说明');
				} else if (app.getLength(form.content)>200){
					app.tips('说明最多100个字');
				} else {
					app.request('//help/addFeedback', {
						content: '类型：注销账号申请，理由：'+form.content,
						contact: form.account
					}, function(){
					}, function(){
					}, function () {
						app.alert('我们已经收到您的申请，等待客服审核',function(){
							app.navBack();
						});
					});
				};
			}
		}
	});
})();