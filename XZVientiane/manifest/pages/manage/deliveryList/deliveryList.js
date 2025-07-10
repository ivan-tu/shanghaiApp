/**
 *模块组件构造器
 */
import kuaidi100 from '../../../static/common/kuaidi100.js';
(function () {

	let app = getApp();
	app.Page({
		pageId: 'manage-deliveryList',
		data: {
			systemId: 'manage',
			moduleId: 'deliveryList',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {},
			language: {},
			form: {
				selectCompany: "",
				keyword: ''
			},
			kuaidiList: {},//快递列表
			list: {},
			listNav: [],
			height: (app.system.windowHeight - 179) / 28,
			client: app.config.client,
		},
		methods: {
			onLoad: function (options) {
				let _this = this;
				if(app.config.client=='web'){
					require(app.config.staticPath + 'common/kuaidi100.js');
					register('kuaidi100', () => {
						_this.getList();
					});
				}else{
					this.getList();
				};
			},
			onShow: function () {

			},
			onPullDownRefresh: function () {
				wx.stopPullDownRefresh();
			},
			load: function(){
			},
			// 获取快递公司列表
			getList: function () {
				let _this = this,
					navList = [];
				if(app.config.client=='wx'){
					app.each(kuaidi100, function (i, item) {
						navList.push(i)
					});
					_this.setData({
						list: kuaidi100,
						listNav: navList,
					});
				}else{
					require(app.config.staticPath + "common/kuaidi100.js");
					register('kuaidi100', () => {
						app.each(kuaidi100, function (i, item) {
							navList.push(i)
						});
						_this.setData({
							list: kuaidi100,
							listNav: navList,
						});
					});
				};
			},
			setCompany: function (e) {
				let name = app.eData(e).name,
					type = app.eData(e).type;
				app.dialogSuccess({
					selectCompany: name,
					type: type
				});
			}
		}
	});
})();