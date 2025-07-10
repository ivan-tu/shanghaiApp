/**
 *模块组件构造器
 */
(function () {

	let app = getApp();

	app.Page({
		pageId: 'activity-ticketMy',
		data: {
			systemId: 'activity',
			moduleId: 'ticketMy',
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
				activityid: '',
				gettype: 'my', //my,mysend
			},
			isUserLogin: app.checkUser(),
			client: app.config.client,
			showLoading: false,
			showNoData: false,
			count: 0,
			pageCount: 0,
		},
		methods: {
			onLoad: function (options) {
				let _this = this;
				this.setData({
					options: options,
					'form.activityid': options.id || '',
				});
			},
			onShow: function () {
				let _this = this;
				app.checkUser(function () {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
			onPullDownRefresh: function () {
				if (this.getData().isUserLogin) {
					this.load();
				};
				wx.stopPullDownRefresh();
			},
			load: function () {
				this.getList();
			},
			toMyDetail:function(e){
				let options = this.getData().options,
					index = Number(app.eData(e).index),
					data = this.getData().data,
					status = data[index].status;
				if(status!=0&&status!=2){//不是退票，不是未使用
					app.navTo('../../activity/ticketMyCode/ticketMyCode?id=' + options.id);
				};
			},
			toAdd: function () {
				let options = this.getData().options;
				if(options.clubid){
					app.navTo('../../activity/ticketBuy/ticketBuy?id='+ options.id+'&clubid='+options.clubid);
				}else{
					app.navTo('../../activity/ticketBuy/ticketBuy?id='+ options.id);
				};
			},
			screenStatus: function (e) {
				this.setData({
					'form.page': 1,
					'form.gettype': app.eData(e).type
				});
				this.getList();
			},
			toSetMyself: function (e) { //设为自用
				let _this = this,
					data = this.getData().data,
					index = Number(app.eData(e).index),
					id = data[index]._id;
				app.confirm('确定设为自用吗？', function () {
					app.request('//activityapi/useTicket', {
						ticketid: id
					}, function () {
						_this.getList();
					});
				});
			},
			toRefund: function (e) { //退票
				let _this = this,
					data = this.getData().data,
					index = Number(app.eData(e).index),
					id = data[index]._id,
					options = this.getData().options;
				if(options.id=='631180836427cb3471762205'){
					app.tips('无法退票', 'error');
				}else{
					app.confirm('确定退票吗？', function () {
						app.request('//activityapi/cancelTicket', {
							id: id
						}, function () {
							app.tips('退票成功', 'success');
							_this.load();
						});
					});
				};
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
				};
				app.request('//activityapi/getTicketList', formData, function (backData) {
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
							if (item.activity) {
								item.activity.sharePic = app.image.width(item.activity.pic,180);
								item.activity.pic = app.image.crop(item.activity.pic, 88, 88);
								if (item.activity.bDate) {
									item.activity.activityTime = item.activity.bDate + ' ' + item.activity.bTime;
									if (item.activity.eDate) {
										if ((item.activity.eDate.split('-'))[0] == (item.activity.bDate.split('-'))[0]) {
											item.activity.activityTime += ' 至 ' + (item.activity.eDate.split('-'))[1] + '-' + (item.activity.eDate.split('-'))[2] + ' ' + (item.activity.eTime || '');
										} else {
											item.activity.activityTime += ' 至 ' + (item.activity.eDate.split('-'))[0] + '-' + (item.activity.eDate.split('-'))[1] + '-' + (item.activity.eDate.split('-'))[2] + ' ' + (item.activity.eTime || '');
										};
									};
								};
								if (item.activity.area && item.activity.area.length) {
									item.activity.realAddress = item.activity.area;
									if(item.activity.realAddress[0] == item.activity.realAddress[1]){
										item.activity.realAddress = item.activity.realAddress[0] + '' + item.activity.realAddress[2];
									}else{
										item.activity.realAddress = item.activity.realAddress[0] + '' + item.activity.realAddress[1] + '' + item.activity.realAddress[2];
									};
								};
								if (item.activity.address) {
									item.activity.realAddress += ' | ' + item.activity.address;
								};
								if (item.activity.addressName) {
									item.activity.realAddress += ' | ' + item.activity.addressName;
								};
							};
							if (item.reviceuser && item.reviceuser.headpic) {
								item.reviceuser.headpic = app.image.crop(item.reviceuser.headpic, 60, 60);
							};
							if (item.senduser && item.senduser.headpic) {
								item.senduser.headpic = app.image.crop(item.senduser.headpic, 60, 60);
							};
						});
					};
					if (loadMore) {
						list = _this.getData().data.concat(backData.data);
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
			toShare: function (e) {
				let _this = this,
					data = this.getData().data,
					index = Number(app.eData(e).index),
					id = data[index]._id,
					activityInfo = data[index].activity,
					newData = {
						pocode: app.storage.get('pocode'),
						id: id
					},
					shareImg = activityInfo.sharePic,
					pathUrl = app.mixURL('/p/activity/ticketReceive/ticketReceive', newData),
					shareData = {
						shareData: {
							title: '送您一张' + activityInfo.name + '门票',
							content: '点击前往领取',
							path: 'https://' + app.config.domain + pathUrl,
							pagePath: pathUrl,
							img: shareImg,
							imageUrl: shareImg,
							weixinH5Image: shareImg,
							showMini: false,
							showQQ: false,
							showWeibo: false
						}
					},
					reSetData = function () {
						setTimeout(function () {
							if (_this.selectComponent('#newShareCon')) {
								_this.selectComponent('#newShareCon').reSetData(shareData);
								_this.selectComponent('#newShareCon').openShare();
							} else {
								reSetData();
							}
						}, 500)
					};
				reSetData();
				app.request('//activityapi/sendTicket', {
					id: id
				}, function () {});
			},
			onShareAppMessage: function () {
				return app.shareData;
			},
		}
	});
})();