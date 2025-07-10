(function() {

	let app = getApp();

	app.Page({
		pageId: 'suboffice-recruitClub',
		data: {
			systemId: 'suboffice',
			moduleId: 'recruitClub',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {
				bottomLoad: false
			},
			language: {},
			form: {
				page:1,
				size:30,
			},
			begindate:app.getNowDate(),
			enddate:app.getNowDate(),
			showDate:false,
			showLoading:false,
			showNoData:false,
			count:0,
			pageCount:0,
			total:0,
		},
		methods: {
			onLoad: function(options) {
				let _this = this;
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
				let pathUrl = app.mixURL('/p/suboffice/index/index', {pocode: app.storage.get('pocode')}), 
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
				this.setData({
					'form.page': 1
				});
				if (this.getData().isUserLogin) {
					this.load();
				};
				wx.stopPullDownRefresh();
			},
			load: function() {
				this.getList();
			},
			getList:function(loadMore){
				let _this = this,
					formData = _this.getData().form,
					pageCount = _this.getData().pageCount;
				if(loadMore){
					if (formData.page >= pageCount) {
						_this.setData({'settings.bottomLoad':false});
					};
				};
				_this.setData({'showLoading':true});
				app.request('//homeapi/getPartnerClubs',formData,function(backData){
					if(!loadMore){
						if(backData.clubs.count){
							pageCount = Math.ceil(backData.clubs.count / formData.size);
							_this.setData({'pageCount':pageCount});
							if(pageCount > 1){
								_this.setData({'settings.bottomLoad':true});
							}else{
								_this.setData({'settings.bottomLoad':false});
							};
							_this.setData({'showNoData':false});
						}else{
							_this.setData({
								'settings.bottomLoad':false,
								'showNoData':true
							});
						};
					};
					let list = backData.clubs.data;
					if(list&&list.length){
						app.each(list,function(i,item){
							item.pic = app.image.crop(item.pic,100,100);
							if(item.userData&&item.userData.headpic){
								item.userData.headpic = app.image.crop(item.userData.headpic,30,30);
							};
						});
					};
					if(loadMore){
						list = _this.getData().data.concat(list);
					};
					_this.setData({
						data:list,
						count:backData.clubs.count||0,
						total:backData.total||0,
					});
				},'',function(){
					_this.setData({
						'showLoading':false,
					});
				});
			},
			onReachBottom:function(){
				if(this.getData().settings.bottomLoad) {
					let formData = this.getData().form;
					formData.page++;
					this.setData({form:formData});
					this.getList(true);
				};
			},
			toShare:function(){
				this.selectComponent('#newShareCon').openShare();
			},
			onShareAppMessage: function () {
				return app.shareData;
			},
		}
	});
})();