/**
 *模块组件构造器
 */
(function() {

	let app = getApp();

	app.Page({
		pageId: 'goods-orderList',
		data: {
			systemId: 'goods',
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
			picWidth:((app.system.windowWidth>480?480:app.system.windowWidth)-55)/4,
		},
		methods: {
			onLoad: function(options){
				let _this = this;
				this.setData({
					form:app.extend(this.getData().form,options)
				});
				app.checkUser(function(){
					_this.setData({
					   isUserLogin: true
					});
					_this.load();
				});
			},
			onShow: function(){
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
				app.request('//homeapi/getClientOrderList', formData, function(backData) {
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
							if(item.goodsinfo&&item.goodsinfo.pic){
								item.goodsinfo.pic = app.image.crop(item.goodsinfo.pic, 100,100);
							};
							if(item.status==2&&item.applyRefund==1){
								item.statusName = '申请退款中';
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
			//支付订单
			payOrder: function(e) {
				app.request('//homeapi/createPayOrder',{ordernum:app.eData(e).ordernum},function(req){
					if(req.ordernum){
						app.navTo('../../pay/pay/pay?ordernum='+req.ordernum+'&ordertype='+req.ordertype);
					};
				});
			},
			//确认收货
			reveiveOrder:function(e){
				let _this = this,
					id = app.eData(e).id;
				app.confirm('确定要收货吗？',function(){
					app.request('//homeapi/confirmOrder',{orderid:id},function(){
						app.tips('收货成功','success');
						_this.setData({ 'form.page': 1 });
						_this.getList();
					});
				});
			},
		}
	});
})();