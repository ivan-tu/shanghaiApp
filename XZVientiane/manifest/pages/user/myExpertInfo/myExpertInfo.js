(function() {

	let app = getApp();

	app.Page({
		pageId: 'user-myExpertInfo',
		data: {
			systemId: 'user',
			moduleId: 'myExpertInfo',
			isUserLogin: app.checkUser(),
			data: {},
			options: {},
			settings: {},
			language: {},
			form: {
				page:1,
				size:7,
				gettype:'expert',
				isexpert:1,
			},
			settingData:{},
			ajaxLoading:true,
			showLoading:false,
			showNoData:false,
			count:0,
			pageCount:0,
			userList:[],
			showType:'daren',
			darenContent:'',
			agentContent:'',
			partnerContent:'',
			changeForm:{
				show:false,
				height:330,
				changecode:'',
				data:'',
			},
			contentTipsForm:{
				show:false,
				height:450,
				content:''
			},
			agreeMent:true,
			showToBuy:0,//是否支持购买
			checkParentDialog:{
				show:false,
				height:260,
				parentData:{},
				type:1,//直接购买，2-兑换
				edit:0,//0-没修改，1-已修改
				account:'',
			},
			depositSet:{},//定金、分期设置
			customerWxName:'',
			customerWxPic:'',//客服微信二维码
			customerHeadPic:'',//客服头像
		},
		methods: {
			onLoad:function(options){
				let _this = this;
				if (app.config.client == 'wx' && options.scene) {
					let scenes = options.scene.split('_');
					options.pocode = scenes[0];
					app.session.set('vcode', scenes[0]);
					app.storage.set('scanCode',scenes[0]);
					delete options.scene;
				}else if(options.pocode){
					app.storage.set('scanCode',options.pocode);
				};
				_this.setData({
					options: options
				});
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
				app.request('//set/get', {type: 'homeSet'}, function (res) {
					let backData = res.data||{};
					let wxVersion = app.config.wxVersion;
					if(backData){
						backData.wxVersion = backData.wxVersion?Number(backData.wxVersion):1;
						if(wxVersion>backData.wxVersion){//如果当前版本大于老版本，就要根据设置来
							_this.setData({
								showToBuy:backData.showToBuy||0,
							});
						}else{
							_this.setData({
								showToBuy:1
							});
						};
						if(backData.customerWxPic){
							_this.setData({
								customerWxName:backData.customerWxName,
								customerWxPic:app.image.width(backData.customerWxPic,240),
								customerHeadPic:app.image.crop(backData.customerHeadPic||'17503219166608743.jpg',80,80),
							});
						};
					}else{
						_this.setData({
							showToBuy:1
						});
					};
				},function(){
					_this.setData({
						showToBuy:1
					});
				});
			},
			onShow: function() {
				//检查用户登录状态
				let isUserLogin = app.checkUser();
				if (isUserLogin != this.getData().isUserLogin) {
					this.setData({
						isUserLogin: isUserLogin
					});
					if (isUserLogin) {
						this.load();
					};
				};
				if(app.storage.get('pageReoload')){
					app.storage.remove('pageReoload');
					this.load();
				};
			},
			onPullDownRefresh: function() {
				if (this.getData().isUserLogin) {
					this.load();
				};
				wx.stopPullDownRefresh();
			},
			load: function() {
				let _this = this,
					options = this.getData().options;
					
				this.getArticleDetail();
				
				app.request('//set/get', {type: 'partner'}, function (res) {
					let backData = res.data||{};
					if (backData){
						_this.setData({
							settingData:backData
						});
					};
				});
				app.request('//homeapi/getExpertInfo',{},function(res){
					//res.isexpert = 0;
					//res.isagent = 0;
					//res.ispartner = 0;
					if(res.isexpert==1||res.isagent==1||res.ispartner==1){
						_this.getList();
					}else{
						_this.getDepositSet();
					};
					if(res.parentInfo&&res.parentInfo.headpic){
						res.parentInfo.headpic = app.image.crop(res.parentInfo.headpic,60,60);
					};
					if(res.parentInfo&&res.parentInfo.wxCodePic){
						res.parentInfo.wxCodePic = app.image.width(res.parentInfo.wxCodePic,120);
					};
					if(res.serverInfo&&res.serverInfo.headpic){
						res.serverInfo.headpic = app.image.crop(res.serverInfo.headpic,60,60);
					};
					if(res.serverInfo&&res.serverInfo.wxCodePic){
						res.serverInfo.wxCodePic = app.image.width(res.serverInfo.wxCodePic,120);
					};
					if(res.operCenterInfo&&res.operCenterInfo.headpic){
						res.operCenterInfo.headpic = app.image.crop(res.operCenterInfo.headpic,60,60);
					};
					if(res.operCenterInfo&&res.operCenterInfo.wxCodePic){
						res.operCenterInfo.wxCodePic = app.image.width(res.operCenterInfo.wxCodePic,120);
					};
					_this.setData({
						data:res
					});
					if(!res.buyed&&!res.ispartner&&!res.isagent&&!res.isexpert&&app.storage.get('scanCode')){//没身份的人，修改一下推荐人
						app.request('//userapi/updateMyParentBycode',{code:app.storage.get('scanCode')},function(){
							app.storage.remove('scanCode');
						},function(){
						});
					};
				},'',function(){
					_this.setData({ajaxLoading:false})
				});
				
				//设置分享参数
				let newData = app.extend({}, options);
				newData = app.extend(newData, {
					pocode: app.storage.get('pocode')
				});
				let pathUrl = app.mixURL('/p/user/myExpertInfo/myExpertInfo', newData), 
					sharePic = 'https://statics.tuiya.cc/17333689747996230.jpg',
					shareData = {
						shareData: {
							title: '成为在局达人，成人达己，乐在局中',  
							content: '推广平台，收获财富',
							path: 'https://' + app.config.domain + pathUrl,
							pagePath: pathUrl,
							img: sharePic,
							imageUrl: sharePic,
							weixinH5Image: sharePic,
							wxid: 'gh_601692a29862',
							showMini: false,
							hideCopy: app.config.client=='wx'?true:false,
						},
						loadPicData:{
							ajaxURL: '//homeapi/getExpertWxpic',
							requestData: {
								url:'p/user/myExpertInfo/myExpertInfo',
								scene:app.storage.get('pocode'),
							}
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
			getDepositSet:function(){//获取分期，定金设置
				let _this = this;
				app.request('//set/get', {type: 'deposit'}, function (res) {
					let backData = res.data||{};
					if(backData){
						_this.setData({depositSet:backData});
					};
				});
			},
			changeType:function(e){
				this.setData({
					showType:app.eData(e).type
				});
				this.getArticleDetail();
			},
			getArticleDetail:function(){
				let _this = this,
					showType = this.getData().showType;
				if(showType=='daren'&&!this.getData().darenContent){
					app.request('//admin/getArticleInfo',{customId:'darenRule'},function(res){
						if (res.content){
							_this.setData({
								darenContent:app.parseHtmlData(res.content)
							});
						};
					});
				};
				if(showType=='agent'&&!this.getData().agentContent){
					app.request('//admin/getArticleInfo',{customId:'agentRule'},function(res){
						if (res.content){
							_this.setData({
								agentContent:app.parseHtmlData(res.content)
							});
						};
					});
				};
				if(showType=='partner'&&!this.getData().partnerContent){
					app.request('//admin/getArticleInfo',{customId:'partnerRule'},function(res){
						if (res.content){
							_this.setData({
								partnerContent:app.parseHtmlData(res.content)
							});
						};
					});
				};
			},
			toBuy:function(){//购买
				let _this = this,
					showType = this.getData().showType,
					settingData = this.getData().settingData;
				if(showType=='partner'){
					this.toBuyPartner();
				}else{
					app.request('//diamondapi/createRechargeOrder',{total:settingData.darenPrice||3980},function(res){
						if(res.ordernum){
							app.navTo('../../pay/pay/pay?ordertype=' + res.ordertype + '&ordernum=' + res.ordernum + '&total=' + res.paymoney+'&backStep=1');
						}else{
							app.tips('创建订单失败','error');
						};
					});
				};
			},
			screen:function(e){
				let formData = this.getData().form,
					type = app.eData(e).type,
					value = app.eData(e).value;
				formData[type] = value;
				formData.page = 1;
				this.setData({form:formData});
				this.getList();
			},
			getList:function(loadMore){
				let _this = this,
					formData = _this.getData().form,
					pageCount = _this.getData().pageCount;
				if(loadMore){
					if (formData.page >= pageCount) {
						_this.setData({'settings.bottomLoad':false});
					};
				};
				_this.setData({'showLoading':true});
				app.request('//homeapi/getMyTeamList',formData,function(backData){
					if(!backData||!backData.data){
						backData = {data:[],count:0};
					};
					if(!loadMore){
						if(backData.count){
							pageCount = Math.ceil(backData.count / formData.size);
							_this.setData({'pageCount':pageCount});
							if(pageCount > 1){
								_this.setData({'settings.bottomLoad':true});
							}else{
								_this.setData({'settings.bottomLoad':false});
							};
							_this.setData({'showNoData':false});
						}else{
							_this.setData({
								'settings.bottomLoad':false,
								'showNoData':true
							});
						};
					};
					let list = backData.data;
					if(list&&list.length){
						app.each(list,function(i,item){
							item.headpic = app.image.crop(item.headpic,50,50);
						});
					};
					if(loadMore){
						list = _this.getData().userList.concat(list);
					};
					_this.setData({
						userList:list,
						count:backData.count||0,
					});
				},'',function(){
					_this.setData({
						'showLoading':false,
					});
				});
			},
			onReachBottom:function(){
				if(this.getData().settings.bottomLoad) {
					let formData = this.getData().form;
					formData.page++;
					this.setData({form:formData});
					this.getList(true);
				};
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
			toRecord:function(){
				app.navTo('../../finance/userBeansRecord/userBeansRecord');
			},
			toUpDate:function(){//购买礼包升级，默认直接打开
				app.navTo('../../finance/diamondBuy/diamondBuy?onceopen=1');
			},
			toBuyDiamond:function(){//直接升级
				let _this = this,
					options = this.getData().options,
					data = this.getData().data,
					showType = this.getData().showType,
					depositSet = this.getData().depositSet,//定金-分期设置
					checkParentDialog = this.getData().checkParentDialog,
					requestData = {
						type:'',
						onceopen:1
					};
				//没买过，并且链接上不带pocode的就确认一下推荐人
				if(!data.buyed&&!options.pocode&&!checkParentDialog.edit){
					_this.setData({
						'checkParentDialog.parentData':'',
						'checkParentDialog.show':true,
						'checkParentDialog.edit':0,
						'checkParentDialog.type':1
					});
					if(data.parentInfo&&data.parentInfo.invitationNum){
						_this.setData({
							'checkParentDialog.parentData':data.parentInfo,
							'checkParentDialog.account':data.parentInfo.account,
							'checkParentDialog.edit':1,
						});
					};
					return;
				};
				if(!this.getData().agreeMent){
					app.tips('请同意充值协议','error');
					return;
				}else if(showType=='daren'){
					requestData.type = 'white';
					if((depositSet.deposit&&Number(depositSet.deposit.white)>0)||(depositSet.expertStages&&depositSet.expertStages.length)){
						app.navTo('../../pay/fenqiPay/fenqiPay?type='+requestData.type);
						return;
					};
				}else if(showType=='agent'){
					requestData.type = 'red';
					if((depositSet.deposit&&Number(depositSet.deposit.red)>0)||(depositSet.agentStages&&depositSet.agentStages.length)){
						app.navTo('../../pay/fenqiPay/fenqiPay?type='+requestData.type);
						return;
					};
				}else if(showType=='partner'){
					requestData.type = 'gold';
					if((depositSet.deposit&&Number(depositSet.deposit.gold)>0)||(depositSet.partnerStages&&depositSet.partnerStages.length)){
						app.navTo('../../pay/fenqiPay/fenqiPay?type='+requestData.type);
						return;
					};
				}else{
					app.navTo('../../finance/diamondBuy/diamondBuy?onceopen=1');
					return;
				};
				app.request('//diamondapi/createDiamondOrder',requestData,function(res){
					if(res.ordernum){
						app.navTo('../../pay/pay/pay?ordertype=' + res.ordertype + '&ordernum=' + res.ordernum + '&total=' + res.paymoney+'&backStep=1');
					}else{
						app.tips('创建订单失败','error');
					};
				});
			},
			toUserDetail:function(e){
				if(app.eData(e).userid){
					app.navTo('../../user/businessCard/businessCard?id='+app.eData(e).userid);
				};
			},
			toChange:function(){//兑换
				let _this = this,
					options = this.getData().options,
					data = this.getData().data,
					checkParentDialog = this.getData().checkParentDialog;
				//链接上不带pocode的就确认一下推荐人
				if(!options.pocode&&!checkParentDialog.edit){
					_this.setData({
						'checkParentDialog.parentData':'',
						'checkParentDialog.show':true,
						'checkParentDialog.edit':0,
						'checkParentDialog.type':2
					});
					if(data.parentInfo&&data.parentInfo.invitationNum){
						_this.setData({
							'checkParentDialog.parentData':data.parentInfo,
							'checkParentDialog.account':data.parentInfo.account,
							'checkParentDialog.edit':1,
						});
					};
				}else{
					this.setData({
						'changeForm.show':true,
						'changeForm.data':'',
						'changeForm.changecode':'',
					});
				};
			},
			toHideDialog:function(){
				this.setData({
					'changeForm.show':false
				});
			},
			checkCode:function(){//确认兑换码
				let _this = this,
					changeForm = this.getData().changeForm;
				if(!changeForm.changecode){
					app.tips('请输入兑换码','error');
				}else{
					app.request('//diamondapi/getGiftByCode',{changecode:changeForm.changecode},function(res){
						_this.setData({
							'changeForm.data':res||'',
						});
					});
				};
			},
			toConfirmDialog:function(){
				let _this = this,
					changeForm = this.getData().changeForm;
				if(!changeForm.changecode){
					app.tips('请输入兑换码','error');
				}else if(!changeForm.data){
					app.tips('请确认兑换码','error');
				}else{
					app.request('//diamondapi/changeDiamondGift',{changecode:changeForm.changecode},function(){
						app.tips('兑换成功','success');
						_this.toHideDialog();
					});
				};
			},
			toHideTipsDialog:function(){
				this.setData({
					'contentTipsForm.show':false
				});
			},
			showTips:function(){
				let data = this.getData().data,
					settingData = this.getData().settingData;
				if(data.ispartner==1){
					this.setData({
						'contentTipsForm.content':settingData.partnerRule,
						'contentTipsForm.show':true,
					});
				}else if(data.isagent==1){
					this.setData({
						'contentTipsForm.content':settingData.agentRule,
						'contentTipsForm.show':true,
					});
				}else if(data.isexpert==1){
					this.setData({
						'contentTipsForm.content':settingData.darenRule,
						'contentTipsForm.show':true,
					});
				}else{
					app.tips('暂无奖励政策','error');
				};
			},
			changeAgreeMent:function(){
				this.setData({agreeMent:!this.getData().agreeMent});
			},
			toHideCheckDialog:function(){
				this.setData({
					'checkParentDialog.show':false,
				});
			},
			toEditParent:function(){
				this.setData({
					'checkParentDialog.edit':1,
					'checkParentDialog.parentData':'',
					'checkParentDialog.account':'',
				});
			},
			checkAccount:function(){//检测账号
				let _this = this,
					checkParentDialog = this.getData().checkParentDialog;
				if(!checkParentDialog.account){
					app.tips('请输入账号','error');
				}else{
					app.request('//userapi/getInfoByAccount',{account:checkParentDialog.account},function(res){
						if(res&&res.invitationNum){
							res.headpic = app.image.crop(res.headpic,60,60);
							res.account = checkParentDialog.account;
							_this.setData({
								'checkParentDialog.parentData':res,
								'checkParentDialog.edit':1
							});
						}else{
							app.tips('用户不存在','error');
						};
					});
				};
			},
			toConfirmCheckDialog:function(){
				let _this = this,
					checkParentDialog = this.getData().checkParentDialog,
					msg = '';
				if(!checkParentDialog.parentData||!checkParentDialog.parentData.invitationNum){
					msg = '请确认推荐人';
				};
				if(msg){
					app.tips(msg,'error');
				}else{
					_this.toHideCheckDialog();
					app.request('//userapi/updateMyParentBycode',{code:checkParentDialog.parentData.invitationNum},function(){
						if(checkParentDialog.type==1){//购买流程
							_this.toBuyDiamond();
						}else{//兑换流程
							_this.toChange();
						};
					},function(msg){
						if(msg=='推荐人不能是同一人'){
							if(checkParentDialog.type==1){//购买流程
								_this.toBuyDiamond();
							}else{//兑换流程
								_this.toChange();
							};
						}else{
							app.tips(msg,'error');
							_this.setData({
								'checkParentDialog.parentData':'',
								'checkParentDialog.account':'',
								'checkParentDialog.edit':0
							});
						};
					});
				};
			},
			toMyInvite:function(){//查看全部邀请人
				app.navTo('../../user/myInvite/myInvite?gettype=expert&isexpert=1');
			},
			viewThisImage: function (e) {
				let _this = this,
					pic = app.eData(e).pic;
				pic = pic.split('?')[0];
				app.previewImage({
					current: pic,
					urls: [pic]
				})
			},
		}
	});
})();