/**
 *模块组件构造器
 */
(function () {

	let app = getApp();

	app.Page({
		pageId: 'activity-ticketBuy',
		data: {
			systemId: 'activity',
			moduleId: 'ticketBuy',
			data: {},
			options: {},
			settings: {},
			form: {
				id: '',
				ticket: '',
				quantity: 1,
				usetype: 1, //=0-送人/1-自用
			},
			selectIndex: 0,
			totalPrice: '0.00',
			showLoading: true,
			stock:0,
			showEditInfoDialog:{
				show:false,
				height:250,
				avatarUrl:'',
				username:'',
				headpic:''
			},
			isUserLogin: app.checkUser(),
			diamondpay:0,//是否支持钻石兑换
			myDiamond:0,//我的钻石余额
			showBuyDialog:{
				show:false,
				height:180,
				content:'',
				change:0,
			},
		},
		methods: {
			onLoad: function (options) {
				let _this = this;
				this.setData({
					options: options,
					'form.id': options.id
				});
				if(options.clubid){
					//有可能参数是短id，换取一下短的
					app.request('//clubapi/getClubBasicinfo',{id:options.clubid},function(res){
						if(res._id){
							_this.setData({'options.clubid':res._id});
						};
					},function(msg){
						app.tips('获取俱乐部失败','error');
					});
				};
			},
			onShow: function () {
				let _this = this,
					options = this.getData().options,
					activityOrdernum = app.storage.get('activityOrdernum');
				/*if(app.config.client!='web'&&activityOrdernum){
					app.request('//api/checkPaystatus', {ordernum: activityOrdernum}, function(res) {
						if (res == '1') {
							app.navTo('../../activity/ticketMy/ticketMy?id='+options.id);
						};
					},function(){
					},function(){
						app.storage.remove('activityOrdernum');
					});
				};*/
				app.checkUser(function(){
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
			onPullDownRefresh: function () {
				this.load();
				wx.stopPullDownRefresh();
			},
			screenType: function (e) {
				this.setData({
					'form.usetype': Number(app.eData(e).type),
					'form.quantity': 1,
				});
				this.getPrice();
			},
			load: function () {
				let _this = this,
					options = this.getData().options;
				this.setData({
					showLoading: true
				});
				app.request('//activityapi/getActivityTicket', {
					id: options.id
				}, function (res) {
					_this.setData({
						data: res,
						'form.ticket': res.tickets[0]['name'],
						stock:res.tickets[0]['stock'],
						diamondpay:res.diamondpay,
						myDiamond:res.diamond,
					});
					if (res.myjoin == 1) {
						_this.setData({
							'form.usetype': 0
						});
					};
					_this.getPrice();
				}, '', function () {
					_this.setData({
						showLoading: false
					});
				});
			},
			selectThis: function (e) {
				let _this = this,
					productList = this.getData().data.tickets,
					index = Number(app.eData(e).index);
				this.setData({
					selectIndex: index,
					'form.ticket': productList[index]['name'],
					stock:productList[index]['stock'],
				});
				this.getPrice();
			},
			getPrice: function () {
				let formData = this.getData().form,
					selectIndex = this.getData().selectIndex,
					productList = this.getData().data.tickets,
					totalPrice = app.getPrice(Number(formData.quantity) * Number(productList[selectIndex].price));
				if(formData.usetype==0){//送给其他人的，用price2，标准价格
					totalPrice = app.getPrice(Number(formData.quantity) * Number(productList[selectIndex].price2));
				};
				this.setData({
					totalPrice: totalPrice
				});
			},
			//增加数量
			addCount: function (e) {
				let _this = this,
					form = _this.getData().form;
				form.quantity++;
				_this.setData({
					form: form
				});
				_this.getPrice();
			},
			//减少数量
			minusCount: function (e) {
				let _this = this,
					form = _this.getData().form;
				if (form.quantity > 1) {
					form.quantity--;
					_this.setData({
						form: form
					});
					_this.getPrice();
				} else {
					app.tips('最少为1');
				};

			},
			//输入数量
			inputCount: function (e) {
				let _this = this,
					value = Number(app.eValue(e)),
					form = _this.getData().form;
				if (value < 1) {
					value = 1;
				};
				form.quantity = value;
				_this.setData({
					form: form
				});
				_this.getPrice();
			},
			toBuy: function (e) {
				let _this = this,
					options = this.getData().options,
					formData = this.getData().form,
					isNum = /^[1-9]\d*$/,
					diamondpay = this.getData().diamondpay,//是否支持钻石兑换
					myDiamond = this.getData().myDiamond,//我的钻石余额
					totalPrice = this.getData().totalPrice;//合计总价
				if(options.clubid){
					formData.clubid = options.clubid;
				};
				app.checkUser(function () {
					if (!formData.ticket) {
						app.tips('请选择规格');
					} else if (!isNum.test(formData.quantity)) {
						app.tips('请输入正确的数量');
					} else {
						//获取用户资料，检测是否改名
						app.request('//homeapi/getMyInfo', {}, function(myInfo){
							myInfo.headpic = myInfo.headpic||'16872518696971749.png';
							_this.setData({
								'showEditInfoDialog.avatarUrl':app.image.crop(myInfo.headpic,60,60),
								'showEditInfoDialog.username':myInfo.username,
								'showEditInfoDialog.headpic':myInfo.headpic,
							});
							if (app.config.client!='wx') {
								_this.selectComponent('#uploadPic').reset(myInfo.headpic);
							};
							myInfo.headpic = app.image.crop(myInfo.headpic||'16872518696971749.png', 60, 60);
							if(myInfo.username=='微信用户'||myInfo.username.indexOf('hi3')==0||myInfo.headpic.indexOf('16872518696971749.png')>=0){
								app.tips('请先完善资料再报名','error');
								setTimeout(function(){
									_this.toShowEditInfoDialog();
								},800);
							}else{
								if(diamondpay==1){//允许钻石兑换
									if(myDiamond>=Number(totalPrice)){//钻石足够
										_this.setData({
											'showBuyDialog.show':true,
											'showBuyDialog.content':'钻石余额：'+myDiamond+'，是否使用钻石兑换',
											'showBuyDialog.change':1,
										});
									}else if(myDiamond>0){//有钻石，不够
										let needDiamond = Math.ceil(Number(totalPrice) - myDiamond);
										_this.setData({
											'showBuyDialog.show':true,
											'showBuyDialog.content':'钻石余额还差：'+needDiamond+'，是否前往充值',
											'showBuyDialog.change':0,
										});
									}else{//一个钻石也没有
										_this.toConfirmCash();//现金支付
									};
								}else{
									_this.toConfirmCash();//现金支付
								};
							};
						});
					};
				});
			},
			toHideBuyDialog:function(){
				this.setData({'showBuyDialog.show':false});
			},
			toConfirmCash:function(){//确定现金支付
				let _this = this,
					options = this.getData().options,
					formData = this.getData().form;
				if(options.clubid){
					formData.clubid = options.clubid;
				};
				formData.paytype = '';
				app.request('//activityapi/createActivityOrder', formData, function (res) {
					_this.toHideBuyDialog();
					if (res.paymoney == 0) {
					  app.tips('领取成功', 'success');
					  setTimeout(function () {
						app.navBack();
					  }, 500);
					} else if (res.ordernum) {
					  app.storage.set('activityOrdernum', res.ordernum);
					  app.navTo('../../pay/pay/pay?id=' + formData.id + '&ordertype=' + res.ordertype + '&ordernum=' + res.ordernum + '&total=' + res.paymoney + '&backStep=2');
					};
				});
			},
			toConfirmDiamond:function(){//确定钻石兑换
				let _this = this,
					options = this.getData().options,
					formData = this.getData().form;
				if(options.clubid){
					formData.clubid = options.clubid;
				};
				formData.paytype = 'diamond';
				app.request('//activityapi/createActivityOrder', formData, function (res) {
					_this.toHideBuyDialog();
					app.tips('支付成功', 'success');
					setTimeout(function () {
						app.navBack();
					}, 500);
				});
			},
			toConfirmRecharge:function(){//确定钻石充值
				let myDiamond = this.getData().myDiamond,//我的钻石余额
					totalPrice = this.getData().totalPrice,//合计总价
					needDiamond = Math.ceil(Number(totalPrice) - myDiamond);
				this.toHideBuyDialog();
				app.navTo('../../finance/recharge/recharge?total='+needDiamond);
			},
			toShowEditInfoDialog:function(){
				this.setData({'showEditInfoDialog.show':true});
			},
			toHideEditInfoDialog:function(){
				this.setData({'showEditInfoDialog.show':false});
			},
			toConfirmEditInfoDialog:function(){
				let _this = this,
					showEditInfoDialog = this.getData().showEditInfoDialog,
					msg = '';
				if(!showEditInfoDialog.headpic||showEditInfoDialog.headpic.indexOf('16872518696971749.png')>=0){
					msg = '请上传头像';
				}else if(showEditInfoDialog.username.indexOf('hi3')==0){
					_this.setData({'showEditInfoDialog.username':''});
					msg = '请输入您的昵称';
				}else if(!showEditInfoDialog.username){
					msg = '请输入昵称';
				}else if(app.getLength(showEditInfoDialog.username)>28){
					msg = '昵称太长了';
				};
				if(msg){
					app.tips(msg,'error');
				}else{
					app.request('//userapi/setting', {username:showEditInfoDialog.username,headpic:showEditInfoDialog.headpic}, function(backData) {
						app.tips('修改成功','success');
						_this.toHideEditInfoDialog();
						_this.toBuy();
					});
				};
			},
			uploadSuccess: function(e) {//头像
				this.setData({
					'showEditInfoDialog.headpic': e.detail.src[0]
				});
            },
			onChooseAvatar:function(e){//微信头像
				let _this = this,
					avatarUrl = e.detail.avatarUrl;
				this.setData({
					'showEditInfoDialog.avatarUrl':avatarUrl
				});
				if(avatarUrl){
					app.uploadFile({
						mimeType:'image',
						file:{path:avatarUrl,key:avatarUrl},
						start:function(res){
						},
						progress:function(res){
						},
						success:function(res){
							if(res.key){
								_this.setData({
									'showEditInfoDialog.headpic': res.key
								});
							};
						},
						fail:function(){
							_this.setData({
								'showEditInfoDialog.headpic': avatarUrl
							});
						},
					});
				}else{
					app.tips('出错了','error');
				};
			},
		}
	});
})();