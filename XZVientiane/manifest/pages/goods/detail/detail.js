(function () {
	let app = getApp();
	app.Page({
		pageId: 'goods-detail',
		data: {
			systemId: 'goods',
			moduleId: 'detail',
			isUserLogin: app.checkUser(),
			client: app.config.client,
			data: {},
			options: {},
			settings: {},
			language: {},
			form: {
				page: 1,
				size: 10
			},
			imgWidth: app.system.windowWidth > 480 ? 480 : app.system.windowWidth,
			imgHeight: app.system.windowWidth > 480 ? 480 : app.system.windowWidth,
			maxHeight: app.system.windowHeight - 120,
			showLoading: true,
			showNoData: false,
			client: app.config.client,
			userInfo:{},
		},
		methods: {
			onLoad: function (options) {
				let _this = this;
				if (app.config.client == 'wx' && options.scene) {
					let scenes = options.scene.split('_');
					options.id = scenes[0];
					if (scenes.length > 1) {
						options.pocode = scenes[1];
						app.session.set('vcode', scenes[1]);
					};
					delete options.scene;
				};
				_this.setData({
					options: options,
				});
				app.checkUser({
					goLogin: false,
					success: function () {
						_this.setData({
							isUserLogin: true
						})
					}
				});
				_this.load();
			},
			onShow: function () {
				let _this = this,
					options = this.getData().options,
					isUserLogin = app.checkUser(),
					data = this.getData().data,
					userInfo = this.getData().userInfo;
				if (isUserLogin != this.getData().isUserLogin) {
					this.setData({
						isUserLogin: isUserLogin
					});
					this.load();
				};
			},
			onPullDownRefresh: function () {
				this.setData({
					'form.page': 1
				});
				this.load();
				wx.stopPullDownRefresh()
			},
			load: function () {
				let _this = this;
				setTimeout(function () {
					_this.getGoodeDetail();
				}, 500);
			},
			getGoodeDetail: function () {
				let _this = this,
					options = this.getData().options;
				app.request('//homeapi/getGoodsDetail', {id: options.id}, function (res) {
					let imgWidth = _this.getData().imgWidth,
						imgHeight = _this.getData().imgHeight,
						fPath = app.config.filePath;
					if (res.pic) {
						res.pic = app.image.crop(res.pic, imgWidth, imgHeight);
					};
					//先清除原有样式
					res.content = res.content.replace(/<img[^>]*>/gi, function (match, capture) {
					  match = match.replace(/style="[^"]+"/gi, '').replace(/style='[^']+'/gi, '');	      
					  return match;
					});	 
					//再设置新的样式  
					res.content = res.content.replace(/\<img/gi, '<img style="max-width:100%;height:auto;text-align:center;"');	
					res.content = app.parseHtmlData(res.content);
					//res.content = res.content.replaceAll('https://pic.zjpxsm2.cn/',app.config.filePath);
					_this.setData({
						data:res,
						showLoading:false,
					});
					//设置分享参数
					_this.setShareData(res,false);
				}, function () {
					_this.setData({
						showLoading: false
					});
				});
			},
			setShareData:function(res,isToShare){//设置分享参数
				let _this = this,
					options = this.getData().options,
					newData = app.extend({}, options);
				newData = app.extend(newData, {
					pocode: app.storage.get('pocode')
				});
				let pathUrl = app.mixURL('/p/goods/detail/detail', newData),
					shareData = {
						shareData: {
							title: res.name,
							content: res.abstract || '',
							path: 'https://' + app.config.domain + pathUrl,
							pagePath: pathUrl,
							img: res.pic || '',
							imageUrl: res.pic || '',
							weixinH5Image: res.pic,
							wxid: '',
							showMini: false,
							showQQ: false,
							showWeibo: false
						},
					},
					reSetData = function () {
						setTimeout(function () {
							if (_this.selectComponent('#newShareCon')) {
								_this.selectComponent('#newShareCon').reSetData(shareData);
								if(isToShare){
									_this.selectComponent('#newShareCon').openShare();
								};
							} else {
								reSetData();
							}
						}, 500)
					};
				reSetData();
			},
			//立即购买
			toBuy: function () {
				let _this = this,
					data = this.getData().data,
					options = this.getData().options;
				if(app.checkUser()){
					app.request('//homeapi/getMyInfo',{},function(res){
						/*if(res.ismember==1||data.isMemberGift==1||data.isgift==1){
							app.navTo('../../order/checkout/checkout?id='+options.id);
						}else{
							app.confirm({
								content:'限制非会员不能购买，请先购买会员礼包成为会员',
								confirmText:'成为会员',
								success:function(req){
									if(req.confirm){
										app.switchTab({
											url:'../../order/gift/gift'
										});
									};
								},
							});
						};*/
						app.navTo('../../goods/checkout/checkout?id='+options.id);
					});
				}else{
					this.goLogin();
				};
			},
			viewThisImage: function (e) {
				let _this = this,
					pic = app.eData(e).pic;
				pic = pic.split('?')[0];
				app.previewImage({
					current: pic,
					urls: [pic]
				})
			},
			goLogin: function () {
				let _this = this;
				app.userLogin(function () {
					_this.load()
				})
			},
			toPage: function (e) {
				let page = app.eData(e).page;
				app.navTo(page)
			},
			viewImage: function (e) {
				let _this = this,
					data = this.getData().evaluateData,
					parent = Number(app.eData(e).parent),
					index = Number(app.eData(e).index),
					viewSrc = [],
					files = data[parent].pics;
				app.each(files, function (i, item) {
					viewSrc.push(app.config.filePath + '' + item.key)
				});
				app.previewImage({
					current: viewSrc[index],
					urls: viewSrc
				})
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
						query: 'scene=' + data.id + '_' + data.pocode + '_' + data.liveid,
						imageUrl: app.shareData.imageUrl
					};
				return shareData;
			},
			backIndex: function () {
				app.switchTab({
					url: '../../home/index/index'
				});
			},
		}
	})
})();