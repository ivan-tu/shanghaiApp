(function() {

	let app = getApp();

	app.Page({
		pageId: 'user-courseList',
		data: {
			systemId: 'user',
			moduleId: 'courseList',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {},
			language: {},
			form: {
				page:1,
				size:30,
				category:'',
			},
			showLoading:false,
			showNoData:false,
			categoryList:[],
		},
		methods: {
			onLoad: function(options) {
				//设置分享参数
				let _this = this,
					newData = app.extend({}, options);
				newData = app.extend(newData, {
					pocode: app.storage.get('pocode')
				});
				let pathUrl = app.mixURL('/p/user/courseList/courseList', newData), 
					sharePic = 'https://statics.tuiya.cc/17333689747996230.jpg',
					shareData = {
						shareData: {
							title: '教程-在局',  
							content: '在局活动社交平台',
							path: 'https://' + app.config.domain + pathUrl,
							pagePath: pathUrl,
							img: sharePic,
							imageUrl: sharePic,
							weixinH5Image: sharePic,
							wxid: 'gh_601692a29862',
							showMini: false,
							hideCopy: app.config.client=='wx'?true:false,
						},
					}, 
					reSetData = function() {
						setTimeout(function() {
							if (_this.selectComponent('#newShareCon')) {
								_this.selectComponent('#newShareCon').reSetData(shareData)
							} else {
								reSetData();
							}
						}, 500)
					};
				reSetData();
			},
			onShow: function() {
				let _this = this;
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
			onPullDownRefresh: function() {
				if (this.getData().isUserLogin) {
					this.load();
				};
				wx.stopPullDownRefresh();
			},
			load: function() {
				let _this = this;
				app.request('//set/get',{type:'courseCategory'}, function (res) {
					if(res.data&&res.data.length){
						_this.setData({
							categoryList:res.data,
							'form.category':res.data[0].name,
						});
						_this.getList();
					}else{
						_this.setData({data:[],showNoData:true});
					};
				});
			},
			screen:function(e){
				let type = app.eData(e).type,
					value = app.eData(e).value,
					formData = this.getData().form;
				formData[type] = value;
				formData.page = 1;
				this.setData({form:formData});
				this.getList();
			},
			getList:function(){
				let _this = this,
					formData = this.getData().form;
				_this.setData({showLoading:true});
				app.request('//admin/getArticle',formData,function(res){
					if(res.data&&res.data.length){
						_this.setData({
							data:res.data,
							showNoData:false,
						});
					}else{
						_this.setData({data:[],showNoData:true});
					};
				},'',function(){
					_this.setData({showLoading:false})
				});
			},
			toShare:function(){
				this.selectComponent('#newShareCon').openShare();
			},
			onShareAppMessage: function () {
				return app.shareData;
			},
			onShareTimeline: function () {
				let data = app.urlToJson(app.shareData.pagePath),
					shareData = {
						title: app.shareData.title,
						query: 'scene=' + data.pocode,
						imageUrl: app.shareData.imageUrl
					};
				return shareData;
			},
		}
	});
})();