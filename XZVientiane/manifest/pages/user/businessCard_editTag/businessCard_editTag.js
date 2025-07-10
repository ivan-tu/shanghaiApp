/**
 *模块组件构造器
 */
(function() {

	let app = getApp();

	app.Page({
		pageId: 'user-businessCard_editTag',
		data: {
			systemId: 'user',
			moduleId: 'businessCard_editTag',
			data: {
				tips: '',
			},
			options: {
				placeholder:'请输入'	
			},
			settings: {},
			language: {},
			form: {
				tags: ''
			},
		},
		methods: {
			onLoad: function(options) {
				let _this = this;
				app.request('//userapi/info', {}, function(res) {
					if(res.tags&&res.tags.length){
						_this.setData({
							'form.tags':(typeof res.tags=='string')?res.tags:res.tags.join(',')
						});
					};
				});
			},
			onPullDownRefresh: function() {
				wx.stopPullDownRefresh();
			},
			submit: function() {
				let formData = this.getData().form, 
					msg = '';
				if(formData.tags){
					formData.tags = formData.tags.replace(/\ +/g, ""); //去掉空格
					formData.tags = formData.tags.replace(/[ ]/g, ""); //去掉空格
					formData.tags = formData.tags.replace(/[\r\n]/g, "");//去掉回车换行
					formData.tags = formData.tags.replace(/，/g, ',');//转换大小写逗号
					formData.tags = formData.tags.split(',');
				}else{
					formData.tags = '';
				};
				if (msg) {
					app.tips(msg, 'error');
				} else {
					let checkInfoData = [formData.tags.join(',')];
					app.wxSecCheck(checkInfoData,1,function(){
						app.request('//userapi/setting', {tags:formData.tags}, function(backData) {
							app.tips('修改成功','success');
							setTimeout(app.navBack,1000);
						});
					});
				};
			},
		}
	});
})();