(function() {

	let app = getApp();

	app.Page({
		pageId: 'shop-myTicket',
		data: {
			systemId: 'shop',
			moduleId: 'myTicket',
			isUserLogin: app.checkUser(),
			data: [],
			options: {
				size: 20,
				page: 1,
				status:'',
				orderid:'',
				type:'my',//send
			},
			settings: {
				bottomLoad: true,
				noMore: false
			},
			language: {},
			form: {},
			showLoading:false,
			showNoData:false,
			count:0,
			pageCount:1
		},
		methods: {
			onLoad: function(options) {
				if(options.status){
					this.setData({
						'options.status':options.status
					});
				};
				if(options.orderid){
					this.setData({
						'options.orderid':options.orderid
					});
				};
				if(options.shopid){
					app.visitShop(options.shopid);
				};
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
				this.setData({
					'options.page': 1
				});
				if (this.getData().isUserLogin) {
					this.load();
				};
				wx.stopPullDownRefresh();
			},
			load: function() {
				this.getList();
			},
			screenStatus:function(e){
				if(app.eData(e).status=='send'){
					this.setData({
						'options.type':'send',
						'options.status':'',
						'options.page':1
					});
				}else{
					this.setData({
						'options.type':'my',
						'options.status':app.eData(e).status,
						'options.page':1
					});
				};
				this.getList();
			},
			toBuy:function(e){
				app.navTo('../../shop/goodsDetail/goodsDetail?id='+app.eData(e).goodsid);
			},
			toUse:function(e){
				app.navTo('../../shop/myTicketDetail/myTicketDetail?id='+app.eData(e).id);
			},
			getList: function(loadMore) {
				var _this = this,
					options = _this.getData().options,
					pageCount = _this.getData().pageCount;

				if (loadMore) {
					if (options.page >= pageCount) {
						_this.setData({
							'settings.bottomLoad': false,
							'settings.noMore': true
						});
					}
				} else {
					_this.setData({
						'settings.bottomLoad': true,
						'settings.noMore': false
					});
				};
				_this.setData({
					'showLoading': true
				});
				app.request('//vorderapi/getClientTickets', options, function(res){
					console.log(app.toJSON(res));
					if(!loadMore) {
						if (res.count) {
							pageCount = Math.ceil(res.count / options.size);
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
					let list = res.data;
					if(list&&list.length){
						app.each(list,function(i,item){
							if(item.pic){
								item.pic = app.image.crop(item.pic,80,80);
							};
							if (item.shopdata&&item.shopdata.logo){
								item.shopdata.logo = app.image.crop(item.shopdata.logo, 24,24);
							};
							item.codeUrl = app.getQrCodeImg('https://'+app.config.domain+'/p/manage/ticketDetail/ticketDetail?id='+item.id);
						});
					};
					if (loadMore) {
						list = _this.getData().data.concat(list);
					};
					_this.setData({
						data:list,
						count:res.count
					});
				}, '', function() {
					_this.setData({
						'showLoading':false
					});
				});
			},
			loadMore: function() {
				var _this = this,
					options = this.getData().options,
					pageCount = this.getData().pageCount;

				if (pageCount > options.page) {
					options.page++;
					this.setData({
						options: options
					});
					this.getList(true);
				};
			},
			onReachBottom: function() {
				if (this.getData().settings.bottomLoad) {
					this.loadMore();
				};
			},
			//去店铺首页
			toStoreIndex:function(e){
				if(app.eData(e).shopid){
					app.visitShop(app.eData(e).shopid);
					app.switchTab({url:'../../shop/index/index'});
				};
			},
			toShareThis:function(e){
				let _this = this,
					index = Number(app.eData(e).index),
					data = this.getData().data,
					itemData = data[index],
					shareData = {},
					newData = {
						id: itemData.id,
						pocode: app.storage.get('pocode')
					},
					pathUrl = app.mixURL('/p/shop/receiveTicketDetail/receiveTicketDetail', newData),
					reSetData = function () {
						setTimeout(function () {
							if (_this.selectComponent('#newShareCon')) {
								_this.selectComponent('#newShareCon').reSetData(shareData);
								_this.selectComponent('#newShareCon').openShare();
							} else {
								reSetData();
							};
						}, 500)
					};
				shareData = {
					shareData: {
						title: '您的好友赠送您一张'+itemData.ticketname,
						content: '有效期至'+itemData.expiretime,
						path: 'https://' + app.config.domain + pathUrl,
						pagePath: pathUrl,
						img: app.config.filePath+''+itemData.pic,
						imageUrl: app.config.filePath+''+itemData.pic,
						weixinH5Image: app.config.filePath+''+itemData.pic,
						wxid: 'gh_26794a7a3c16',
						showMini: true,
						showQQ: false,
						showWeibo: false,
						hideCopy: app.config.client=='wx'?true:false,
						hideH5: true,
						hideMoments: true
					},
				};
				reSetData();
			},
			onShareAppMessage: function(){
				return app.shareData;
			},
		}
	});
})();