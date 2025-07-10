/**
 *模块组件构造器
 */
(function() {

	let app = getApp();

	app.Page({
		pageId: 'shop-orderList',
		data: {
			systemId: 'shop',
			moduleId: 'orderList',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {
				bottomLoad:true,
				noMore:false,
			},
			language: {},
			form: {
				page: 1,
				size: 10,
				status:'',//1-6 待付款 待发货 待收货 已完成 已退款 已过退款期
				afterstatus:'',//退款状态 0/未申请，1/申请中，2/同意退款，3/拒绝退款，4/退款完成
			},
			showLoading: false,
			showNoData: false,
			pageCount: 0,
			count: 0,
			picWidth:((app.system.windowWidth>480?480:app.system.windowWidth)-55)/4
		},
		methods: {
			onLoad: function(options){
				this.setData({
					form:app.extend(this.getData().form,options)
				});
			},
			onShow: function() {
				let _this = this;
				app.checkUser(function(){
					_this.setData({
					   isUserLogin: true
					});
					_this.load();
				});
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
				let _this = this;
				_this.getList();
			},
			screenStatus: function(e) {
				this.setData({
					'form.page': 1,
					'form.status': app.eData(e).status,
					'form.afterstatus':'',
					'settings.bottomLoad': true
				});
				this.getList();
			},
			getList: function(loadMore) {
				let _this = this, 
					picWidth = this.getData().picWidth,
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
					if(_this.getData().data.length&&formData.page>1){
						_this.defaultSize = formData.size;
						_this.defaultPage = formData.page;
						formData.size = formData.page * formData.size;
						formData.page = 1;
					};
				};
				app.request('//shopapi/getClientOrderList', formData, function(backData) {
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
						app.each(list, function(i, item) {
							if (item.goodslist&&item.goodslist.length){
								app.each(item.goodslist,function(l,g){
									g.pic = app.image.crop(g.pic, 100,100);
								});
								if(item.status>1&&item.status<4){
									if(item.afterstatus==1){
										item.afterstatusName='已申请退款';
									}else if(item.afterstatus==2){
										item.afterstatusName='通过退款申请';
									}else if(item.afterstatus==3){
										item.afterstatusName='拒绝退款申请';
									};
								};
							};
							if(item.shopdata&&item.shopdata.logo){
								item.shopdata.logo = app.image.crop(item.shopdata.logo, 24,24);
							};
							if(!item.shopdata){
								item.shopdata = {};
							};
						});
					};
					if (loadMore) {
						list = _this.getData().data.concat(backData.data);
					}else{
						if(_this.defaultSize){
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
				}, '', function() {
					_this.setData({
						'showLoading': false
					});
				});
			},
			changeKeyword: function(e) {
					//document.activeElement.blur();
					let keyword = e.detail.keyword;
					this.setData({ 'form.keyword': e.detail.keyword, 'form.page': 1 });
					this.getList();
			},
			closeKeyword: function(e) {
					let keyword = e.detail.keyword;
					this.setData({ 'form.keyword': '', 'form.page': 1 });
					this.getList();
			},
			loadMore: function() {
				let _this = this, form = this.getData().form;
				form.page++;
				this.setData({
					form: form
				});
				this.getList(true);
			},
			onReachBottom: function() {
				if (this.getData().settings.bottomLoad) {
					this.loadMore();
				};
			},
			//取消未付款订单
			delOrder: function(e) {
				let _this = this, 
					id = app.eData(e).id;
				app.confirm('确定要取消吗？', function() {
					app.request('//vorderapi/cancelOrder', {
						orderid:id
					}, function(){
						app.tips('取消成功','success');
						_this.setData({ 'form.page': 1 });
						_this.getList();
					});
				});
			},
			//取消未发货订单
			cancelOrder: function(e) {
				let _this = this, 
					id = app.eData(e).id;
				app.confirm('确定要取消吗？', function() {
					app.request('//vorderapi/rebackOrder', {
						orderid:id
					}, function(){
						app.tips('取消成功','success');
						_this.setData({ 'form.page': 1 });
						_this.getList();
					});
				});
			},
			//支付订单
			payOrder: function(e) {
				app.request('//vorderapi/createGoodsPayOrder',{ordernums:app.eData(e).ordernum},function(res){
					if(res.ordernum){
						if(app.config.client=='web'){
							window.location.href=(res.payurl);	
						}else{
							app.navTo('../../pay/pay/pay?ordernum=' + res.ordernum + '&ordertype='+res.ordertype);
						};
					};
				});
			},
			//查看物流
			viewLogistics:function(e){
				let _this = this,
					id = app.eData(e).id;
				app.navTo('../../shop/orderLogistics/orderLogistics?id='+id);
			},
			//确认收货
			reveiveOrder:function(e){
				let _this = this,
					id = app.eData(e).id;
				app.confirm('收货后不能再退款，确定要收货吗？',function(){
					app.request('//vorderapi/confirmOrder',{orderid:id},function(){
						app.tips('收货成功','success');
						_this.setData({ 'form.page': 1 });
						_this.getList();
					});
				});
			},
			//申请退款
			refundOrder:function(e){
				let _this = this,
					id = app.eData(e).id;
				app.navTo('../../shop/orderRefund/orderRefund?id='+id);
			},
			//去评价
			toEvaluate:function(e){
				let _this = this,
					id = app.eData(e).id;
				app.navTo('../../shop/orderEvaluate/orderEvaluate?id='+id);
			},
			//去店铺首页
			toStoreIndex:function(e){
				if(app.eData(e).shopid){
					app.visitShop(app.eData(e).shopid);
					//app.switchTab({url:'../../shop/index/index'});
					app.navTo('../../shop/index/index');
				};
			}
		}
	});
})();