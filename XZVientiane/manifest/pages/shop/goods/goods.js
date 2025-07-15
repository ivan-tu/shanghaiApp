/**
 *模块组件构造器
 */
(function () {

	let app = getApp();

	app.Page({
		pageId: 'shop-goods',
		data: {
			systemId: 'shop',
			moduleId: 'goods',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {
				bottomLoad: true,
				noMore: false,
			},
			language: {},
			form: {
				page: 1,
				size: 10,
				status: '1',
				goodsCategoryId: '', //自定义分类
				sort: 'top',
				keyword: '',
				goodsTypeid: '', //系统分类id
			},
			client: app.config.client,
			showLoading: false,
			showNoData: false,
			pageCount: 0,
			count: 0,
			categoryData: [],
			visitShopShortId: '',
			showDialog: false,
			showDialog_animate: false,
			selectedIndex: 0,
			selectedCount: 1,
			detailData: {
				sku: []
			}, //详情数据
			showType: 'top',
			goodsPicWidth:((app.system.windowWidth>480?480:app.system.windowWidth)-30)/2,
			goodsPicHeight:((app.system.windowWidth>480?480:app.system.windowWidth)-30)/2,
		},
		methods: {
			onLoad: function (options) {
				let _this = this,
					opts = {};
				if (options.goodsTypeid) {
					opts.goodsTypeid = options.goodsTypeid;
				};
				if (options.sort) {
					opts.sort = options.sort;
					if(options.sort=='salecount'){
						this.setData({showType:'salecount'});
					};
				};
				if (options.tags || options.tag) {//商品标签
					opts.tags = options.tags || options.tag;
				};
				if (options.keyword) {//关键词
					opts.keyword = options.keyword;
				};
				if (options.pointTag) {//筛选标签
					opts.pointTag = options.pointTag;
				};
				if (options.shopid) {//指定店铺
					opts.shopid = options.shopid;
				};
				_this.setData({
					form: app.extend(_this.getData().form, opts)
				});
				app.checkUser({
					goLogin: false,
					success: function () {
						_this.setData({
							isUserLogin: true
						});
					}
				});
				
				//设置分享参数
				let newData = app.extend({}, options);
				newData = app.extend(newData, {
					pocode: app.storage.get('pocode')
				});
				let pathUrl = app.mixURL('/p/shop/goods/goods', newData), 
					sharePic = 'https://statics.tuiya.cc/17173202189832506.jpg',
					shareData = {
						shareData: {
							title: '购物上各店，积分能变现',  
							content: '会员即股东，消费即收益，Web3新商城，越买越有钱',
							path: 'https://' + app.config.domain + pathUrl,
							pagePath: pathUrl,
							img: sharePic,
							imageUrl: sharePic,
							weixinH5Image: sharePic,
							wxid: 'gh_4a817d503791',
							hideH5:true,
							hideCopy:app.config.client=='web'?false:true,
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
				_this.load();
			},
			onShow: function () {
				//检查用户登录状态
				let isUserLogin = app.checkUser();
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
				if (this.getData().isUserLogin) {
					this.load();
				};
				wx.stopPullDownRefresh();
			},
			load: function () {
				/*let _this=this,
					attrs=[{title:'全部',id:''}];
					  app.request('//vshopapi/getShopGoodsCategory',function(res){
						  attrs=attrs.concat(res);
						  _this.setData({categoryData:attrs});
					  });*/
				this.getList();
			},
			screenType: function (e) {
				this.setData({
					'form.page': 1,
					'form.goodsCategoryId': app.eData(e).id,
					'settings.bottomLoad': true
				});
				this.getList();
			},
			changeKeyword: function (e) {
				//document.activeElement.blur();
				let keyword = e.detail.keyword;
				this.setData({
					'form.keyword': e.detail.keyword,
					'form.page': 1
				});
				this.getList();
			},
			closeKeyword: function (e) {
				let keyword = e.detail.keyword;
				this.setData({
					'form.keyword': '',
					'form.page': 1
				});
				this.getList();
			},
			getList: function (loadMore) {
				let _this = this,
					formData = _this.getData().form,
					pageCount = _this.getData().pageCount;
				_this.setData({
					'showLoading': true
				});
				if (loadMore) {
					if (formData.page >= pageCount) {
						_this.setData({
							'settings.bottomLoad': false,
							'settings.noMore': true
						});
					};
				} else {
					_this.setData({
						'settings.bottomLoad': true,
						'settings.noMore': false
					});
					if (_this.getData().data.length && formData.page > 1) {
						_this.defaultSize = formData.size;
						_this.defaultPage = formData.page;
						formData.size = formData.page * formData.size;
						formData.page = 1;
					};
				};
				app.request('//homeapi/getShopGoodsList', formData, function (backData) {
					if (!backData.data) {
						backData.data = [];
					};
					if (!loadMore) {
						if (backData.count) {
							pageCount = Math.ceil(backData.count / formData.size);
							_this.setData({
								pageCount: pageCount
							});
							if (pageCount == 1) {
								_this.setData({
									'settings.bottomLoad': false
								});
							};
							_this.setData({
								'showNoData': false
							});
						} else {
							_this.setData({
								'showNoData': true
							});
						};
					};
					let list = backData.data;
					if (list && list.length) {
						app.each(list, function (i, item) {
							item.id = item.id || item._id;
							if (item.pic) {
								item.pic = app.image.crop(item.pic, _this.getData().goodsPicWidth, _this.getData().goodsPicHeight);
							};
						});
					};
					if (loadMore) {
						list = _this.getData().data.concat(backData.data);
					} else {
						if (_this.defaultSize) {
							formData.page = _this.defaultPage;
							formData.size = _this.defaultSize;
							_this.defaultPage = null;
							_this.defaultSize = null;
						};
					};
					_this.setData({
						data: list,
						count: backData.count || 0
					});
				}, '', function () {
					_this.setData({
						'showLoading': false
					});
				});
			},

			loadMore: function () {
				let _this = this,
					form = this.getData().form;
				form.page++;
				this.setData({
					form: form
				});
				this.getList(true);
			},
			onReachBottom: function () {
				if (this.getData().settings.bottomLoad) {
					this.loadMore();
				};
			},
			//跳转详情
			toDetail: function (e) {
				app.navTo('../../shop/goodsDetail/goodsDetail?id=' + app.eData(e).id);
			},
			toBuy: function (e) {
				if (app.config.client != 'wx') {
					e.preventDefault();
				};
				let _this = this,
					type = Number(app.eData(e).type), //1-加入购物车2-购买
					isLogin = app.checkUser();
				if (isLogin) {
					//获取商品详情
					app.request('//vshopapi/getGoodsDetail', {
						id: app.eData(e).id
					}, function (res) {
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
							res.canbuyCount = '';
						};
						res.buyType = type;
						_this.setData({
							detailData: res
						});
						_this.setData({
							selectedCount: 1,
							showDialog: true,
							selectedIndex: 0
						});
						setTimeout(function () {
							_this.setData({
								showDialog_animate: true
							});
						}, 100);
					});
				} else {
					app.confirm({
						title: '您还未登录',
						confirmText: '立即登录',
						success: function (res) {
							if (res.confirm) {
								app.userLogin();
							};
						}
					})
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
			submit: function () {
				let _this = this,
					data = _this.getData().detailData,
					id = data.id,
					count = _this.getData().selectedCount,
					index = _this.getData().selectedIndex,
					sku = data.sku[index];
				if (data.buyType == 1) { //添加到购物车
					app.request('//vorderapi/addInCart', {
						goodsid: id,
						format: sku.name,
						quantity: count
					}, function (res) {
						app.tips('已加入购物车');
						_this.setData({
							cartCount: res.num
						});
						if (data.limitCount) {
							_this.setData({
								'detailData.canbuyCount': data.canbuyCount - count
							})
						};
					});
					if (_this.getData().showDialog) {
						_this.setData({
							showDialog_animate: false
						});
						setTimeout(function () {
							_this.setData({
								showDialog: false
							});
						}, 100);
					};
				} else if (data.buyType == 2) { //立即购买
					app.storage.set('checkoutData', [{
						goodsid: id,
						format: sku.name,
						quantity: count,
						cycleid: app.session.get('visitCycleid') || '',
					}]);
					if (_this.getData().showDialog) {
						_this.setData({
							showDialog_animate: false
						});
						setTimeout(function () {
							_this.setData({
								showDialog: false
							});
						}, 100);
					};
					setTimeout(function () {
						app.navTo('../../shop/checkout/checkout');
					}, 500);
				};
			},
			closeSelect: function () {
				this.setData({
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
				} else {
					app.tips('已售罄')
				};
			},
			addCount: function () {
				let _this = this,
					count = _this.getData().selectedCount,
					selectedIndex = _this.getData().selectedIndex,
					data = _this.getData().detailData,
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
					data = _this.getData().detailData,
					sku = data.sku[selectedIndex];
				if (count > 1) {
					count--;
					_this.setData({
						selectedCount: count
					})
				} else {
					app.tips('数量最少为1')
				}
			},
			inputCount: function (e) {
				let _this = this,
					value = Number(app.eValue(e)),
					selectedIndex = _this.getData().selectedIndex,
					data = _this.getData().detailData,
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
			toSearch: function () {
				this.setData({
					'form.page': 1
				});
				this.getList();
			},
			closeSearch: function () {
				this.setData({
					'form.page': 1,
					'form.keyword': ''
				});
				this.getList();
			},
			selectCateogry: function () {
				let _this = this,
					formData = this.getData().form;
				this.dialog({
					title: '选择分类',
					url: '../../manage/selectCategory/selectCategory?hasAll=1&id=' + formData.goodsTypeid,
					success: function (res) {
						console.log(app.toJSON(res));
						if (res.sId) {
							_this.setData({
								'form.goodsTypeid': res.sId
							});
							if(res.sTitle){
								setTimeout(function(){
									app.setPageTitle(res.sTitle);
								},400);
							};
						} else if (res.pId) {
							_this.setData({
								'form.goodsTypeid': res.pId
							});
							if(res.pTitle){
								setTimeout(function(){
									app.setPageTitle(res.pTitle);
								},400);
							};
						} else {
							_this.setData({
								'form.goodsTypeid': ''
							});
							setTimeout(function(){
								app.setPageTitle('商品');
							},400);
						};
						_this.getList();
					}
				});
			},
			setType: function (e) {
				let formData = this.getData().form,
					type = app.eData(e).type;
				if (type == 'price') {
					if (formData.sort == 'priceasc') {
						formData.sort = 'pricedesc';
					} else {
						formData.sort = 'priceasc';
					};
				} else {
					formData.sort = type;
				};
				formData.page = 1;
				this.setData({
					showType: app.eData(e).type,
					form: formData
				});
				this.getList();
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