/**
 *模块组件构造器
 */
(function () {

	let app = getApp();

	app.Page({
		pageId: 'manage-orderList',
		data: {
			systemId: 'manage',
			moduleId: 'orderList',
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
				keyword: '',
				searchtype: '',
				startTime: '',
				endTime: '',
				filterType: '',
				status: '', //1-待付款2-待发货3-待收货4-已完成5-已退款6-已过售后期
				afterstatus: '', //afterstatus 售后状态 0/未申请，1/申请中，2/同意退款，3/拒绝退款，4/退款完成
			},
			showLoading: false,
			showNoData: false,
			pageCount: 0,
			count: 0,
			myAuthority: app.storage.get('myAuthority'),
			picWidth: ((app.system.windowWidth > 480 ? 480 : app.system.windowWidth) - 55) / 4,
			smallPicWidth: ((app.system.windowWidth > 480 ? 480 : app.system.windowWidth) - 55 - 30) / 4,
			showEdit: false,
			showDeilvery: false,
			editForm: {
				orderid: '',
				type: 'low',
				total: ''
			},
			deilveryForm: {
				orderid: '',
				deliverynum: ''
			},
			checkAll: false, //全选模式
			checkArray: [],
			timeScreen: [{
				name: '全部',
				value: ''
			}, {
				name: '今天',
				value: 'today'
			}, {
				name: '昨天',
				value: 'yesterday'
			}, {
				name: '本周',
				value: 'week'
			}, {
				name: '本月',
				value: 'month'
			}],
			startTime: app.getNowDate(-1),
			endTime: app.getNowDate(),
			showDate: false,
		},
		methods: {
			onLoad: function (options) {
				let _this = this;
				this.setData({
					form:app.extend(this.getData().form,options),
					myAuthority: app.storage.get('myAuthority')
				});
				if (!this.getData().myAuthority) {
					app.navTo('../../manage/index/index');
				};
				/*
				if(app.config.client=='web'&&app.storage.get('defaultFormData_order')){
					this.setData({
						form:app.extend(_this.getData().form,app.storage.get('defaultFormData_order'))
					});
					app.storage.remove('defaultFormData_order');
				};*/
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
				this.setData({
					'form.page': 1
				});
				if (this.getData().isUserLogin) {
					this.load();
				};
				wx.stopPullDownRefresh();
			},
			load: function () {
				let _this = this;
				if (_this.getData().myAuthority.order) {
					_this.getList();
				};
			},
			screen: function (e) {
				let _this = this,
					eData = {};
				if (app.eData(e).type == 'filterType') {
					eData['startTime'] = '';
					eData['endTime'] = '';
					this.setData({
						showDate: false
					});
				};
				eData[app.eData(e).type] = app.eData(e).value;
				let formData = app.extend(_this.getData().form, eData);
				_this.setData({
					form: formData
				});
				_this.getList();
			},
			bindStartTime: function (e) {
				this.setData({
					'form.startTime': e.detail.value,
					startTime: e.detail.value,
				});
			},
			bindEndTime: function (e) {
				this.setData({
					'form.endTime': e.detail.value,
					endTime: e.detail.value,
				});
			},
			screenTime: function () {
				this.setData({
					'form.filterType': '',
					showDate: true
				});
			},
			confirmTime: function () {
				let _this = this,
					formData = _this.getData().form,
					begindate = formData.startTime ? Date.parse(new Date(formData.startTime)) : '',
					enddate = formData.endTime ? Date.parse(new Date(formData.endTime)) : '';
				if (begindate && enddate && begindate > enddate) {
					app.tips('结束时间不能小于起始时间', 'error');
					_this.setData({
						'form.endTime': ''
					});
				} else {
					_this.getList();
				};
			},
			screenStatus: function (e) {
				this.setData({
					'form.page': 1,
					'form.status': app.eData(e).status,
					'form.afterstatus': '',
					'settings.bottomLoad': true
				});
				this.getList();
			},
			//打开批量操作
			toCheckAll: function () {
				this.setData({
					checkAll: !this.getData().checkAll
				});
			},
			//取消批量操作
			toCancelAll: function () {
				let data = this.getData().data;
				app.each(data, function (i, item) {
					item.checked = false;
				});
				this.setData({
					data: data,
					checkAll: false,
					checkArray: []
				});
			},
			//点击单项
			clickThis: function (e) {
				let _this = this,
					checkAll = this.getData().checkAll,
					checkArray = this.getData().checkArray,
					data = this.getData().data,
					index = Number(app.eData(e).index),
					id = app.eData(e).id;
				if (checkAll) {
					if (data[index].checked) {
						data[index].checked = false;
						checkArray.splice(app.inArray(id, checkArray), 1);
					} else {
						data[index].checked = true;
						checkArray.push(id);
					};
					this.setData({
						data: data,
						checkArray: checkArray
					});
				} else {
					if (app.config.client == "web") {
						window.open('../../manage/orderDetail/orderDetail?id=' + id, '_blank')
					} else {
						app.navTo('../../manage/orderDetail/orderDetail?id=' + id);
					}
				};
			},
			exportThis: function (e) {//选择性导出
				let checkArray = this.getData().checkArray,
					formData = this.getData().form,
					_this = this;
				if (checkArray.length) {
					app.confirm('确定要导出所选订单吗？', function () {
						formData.ids = checkArray.join(',');
						_this.exportOrder(formData);
					});
				}else {
					app.tips('请选择订单');
				};
			},
			exportAll: function () {//导出全部
				let checkArray = this.getData().checkArray,
					formData = this.getData().form,
					_this = this;
				app.confirm('确定导出当前所有订单吗？', function () {
					_this.exportOrder(formData);
				});
			},
			exportOrder: function (formData) {
				let _this = this,
					client = app.config.client;
				formData.download = 1;
				formData.shopid = app.session.get('manageShopId');
				//各利商城，推个第三方自营店铺，推个商城
				if(formData.shopid=='61d9716fd6ac8e76dc4085f9'||formData.shopid=='6229ce25401c31177b1deaf9'||formData.shopid=='5f9974d2fbb9353c394fa0bd'){
					let ajaxURL = app.mixURL('https://'+app.config.domain+'/export/exportTuigeOrder',formData);
					if(app.config.client=='web'){
						window.open(ajaxURL);
					}else{
						let confirmText = '确定';
						if (client == 'wx' || client == 'app') {
							confirmText = '复制地址';
						};
						app.confirm({
							content: '导出地址是：' + ajaxURL,
							confirmText: confirmText,
							success: function (res) {
								if (res.confirm) {
									if (client == 'wx') {
										wx.setClipboardData({
											data: ajaxURL,
											success: function () {
												app.tips('复制成功', 'success');
											},
										});
									} else if (client == 'app') {
										wx.app.call('copyLink', {
											data: {
												url: ajaxURL
											},
											success: function (res) {
												app.tips('复制成功', 'success');
											}
										});
									};
								};
							}
						});
					};
				}else{
					app.request('//export/exportOrder', formData, function (backData) {
						let confirmText = '确定';
						if (client == 'wx' || client == 'app') {
							confirmText = '复制地址';
						};
						app.confirm({
							content: '导出地址是：' + backData,
							confirmText: confirmText,
							success: function (res) {
								if (res.confirm) {
									if (client == 'wx') {
										wx.setClipboardData({
											data: backData,
											success: function () {
												app.tips('复制成功', 'success');
											},
										});
									} else if (client == 'app') {
										wx.app.call('copyLink', {
											data: {
												url: backData
											},
											success: function (res) {
												app.tips('复制成功', 'success');
											}
										});
									};
								};
							}
						});
					});
				};
			},
			screenSearchType: function () {
				let _this = this;
				app.actionSheet(['订单编号', '收货人手机号', '收货人姓名', '付款人手机号','商品名称','楼号'], function (res) {
					switch (res) {
						case 0:
							_this.setData({
								'form.searchtype': ''
							});
							break;
						case 1:
							_this.setData({
								'form.searchtype': 'addressmobile'
							});
							break;
						case 2:
							_this.setData({
								'form.searchtype': 'addressname'
							});
							break;
						case 3:
							_this.setData({
								'form.searchtype': 'usermobile'
							});
							break;
						case 4:
							_this.setData({
								'form.searchtype': 'goodsname'
							});
							break;
						case 5:
							_this.setData({
								'form.searchtype': 'floorno'
							});
							break;
					};
					if (_this.getData().form.keyword) {
						_this.setData({
							'form.page': 1
						});
						_this.getList();
					};
				});

			},
			getList: function (loadMore) {
				let _this = this,
					isPhone = /^0?1[2|3|4|5|6|7|8|9][0-9]\d{8}$/,
					checkArray = this.getData().checkArray,
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
					if (_this.getData().data.length && formData.page > 1) {
						_this.defaultSize = formData.size;
						_this.defaultPage = formData.page;
						formData.size = formData.page * formData.size;
						formData.page = 1;
					};
				};
				/*if(app.config.client=='web'){
					app.storage.set('defaultFormData_order',formData);
				};*/
				app.request('//shopapi/getShopOrderList', formData, function (backData) {
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
							if (item.headpic) {
								item.headpic = app.image.crop(item.headpic, 30, 30);
							};
							if (item.goodslist && item.goodslist.length) {
								app.each(item.goodslist, function (l, g) {
									g.pic = app.image.crop(g.pic, 100, 100);
								});

								if (item.status > 1 && item.status < 4) {
									if (item.afterstatus == 1) {
										item.afterstatusName = '已申请退款';
									} else if (item.afterstatus == 2) {
										item.afterstatusName = '通过退款申请';
									} else if (item.afterstatus == 3) {
										item.afterstatusName = '拒绝退款申请';
									};
								};
							};
							if (app.inArray(item.id, checkArray) >= 0) {
								item.checked = 1;
							} else {
								item.checked = 0;
							};
						});
					};
					if (loadMore) {
						list = _this.getData().data.concat(list);
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
			//取消订单
			cancelOrder: function (e) {
				let _this = this,
					id = app.eData(e).id;
				app.confirm('确定要取消吗？', function () {
					app.request('//shopapi/cancelOrder', {
						orderid: id
					}, function () {
						app.tips('取消成功', 'success');
						_this.getList();
					});
				});
			},
			//隐藏弹框
			toHideEdit: function (e) {
				this.setData({
					showEdit: false
				});
			},
			//显示弹框
			toShowEdit: function (e) {
				this.setData({
					showEdit: true,
					'editForm.orderid': app.eData(e).id,
					'editForm.total': '',
					'editForm.type': 'low'
				});
			},
			//提交修改
			toConfirmEdit: function (e) {
				let editForm = this.getData().editForm,
					isPrice = re = /^[0-9]+.?[0-9]*$/,
					_this = this;
				if (!editForm.type) {
					app.tips('请选择类型', 'error');
				} else if (!editForm.total || !isPrice.test(editForm.total)) {
					app.tips('请输入正确的金额', 'error');
				} else {
					app.request('//shopapi/updateShopOrderPrice', editForm, function () {
						app.tips('修改成功', 'success');
						_this.load();
					}, '', function () {
						_this.toHideEdit();
					});
				};
			},
			editType: function (e) {
				this.setData({
					'editForm.type': app.eData(e).type
				});
			},
			toHideDeilvery: function () {
				this.setData({
					showDeilvery: false
				});
			},
			toShowDeilvery: function (e) {
				let _this = this,
					index = Number(app.eData(e).index),
					data = this.getData().data,
					id = app.eData(e).id,
					address = data[index].address;
				/*this.setData({
					showDeilvery: true,
					'deilveryForm.orderid':id,
					'deilveryForm.deliverynum':''
				});*/
				app.storage.set("addressObj", {
					name: address.name,
					mobile: address.mobile,
					address: address.area[0] + ' ' + address.area[1] + ' ' + address.area[2]+' '+address.address
				});
				app.navTo('../../manage/deliverGoods/deliverGoods?id=' +id);
			},
			toConfirmDeilvery: function () {
				let deilveryForm = this.getData().deilveryForm,
					_this = this;
				app.request('//shopapi/deliveryShopOrder', deilveryForm, function () {
					app.tips('发货成功', 'success');
					_this.load();
				}, '', function () {
					_this.toHideDeilvery();
				});
			},
			//取消订单直接退款
			toCancel: function (e) {
				let _this = this,
					id = app.eData(e).id;
				app.confirm('确定要取消订单？', function () {
					app.request('//shopapi/cancelOrder', {
						orderid: id
					}, function () {
						app.tips('取消成功', 'success');
						_this.load();
					});
				});
			},
			//同意售后申请
			toAfter: function (e) {
				let _this = this,
					index = Number(app.eData(e).index),
					data = this.getData().data,
					id = app.eData(e).id;
				app.confirm('同意申请后，就可以办理退款，款项将原路退回给客户', function () {
					app.request('//shopapi/doOrderAfterSale', {
						orderid: id,
						status: 2
					}, function () {
						app.tips('同意成功', 'success');
						data[index].afterstatus = 2;
						data[index].afterstatusName = '通过退款申请';
						_this.setData({
							data: data
						});
					});
				});
			},
			//拒绝售后申请
			noAfter: function (e) {
				let _this = this,
					index = Number(app.eData(e).index),
					data = this.getData().data,
					id = app.eData(e).id;
				app.confirm('确定拒绝吗？', function () {
					app.request('//shopapi/doOrderAfterSale', {
						orderid: id,
						status: 3
					}, function () {
						app.tips('拒绝成功', 'success');
						data[index].afterstatus = 3;
						data[index].afterstatusName = '拒绝退款申请';
						_this.setData({
							data: data
						});
					});
				});
			},
			//售后立即退款
			toRefund: function (e) {
				let _this = this,
					index = Number(app.eData(e).index),
					data = this.getData().data,
					id = app.eData(e).id,
					totalPrice = Number(data[index].totalPrice),
					freightTotal = Number(data[index].freightTotal),
					total = totalPrice - freightTotal;
				app.confirm('退款后，款项将原路退回给客户，请确认是否立即退款', function () {
					app.request('//shopapi/doOrderRefund', {
						orderid: id,
						total: total
					}, function () {
						app.tips('退款成功', 'success');
						data[index].afterstatus = 4;
						data[index].status = 5;
						_this.setData({
							data: data
						});
					});
				});
			},
			toDeliveryOrder: function () { //批量发货
				let data = this.getData().data,
					orderList = [];
				app.each(data,function(i,item){
					if(item.status==2){
						orderList.push(item.ordernum);
					};
				});
				app.storage.set('deliveryOrdernum',orderList);
				console.log(orderList);
				app.navTo('../../manage/orderDelivery/orderDelivery');
			},
		}
	});
})();