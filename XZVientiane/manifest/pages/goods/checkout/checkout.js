(function() {
	let app = getApp();
	app.Page({
		pageId: 'goods-checkout',
		data: {
			systemId: 'goods',
			moduleId: 'checkout',
			isUserLogin: app.checkUser(),
			data: {},
			options: {},
			settings: {},
			language: {},
			form: {
				id:'',
				addressId:'',
				quantity:1,
			},
			address: '',
			showLoading: false,
			showNoData: false,
			client:app.config.client,
			orderInfo:{},
			showBind:false,//是否显示绑定
			vcode:'',
			totalPrice:'0.00',//总价
		},
		methods: {
			onLoad: function(options) {
				this.setData({
					options: options
				});
			},
			onShow: function() {
				let _this = this;
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load()
				});
			},
			onPullDownRefresh: function() {
				if (this.getData().isUserLogin) {
					this.load()
				};
				wx.stopPullDownRefresh()
			},
			load: function() {
				let _this = this,
					isLoaded = this.getData().isLoaded,
					checkoutOrdernum = app.storage.get('checkoutOrdernum'),
					options = this.getData().options;
				if(checkoutOrdernum){
					app.request('//homeapi/getClientOrderDetail',{ordernum:checkoutOrdernum},function(res){
						app.storage.remove('checkoutOrdernum');
						_this.setData({
							'data.name':'',
							orderInfo:res
						});
					});
				}else if(options.id){
					this.setData({showLoading:true});
					app.request('//homeapi/getGoodsDetail', {id: options.id}, function (res) {
						if(res.pic){
							res.pic = app.image.crop(res.pic,60,60);
						};
						_this.setData({
							data:res,
							isLoaded:false,
						});
						_this.resetPrice();
						if(!isLoaded){
							_this.getAddress();
						};
					},'',function(){
						_this.setData({showLoading:false});
					});
				};
			},
			addCount: function(e) {
				let formData = this.getData().form;
				formData.quantity++;	
				this.setData({form:formData});
				this.resetPrice();
			},
			minusCount: function(e) {
				let formData = this.getData().form;
				formData.quantity--;	
				formData.quantity = formData.quantity<1?1:formData.quantity;
				this.setData({form:formData});
				this.resetPrice();
			},
			inputCount: function(e) {
				let formData = this.getData().form,
					value = Number(app.eValue(e));
				if(value < 1){
					value = 1;
				}else{
					formData.quantity = value;
				};
				this.setData({form:formData});
				this.resetPrice();
			},
			resetPrice: function() {
				let formData = this.getData().form,
					data = this.getData().data
					totalPrice = 0;//实际金额
				totalPrice = app.getPrice(Number(data.price)*Number(formData.quantity));
				this.setData({
					totalPrice:totalPrice
				});
			},
			backIndex:function(){
				if(app.config.client=='web'){
					app.navTo('../../home/index/index');
				}else{
					app.switchTab({
						url:'../../home/index/index'
					});
				};
			},
			//获取收货地址
			getAddress: function() {
				let _this = this;
				app.request('//userapi/getUserAddress', {
					justdefault: 1
				}, function(res) {
					if(res.data.length) {
						_this.setAddress(res.data[0])
					};
					if(res.isbind==1){
						_this.setData({showBind:false});
					}else{
						_this.setData({
							showBind:true,
							vcode:'',
						});
					};
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
				}
			},
			submit: function(e) {
				let _this = this,
					data = this.getData().data, 
					options = this.getData().options,
					address = this.getData().address,
					formData = this.getData().form,
					mobile = this.getData().mobile,
					isMobileOrder = this.getData().isMobileOrder,
					requestData = {
						id:options.id,
						quantity:formData.quantity,
						ispickup:formData.ispickup,
					},
					showBind = this.getData().showBind,
					vcode = this.getData().vcode,
					msg = '';
				if(_this.submitStatus==1){
					return;
				};
				if(!address){
					msg = '请添加收货地址';
				}else{
					requestData.addressId = address.id;
				};
				if(!Number(requestData.quantity)){
					msg = '请选择数量';
				};
				if(msg){
					app.tips(msg,'error');
				}else{
					if(!_this.submitStatus){
						_this.submitStatus = 1;
						console.log(app.toJSON(requestData));
						app.request('//homeapi/addOrder', requestData, function(res) {
							if (res.ordernum) {
								app.storage.set('checkoutOrdernum', res.ordernum);
								app.request('//homeapi/createPayOrder', {ordernum: res.ordernum}, function(req) {
									if (req.ordernum) {
										app.navTo('../../pay/pay/pay?ordernum='+req.ordernum+'&ordertype='+req.ordertype);
									};
								});
							};
						}, function(msg) {
							app.tips(msg);
							_this.load();
						},function(){
							setTimeout(function(){
								_this.submitStatus = 0;
							},500);
						});
					};
				};
			},
			payOrder:function(){
				let _this = this,
					data = this.getData().orderInfo;
				app.request('//homeapi/createPayOrder',{ordernum:data.ordernum},function(req){
					if(req.ordernum){
						app.navTo('../../pay/pay/pay?ordernum='+req.ordernum+'&ordertype='+req.ordertype);
					};
				});
			},
			toPage:function(e){
				app.navTo(app.eData(e).page);
			},
		}
	})
})();