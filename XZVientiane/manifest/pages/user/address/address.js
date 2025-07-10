(function () {

	let app = getApp();

	app.Page({
		pageId: 'user-address',
		data: {
			systemId: 'user',
			moduleId: 'address',
			data: {},
			options: {},
			settings: {},
			language: {},
			select: '',
			form: {}
		},
		methods: {
			onLoad: function (options) {
				if (options.select) {
					this.setData({
						select: options.select
					});
				};
				this.load();
			},
			onPullDownRefresh: function () {
				this.load();
				wx.stopPullDownRefresh();
			},
			load: function () {
				let _this = this;
				app.request('/user/userapi/getUserAddress', {}, function (res) {
					if (res.data.length) {
						app.each(res.data, function (i, item) {
							let detail = item.address;
							if (item.area && item.area.length) {
								if (item.area[2]) {
									detail = item.area[2] + detail;
								};
								if (item.area[1] != item.area[0]) {
									detail = item.area[1] + detail;
								};
								detail = item.area[0] + detail;
							};
							item.detail = detail;
						});

						_this.setData({
							data: res.data
						});
					};
				});
			},
			toAdd: function () {
				let _this = this,
					select = this.getData().select;

				if (select) {
					_this.dialog({
						url: '../../user/addAddress/addAddress?order=1',
						title: '添加收货地址',
						success: function (res) {
							if (res) {
								_this.load();
							}
						}
					});
				} else {
					app.navTo('../addAddress/addAddress');
				};
			},
			changeDefault: function (e) {
				let _this = this,
					val = app.eValue(e),
					index = app.eData(e).index,
					data = _this.getData().data;

				app.request('/user/userapi/setDefaultAddress', {
					id: data[index]._id
				}, function () {
					app.each(data, function (i, item) {
						item.isdefault = 0;
					});
					data[index].isdefault = 1;
					_this.setData({
						data: data
					});
				});
			},
			editAddress: function (e) {
				let _this = this,
					index = app.eData(e).index,
					data = _this.getData().data;

				_this.dialog({
					url: '../addAddress/addAddress?id=' + data[index]._id,
					title: '编辑收货地址',
					success: function (res) {
						if (res) {
							_this.load();
						};
					}
				})
			},
			delAddress: function (e) {
				let _this = this,
					index = app.eData(e).index,
					data = _this.getData().data;

				app.request('/user/userapi/delAddress', {
					id: data[index]._id
				}, function (res) {
					data = app.removeArray(data, index);
					_this.setData({
						data: data
					});
					app.tips('删除成功');
				});
			},
			selectThis: function (e) {
				let _this = this,
					select = this.getData().select,
					data = this.getData().data,
					index = Number(app.eData(e).index);
				if (select) {
					select = data[index]._id;
					this.setData({
						select: select
					});
					app.dialogSuccess({
						data: data[index]
					});
				}else{
					app.actionSheet(['编辑','删除'],function(res){
						switch(res){
							case 0:
							_this.dialog({
								url: '../addAddress/addAddress?id=' + data[index]._id,
								title: '编辑收货地址',
								success: function (res) {
									if (res) {
										_this.load();
									};
								}
							});
							break;
							case 1:
							app.request('//userapi/delAddress', {id: data[index]._id}, function (res) {
								data = app.removeArray(data, index);
								_this.setData({
									data: data
								});
								app.tips('删除成功');
							});
							break;
						};
					});
				};
			}
		}
	});
})();