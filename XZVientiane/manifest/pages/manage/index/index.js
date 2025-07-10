/**
 *模块组件构造器
 */
(function () {

	let app = getApp();

	app.Page({
		pageId: 'manage-index',
		userSession: true,
		data: {
			systemId: 'manage',
			moduleId: 'index',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {},
			language: {},
			form: {},
			shopInfo: {
				"all": {
					"total": 0,
				},
				"today": {
					"order": 0,
					"total": 0,
					"orderwait":0,
				},
			},
			noShop: false,
			showLoading: false,
			client: app.config.client,
			windowWidth: app.system.windowWidth > 480 ? 480 : app.system.windowWidth,
			managePath: '../',//xzSystem.getSystemDist('manage'),
			myAuthority: {},
			info: {},
		},
		methods: {
			onLoad: function (options) {
				let _this = this;
				if(options.id){
					app.session.set('manageShopId',options.id);
				};
				if(app.config.client!='wx'){
					this.setData({managePath:xzSystem.getSystemDist('manage')})
				};
				_this.setData({
					options: options
				});
				app.checkUser(function () {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
			onShow: function () {
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
			onPullDownRefresh: function () {
				if (app.checkUser()) {
					this.load();
				};
				wx.stopPullDownRefresh();
			},
			load: function () {
				let _this = this;
				//获取店铺数据
				if (app.session.get('manageShopId')){
					_this.getShopInfo();
				}else{
					app.tips('缺少店铺id','error');
					app.switchTab({
						url:'../../suboffice/index/index'
					});
				};
			},
			getShopInfo: function () {
				let _this = this;
				app.request('//shopapi/getMyManageShopDetail', {
					client: app.config.client,
					systemjson: 'system.json'
				}, function (res) {
					if(res.shortid){
						app.session.set('manageShopShortId',res.shortid);
						app.visitShop(res.shortid);
					};
					if(res._id){
						app.session.set('manageShopId',res._id);
					};
					if(res.clubid){
						app.session.set('manageShopClubId',res.clubid);
					};
					let myAuthority = {};
					res.cover = res.cover || res.logo;
					res.logo = app.image.crop(res.logo||'17350243935763165.png', 80, 80);
					if(res.cover){
						res.cover = app.image.crop(res.cover, 320, 320);
					};
					if (res.system && res.system.length) {
						let newSystem = [];
						app.each(res.system, function (i, item) {
							let itemSystem = {
								'categoryName': item.categoryName,
								'list': []
							};
							if (item.list && item.list.length) {
								app.each(item.list, function (l, g) {
									g.icon = _this.getData().managePath + 'assets/images/' + g.icon;
									itemSystem.list.push(g);
									myAuthority[g.id] = true;
								});
							};
							if (itemSystem.list.length) {
								newSystem.push(itemSystem);
							};
						});
						res.system = newSystem;
					};
					res.link = 'https://' + app.config.domain + '/p/shop/index/index?id=' + res.shortid;
					app.storage.set('myAuthority', myAuthority);
					_this.setData({
						shopInfo: res,
						myAuthority: myAuthority
					});

					//设置分享参数
					let newData = app.extend({}, _this.getData().options);
					newData = app.extend(newData, {
						pocode: app.storage.get('pocode'),
						id: res.shortid
					});
					let pathUrl = app.mixURL('/p/shop/index/index', newData),
						shareData = {
							shareData: {
								title: res.name || '',
								content: res.content || '',
								path: 'https://' + res.domain + pathUrl,
								pagePath: pathUrl,
								img: res.cover || '',
								imageUrl: res.cover || '',
								weixinH5Image: res.logo,
								wxid: res.wxid || '',
								showMini: true,
							},
						},
						reSetData = function () {
							setTimeout(function () {
								if (_this.selectComponent('#newShareCon')) {
									_this.selectComponent('#newShareCon').reSetData(shareData);
								} else {
									reSetData();
								};
							}, 500);
						};
					reSetData();
					_this.isLoaded = true;
				});
			},
			toShare: function () {
				this.selectComponent('#newShareCon').openShare();
			},
			onShareAppMessage: function () {
				return app.shareData;
			},
			toPage: function (e) {
				app.navTo(app.eData(e).page);
			},
		}
	});
})();