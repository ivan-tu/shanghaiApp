(function () {
	let app = getApp();
	app.Page({
		pageId: 'shop-goodsDetail',
		data: {
			systemId: 'shop',
			moduleId: 'goodsDetail',
			isUserLogin: app.checkUser(),
			client: app.config.client,
			data: {
				name: '',
				sku: [],
				salesLevel: {}
			},
			options: {},
			settings: {},
			language: {},
			form: {
				page: 1,
				size: 10
			},
			pageCount: 0,
			evaluateData: [],
			contentData: [],
			myUserLevel: 0,
			salesSetting: {
				discounts: 0,
				showDiscounts: 0
			}, //分销设置
			realPrice: 0, //实际价格
			discountsPrice: 0, //优惠金额
			realTotalPrice: 0, //优惠后的价格
			cartCount: 0, //购物车商品数量
			selectStatus: false, //是否选择状态
			selectType: '', //选择类型，cart加入购物车，buy立即购买
			selectedIndex: 0, //选中规格
			selectedCount: 1, //选中数量
			shopInfo: {}, //网店信息
			showEvaMore: false, //显示查看更多[评价]
			showEvaLoading: false, //显示加载更多[评价]
			showLoading: true,
			showNoData: false,
			showDialog: false,
			showDialog_animate: false,
			client: app.config.client,
			imgWidth: app.system.windowWidth > 480 ? 480 : app.system.windowWidth,
			imgHeight: app.system.windowWidth > 480 ? 480 : app.system.windowWidth,
			liveid: '', //直播间id
			dynamicid:'',//动态id
			dynamicData:'',
			clienData: {}, //客服数据
			badgeList: [], // 店铺标志列表
			badgeshopListall: [], // 商品标志全部列表
			badgeshopList: [], // 商品标志显示列表
			isshowBadgeAll: false, //显示弹框
			showReport: false, //显示投诉弹框
			showReport_m: false, //显示投诉弹框内容
			reportList: [{
				title: '出售违禁品'
			}, {
				title: '出售假冒商品'
			}, {
				title: '商家资质不符'
			}, {
				title: '商品描述不符'
			}, {
				title: '其他（手动填写）'
			}],
			reportForm: {
				index: 0,
				content: '',
				mobile: ''
			},
			showSelectShopDialog: false,
			maxHeight: app.system.windowHeight - 120,
			myShopList: [], //我的店铺列表
			selectShopData: {
				name: '',
				id: '',
				shortid:'',
				type:1,//店主自购，2分享商品
			}, //当前选择的店铺信息
			agentSpreadRealPrice:'',//项目代理推广赚差价
			agentSpreadPrice:'',//项目代理推广赚差价(保留两位小数的字符串)
			musicData:{src:'',time:'00:00',now:'00:00',progress:0},
			musicStyle:0,//音乐播放器状态0-收起1-展开
			musicLeft:app.system.windowWidth-100,
			musicStatus:0,//0未播放,1-播放中,2-暂停
		},
		methods: {
			onLoad: function (options) {
				console.log(app.toJSON(options));
				//app.config.needBindAccount = 0;
				let _this = this;
				if (app.config.client == 'wx' && options.scene) {
					let scenes = options.scene.split('_');
					options.id = scenes[0];
					if (scenes.length > 1) {
						app.session.set('vcode', scenes[1]);
					};
					if (scenes.length > 2) {
						if(scenes[2].length==8){
							options.shopShortid = scenes[2];
						}else{
							options.liveid = scenes[2];
						};
					};
					if (scenes.length > 3) {
						options.dynamicShortid = scenes[3];
					};
					delete options.scene;
				};
				_this.setData({
					options: options
				});
				if(options.shopShortid){
					app.visitShop(options.shopShortid);
				};
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
				let isUserLogin = app.checkUser(),
					data = this.getData().data;
				if (data && data.isshopmaster == 0) {
					this.load();
				} else if (isUserLogin != this.getData().isUserLogin) {
					this.setData({
						isUserLogin: isUserLogin
					});
					if (isUserLogin) {
						this.load();
					};
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
			toLogin: function () {
				let _this = this;
				app.userLogin({
					success: function () {
						_this.setData({
							isUserLogin: true
						});
						_this.toSupplyDetail();
					}
				});
			},
			// 获取标志详情
			watchBadge: function (e) {
				let id = app.eData(e).id
				this.dialog({
					title: "标志详情",
					url: '../../mobile/detail/detail?id=' + id,
					success: function (res) {}
				});
			},
			// 关闭全部标志底部弹框
			hideBadgeAll: function () {
				this.setData({
					isshowBadgeAll: false
				});
			},
			// 查看全部标志
			selectbadge: function () {
				this.setData({
					isshowBadgeAll: true
				});
			},
			getGoodeDetail: function () {
				let _this = this,
					options = this.getData().options;
				app.request('//vshopapi/getGoodsDetailV3', {
					id: _this.getData().options.id,
					shopShortid:_this.getData().options.shopShortid||'',
				}, function (res) {
					if(res.dynamicData&&res.dynamicData._id){
						_this.setData({
							dynamicid:res.dynamicData._id,
							dynamicData:res.dynamicData,
						});
					};
					if(res.shopShortid&&res.shopShortid!=options.shopShortid) {
						app.visitShop(res.shopShortid);
					};
					_this.getSettings();
					//获取客服
					/*app.request('//shopapi/getShopClienter', {
						shopid: options.shopShortid||res.shopShortid
					}, function (clienData) {
						if (clienData && clienData.length) {
							_this.setData({
								clienData: clienData[0]
							});
						};
					}, function () {
						console.log('获取客服失败')
					});*/
					let imgWidth = _this.getData().imgWidth,
						imgHeight = _this.getData().imgHeight,
						contentImgWidth = imgWidth - 30,
						fPath = app.config.filePath,
						sData = {
							showLoading: false,
							discountsPrice: 0
						};
					if (res.pic) {
						res.musicPic = app.image.crop(res.pic, 60, 60);
						res.pic = app.image.crop(res.pic, imgWidth, imgHeight);
					};
					if (res.pics && res.pics.length) {
						let pics = [];
						app.each(res.pics, function (i, item) {
							pics.push(app.image.crop(item, imgWidth, imgHeight))
						});
						res.pics = pics
					};
					if (res.content) {
						if (typeof res.content == 'object' && res.content.length) {
							app.each(res.content, function (i, item) {
								if (item.type == 'image') {
									item.file = app.image.width(item.src, contentImgWidth)
								} else if (item.type == 'video') {
									item.file = fPath + '' + item.src;
									if (item.poster) {
										item.poster = app.image.width(item.poster, contentImgWidth)
									}
								}
							})
						} else if (typeof res.content == 'string') {
							res.content = [{
								type: 'text',
								content: res.content
							}]
						};
						sData.contentData = res.content;
						_this.setData({
							contentData: res.content
						})
					};
					//初始化详情-音频
					/*let reSetEditorcontent = function(){
						setTimeout(function(){
							if(_this.selectComponent('#editorcontent')){
								_this.selectComponent('#editorcontent').init();
							}else{
								reSetEditorcontent();
							};
						},600);
					};
					reSetEditorcontent();*/
					
					if (!res.salesLevel) {
						res.salesLevel = {}
					};
					//计算优惠价格
					/*if (res.discounts && res.salesLevel.discountsRate) {
						if (res.salesUnit == 1) {
							sData.discountsPrice = Math.round(res.price * res.salesLevel.discountsRate) / 100
						} else {
							sData.discountsPrice = res.salesLevel.discountsRate
						}
					};*/
					//计算分销提成
					/*if (res.salesLevel.royalty1) {
						if (res.salesUnit == 1) {
							res.royalty1Price = Math.round(res.price * res.salesLevel.royalty1) / 100
						} else {
							res.royalty1Price = res.salesLevel.royalty1
						}
					} else {
						res.royalty1Price = 0
					};*/
					//计算票券
					if (res.goodsCategoryType == 2 && res.sku.length) {
						let ticketCounts = 0;
						app.each(res.sku, function (i, item) {
							ticketCounts += Number(item.count);
							item.showContent = false
						});
						res.ticketCounts = ticketCounts;
					};
					//设置规格图片
					if (res.sku.length > 0) {
						app.each(res.sku, function (i, item) {
							if (item.pic) {
								item.pic = app.image.crop(item.pic, 80, 80)
							} else {
								item.pic = app.image.crop(res.pic, 80, 80)
							};
							if (item.realPrice < 0) {
								item.realPrice = item.price;
							};
						})
					};
					if (res.limitCount) {
						res.canbuyCount = res.limitCount - res.buynum;
						if (res.canbuyCount < 0) {
							res.canbuyCount = 0
						}
					} else {
						res.canbuyCount = ''
					};
					sData.data = res;
					_this.setData(sData);
					//如果有音乐文件
					if(res.music){
						_this.setData({'musicData.src':app.config.filePath+''+res.music});
						_this.resetMusic();
						if(app.config.client=='web'){
							//兼容有滚动条的情况下
							setTimeout(function(){
								_this.setData({musicLeft:$('body').width()-100});
							},500);
						};
					};
					//获取优惠金额
					_this.getDiscountsRate();
					//获取分销提成
					//_this.getRoyalty1Price();
					//设置banner
					if (app.config.client != 'wx') {
						let swiperJs = xzSystem.getSystemDist('assets') + 'js/swiper.js',
							swiperCss = xzSystem.getSystemDist('assets') + 'css/swiper.css';
						xzSystem.loadSrcs([swiperJs, swiperCss], function () {
							var mySwiper_banner = new Swiper('#swiperBanner', {
								pagination: '#swiperBanner .pagination',
								paginationClickable: true,
								grabCursor: true,
								resizeReInit: true,
								loop: true,
								slidesPerView: 1,
								calculateHeight: true,
								autoplay: 3000,
								speed: 1000,
								autoplayDisableOnInteraction: false,
							})
						})
					};
					//获取评价
					_this.getEvaluate();
					//设置分享参数
					_this.setShareData(res,false);
				}, function () {
					_this.setData({
						showLoading: false
					})
				})
			},
			setShareData:function(res,isToShare){//设置分享参数
				let _this = this,
					options = this.getData().options,
					newData = app.extend({}, options);
				newData = app.extend(newData, {
					pocode: app.storage.get('pocode'),
					shopShortid:res.shareShopid||options.shopShortid,
				});
				let pathUrl = app.mixURL('/p/shop/goodsDetail/goodsDetail', newData),
					shareData = {
						shareData: {
							title: res.name,
							content: res.abstract || '',
							path: 'https://' + app.config.domain + pathUrl,
							pagePath: pathUrl,
							img: res.pic || '',
							imageUrl: res.pic || '',
							weixinH5Image: res.pic,
							wxid:'gh_4a817d503791',
							hideH5:true,
							hideCopy:app.config.client=='web'?false:true,
						},/*
						loadPicData: {
							ajaxURL: '//vshopapi/getSharePic',
							requestData: {
								type: 'goods',
								url: 'p/shop/goodsDetail/goodsDetail',
								id: res.id,
								shopid: res.shareShopid||options.shopShortid,
							}
						},
						loadCodeData: {
							ajaxURL: '//shopapi/getShareWxpic',
							requestData: {
								type: 'goods',
								shopid: res.shareShopid||options.shopShortid,
								goodsShortid: res.shortid
							}
						}*/
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
			getDiscountsRate: function () { //计算优惠价格
				let res = this.getData().data,
					discountsPrice = 0,
					realTotalPrice = 0,
					agentSpreadPrice = 0,
					agentSpreadRealPrice = 0,//项目中的代理赚差价
					selectedIndex = this.getData().selectedIndex;
				if (res.discounts && res.salesLevel.discountsRate) {
					if (res.salesUnit == 1) { //百分比
						discountsPrice = Math.round(res.sku[selectedIndex].price * res.salesLevel.discountsRate) / 100;
					} else { //固定金额
						discountsPrice = res.salesLevel.discountsRate
					};
				};
				realTotalPrice = app.getPrice(res.sku[selectedIndex].realPrice - discountsPrice);
				if(res.projectid&&res.agentPrice>0){
					agentSpreadRealPrice = Number(res.sku[selectedIndex].realPrice) - Number(res.sku[selectedIndex].agentPrice);
					agentSpreadPrice = app.getPrice(agentSpreadRealPrice);
				};
				this.setData({
					discountsPrice: discountsPrice,
					realTotalPrice: realTotalPrice,
					agentSpreadRealPrice:agentSpreadRealPrice,
					agentSpreadPrice:agentSpreadPrice,
				});
			},
			getRoyalty1Price: function () { //计算分销提成
				let res = this.getData().data,
					selectedIndex = this.getData().selectedIndex;
				if (res.salesLevel.royalty1) {
					if (res.salesUnit == 1) {
						res.royalty1Price = Math.round(res.sku[selectedIndex].price * res.salesLevel.royalty1) / 100;
					} else {
						res.royalty1Price = res.salesLevel.royalty1
					};
				} else {
					res.royalty1Price = 0
				};
				this.setData({
					data: res
				});
			},
			// 查看标志详情
			watchBadge: function (e) {
				let id = app.eData(e).id
				this.dialog({
					title: "标志详情",
					url: '../../mobile/detail/detail?id=' + id,
					success: function (res) {}
				});
			},
			getSettings: function () { //获取配置
				let _this = this;
				if (_this.getData().isUserLogin) {//获取购物车数量
					app.request('//vorderapi/getCartNum', function (res1) {
						_this.setData({
							cartCount: res1
						})
					});
				};
				app.request('//vshopapi/getShopBasicinfo', function (req) {
					req.cover = req.cover || req.logo;
					if (req.logo) {
						req.logo = app.image.crop(req.logo, 80, 80)

					};
					if (req.cover) {
						req.cover = app.image.width(req.cover, _this.getData().imgWidth)
					};
					_this.setData({
						shopInfo: req
					})
				},function(msg){
					app.navTo('../../home/index/index');
				});
			},
			//查看自提点
			viewPickUpList: function () {
				let data = this.getData().data;
				this.dialog({
					title: '查看自提点',
					url: '../../shop/pickUpList/pickUpList?supplyShopid=' + data.supplyShopid,
					success: function () {}
				});
			},
			//查看票券使用规则
			showContent: function (e) {
				let index = app.eData(e).index,
					data = this.getData().data;
				data.sku[index].showContent = !data.sku[index].showContent;
				this.setData({
					'data.sku': data.sku
				})
			},
			//加入购物车
			addCart: function () {
				let _this = this,
					data = _this.getData().data;
				app.checkUser({
					goLogin: false,
					success: function () {
						if (data.sku.length == 1) {
							_this.addToCart()
						} else {
							_this.selectSku('cart')
						}
					},
					fail: function () {
						_this.goLogin();
					}
				});
			},
			//立即购买
			buy: function () {
				let _this = this,
					data = this.getData().data;
				if (data.sku.length == 1) {
					_this.toBuy();
				} else {
					_this.selectSku('buy');
				};
			},
			//店主自购
			selfBuy: function () {
				this.setData({'selectShopData.type':1});
				this.getAllShop();
			},
			//获取店铺
			getAllShop:function(){
				let _this = this,
					data = this.getData().data,
					options = this.getData().options,
					selectShopData = this.getData().selectShopData,
					myShopList = this.getData().myShopList,
					ajaxURL = '//shopapi/getUserAllShop',
					requestData = {};
				if(selectShopData.type==2){
					ajaxURL = '//shopapi/getShareShops';
					requestData = {goodsid:data.id};
				};
				app.request(ajaxURL, requestData, function (res) {
					console.log(app.toJSON(res));
					if (res && res.length) {
						_this.setData({
							'selectShopData.id': res[0]['_id'],
							'selectShopData.name': res[0]['name'],
							'selectShopData.shortid': res[0]['shortid'],
							myShopList: res
						});
						if (res.length > 1) {
							_this.setData({
								showSelectShopDialog: true
							});
						} else {
							if(selectShopData.type==2){
								//分享
								data.shareShopid = res[0].shortid;
								_this.setShareData(data,true);
							}else{
								_this.buy();
							};
						};
					};
				});
			},
			//选择店铺
			selectThisShop: function (e) {
				let myShopList = this.getData().myShopList,
					data = this.getData().data,
					selectShopData = this.getData().selectShopData,
					index = Number(app.eData(e).index);
				this.setData({
					'selectShopData.name': myShopList[index].name,
					'selectShopData.id': myShopList[index]._id,
					'selectShopData.shortid': myShopList[index].shortid
				});
				this.cancelSlectShopDialog();
				if(selectShopData.type==2){
					data.shareShopid = myShopList[index].shortid;
					this.setShareData(data,true);
				}else{
					this.buy();
				};
			},
			//关闭店铺弹框
			cancelSlectShopDialog: function () {
				this.setData({
					showSelectShopDialog: false
				});
			},
			//确定店铺弹框
			confirmSlectShopDialog: function () {
				let data = this.getData().data,
					selectShopData = this.getData().selectShopData;
				this.cancelSlectShopDialog();
				if(selectShopData.type==2){
					data.shareShopid = selectShopData.shortid;
					this.setShareData(data,true);
				}else{
					this.buy();
				};
			},
			//加入到购物车
			addToCart: function () {
				let _this = this,
					data = _this.getData().data,
					id = data.id,
					count = _this.getData().selectedCount,
					index = _this.getData().selectedIndex,
					sku = data.sku[index];
				app.checkUser(function () {
					app.request('//vorderapi/addInCart', {
						goodsid: id,
						format: sku.name,
						quantity: count,
					}, function (res) {
						app.tips('已加入购物车');
						_this.setData({
							cartCount: res.num
						});
						if (data.limitCount) {
							_this.setData({
								'data.canbuyCount': data.canbuyCount - count
							})
						};
					});
					if (_this.getData().showDialog) {
						_this.setData({
							showDialog: false,
							showDialog_animate: false
						})
					}
				})
			},
			//立即购买
			toBuy: function () {
				let _this = this,
					data = _this.getData().data,
					id = (data.selfbuyprice > 0 && data.oldgoodsid) ? data.oldgoodsid : data.id,
					count = _this.getData().selectedCount,
					index = _this.getData().selectedIndex,
					sku = data.sku[index],
					selectShopData = this.getData().selectShopData;
				app.storage.set('checkoutData', [{
					goodsid: id,
					format: sku.name,
					quantity: count,
					weight: sku.weight || '',
					shopid: data.selfbuyprice > 0 ? selectShopData.id : '',
				}]);
				app.navTo('../../shop/checkout/checkout');
			},
			//选择规格
			selectSku: function (type) {
				let _this = this,
					data = _this.getData().data,
					index = _this.getData().selectedIndex;
				if (data.sku[index].stock < 1) {
					app.each(data.sku, function (i, item) {
						if (item.stock > 0) {
							index = i;
							return false
						}
					})
				};
				if (type != "cart" && type != 'buy') {
					type = ''
				};
				_this.setData({
					'selectType': type,
					selectedCount: 1,
					showDialog: true,
					showDialog_animate: true,
					selectedIndex: index
				});
			},
			//关闭选择
			closeSelect: function () {
				let _this = this;
				_this.setData({
					selectedCount: 1,
					showDialog: false,
					showDialog_animate: false
				})
			},
			//选中规格
			onSelected: function (e) {
				let _this = this,
					index = app.eData(e).index,
					stock = app.eData(e).stock;
				if (stock > 0) {
					_this.setData({
						selectedIndex: index,
						selectedCount: 1
					});
					//获取优惠金额
					_this.getDiscountsRate();
					//获取分销提成
					//_this.getRoyalty1Price();
				} else {
					app.tips('已售罄')
				};
			},
			addCount: function () {
				let _this = this,
					count = _this.getData().selectedCount,
					selectedIndex = _this.getData().selectedIndex,
					data = _this.getData().data,
					sku = data.sku[selectedIndex];
				if (count < sku.stock) {
					count++;
					if (data.limitCount && count > data.canbuyCount) {
						app.tips('最多可买' + data.canbuyCount + '件')
					} else {
						_this.setData({
							selectedCount: count
						})
					}
				} else {
					app.tips('数量不能超过库存')
				}
			},
			minusCount: function () {
				let _this = this,
					count = _this.getData().selectedCount,
					selectedIndex = _this.getData().selectedIndex,
					sku = _this.getData().data.sku[selectedIndex];
				if (count > 1) {
					count--;
					_this.setData({
						selectedCount: count
					})
				} else {
					app.tips('数量最少为1');
				}
			},
			inputCount: function (e) {
				let _this = this,
					value = Number(app.eValue(e)),
					selectedIndex = _this.getData().selectedIndex,
					data = _this.getData().data,
					sku = data.sku[selectedIndex];
				if (value > sku.stock) {
					app.tips('最多还可买' + sku.stock + '件');
					value = sku.stock
				} else if (value < 1) {
					value = 1
				} else if (data.limitCount) {
					if (value > data.canbuyCount) {
						value = data.canbuyCount;
						app.tips('最多还可买' + data.canbuyCount + '件')
					}
				};
				console.log(value);
				setTimeout(function () {
					_this.setData({
						selectedCount: value
					})
				}, 100)
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
			getEvaluate: function (loadMore) {
				let _this = this,
					picWidth = ((app.system.windowWidth > 480 ? 480 : app.system.windowWidth) - 38) / 3,
					data = _this.getData().data,
					formData = _this.getData().form,
					pageCount = _this.getData().pageCount;
				formData.goodsid = data.id;
				_this.setData({
					'showEvaLoading': true
				});
				if (loadMore) {
					if (formData.page >= pageCount) {
						_this.setData({
							showEvaMore: false
						})
					}
				} else {
					_this.setData({
						'showEvaMore': true
					})
				};
				app.request('//vshopapi/getGoodsComment', formData, function (backData) {
					if (!backData.data) {
						backData.data = []
					};
					if (!loadMore) {
						if (backData.count) {
							pageCount = Math.ceil(backData.count / formData.size);
							_this.setData({
								pageCount: pageCount
							});
							if (pageCount == 1) {
								_this.setData({
									'showEvaMore': false
								})
							}
						} else {}
					};
					let list = backData.data;
					if (list && list.length) {
						app.each(list, function (i, item) {
							if (item.headpic) {
								item.headpic = app.image.crop(item.headpic, 40, 40)
							};
							if (item.pics && item.pics.length) {
								let newPic = [];
								app.each(item.pics, function (l, g) {
									newPic.push({
										key: g,
										file: app.image.crop(g, picWidth, picWidth),
									})
								});
								item.pics = newPic
							} else {
								item.pics = []
							}
						})
					};
					if (loadMore) {
						list = _this.getData().evaluateData.concat(backData.data)
					};
					_this.setData({
						evaluateData: list
					})
				}, '', function () {
					_this.setData({
						'showEvaLoading': false
					})
				})
			},
			loadMoreEva: function () {
				let _this = this,
					form = this.getData().form;
				form.page++;
				this.setData({
					form: form
				});
				this.getEvaluate(true)
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
				let data = this.getData().data;
				if(data.isshopmaster==1){
					this.setData({'selectShopData.type':2});
					this.getAllShop();
				}else{
					this.selectComponent('#newShareCon').openShare();
				};
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
				console.log(app.toJSON(shareData));
				return shareData;
			},
			toCartPage: function () {
				/*app.switchTab({
					url: '../../shop/cart/cart'
				});*/
				app.navTo('../../shop/cart/cart');
			},
			gotoShopIndex:function(){
				let data = this.getData().data;
				if(data.shopShortid){
					app.visitShop(data.shopShortid);
				};
				app.navTo('../../shop/index/index');
			},
			callTel: function (e) {
				let tel = app.eData(e).tel;
				if (!tel) return;
				wx.makePhoneCall({
					phoneNumber: tel
				})
			},
			toShowReport: function () {
				let _this = this;
				app.checkUser({
					goLogin: false,
					success: function () {
						app.request('//userapi/info', {}, function (res) {
							if (res.account) {
								_this.setData({
									'reportForm.mobile': res.account
								});
							};
						});
						_this.setData({
							showReport: true
						});
						setTimeout(function () {
							_this.setData({
								showReport_m: true
							});
						}, 300);
					},
					fail: function () {
						_this.goLogin();
					}
				});
			},
			closeReport: function () {
				let _this = this;
				this.setData({
					showReport_m: false
				});
				setTimeout(function () {
					_this.setData({
						showReport: false
					});
				}, 300);
			},
			submitReport: function () {
				let _this = this,
					data = this.getData().data,
					reportList = this.getData().reportList,
					reportForm = this.getData().reportForm;
				if (reportForm.index == reportList.length - 1 && !reportForm.content) {
					app.tips('请输入投诉内容');
				} else if (!reportForm.content) {
					app.tips('请选择投诉类型');
				} else if (!reportForm.mobile) {
					app.tips('请输入联系方式');
				} else {
					app.request('//vshopapi/addGoodsComplaint', {
						goodsid: data.id,
						content: reportForm.content,
						mobile: reportForm.mobile
					}, function () {
						app.tips('投诉提交成功');
						_this.closeReport();
					});
				};
			},
			selectReport: function (e) {
				let index = Number(app.eData(e).index),
					reportList = this.getData().reportList;
				reportList[index].active = 1;
				if (index == reportList.length - 1) {
					this.setData({
						reportList: reportList,
						'reportForm.index': index,
						'reportForm.content': ''
					});
				} else {
					this.setData({
						reportList: reportList,
						'reportForm.index': index,
						'reportForm.content': reportList[index].title
					});
				};
			},
			backIndex: function () {
				/*app.switchTab({
					url: '../../home/index/index'
				});*/
				app.navTo('../../shop/index/index');
			},
			resetMusic:function(autoplay){	
				let _this = this,
					musicData = this.getData().musicData,
					myAudio;
				if(app.config.client=='wx'){
					myAudio = wx.createInnerAudioContext();
					myAudio.src = musicData.src;
					_this.myAudio = myAudio;
					//播放位置发生改变
					myAudio.onTimeUpdate(function(){
						let duration = Number(myAudio.duration),
							currentTime = Number(myAudio.currentTime);
						let duration_minutes = parseInt(duration / 60);
						if (duration_minutes < 10) {
							duration_minutes = "0" + duration_minutes;
						};
						let duration_seconds = parseInt(duration % 60);
						duration_seconds = Math.round(duration_seconds);
						if (duration_seconds < 10) {
							duration_seconds = "0" + duration_seconds;
						};
						_this.setData({'musicData.time':duration_minutes+':'+duration_seconds});
						
						let seconds = parseInt(currentTime);
						let minutes = parseInt(seconds / 60);
						if (minutes < 10) {
							minutes = "0" + minutes;
						};
						seconds = parseInt(seconds % 60);
						if (seconds < 10) {
							seconds = "0" + seconds;
						};
						_this.setData({
							'musicData.now':minutes+':'+seconds,
							'musicData.progress':!Number(currentTime)?0:parseInt(Number(currentTime) / Number(duration)*100),
						});
					});
					//播放结束
					myAudio.onEnded(function(){
						_this.setData({
							'musicData.now':'00:00',
							'musicData.progress':0,
							musicStatus:0,
						});
						myAudio.destroy();
						_this.myAudio = null;
						_this.resetMusic(true);
					});
					//准备就绪
					myAudio.onCanplay(function(){
						if(autoplay){
							_this.setData({
								musicStatus:1
							});
							myAudio.play();
						};
					});
				}else{
					myAudio = new Audio();
					myAudio.src = musicData.src;
					myAudio.loop = true;
					myAudio.load();
					_this.myAudio = myAudio;
					//播放准备就绪
					myAudio.addEventListener('canplaythrough',function(){
						var minutes = parseInt(myAudio.duration / 60);
						if (minutes < 10) {
							minutes = "0" + minutes;
						};
						var seconds = parseInt(myAudio.duration % 60);
						seconds = Math.round(seconds);
						if (seconds < 10) {
							seconds = "0" + seconds;
						};
						_this.setData({'musicData.time':minutes+':'+seconds});
					});
					//播放位置发生改变
					myAudio.addEventListener('timeupdate',function(){
						let seconds = parseInt(myAudio.currentTime);
						let minutes = parseInt(seconds / 60);
						if (minutes < 10) {
							minutes = "0" + minutes;
						};
						seconds = parseInt(seconds % 60);
						if (seconds < 10) {
							seconds = "0" + seconds;
						};
						_this.setData({
							'musicData.now':minutes+':'+seconds,
							'musicData.progress':!Number(myAudio.currentTime)?0:parseInt(Number(myAudio.currentTime) / Number(myAudio.duration)*100),
						});
					});
					//播放结束
					myAudio.addEventListener('ended',function(){
						_this.setData({
							'musicData.now':'00:00',
							'musicData.progress':0,
							musicStatus:0,
						});
					});
				};
			},
			changeMusicStyle:function(){
				this.setData({
					musicStyle:this.getData().musicStyle==1?0:1
				});
				if(!this.getData().musicStatus&&this.getData().musicStyle==1){
					this.changeMusicStatus();
				};
			},
			changeMusicStatus:function(){//播放-暂停
				let myAudio = this.myAudio,
					audioPlaying;
				if(this.getData().musicStatus==0){
					this.setData({
						musicStatus:1,
					});
				}else{
					this.setData({
						musicStatus:this.getData().musicStatus==1?2:1,
					});
				};
				if(this.getData().musicStatus==2){
					myAudio.pause();
				}else{
					if(app.config.client=='wx'){
						myAudio.play();
					}else{
						audioPlaying = setInterval(function() {
							myAudio.play();
							if(myAudio.readyState==4){
								clearInterval(audioPlaying);
							};
						},20);
					};
				};
			},
			//复制内容
			copyThis:function(e){
				let client = app.config.client,
					content = app.eData(e).content;
				if (client == 'wx') {
				  wx.setClipboardData({
					data:content,
					success: function () {
					  app.tips('复制成功', 'error');
					},
				  });
				} else if (client == 'app') {
				  wx.app.call('copyLink', {
					data: {
					  url:content
					},
					success: function (res) {
					  app.tips('复制成功', 'error');
					}
				  });
				} else {
				  $('body').append('<input class="readonlyInput" value="'+content+'" id="readonlyInput" readonly />');
				  var originInput = document.querySelector('#readonlyInput');
				  originInput.select();
				  if(document.execCommand('copy')) {
					  document.execCommand('copy');
					  app.tips('复制成功','error');
				  }else{
					  app.tips('浏览器不支持，请手动复制','error');
				  };
				  originInput.remove();
				};
			},
		}
	})
})();