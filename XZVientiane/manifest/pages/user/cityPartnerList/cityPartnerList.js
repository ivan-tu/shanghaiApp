(function() {

	let app = getApp();

	app.Page({
		pageId: 'user-cityPartnerList',
		data: {
			systemId: 'user',
			moduleId: 'cityPartnerList',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {},
			language: {},
			form: {},
			showLoading:true,
			addDialog:{
				show:false,
				height:400,
				number:'',
				city:'',
				numberList:[],
			},
		},
		methods: {
			onLoad: function(options) {
				//设置分享参数
				let _this = this,
					newData = app.extend({}, options);
				newData = app.extend(newData, {
					pocode: app.storage.get('pocode')
				});
				let pathUrl = app.mixURL('/p/user/cityPartnerList/cityPartnerList', newData), 
					sharePic = 'https://statics.tuiya.cc/17333689747996230.jpg',
					shareData = {
						shareData: {
							title: '快来一起入局，出门入局，乐在局中。',  
							content: '在局活动社交平台',
							path: 'https://' + app.config.domain + pathUrl,
							pagePath: pathUrl,
							img: sharePic,
							imageUrl: sharePic,
							weixinH5Image: sharePic,
							wxid: 'gh_601692a29862',
							showMini: false,
							hideCopy: app.config.client=='wx'?true:false,
						},
					}, 
					reSetData = function() {
						setTimeout(function() {
							if (_this.selectComponent('#newShareCon')) {
								_this.selectComponent('#newShareCon').reSetData(shareData)
							} else {
								reSetData();
							}
						}, 500)
					};
				reSetData();
			},
			onShow: function() {
				let _this = this;
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
			onPullDownRefresh: function() {
				if (this.getData().isUserLogin) {
					this.load();
				};
				wx.stopPullDownRefresh();
			},
			load: function() {
				let _this = this;
				app.request('//set/get',{type:'citypartner'}, function (res) {
					if(res.data&&res.data.list){
						_this.setData({data:res.data.list});
					};
					_this.setData({showLoading:false});
				});
			},
			toSupply:function(e){
				let _this = this,
					index = Number(app.eData(e).index),
					data = this.getData().data;
				app.request('//homeapi/getCityPartnerEmptynum',{city:data[index].name},function(res){
					if(res&&res.length){
						_this.setData({
							'addDialog.numberList':res,
							'addDialog.city':data[index].name,
							'addDialog.number':'',
							'addDialog.show':true,
						});
					}else{
						app.tips('该地区合伙人已收满','error');
					};
				});
			},
			toHideAddDialog:function(){
				this.setData({'addDialog.show':false});
			},
			toConfirmAddDialog:function(){
				let _this = this,
					isNum = /^[0-9]*$/,
					addDialog = this.getData().addDialog,
					msg = '';
				if((!addDialog.number&&String(addDialog.number)!='0')||!isNum.test(addDialog.number)){
					msg = '请选择号码';
				};
				if(msg){
					app.tips(msg,'error');
				}else{
					app.request('//homeapi/joinCityPartner',{
						city:addDialog.city,
						partnernum:addDialog.number,
					},function(res){
						if(res.ordernum){
							app.navTo('../../pay/pay/pay?ordertype=' + res.ordertype + '&ordernum=' + res.ordernum + '&total=' + res.paymoney+'&backStep=2');
						}else{
							app.tips('创建订单失败','error');
						};
					});
				};
			},
			selectNum:function(e){
				let num = app.eData(e).num,
					addDialog = this.getData().addDialog;
				addDialog.number = Number(num);
				this.setData({addDialog:addDialog});
			},
			toShare:function(){
				this.selectComponent('#newShareCon').openShare();
			},
			onShareAppMessage: function () {
				return app.shareData;
			},
			onShareTimeline: function () {
				let data = app.urlToJson(app.shareData.pagePath),
					shareData = {
						title: app.shareData.title,
						query: 'scene=' + data.pocode,
						imageUrl: app.shareData.imageUrl
					};
				return shareData;
			},
		}
	});
})();