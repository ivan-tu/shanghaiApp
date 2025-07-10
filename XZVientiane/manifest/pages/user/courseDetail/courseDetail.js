(function() {

	let app = getApp();
	app.Page({
		pageId: 'user-courseDetail',
		data: {
			systemId: 'user',
			moduleId: 'courseDetail',
			data: {},
			options: {},
			settings: {bottomLoad:false},
			language: {},
			form: {},
			isUserLogin:app.checkUser(),
			showLoading:true,
			client:app.config.client,
			videoStatus:0,//0-待播放，1-播放
			picWidth:Math.floor(app.system.windowWidth>480?480:app.system.windowWidth),
			picHeight:Math.floor((app.system.windowWidth>480?480:app.system.windowWidth)*0.75),
			settingData:{},
		},
		methods: {
			onLoad: function(options){
				let _this = this;
				if (app.config.client == 'wx' && options.scene) {
					let scenes = options.scene.split('_');
					options.id = scenes[0];
					if (scenes.length > 1) {
						app.session.set('vcode', scenes[1]);
					};
					delete options.scene;
				};
				this.setData({
					options:options,
					'form.videoid':options.id,
				});
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
				//this.load();
				wx.stopPullDownRefresh();
			},
			load: function() {
				let _this = this,
					options = this.getData().options;
				app.request('//admin/getArticleInfo',{id:options.id},function(res){
					if(res.title){
						app.setPageTitle(res.title);
					};
					if(res.video&&res.video.file){
						res.video.file = app.config.filePath+''+res.video.file;
						res.video.pic = app.image.crop(res.video.pic,_this.getData().picWidth,_this.getData().picHeight);
					};
					res.content = app.parseHtmlData(res.content);
					_this.setData({
						data:res,
						showLoading:false,
					});
					//设置分享参数
					let newData = {pocode: app.storage.get('pocode')};
					newData = app.extend(newData, options);
					let pathUrl = app.mixURL('/p/user/courseDetail/courseDetail', newData),
						sharePic = 'https://statics.tuiya.cc/17333689747996230.jpg',
						shareData = {
							shareData: {
								title: res.title,  
								content: '',
								path: 'https://' + app.config.domain + pathUrl,
								pagePath: pathUrl,
								img: sharePic,
								imageUrl: sharePic,
								weixinH5Image: sharePic,
								wxid: 'gh_601692a29862',
								showMini: false,
								hideCopy: app.config.client=='wx'?true:false,
							}
						},
						reSetData = function () {
							setTimeout(function () {
								if (_this.selectComponent('#newShareCon')) {
									_this.selectComponent('#newShareCon').reSetData(shareData);
								} else {
									reSetData();
								}
							}, 500)
						};
					 reSetData();
				},function(){
					_this.setData({showLoading:false,content:'教程不存在或已被删除'});
				});
			},
			toPlay:function(){
				let _this = this,
					options = this.getData().options,
					data = this.getData().data,
					settingData = this.getData().settingData;
				this.setData({videoStatus:1});
			},
			videoPicLoad:function(e){
				let _this = this,
					windowHeight = this.getData().windowHeight;
				if(app.config.client=='wx'){
					 let query = wx.createSelectorQuery();
					  query.select('#videoPic').boundingClientRect(function(res) {
						if (res) {
						 let videoHeight  = Number(res.height);
						 _this.setData({videoHeight:videoHeight});
						 if(videoHeight>=windowHeight-65){
							 _this.setData({videoTop:0});
						 }else{
							 _this.setData({videoTop:Math.floor((windowHeight-65)/2-videoHeight/2)});
						 }; 
						 _this.setData({showLoading:false});
						};
					  }).exec();
				 }else{
					 setTimeout(function(){
						 let videoHeight  = $('#video').height();
						 if(videoHeight>=windowHeight-65){
							 _this.setData({videoTop:0});
						 }else{
							 _this.setData({videoTop:Math.floor((windowHeight-65)/2-videoHeight/2)});
						 };
						 _this.setData({showLoading:false});
					 },500);
				 };
			},
			toShare: function () {
				this.selectComponent('#newShareCon').openShare();
			},
			onShareAppMessage: function () {
				return app.shareData;
			},
			onShareTimeline: function () {
				let data = app.urlToJson(app.shareData.pagePath),
					shareData = {
						title: app.shareData.title,
						query: 'scene=' + data.id + '_' + data.pocode,
						imageUrl: app.shareData.imageUrl
					};
				return shareData;
			},
		}
	});
})();