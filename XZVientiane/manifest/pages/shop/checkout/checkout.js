(function() {
	let app = getApp();
	app.Page({
		pageId: 'shop-checkout',
		data: {
			systemId: 'shop',
			moduleId: 'checkout',
			isUserLogin: app.checkUser(),
			data: {
				realTotalPrice: 0,
				freight: 0,//按单运费
				freight1: 0,//按件运费
				nodelivery:'',//是否有不在配送范围内的商品，是的话为一个数组['商品A']
				freightData:[],//获取运费的时候返回的商品数组，用来计算最后的运费价格
				data: []
			},
			options: {},
			settings: {},
			language: {},
			form: {
			},
			deliveryAddressIndex:0,//默认自提地址是第一个A']
			address: '',
			showLoading: false,
			showNoData: false,
			orderInfo:{ordernum:''},
			goodsList:'',
			client:app.config.client,
			showAllTakeAddress:false,
			isLoaded:false,//是否第一次加载
			freightList:[],
			orderList:[],
			total:0,//总价格
			goodsTotalPrice:0,//总商品价格
			freightTotal:0,//总运费
			materialGoods:false,//是否有实物类商品
			nodelivery:[],//不在配送范围的商品名称
		},
		methods: {
			onLoad: function(options) {
				//app.config.needBindAccount = 0;
				let _this = this;
				_this.setData({
					options: options
				});
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
			onShow: function() {
				let isUserLogin = app.checkUser();
				if(isUserLogin != this.getData().isUserLogin){
					this.setData({
						isUserLogin: isUserLogin
					});
				};
				if(isUserLogin && this.getData().isLoaded){
					this.load();
				};
			},
			onPullDownRefresh: function() {
				if(this.getData().isUserLogin){
					this.load();
				};
				wx.stopPullDownRefresh();
			},
			load: function() {
				let _this = this;
				_this.setData({
					orderList:[],
					total:0,
				});
				_this.getList();
			},
			backIndex:function(){
				//app.switchTab({url:'../../home/index/index'});
				//app.navTo('../../shop/index/index');
				app.navBack();
			},
			getList: function(loadMore) {
				let _this = this,
					isLoaded = this.getData().isLoaded,
					checkoutData = app.storage.get('checkoutData'), 
					checkoutOrdernum = app.storage.get('checkoutOrdernum');
				_this.setData({
					showLoading: true
				});
				if (checkoutData && checkoutData.length) {
					console.log('getCheckOut');
					app.request('//vorderapi/getCheckOut', checkoutData, function(res){
						_this.loaded = true;
						if (res.data && res.data.length) {
							let allData = [];
							app.each(res.data, function(i, item) {
								if(item.data&&item.data.length){
									let newData = [];
									if(item.shopdata){
										item.shopdata.logo=app.image.crop(item.shopdata.logo,40,40);
									};
									app.each(item.data,function(l,g){
										if (g.limitCount) {
											g.canbuyCount = g.limitCount - g.buynum;
											if (g.canbuyCount < 0) {
												g.canbuyCount = 0
											};
										} else {
											g.canbuyCount = '';
										};
										if(g.canBuy&&g.hasstock){
											g.pic = g.pic?app.image.crop(g.pic, 80, 80):'';
											if(g.goodsCategoryType==1){
												_this.setData({materialGoods:true});
											};
											newData.push(g);
										};
									});
									item.message = '';
									item.data = newData;
								};
								allData.push(item);
							});
							_this.setData({
								orderList:allData,
								total:res.totalprice,
								goodsTotalPrice:res.goodsTotalPrice,
								freightList:res.freightList
							});
							if(_this.getData().materialGoods){
								if(!isLoaded){//第一次加载才获取地址
									_this.getAddress();
								}else{
									_this.getFreight();
								};
							};
						};
						_this.setData({
							showLoading: false,
							isLoaded:true
						});
					}, function(msg) {
						app.tips(msg, 'error');
						_this.setData({
							showLoading: false
						});
					})
				} else {
					if (checkoutOrdernum) {
						app.request('//vorderapi/getClientOrderDetail', {ordernum: checkoutOrdernum}, function(res) {
							console.log(app.toJSON(res));
							if (res.id) {
								_this.setData({orderInfo: res});
							};
							_this.setData({showLoading: false});
						});
					} else {
						_this.setData({showLoading: false});
					};
					_this.setData({isLoaded: true});
					//_this.getGoods();
				}
			},
			//获取运费
			getFreight:function(){
				let _this = this, 
					orderList = this.getData().orderList,
					freightList = this.getData().freightList,
					goodsTotalPrice = this.getData().goodsTotalPrice,
					address = this.getData().address,
					checkoutData = app.storage.get('checkoutData');
				if(checkoutData&&address&&address.area){
					let requestData = {province:address.area[0],data:checkoutData,realTotalPrice:goodsTotalPrice,freightList:freightList};
					app.request('//vorderapi/getOrderFreight',requestData,function(backData){
						if(backData.list&&backData.list.length){
							app.each(backData.list,function(i,item){
								orderList[i].freightTotal = item.freightTotal;
							});
						};
						_this.setData({
							total:backData.totalPrice,
							orderList:orderList,
							nodelivery:backData.nodelivery
						});
					},function(){
					});
				};	
			},
			//选择配送类型
			selectDeliveryType:function(e){
				let form = this.getData().form,
					data = this.getData().data,
					deliveryAddressIndex = this.getData().deliveryAddressIndex;
				form.deliveryType = Number(app.eData(e).type);
				if(form.deliveryType==2){
					form.deliveryAddress = data.takeaddress[deliveryAddressIndex];
				}else{
					form.deliveryAddress = {};
				};
				this.setData({
					form:form
				});
			},
			//选择自提地址
			selectTakeAddress:function(e){
				let index = Number(app.eData(e).index),
					data = this.getData().data;
				this.setData({
					'form.deliveryAddress':data.takeaddress[index],
					deliveryAddressIndex:index
				});
			},
			//获取收货地址
			getAddress: function() {
				let _this = this;
				app.request('/user/userapi/getUserAddress', {
					justdefault: 1
				}, function(res) {
					if (res.data.length) {
						_this.setAddress(res.data[0])
					}
				})
			},
			//选择收货地址
			selectAddress: function() {
				let _this = this;
				_this.dialog({
					title: '选择收货地址',
					url: '../../user/address/address?select=1',
					success: function(res) {
						if (res.data) {
							_this.setAddress(res.data)
						};
					}
				});
			},
			//添加收货地址
			addAddress: function() {
				let _this = this;
				_this.dialog({
					title: '添加收货地址',
					url: '../../user/addAddress/addAddress?order=1',
					success: function(res) {
						if (res.data && res.data._id) {
							_this.setAddress(res.data)
						}
					}
				})
			},
			//设置收货地址
			setAddress: function(res) {
				let _this = this;
				if (res._id) {
					let detail = res.address;
					if (res.area && res.area.length) {
						if (res.area[2]) {
							detail = res.area[2] + detail
						};
						if (res.area[1] != res.area[0]) {
							detail = res.area[1] + detail
						};
						detail = res.area[0] + detail
					};
					res.detail = detail;
					res.id = res._id;
					_this.setData({
						address: res
					});
					_this.getFreight();
				}
			},
			setMessage: function(e) {
				let _this = this, 
					orderList = this.getData().orderList,
					index = Number(app.eData(e).index),
					form = _this.getData().form, 
					inputData = app.eData(e);
				inputData.value = orderList[index].message, 
				inputData.type = 'textarea';
				app.storage.set('textInputData', inputData);
				_this.dialog({
					url: '../../home/textInput/textInput',
					title: inputData.title || '编辑留言',
					success: function(res) {
						app.storage.remove('textInputData');
						if (res) {
							orderList[index].message = res.value;
							_this.setData({
								orderList:orderList
							})
						}
					}
				})
			},
			submit: function(e) {
				let _this = this, 
					checkoutData = app.storage.get('checkoutData'), 
					address = _this.getData().address, 
					orderList = _this.getData().orderList, 
					materialGoods = _this.getData().materialGoods,
					nodelivery = _this.getData().nodelivery,
					formData = _this.getData().form, 
					ids = [];
				if(_this.submitStatus==1){
					return;
				};
				
				if (materialGoods && !address) {
					app.tips('请添加收货地址');
					return;
				};
				if (address) {
					formData.addressId = address.id;
					formData.province = address.area[0];
				};
				let sData = [],
					message = [];
				app.each(orderList, function(i, item) {
					message.push(item.message);
					app.each(item.data, function(l, g) {
						sData.push({
							goodsid: g.goodsid,
							format: g.format,
							quantity: g.quantity,
						});
					});
				});
				if (materialGoods && nodelivery&&nodelivery.length) {
					app.confirm(nodelivery.join('、')+' 不在配送区域内');
					return;
				};
				formData.data = sData;
				formData.message = message;
				if (_this.getData().options.cart) {
					app.each(checkoutData, function(i, item) {
						if (item.cartId) {
							ids.push(item.cartId)
						}
					});
					formData.cartIds = ids
				};
				if(!_this.submitStatus){
					_this.submitStatus = 1;
					console.log(app.toJSON(formData));
					app.request('//vorderapi/addShopOrderV3', formData, function(res) {
						if (res.ordernums) {
							if(res.total==0){
								app.navTo('../../shop/orderList/orderList');
								return;
							};
							////vorderapi/createListPayOrder多单
							app.storage.set('checkoutOrdernum', res.ordernums);
							app.storage.remove('checkoutData');
							if(res.total==0){
								app.navTo('../../shop/orderDetail/orderDetail?id='+res.id);
								return;
							};
							app.request('//vorderapi/createGoodsPayOrder', {
								ordernums: res.ordernums
							}, function(req) {
								if (req.ordernum) {
									if (app.config.client == 'web') {
										window.location.href = (req.payurl)
									} else {
										app.navTo('../../pay/pay/pay?ordernum=' + req.ordernum + '&ordertype='+res.ordertype)
									}
								}
							})
						};
					}, function(msg) {
						app.tips(msg);
						_this.load()
					},function(){
						setTimeout(function(){
							_this.submitStatus = 0;
						},500);
					});
				};
			},
			getGoods: function() {
				let _this = this, picWidth = (app.system.windowWidth - 40) / 2, formData = {
					page: 1,
					size: 4,
					sort: 'top',
					commend: 1
				};
				app.request('//vshopapi/getShopGoodsList', formData, function(backData) {
					if (!backData.data) {
						backData.data = []
					};
					if (backData.data && backData.data.length) {
						app.each(backData.data, function(i, item) {
							if (item.pic) {
								item.pic = app.image.crop(item.pic, picWidth, picWidth)
							}
						})
					};
					_this.setData({
						goodsList: backData.data
					})
				})
			},
			toShowAllTakeAddress:function(){
				this.setData({showAllTakeAddress:true});
			}
		}
	})
})();