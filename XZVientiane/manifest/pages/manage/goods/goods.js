/**
 *模块组件构造器
 */
(function () {

	let app = getApp();

	app.Page({
		pageId: 'manage-goods',
		data: {
			systemId: 'manage',
			moduleId: 'goods',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {},
			language: {},
			form: {
				page: 1,
				size: 10,
				goodsCategoryId:'',
				sort: 'top',
				keyword: '',
				status:'1',
				goodsTypeid:'',//品类ID
			},
			myAuthority: app.storage.get('myAuthority'),
			showLoading: false,
			showNoData: false,
			pageCount: 0,
			count: 0,
			categoryData: [],
			showTaixDialog: false,
			taixForm: {
				id: '',
				taix: ''
			},
			categoryName: '全部分类',
			categoryIndex: 0,
			client:app.config.client,
			isshowMore: true,
			shopShortid:app.session.get('manageShopShortId')||'',
			topCoin:0,//平台置顶需要耗费的各豆
		},
		methods: {
			onLoad: function (options) {
				let _this = this;
				if (app.config.client == 'app') {
					_this.setData({
						isshowMore: false
					})
				}
				this.setData({
					myAuthority: app.storage.get('myAuthority')
				});
				if (!this.getData().myAuthority) {
					app.navTo('../../manage/index/index');
				};
				_this.setData({
					form:app.extend(this.getData().form,options),
					options: options
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
				if (_this.getData().myAuthority.goods) {
					let attrs = [{
						title: '全部',
						id: ''
					}];
					/*app.request('//shopapi/getMShopGoodsCategory', function (res) {
						if(res&&res.length){
							attrs = attrs.concat(res);
						};
						_this.setData({
							categoryData: attrs
						});
						setTimeout(function () {
							_this.selectComponent('#pickerType').reset();
						}, 100);
					});*/
					_this.getList();
				};
			},
			screenType: function (e) { //筛选分类
				let index = Number(e.detail.value),
					categoryData = this.getData().categoryData;
				this.setData({
					'form.page': 1,
					'form.goodsCategoryId': categoryData[index].id,
					'settings.bottomLoad': true,
					categoryIndex: index,
					categoryName: categoryData[index].title
				});
				this.getList();
			},
			//选择类目
			selectCategory: function () {
				let _this = this,
					formData = this.getData().form;
				this.dialog({
					title: '选择商品分类',
					url: '../../manage/selectCategory/selectCategory?hasAll=1&id=' + formData.goodsTypeid,
					success: function (res) {
						console.log(app.toJSON(res));
						if (res.sId) {
							_this.setData({
								'form.goodsTypeid': res.sId,
								categoryName: res.sTitle
							});
						} else if (res.pId) {
							_this.setData({
								'form.goodsTypeid': res.pId,
								categoryName: res.pTitle
							});
						} else {
							_this.setData({
								'form.goodsTypeid': '',
								categoryName: '全部分类'
							});
						};
						_this.setData({
							'form.page': 1
						});
						_this.getList();
					}
				});
			},
			selectStatus: function (e) {
				let status = app.eData(e).status;
				this.setData({
					'form.status': status,
					'form.delstatus': 0,
					'form.page': 1
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
				app.request('//shopapi/getMyShopGoods', formData, function (backData) {
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
							if (item.pic) {
								item.pic = app.image.crop(item.pic, 80, 80);
							};
						});
					};
					if (loadMore) {
						list = _this.getData().data.concat(backData.data);
					}else{
						if (_this.defaultSize) {
							formData.page = _this.defaultPage;
							formData.size = _this.defaultSize;
							_this.defaultPage = null;
							_this.defaultSize = null;
						};
					};
					_this.setData({
						data: list,
						count: backData.count || 0,
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
			//上下架			
			setStaus: function (e) {
				let _this = this,
					index = Number(app.eData(e).index),
					data = _this.getData().data,
					status = data[index].status ? 0 : 1;
				if (status == 0) {//下架
					app.request('//shopapi/updateShopGoodsStatus', {
						id: data[index].id,
						type: 'status',
						value: status,
						downsupply: 0
					}, function () {
						data[index].status = status;
						_this.setData({
							data: data
						});
					});
				} else {//上架
					app.request('//shopapi/updateShopGoodsStatus', {
						id: data[index].id,
						type: 'status',
						value: status
					}, function () {
						data[index].status = status;
						_this.setData({
							data: data
						});
					});
				};
			},
			//置顶
			setTop: function (e) {
				let _this = this,
					index = Number(app.eData(e).index),
					data = _this.getData().data;
				app.request('//shopapi/updateShopGoodsStatus', {
					id: data[index].id,
					type: 'top',
					value: 1
				}, function () {
					let old = data[index];
					data.splice(index, 1);
					data.unshift(old);
					_this.setData({
						data: data
					});
				});

			},
			//取消置顶
			setnoTop: function (e) {
				let _this = this,
					index = Number(app.eData(e).index),
					data = _this.getData().data;
				app.request('//shopapi/updateShopGoodsStatus', {
					id: data[index].id,
					type: 'top',
					value: 0
				}, function () {
					_this.getList();
				});
			},
			//修改排序
			setTaix: function (index) {
				let data = this.getData().data;
				this.setData({
					showTaixDialog: true,
					'taixForm.id': data[index].id,
					'taixForm.index': index,
					'taixForm.taix': data[index].taix,
				});
			},
			toHideDialog: function () {
				this.setData({
					showTaixDialog: false
				});
			},
			toConfirmDialog: function () {
				let _this = this,
					taixForm = this.getData().taixForm,
					data = this.getData().data,
					isNumber = /^[+]{0,1}(\d+)$/;
				if (!isNumber.test(taixForm.taix)) {
					app.tips('请输入正确的数字');
				} else {
					app.request('//shopapi/updateGoodsTaix', {
						taix: taixForm.taix,
						id: taixForm.id
					}, function () {
						app.tips('修改成功');
						data[taixForm.index].taix = taixForm.taix;
						_this.setData({
							data: data
						});
						_this.toHideDialog();
					});
				};
			},
			//删除
			del: function (e) {
				let _this = this,
					index = Number(app.eData(e).index),
					formData = _this.getData().form,
					data = _this.getData().data;
				app.confirm('删除后不可恢复，确定要删除吗？', function () {
					app.request('//shopapi/delShopGoods', {
						id: data[index].id
					}, function () {
						data.splice(index, 1);
						_this.setData({
							data: data,
							count: _this.getData().count - 1
						});
					});
				});
			},
			onSelect: function (e) {
				let _this = this,
					index = app.eData(e).index,
					options = _this.getData().options,
					data = _this.getData().data[index];
				if (options.selectType) {
					if (data.status == 1) {
						if (options.selectType == 'storage' && app.config.client == 'app') {
							data.from = 'myGoods';
							data.to = options.to || '';
							app.storage.set('publishData', data);
							app.navBack();
						} else {
							app.dialogSuccess(data);
						};
					} else {
						app.tips('请选择已上架的商品');
					};
				} else {
					app.dialogSuccess(data);
				};
			},
			toPage: function (e) {
				let page = app.eData(e).page;
				if (page) {
					app.navTo(page);
				};
			},
			setSystemTop:function(e){//平台置顶
				let _this = this,
					data = this.getData().data,
					topCoin = this.getData().topCoin,
					index = Number(app.eData(e).index);
				if(topCoin>0){
					app.confirm('平台推荐需要消耗'+topCoin+'各豆，确定推荐吗？',function(){
						app.request('//shopapi/setTopShopGoods', {id:data[index].id},function(){
							app.tips('推荐成功','success');
						});
					});
				}else{
					app.request('//shopapi/getMyManageShopDetail', {},function(reb){
						if(reb){
							_this.setData({topCoin:reb.topCoin});
							app.confirm('平台推荐需要消耗'+reb.topCoin+'各豆，确定推荐吗？',function(){
								app.request('//shopapi/setTopShopGoods', {id:data[index].id},function(){
									app.tips('推荐成功','success');
								});
							});
						};
					});
				};
			},
			//更多操作
			setMore: function (e) {
				let _this = this,
					data = this.getData().data,
					index = Number(app.eData(e).index),
					arrayList = ['店内排序','查看订单'];
				app.actionSheet(arrayList, function (res) {
					switch (arrayList[res]) {
						case '店内排序':
							_this.setTaix(index);
						break;
						case '查看订单':
							app.navTo('../../manage/orderList/orderList?searchtype=goodsname&keyword=' + data[index].name);
						break;
					};
				});
			},
		}
	});
})();