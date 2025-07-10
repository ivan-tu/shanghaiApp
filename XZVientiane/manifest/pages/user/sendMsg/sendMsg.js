/**
 *模块组件构造器
 */
(function() {

	let app = getApp();

	app.Page({
		pageId: 'user-sendMsg',
		data: {
			systemId: 'user',
			moduleId: 'sendMsg',
			data: {},
			options: {},
			settings: {},
			language: {},
			form: {
				touserid:'',
				content: '',
			},
			isUserLogin:app.checkUser(),
		},
		methods: {
			onLoad: function(options){
				this.setData({
					options:options,
					'form.touserid':options.userid,
				});
			},
			onPullDownRefresh: function() {
				wx.stopPullDownRefresh();
			},
			submit: function() {
				let _this = this,
					formData = this.getData().form, 
					msg = '';
				if(!formData.content){
					msg='请输入私信内容';
				};
				if (msg) {
					app.tips(msg, 'error');
				} else {
					app.request('//homeapi/sendLetter',formData,function(){
						_this.setData({'form.content':''});
						app.confirm({
							title:'提示',
							content:'私信发送成功',
							cancelText:'返回',
							confirmText:'再发一条',
							success:function(req){
								if(req.confirm){
								}else{
									app.navBack();
								};
							},
						});
					})
				};
			},
		}
	});
})();