/**
 *模块组件构造器
 */
(function () {

	let app = getApp();

	app.Page({
		pageId: 'manage-deliverGoods',
		data: {
			systemId: 'manage',
			moduleId: 'deliverGoods',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {},
			language: {},
			form: {
				id:'',
				deliveryCompany:'',// 公司name
				type:'',// 公司type
				addressObj:{},// 地址信息
				value:'',// 单号
				isedit:'',
			},
			client: app.config.client,
		},
		methods: {
			onLoad: function (options) {
				this.setData({
					'form.id': options.id,
					'form.addressObj': app.storage.get('addressObj')||{},
					'form.isedit': options.isedit || false
				});
			},
			onShow: function () {
				let _this = this;
				//检查用户登录状态
				let isUserLogin = app.checkUser();
				if (isUserLogin != this.getData().isUserLogin) {
					this.setData({
						isUserLogin: isUserLogin
					});
				};
			},
			onPullDownRefresh: function () {
				this.load();
				wx.stopPullDownRefresh();
			},
			load: function () {
			},
			// 选择快递公司
			setCompany:function(){
				let _this = this,
					formData = app.deepCopy(_this.getData().form);
				_this.dialog({
					url: '../../manage/deliveryList/deliveryList',
					title: '选择快递公司',
					success: function (res) {
						if(res.selectCompany){
							_this.setData({form:''});
							formData.deliveryCompany = res.selectCompany;
							formData.type = res.type;
							_this.setData({
								form:formData
							});
						};
					}
				});
			},
			// 匹配
			changeOrder: function (e) {
				this.setData({
					'form.value': app.eValue(e)
				})
			},
			matching: function (e) {
				let _this = this,
					value = _this.getData(e).form.value;
				app.request('/index/api/getTxDeliveryInfo', {
					number: value,
					type: ''
				}, function (res) {
					if (res == '') {
						// app.tips('未匹配到快递公司')
						app.alert('未匹配到快递公司');
					} else if (res.type == '') {
						// app.tips('未匹配到快递公司,请手动选择')
						app.alert('未匹配到快递公司,请手动选择');
					} else {
						_this.setData({
							'form.deliveryCompany': res.typename,
							'form.type': res.type
						})
					}
				})
			},
			// 发货
			submit: function () {
				let orderid = this.getData().form.id,
					isedit = this.getData().form.isedit,
					deliverynum = this.getData().form.value,
					deliverytype = this.getData().form.type,
					deliveryname = this.getData().form.deliveryCompany,
					requestData = {
						orderid:orderid,
						deliverynum:deliverynum,
						deliverytype:deliverytype,
						deliveryname:deliveryname
					},
					ajaxURL = '//shopapi/deliveryShopOrder';
				if (isedit) {//是修改
					ajaxURL = '//shopapi/updateDelivery';
				};
				app.request(ajaxURL, requestData, function () {
					app.tips(isedit?'修改成功':'发货成功', 'success');
					app.navBack(1)
				});
			}
		}
	});
})();