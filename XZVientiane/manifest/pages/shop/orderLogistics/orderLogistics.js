/**
 *模块组件构造器
 */
(function() {

	let app = getApp();

	app.Page({
		pageId: 'shop-orderLogistics',
		data: {
			systemId: 'shop',
			moduleId: 'orderLogistics',
			orderData:{number:'',typename:''},
			data: [],
			options: {},
			settings: {},
			language: {},
			form: {},
			showLoading: false,
			showNoData: false,
			orderid:'',
			deliverynum:'',
		},
		methods: {
			onLoad: function(options){
				this.setData({
					orderid:options.id,
					deliverynum:options.deliverynum,
					options:options,
				});
			},
			onShow: function() {
				this.load();
			},
			onPullDownRefresh: function() {
				this.load();
				wx.stopPullDownRefresh();
			},
			load: function() {
				let _this = this,
					deliverynum = this.getData().deliverynum,
					ajaxURL = '//shopapi/viewOrderDelivery',
					orderid = this.getData().orderid;
				this.setData({showLoading:true});
				if(this.getData().options.from=='groupBuy'){
					ajaxURL = '//bulkapi/viewOrderDelivery';
				}else if(this.getData().options.from=='pickOrder'){
					ajaxURL = '//bulkapi/mViewOrderDelivery';
				};
				app.request(ajaxURL,{orderid:orderid,deliverynum:deliverynum},function(backData){
					_this.setData({
						'orderData.number':backData.number,
						'orderData.typename':backData.typename
					});
					if(backData.list&&backData.list.length){
						_this.setData({
							data:backData.list,
							showNoData:false
						});
					}else{
						_this.setData({
							data:[],
							showNoData:true
						});
					};	
				},'',function(){
					_this.setData({showLoading:false});
				});
			},
		}
	});
})();