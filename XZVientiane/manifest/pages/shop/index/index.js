/**

 *模块组件构造器

 */

(function () {
	let app = getApp();
	app.Page({
		pageId: 'shop-index',
		data: {
			systemId: 'shop',
			moduleId: 'index',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			form: {
				page: 1,
				size: 2,
				status: 1,
				sort: "top"
			},
			ypform: {
				page: 1,
				size: 10,
			},
			count: 0,
			pageCount: 0,
			settings: {
				bottomLoad: true,
				noMore: false
			},
			language: {},
			windowWidth: (app.system.windowWidth > 480 ? 480 : app.system.windowWidth),
			imgHeight: (app.system.windowWidth > 480 ? 480 : app.system.windowWidth) / 2,
			shopInfoWidth: app.system.windowWidth > 480 ? 356 : app.system.windowWidth - 124,
			PicWidth2: ((app.system.windowWidth > 480 ? 480 : app.system.windowWidth) - 30) / 2,
			modules: [],
			shopInfo: '',
			showLoading: false,
			showNoData2: false,
			visitShopShortId: '',
			client: app.config.client,
			showGXB: false,
			sharetemp: false,
			badgeList: [], //全部标志列表
			cssData: {
				bannerCss: ''
			},
			newData: [],
			showType: 'news', //显示类型
			showDialog: false,
			showDialog_animate: false,
			selectedIndex: 0,
			selectedCount: 1,
			detailData: {
				sku: []
			}, //详情数据
			// pageCount: 0, //动态总数
			mGetWxsGoodsList: [],// 一品商品列表
			backgroundPic: "",// 信息流店铺背景
			invitationNum: "",
			clienData:{},//客服数据
		},
		methods: {
			onLoad: function (options) {
				console.log(app.toJSON(options));
				if(app.config.client=='wx'){
				}else{
					xzSystem.loadSrcs([app.config.staticPath + 'css/shopIndex.css'], function () {});
				};
				let _this = this;
				if (app.config.client == 'wx' && options.scene) {
					let scenes = options.scene.split('_');
					app.visitShop(scenes[0]);
					if (scenes.length > 1) {
						app.session.set('vcode', scenes[1]);
					};
					delete options.scene;
				} else if (options.id) {
					app.visitShop(options.id);
				} else if (!app.session.get('visitShopShortId')) {
					this.setData({
						showGXB: true
					});
					//app.visitShop('10001048');
				};
				if (app.storage.get('shopMenuType')) {
					let typeArray = {
						'news': '',
						'solitaire': 3,
						'product': 1
					};
					this.setData({
						'form.type': typeArray[app.storage.get('shopMenuType')],
						showType: app.storage.get('shopMenuType')
					});
				};
				_this.setData({
					options: options
				});
				app.checkUser({
					goLogin: false,
					success: function () {
						_this.setData({
							isUserLogin: true
						});
					}
				});
				this.load();
			},
			onShow: function () {
				//检查用户登录状态
				if(app.storage.get('oldShopShortId')){
					app.visitShop(app.storage.get('oldShopShortId'));
					app.storage.remove('oldShopShortId');
					if(app.config.client=='web'){
						this.load();
					};
				};
				let isUserLogin = app.checkUser();
				if (isUserLogin != this.getData().isUserLogin) {
					this.setData({
						isUserLogin: isUserLogin
					});
					if (isUserLogin) {
						this.load();
					};
				} else if (this.getData().visitShopShortId && this.getData().visitShopShortId != app.session.get('visitShopShortId')) {
					this.load();
				};
				this.setData({
					visitShopShortId: app.session.get('visitShopShortId')
				});
				if (this.shareData) {
					this.selectComponent('#newShareCon').reSetData(this.shareData);
				};
			},
			onPullDownRefresh: function () {
				this.setData({
					'form.page': 1
				});
				this.load();
				wx.stopPullDownRefresh();
			},
			load: function () {
				let _this = this;
				if (app.session.get('visitShopShortId')) {
					_this.getInfo();
				} else {
					app.request('//shopapi/getDefaultShopid', {}, function (res) {
						app.visitShop(res);
						_this.getInfo();
					});
				};
			},
			toGoodsDetail:function(e){
				let modules = this.getData().modules,
					parent = Number(app.eData(e).parent),
					index = Number(app.eData(e).index),
					url = app.eData(e).link;
				app.navTo(url);
			},
			toYpGoodsDetail:function(e){//商品详情
				let id = app.eData(e).id,
					visitShopShortId = app.session.get('visitShopShortId');
				if(id){
					app.storage.set('oldShopShortId',visitShopShortId);
					app.navTo('../../shop/goodsDetail/goodsDetail?id='+id);
				};
			},
			loadMore: function () {
			},
			onReachBottom: function () {
				if (this.getData().settings.bottomLoad) {
					this.loadMore();
				};
			},
			screenTab:function(e){//切换选项卡
				let modules = this.getData().modules,
					index = Number(app.eData(e).index),
					parent = Number(app.eData(e).parent);
				modules[parent].settings.tabIndex = index;
				app.each(modules,function(i,item){
					if(i>parent&&i<parent+modules[parent].settings.tabOptions.length+1){
						item.hide = 1;
					};
					if(i==parent+index+1){
						item.hide = 0;
					};
				});
				this.setData({modules:modules});
			},
			getInfo: function () {
				let _this = this;
				app.request('//vshopapi/getShopBasicinfo', function (req) {
					_this.setData({
						invitationNum: req.invitationNum
					});
					req.cover = req.cover || req.logo;
					if (req.logo) {
						req.logo = app.image.crop(req.logo, 80, 80);
					};
					if (req.cover) {
						req.cover = app.image.width(req.cover, _this.getData().windowWidth);
					};
					_this.setData({
						shopInfo: req,
						mGetWxsGoodsList:[],//先重置一下
						'cssData.bannerCss': 'background-image:url(' + req.cover + ')',
					});
					
					app.request('//vshopapi/getShopPageSettings', {
						type: 'home'
					}, function (data) {
						if (data.sharetemp == 1) {
							_this.setData({
								sharetemp: true
							})
						} else {
							_this.setData({
								sharetemp: false
							});
						};
						if (data && data.settings && data.settings.length) {
							data = _this.resetModules(data.settings);
							let items = [],
								hasTabLength = 0,
								hasTabLength2 = 0;
							app.each(data, function (i, item) {
								if(item.type == 'article' || item.type == 'goods') {
									items.push(i);
								};
								item.hide = 0;//默认不隐藏
								if(item.type=='tab'&&item.settings.tabOptions&&item.settings.tabOptions.length){
									hasTabLength = item.settings.tabOptions.length;
									hasTabLength2 = item.settings.tabOptions.length;
									item.settings.tabIndex=0;
								}else if(hasTabLength>0){
									if(hasTabLength2>hasTabLength){
										item.hide = 1;//默认隐藏
									}else if(hasTabLength==0){
										hasTabLength2=0;
									};
									hasTabLength--;
								};
							});
							console.log(app.toJSON(data));
							_this.setData({
								modules: data
							});
							//设置滑动块
							if (app.config.client != 'wx') {
								let swiperJs = xzSystem.getSystemDist('assets') + 'js/swiper.js',
									swiperCss = xzSystem.getSystemDist('assets') + 'css/swiper.css';
								xzSystem.loadSrcs([swiperJs, swiperCss], function () {
									if (data && data.length) {
										app.each(data, function (a, b) {
											if (b.type == 'image' && b.showType == 1) {
												let viewId = '#swiperBanner_' + a;
												var mySwiper_banner = new Swiper(viewId, {
													pagination: viewId + ' .pagination',
													paginationClickable: true,
													grabCursor: true,
													resizeReInit: true,
													loop: true,
													slidesPerView: 1,
													calculateHeight: true,
													autoplay: 3000,
													speed: 1000,
													autoplayDisableOnInteraction: false,
												});
											};
										});
									};
								});
							};
							if (items.length) {
								let index = 0,
									getData = function () {
										_this.freshModule(items[index], function () {
											index++;
											if (index != items.length) {
												getData();
											};
										});
									};
								getData();
							};
						};
					}, function () {});
					_this.setShareData(req);
				});
			},
			//设置模块数据
			resetModules: function (data) {
				let _this = this,
					filePath = app.config.filePath,
					windowWidth = _this.getData().windowWidth;
				app.each(data, function (i, item) {
					let addClass = '';
					if (!item.settings) {
						item.settings = {};
					};
					if (item.content == undefined) {
						item.content = '';
					} else if (item.content) {
						switch (item.type) {
							case 'text':
								item.fontStyle = '';
								if (item.settings.fontSize) {
									item.fontStyle += 'font-size:' + item.settings.fontSize + 'px;';
								};
								if (item.settings.fontWeight == '1') {
									item.fontStyle += 'font-weight:bold;';
								} else if (item.settings.fontWeight == '2') {
									item.fontStyle += 'font-weight:bolder;';
								};
								if (item.settings.color) {
									item.fontStyle += 'color:' + item.settings.color + ';';
								};
								break;
							case 'image':
								if (item.content.length) {
									let column = item.settings.column || 1,
										picWdith = windowWidth / column;
									app.each(item.content, function (j, item1) {
										if (item.settings.showType == 1) {
											let widthScale = Number(item.settings.widthScale) ? Number(item.settings.widthScale) : 2,
												heightScale = Number(item.settings.heightScale) ? Number(item.settings.heightScale) : 1,
												imageHeight = _this.getData().windowWidth / widthScale * heightScale;
											item1.file = app.image.crop(item1.src, _this.getData().windowWidth, imageHeight);
											item.imageHeight = imageHeight;
										} else {
											item1.file = app.image.width(item1.src, picWdith);
										};
										item.imageView = item.settings.imageView==1?1:0;
									});
								};
								if (item.settings.imageMargin == 1) {
									item.imageMarginClass = 'pl5 pt5';
									item.imageMarginStyle = 'margin-top:-5px;margin-left:-5px';
								} else if (item.settings.imageMargin == 2) {
									item.imageMarginClass = 'pl10 pt10';
									item.imageMarginStyle = 'margin-top:-10px;margin-left:-10px';
								} else if (item.settings.imageMargin == 3) {
									item.imageMarginClass = 'pl15 pt15';
									item.imageMarginStyle = 'margin-top:-15px;margin-left:-15px';
								} else {
									item.imageMarginClass = '';
									item.imageMarginStyle = '';
								};
								item.showType = item.settings.showType?item.settings.showType:0;
								if(item.settings.showType==2){//左一右多
									item.imageLeftWidth = item.settings.imageLeftWidth?item.settings.imageLeftWidth+'px':'50%';
									
									if(item.settings.picsColumnMarginlr){
										item.picsColumnMarginlr = item.settings.imageLeftWidth?Number(item.settings.imageLeftWidth)+Number(item.settings.picsColumnMarginlr)+'px':'50%';
									}else{
										item.picsColumnMarginlr = item.settings.imageLeftWidth?item.settings.imageLeftWidth+'px':'50%';
									};
									item.picsColumnMargintb = (item.settings.picsColumnMargintb?Number(item.settings.picsColumnMargintb):0)+'px';
								}else if(item.settings.showType==3){//左多右一
									item.imageRightWidth = item.settings.imageRightWidth?item.settings.imageRightWidth+'px':'50%';
									
									if(item.settings.picsColumnMarginlr){
										item.picsColumnMarginlr = item.settings.imageRightWidth?Number(item.settings.imageRightWidth)+Number(item.settings.picsColumnMarginlr)+'px':'50%';
									}else{
										item.picsColumnMarginlr = item.settings.imageRightWidth?item.settings.imageRightWidth+'px':'50%';
									};
									item.picsColumnMargintb = (item.settings.picsColumnMargintb?Number(item.settings.picsColumnMargintb):0)+'px';
								}else if(item.settings.showType==4){//自定义
									let newContent = app.deepCopy(item.content),
										picsColumn = item.settings.picsColumn?item.settings.picsColumn.split('-'):'',
										picsList = [];
									if(!picsColumn.length){
										for(var a=0;a<item.content.length;a++){
											picsColumn.push(1);
										};
									};
									app.each(picsColumn, function (l, g) {
										let itemJSON = newContent.splice(0, Number(g));
										picsList.push({
											data: itemJSON
										});
									});
									item.picsList = picsList;
									item.picsColumnMargintb = (item.settings.picsColumnMargintb?Number(item.settings.picsColumnMargintb):0)+'px';
									item.picsColumnMarginlr = (item.settings.picsColumnMarginlr?Number(item.settings.picsColumnMarginlr):0)+'px';
								};
								break;
							case 'video':
								item.file = filePath + item.content.src;
								let w = windowWidth;
								if (item.settings.marginLeft) {
									windowWidth -= 15;
								};
								if (item.settings.marginRight) {
									windowWidth -= 15;
								};
								item.width = windowWidth;
								if (item.content.poster) {
									item.posterFile = app.image.width(item.content.poster, w);
								};
								break;
							default:
								if (typeof item.content == 'object') {
									if (!item.settings.template) {
										item.settings.template = 1;
									};
									app.each(item.content, function (j, item1) {
										let c = item.settings.column || 2,
											w = item.settings.picWidth || windowWidth / c,
											h = item.settings.picHeight || windowWidth / c;
										if (item1.pic) {
											if(item.type=='goods'){
												item1.pic_3 = app.image.crop(item1.pic,100,100);
												item1.pic_4 = app.image.crop(item1.pic,108,78);
												item1.pic_5 = app.image.crop(item1.pic,150,150);
											};
											item1.pic = app.image.crop(item1.pic, w, h);
										}
									});
								};
						};
					};
					if (item.settings.backgroundColor) {
						item.style = 'background-color:' + item.settings.backgroundColor + ';';
					};
					if (item.settings.marginSize) {
						if (item.settings.marginTop == '1') {
							addClass += ' mt' + item.settings.marginSize;
						};
						if (item.settings.marginRight == '1') {
							addClass += ' mr' + item.settings.marginSize;
						};
						if (item.settings.marginBottom == '1') {
							addClass += ' mb' + item.settings.marginSize;
						};
						if (item.settings.marginLeft == '1') {
							addClass += ' ml' + item.settings.marginSize;
						};
					};
					if (item.settings.paddingSize) {
						if (item.settings.paddingTop == '1') {
							addClass += ' pt' + item.settings.paddingSize;
						};
						if (item.settings.paddingRight == '1') {
							addClass += ' pr' + item.settings.paddingSize;
						};
						if (item.settings.paddingBottom == '1') {
							addClass += ' pb' + item.settings.paddingSize;
						};
						if (item.settings.paddingLeft == '1') {
							addClass += ' pl' + item.settings.paddingSize;
						};
					};
					if (item.settings.bottomLine == '1') {
						addClass += ' hasBorder bottom';
					};
					if(item.settings.radiusTopLeft){
						item.style+=' border-top-left-radius:'+item.settings.radiusTopLeft+'px;';
					};
					if(item.settings.radiusTopRight){
						item.style+=' border-top-right-radius:'+item.settings.radiusTopRight+'px;';
					};
					if(item.settings.radiusBottomRight){
						item.style+=' border-bottom-right-radius:'+item.settings.radiusBottomRight+'px;';
					};
					if(item.settings.radiusBottomLeft){
						item.style+=' border-bottom-left-radius:'+item.settings.radiusBottomLeft+'px;';
					};
					if(item.type=='service'){
						item.settings.serviceBtnPic = app.image.crop(item.settings.serviceBtnPic||'16412827297502232.png',60,60);
					};
					if(item.settings.moduleTitleIcon&&item.settings.moduleTitleIcon.indexOf('http')==-1){
						item.settings.moduleTitleIcon = app.config.filePath+''+item.settings.moduleTitleIcon;
					};
					item.addClass = addClass;
				});
				return data;
			},
			//刷新数据
			freshModule: function (index, callback) {
				let _this = this,
					modules = _this.getData().modules,
					data = modules[index],
					parms = '',
					set = function (res) {
						data.content = res.data;
						data = _this.resetModules([data])[0];
						modules[index] = data;
						_this.setData({
							modules: modules
						});
						if (typeof callback == 'function') {
							callback();
						}
					};
				switch (data.type) {
					case 'info':
						app.request('//shopapi/getShopBasicinfo', function (req) {
							req.cover = req.cover || req.logo;
							if (req.logo) {
								req.logo = app.image.crop(req.logo, 80, 80);
							};
							if (req.cover) {
								req.cover = app.image.width(req.cover, _this.getData().windowWidth);
							};
							_this.setData({
								shopInfo: req
							});
							set('');
						}, function () {
							if (typeof callback == 'function') {
								callback();
							}
						});
						break;
					case 'goods':
						parms = {
							size: data.settings.size || 6,
							goodsCategoryId: data.settings.goodsCategoryId || '',
							dataLimit: data.settings.dataLimit,
							tags: data.settings.tags,
							pointTag:data.settings.pointTag,
							sort: 'top'
						};
						if(data.settings.dataLimit==3){//项目商品
							parms.shopid = data.settings.projectShopid;
							app.request('//vshopapi/getShopGoodsListByShopid',parms,function(res){
								set(res);
							},function(){
								if(typeof callback=='function'){
									callback();
								};
							});
						}else if(data.settings.dataLimit==4){//入驻商品
							parms.shopid = data.settings.settledShopid;
							app.request('//vshopapi/getEnterGoodsList',parms,function(res){
								set(res);
							},function(){
								if(typeof callback=='function'){
									callback();
								};
							});
						}else{
							app.request('//vshopapi/getShopGoodsList', parms, function (res) {
								set(res);
							}, function () {
								if (typeof callback == 'function') {
									callback();
								}
							});
						};
						break;
					/*case 'article':
						parms = {
							size: data.settings.size || 6,
							categoryid: data.settings.categoryid || '',
							dataLimit: data.settings.dataLimit,
							sort: 'top'
						};
						app.request('//vshopapi/getShopArticleList', parms, function (res) {
							set(res);
						}, function () {
							if (typeof callback == 'function') {
								callback();
							}
						})
						break;*/
				};
			},
			//搜索事件
			searchSubmit: function (e) {
				let _this = this,
					index = app.eData(e).index,
					modules = _this.getData().modules;
				app.navTo('../../shop/goods/goods?keyword=' + modules[index].value);
				if (app.config.client == 'web' || app.config.client == 'app') {
					e.preventDefault();
				};
			},
			//搜索框事件
			searchInput: function (e) {
				let _this = this,
					index = app.eData(e).index,
					value = app.eValue(e),
					modules = _this.getData().modules;
				modules[index].value = value;
				_this.setData({
					modules: modules
				});
			},
			//查看图片
			tapImage: function (e) {
				let _this = this,
					index = app.eData(e).index,
					index1 = app.eData(e).index1,
					itemData = _this.getData().modules[index],
					module = _this.getData().modules[index].content,
					systemMenuUrl = ['/home/index/index', '/suboffice/index/index', '/user/my/my'],
					urlLink = module[index1].link,
					urlData = app.urlToJson(urlLink);
				if (urlLink) {
					if (app.config.client == 'web') {
						window.open(urlLink);
					}else{//app
						let isTab = 0;
						app.each(systemMenuUrl, function (i, item) {
							if (urlLink.indexOf(item) >= 0) {
								isTab = 1;
							};
						});
						if (isTab == 1) {
							app.switchTab({
								url: urlLink
							});
						} else {
							app.navTo(urlLink);
						};
					};
				} else {
					let newSrc = [];
					app.each(module, function (i, item) {
						if (item.src) {
							newSrc.push(app.image.width(item.src, 480));
						};
					});
					if(!itemData.imageView){
						app.previewImage({
							current: newSrc[index1],
							urls: newSrc
						});
					};
				};
			},
			viewImage: function (e) {
				let _this = this,
					image = app.eData(e).image;
				if (image) {
					image = image.split('?')[0];
					image = app.image.width(image, 480);
					app.previewImage({
						current: image,
						urls: [image]
					});
				};
			},
			toPage: function (e) {
				let page = app.eData(e).page;
				if (page) {
					app.navTo(page);
				};
			},
			setShareData: function (res) {
				let _this = this;
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
							wxid: 'gh_601692a29862',
							showMini: true,
							showQQ: true,
							showWeibo: true
						}
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
				_this.shareData = shareData;
				reSetData();
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
				console.log(app.toJSON(shareData));
				return shareData;
			},
			toDetail: function (e) {
				let client = app.config.client,
					systemMenuUrl = ['/home/index/index', '/shop/goods/goods', '/shop/cart/cart', '/user/my/my'],
					urlLink = app.eData(e).link;
				if (!urlLink) return;
				if (client == 'web') {
					if (urlLink.indexOf('http') == 0) {
						window.location.href = urlLink;
					} else {
						app.navTo(urlLink);
					};
				} else {
					let isTab = 0;
					app.each(systemMenuUrl, function (i, item) {
						if (urlLink.indexOf(item) >= 0) {
							isTab = 1;
						};
					});
					if (isTab == 1) {
						app.switchTab({
							url: urlLink
						});
					} else {
						app.navTo(urlLink);
					};
				};
			},
			copyShop: function () { //复制开店
				let shopInfo = this.getData().shopInfo;
				app.navTo('../../site/addShop/addShop?copyshopid=' + shopInfo._id);
			},
			callTel: function (e) {
				let tel = app.eData(e).tel;
				if (!tel) return;
				wx.makePhoneCall({
					phoneNumber: tel
				})
			},
			getDateTime: function (date) {
			 	var hours = parseInt((date % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			 	var hours = parseInt((date / (1000 * 60 * 60 * 24)) * 24);
			 	var minutes = parseInt((date % (1000 * 60 * 60)) / (1000 * 60));
			 	var seconds = parseInt((date % (1000 * 60)) / 1000);
			 	hours = hours < 10 ? '0' + hours : hours;
			 	minutes = minutes < 10 ? '0' + minutes : minutes;
			 	seconds = seconds < 10 ? '0' + seconds : seconds;
			 	return [hours, minutes, seconds];
			},
			countDown: function () { //倒计时
			 	var _this = this,
			 		nowTime = (new Date(app.getNowDate(0, true).replace(/-/g, '/'))).getTime(),
			 		data = this.getData().newData;
			 	if (!data.length) return;
			 	if (this.countDownFn) {
			 		clearInterval(this.countDownFn);
			 	};
			 	this.countDownFn = setInterval(function () {
			 		nowTime = nowTime + 1000;
			 		let count = 0;
			 		app.each(data, function (i, item) {
			 			if (item.type == 3 || item.type == 4) {
			 				count++;
			 				if (item.info.endtime * 1000 - nowTime <= 0) {
			 					item.endtimeText = ['00', '00', '00'];
			 					item.info.status = 2;
			 				} else {
			 					item.endtimeText = _this.getDateTime(item.info.endtime * 1000 - nowTime);
			 				};
			 			};
			 		});
			 		if (count == 0) {
			 			clearInterval(_this.countDownFn);
			 		};
			 		_this.setData({
			 			newData: data
			 		});
			 	}, 1000);
			},
			addFoucson: function () { //添加/取消关注
				let _this = this,
					shopInfo = this.getData().shopInfo,
					isUserLogin = this.getData().isUserLogin;
				if (isUserLogin) {
					if (shopInfo.identity != 2) {
						app.request('//vshopapi/addShopFoucson', {
							id: shopInfo._id
						}, function () {
							shopInfo.fansnum = shopInfo.isfocuson == 1 ? shopInfo.fansnum - 1 : shopInfo.fansnum + 1;
							shopInfo.isfocuson = shopInfo.isfocuson == 1 ? 0 : 1;
							_this.setData({
								shopInfo: shopInfo
							});
						});
					} else {
						app.tips('不能关注自己');
					}
				} else {
					app.tips('请先登录');
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
		}
	});

})();