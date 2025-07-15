/**
 *模块组件构造器
 */
(function() {

	let app = getApp();

	app.Page({
		pageId: 'home-textInput',
		userSession: true,
		data: {
			systemId: 'home',
			moduleId: 'textInput',
			data: {
				tips: '',
			},
			options: {
				placeholder:'请输入'	
			},
			settings: {},
			language: {},
			form: {
				content: ''
			},
			showTextArea: false
		},
		methods: {
			onLoad: function(options) {
				let _this = this;
				if(options.placeholder){
					_this.setData({
						'options.placeholder': options.placeholder
					});
				};
				if (options.tips) {
					_this.setData({
						'data.tips': options.tips
					});
				};
				if (options.content) {
					_this.setData({
						'form.content': options.content,
					});
				};
				if (options.isNumber) {
					_this.setData({
						'options.isNumber': options.isNumber
					});
				};
				if (options.isTel) {
					_this.setData({
						'options.isTel': options.isTel
					});
				};
				if (options.isName) {
					_this.setData({
						'options.isName': options.isName
					});
				};
				if (options.maxLength){
					_this.setData({
						'options.maxLength': options.maxLength
					});
				};
			},
			onPullDownRefresh: function() {
				wx.stopPullDownRefresh();
			},
			submit: function() {
				let formData = this.getData().form, 
					options = this.getData().options,
					numberRe = /^[+]{0,1}(\d+)$/,
					telRe = /^0?1[2|3|4|5|6|7|8|9][0-9]\d{8}$/,
					msg = '';
				if(options.isNumber&&!numberRe.test(formData.content)){
					msg='请输入正确的数字';
				}else if(options.isTel&&!telRe.test(formData.content)){
					msg='请输入正确的手机号';
				}else if(options.maxLength&&app.getLength(formData.content)>options.maxLength){
					msg='最多输入'+Math.ceil(options.maxLength/2)+'个汉字';
				};
				if (msg) {
					app.tips(msg, 'error');
				} else {
					app.dialogSuccess(formData);
				};
			},
		}
	});
})();