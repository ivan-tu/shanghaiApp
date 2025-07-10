(function() {

	let app = getApp();

	app.Page({
		pageId: 'user-myPartner',
		data: {
			systemId: 'user',
			moduleId: 'myPartner',
			isUserLogin: app.checkUser(),
			data: {
				total:'',
				teamuser:''
			},
			options: {},
			settings: {},
			language: {},
			form: {},
			showLoading:true,
		},
		methods: {
			onLoad: function(options) {
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
				let _this = this,
					options = this.getData().options;
				app.request('//homeapi/getPartnerInfo',{},function(res){
					_this.setData({data:res});
				},'',function(){
					_this.setData({showLoading:false})
				});
				
				//设置分享参数
				let newData = app.extend({}, options);
				newData = app.extend(newData, {
					pocode: app.storage.get('pocode')
				});
				let pathUrl = app.mixURL('/p/user/cityPartnerList/cityPartnerList', newData), 
					sharePic = 'https://statics.tuiya.cc/17333689747996230.jpg',
					shareData = {
						shareData: {
							title: '快来一起入局，出门入局，乐在局中。',  
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
			toPartner:function(){
				app.navTo('../../user/cityPartnerList/cityPartnerList');
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