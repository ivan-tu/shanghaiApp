/**
 *模块组件构造器
 */
(function () {

	let app = getApp();

	app.Page({
		pageId: 'activity-detail',
		data: {
			systemId: 'activity',
			moduleId: 'detail',
			isUserLogin: app.checkUser(),
			options: {},
			settings: {
				bottomLoad: true,
				noMore: false,
			},
			language: {},
			form: {
				code: '',
			},
			data: {
				userinfo: {
					username: '',
					headpic: ''
				}, //创建人
				inviteuser: {
					username: '',
					headpic: ''
				}, //邀请人
				area: {
					areaname: ''
				},
			},
			userForm: {
				page: 1,
				size: 5,
				code: '',
				activityid: '',
			},
			userList: [],//参与列表
			client: app.config.client,
			maxuser: 1, //参加人数
			showDialog: false,
			peopleList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 20, 30, 40, 50],
			showJoinBtn: false, //显示参加按钮
			showCancelBtn: false, //显示取消按钮
			showNotJoinBtn:false,//显示暂时无法报名按钮
			showFullBtn: false, //显示报名人数已满按钮
			showEndBtn:false,//显示报名已结束按钮
			showNoCanBtn:false,//显示没有权限按钮
			showQiandaoBtn:false,//显示已签到按钮
			isUpdateNum: false, //修改报名人数模式
			ismaster_maxuser: 0, //我参加人数,
			qrcodePic: '',
			topWidth: app.system.windowWidth > 480 ? 480 : app.system.windowWidth,
			topHeight: (app.system.windowWidth > 480 ? 480 : app.system.windowWidth) *0.8,
			contentImgWidth: (app.system.windowWidth > 480 ? 480 : app.system.windowWidth) - 30,
			contentData: [],
			inviteDialog:{
				show:false,
				height:180,
				freecode:'',
			},
			showEditInfoDialog:{
				show:false,
				height:250,
				avatarUrl:'',
				username:'',
				headpic:''
			},
			userInfo:{},
			dynamicList:[],
			dynamicPicW_a:Math.floor(((app.system.windowWidth>480?480:app.system.windowWidth)-35-45)/2),
			dynamicPicH_a:Math.floor(((app.system.windowWidth>480?480:app.system.windowWidth)-35-45)/2*1.1),
			dynamicPicW_b:Math.floor(((app.system.windowWidth>480?480:app.system.windowWidth)-40-45)/3),
			dynamicPicH_b:Math.floor(((app.system.windowWidth>480?480:app.system.windowWidth)-40-45)/3*1.1),
			dynamicCount:0,
			dynamicPage:0,
			dynamicForm:{
				page:1,
				size:10
			},
			showLoading: false,
			showNoData: false,
			showDetailType:'content',//dynamic
			showCodeType:'qrcode',
			starsText:['','很糟糕','较差','一般','还可以','很棒'],
			activityGiftList:[],//活动送礼记录
			activityGiftCount:0,
			giftDialog:{
				show:false,
				height:340,
				balance:0,
				giftid:'',
				num:0,
				total:0,
				picWidth:35,
				data:[],
			},
		},
		methods: {
			onLoad: function (options) {
				if (app.config.client == 'wx' && options.scene) {
					let scenes = options.scene.split('_');
					options.id = scenes[0];
					if (scenes.length > 1) {
						app.session.set('vcode', scenes[1]);
					};
					if (scenes.length > 2) {
						options.clubid = scenes[2];
					};
					delete options.scene;
				};
				this.setData({
					options: options,
					'userForm.activityid': options.id
				});
			},
			onShow: function (options) {
				//检查用户登录状态
				let _this = this;
				app.checkUser({
					goLogin: false,
					success: function () {
						_this.setData({
							isUserLogin: true
						});
					}
				});
				this.load();
			},
			onHide: function () {
				this.stopInterval();
			},
			onPullDownRefresh: function () {
				this.onShow();
				wx.stopPullDownRefresh();
			},
			callTel: function (e) {
				let tel = app.eData(e).tel;
				if (!tel) return;
				wx.makePhoneCall({
					phoneNumber: tel
				});
			},
			copyThis: function (e) {
				let content = app.eData(e).content;
				if (!content) return;
				if (app.config.client == 'app') {
					wx.app.call('copyLink', {
						data: {
							url: content
						},
						success: function (res) {
							app.tips('复制成功', 'success');
						}
					});
				} else if (app.config.client == 'wx') {
					wx.setClipboardData({
						data: content,
						success: function () {
							app.tips('复制成功', 'success');
						},
					});
				};
			},
			load: function () {
				this.getJoinUserList();
				let _this = this,
					formData = this.getData().form,
					options = this.getData().options;
				this.stopInterval();
				app.request('//activityapi/getActivityDetail', {
					id: options.id
				}, function (res) {
					//有 invitecode 代表报名了, ismy = 1代表是发布人
					//type=2 活动报名需要审核 checkStatus 0未报名 1 已报名，待审核 2 审核通过 3 审核拒绝
					if(res){
						options.id = res._id;
						_this.setData({
							'options.id': res._id,
							'userForm.activityid': res._id
						});
					};
					if(!res.customerTel){
						res.customerTel = res.masteraccount;
					};
					if(res.tickets&&res.tickets.length){
						if(res.price!=res.tickets[0].priceList['标准价']){
							res.oldPrice = res.tickets[0].priceList['标准价'];
						};
					};
					if (res.formList && res.formList) {
						app.each(res.formList, function (i, item) {
							item.active = item.active == 1 ? 1 : 0;
						});
					};
					if (res.pic) {
						res.topPic = app.image.crop(res.pic, _this.getData().topWidth, _this.getData().topHeight);
						res.pic = app.image.crop(res.pic, 160, 160);
					};
					if (res.h5sharepic) {
						res.h5sharepic = app.image.crop(res.h5sharepic, 160, 160);
					};
					if (res.miniwxsharepic) {
						res.miniwxsharepic = app.image.crop(res.miniwxsharepic, 160, 120);
					};
					if (res.grouppic) {
						res.grouppic = app.image.width(res.grouppic, 140);
					};
					if (res.masterpic) {
						res.masterpic = app.image.crop(res.masterpic, 80, 80);
					};
					if (res.clubInfo&&res.clubInfo.pic) {
						res.clubInfo.pic = app.image.crop(res.clubInfo.pic, 80, 80);
					};
					if (res.joinData&&res.myuid) {
						console.log('签到链接：' + 'https://' + app.config.domain + '/p/activity/signed/signed?id=' + options.id+'&joinid='+ res.joinData._id + '&userid=' + res.myuid);
						_this.setData({
							qrcodePic: app.getQrCodeImg('https://' + app.config.domain + '/p/activity/signed/signed?id=' + options.id+'&joinid='+ res.joinData._id + '&userid=' + res.myuid)
						});
						if(res.joinData.signstatus!=1){//报名了，还没签到，就往下滑动到签到二维码位置
							setTimeout(function(){
								wx.pageScrollTo({
									scrollTop:350,
									duration:500
								});
							},500);
						};
					};
					if (res.inviteuser&&res.inviteuser.headpic) {
						res.inviteuser.headpic = app.image.crop(res.inviteuser.headpic, 80, 80);
					};
					_this.setData({
						ismaster_maxuser: res.maxuser || 0
					});
					
					let picArray = [];
					if (res.pics && res.pics.length) {
						app.each(res.pics, function (i, item) {
							if(item){
								picArray.push(app.image.width(item, app.system.windowWidth));
							};
						});
					};
					res.pics = picArray;
					
					if(res.joinclubList&&res.joinclubList.length){
						app.each(res.joinclubList,function(i,item){
							item.pic = app.image.crop(item.pic,60,60);
						});
					};
					
					if (res.bDate) {
						res.activityTime = res.bDate + ' ' + res.bTime;
						if (res.eDate) {
							if ((res.eDate.split('-'))[0] == (res.bDate.split('-'))[0]) {
								res.activityTime += ' 至 ' + (res.eDate.split('-'))[1] + '-' + (res.eDate.split('-'))[2] + ' ' + (res.eTime || '');
							} else {
								res.activityTime += ' 至 ' + (res.eDate.split('-'))[0] + '-' + (res.eDate.split('-'))[1] + '-' + (res.eDate.split('-'))[2] + ' ' + (res.eTime || '');
							};
						};
					};
					res.btime = res.bDate+' '+res.bTime;
					res.etime = res.eDate+' '+res.eTime;
					if(app.config.client=='wx'){//小程序中要把-转换成/
						res.btime = res.btime.replace(/-/g,'/');
						res.etime = res.etime.replace(/-/g,'/');
					};
					res.btime = (new Date(res.btime)).getTime();
					res.etime = (new Date(res.etime)).getTime();
					res.aboutTime = _this.getDateHours(res.etime - res.btime);
					
					if (res.area && res.area.length) {
						res.realAddress = res.area;
						if (res.realAddress[0] == res.realAddress[1]) {
							res.realAddress = res.realAddress[0] + '' + res.realAddress[2];
						} else {
							res.realAddress = res.realAddress[0] + '' + res.realAddress[1] + '' + res.realAddress[2];
						};
					};
					if (res.address) {
						res.realAddress += '' + res.address;
					};
					
					//是否显示报名按钮:活动进行中,有权限，不是发布者，未报名，报名状态开启，限制报名数但没超过，未限制报名数
					if (res.status==1 && res.canapply ==1 && res.ismy!= 1 && ((res.limitnum && res.limitnum > res.joinnum) || !res.limitnum)) {
						_this.setData({
							showJoinBtn: true
						});
					} else {
						_this.setData({
							showJoinBtn: false
						});
					};
					//是否报名已满,活动进行中，有权限，并且没有报名状态下
					if (res.status==1&&res.canapply ==1&&res.limitnum && res.joinnum >= res.limitnum && !res.joinData) {
						_this.setData({
							showFullBtn: true
						});
					}else{
						_this.setData({
							showFullBtn: false
						});
					};
					//是否显示取消报名按钮，//不是发布者，已报名，没签到
					if (res.ismy != 1 && res.joinData && res.joinData.signstatus!=1 && res.status==1) {
						_this.setData({
							showCancelBtn: true
						});
					} else {
						_this.setData({
							showCancelBtn: false
						});
					};
					//是否显示已签到按钮
					if(res.ismy != 1 && res.joinData && res.joinData.signstatus==1){
						_this.setData({
							showQiandaoBtn: true
						});
					}else{
						_this.setData({
							showQiandaoBtn: false
						});
					};
					
					//是否显示已结束按钮
					if(res.status==2){
						_this.setData({
							showEndBtn:true
						});
					}else{
						_this.setData({
							showEndBtn:false
						});
					};
					//是否显示无权限按钮
					if(res.canapply!=1&&!options.freecode){
						_this.setData({
							showNoCanBtn:true
						});
					}else{
						_this.setData({
							showNoCanBtn:false
						});
					};
					/*if (res.mustpay == 1 && res.tickets && res.tickets.length) {
						let priceList = [];
						app.each(res.tickets, function (i, item) {
							app.each(item.priceList, function (l, g) {
								priceList.push(Number(g));
							});
							priceList.sort(function (a, b) {
								return a - b
							});
						});
						res.minPrice = app.getPrice(priceList[0]);
					};*/
					
					//已报名待签到的走轮循
					if (res.joinData && res.joinData.signstatus == 0) {
						_this.checkStatus = setInterval(function () {
							app.request('//activityapi/checkSignin', {
								id: res.joinData._id
							}, function (req) {
								if (req.signstatus == 1) {
									clearInterval(_this.checkStatus);
									res.joinData.signstatus = 1
									_this.setData({
										data:res
									});
								};
							},function(){});
						}, 3000);
					};

					//详情
					if (res.content) {
						if (typeof res.content == 'object' && res.content.length) {
							app.each(res.content, function (i, item) {
								if (item.type == 'image') {
									item.file = app.image.width(item.src, _this.getData().contentImgWidth)
								} else if (item.type == 'video') {
									item.file = app.config.filePath + '' + item.src;
									if (item.poster) {
										item.poster = app.image.width(item.poster, _this.getData().contentImgWidth)
									};
								};
							});
							_this.setData({
								contentData: res.content
							});
						} else if (typeof res.content == 'string') {
							/*res.content = [{
								type: 'text',
								content: res.content
							}];*/
							_this.setData({
								contentData: []
							});
						};
						setTimeout(function(){
							if(_this.selectComponent('#editorcontent')){
								_this.selectComponent('#editorcontent').init();
							};
						},600);
					};
					_this.setData({
						data: res
					});
					let sharepic = "";
					if (app.config.client == 'wx') {
						sharepic = res.miniwxsharepic||res.pic
					} else {
						sharepic = res.h5sharepic||res.pic
					};
					//获取动态
					_this.getList();
					
					//获取收礼记录
					if(res.acceptGift==1){
						_this.getGiftList();
					};
					
					//设置分享
					_this.setShareData();
				});
			},
			showMyCode: function () {
				this.stopInterval();
				app.navTo('../../activity/ticketMyCode/ticketMyCode?id=' + this.getData().data._id);
			},
			stopInterval: function () {
				if (this.checkStatus) {
					clearInterval(this.checkStatus);
				};
			},
			getDateHours: function (date) { //时间戳转大概的小时，四舍五入
				var days = '';
				var hours = parseInt((date / (1000 * 60 * 60 * 24)) * 24);
				var minutes = parseInt((date % (1000 * 60 * 60)) / (1000 * 60));
				var seconds = parseInt((date % (1000 * 60)) / 1000);
				if (minutes > 45) {
					hours = hours + 1;
				} else if (minutes >= 30) {
					hours = hours + 0.5;
				};
				if(hours>24){
					days = Math.trunc(hours/24);
					hours = hours%24;
				};
				if(days){
					return days+'天'+hours+'小时';
				}else{
					return hours+'小时';
				};
			},
			getJoinUserList:function(){//获取参与活动记录
				let _this = this,
					userList = this.getData().userList,
					formData = this.getData().userForm;
				app.request('//activityapi/getActivityUser', formData, function (backData) {
					if (backData.data && backData.data.length) {
						app.each(backData.data, function (i, item) {
							item.headpic = app.image.crop(item.headpic, 80, 80);
						});
					};
					_this.setData({
						userList: backData.data||[]
					});
				});
			},
			getList: function (loadMore) { //无限加载动态
				let _this = this,
					data = this.getData().data,
					dynamicList = this.getData().dynamicList,
					formData = this.getData().dynamicForm,
					pageCount = this.getData().dynamicPage;
				if(data.clubid){
					formData.clubid = data.clubid;
				}else{
					formData.activityid = data._id;
				};
				if(data.ismy==1){
					formData.showstatus = '';
				}else{
					formData.showstatus = 1;
				};
				
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
					if (_this.getData().dynamicList.length && formData.page > 1) {
						_this.defaultSize = formData.size;
						_this.defaultPage = formData.page;
						formData.size = formData.page * formData.size;
						formData.page = 1;
					};
				};
				//动态接口//homeapi/getDynamicList
				app.request('//activityapi/getActivityComments', formData, function (backData) {
					if (!backData.data) {
						backData.data = [];
					};
					if (!loadMore) {
						if (backData.count) {
							pageCount = Math.ceil(backData.count / formData.size);
							_this.setData({
								dynamicPage: pageCount
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
								'settings.bottomLoad': false,
								'showNoData': true
							});
						};
					};
					let list = backData.data;
					if (list && list.length) {
						app.each(list, function (i, item) {
							item.id = item.id||item._id;
							if(item.headpic){
								item.headpic = app.image.crop(item.headpic,40,40);
							};
							if(item.pics&&item.pics.length){
								let newPics = [];
								if(item.pics.length==1){
									app.each(item.pics,function(l,g){
										newPics.push({
											file:app.config.filePath+''+g,
											src:app.image.crop(g,170,187)
										});
									});
								}else if(item.pics.length==2){
									app.each(item.pics,function(l,g){
										newPics.push({
											file:app.config.filePath+''+g,
											src:app.image.crop(g,_this.getData().dynamicPicW_a,_this.getData().dynamicPicH_a)
										});
									});
								}else{
									app.each(item.pics,function(l,g){
										newPics.push({
											file:app.config.filePath+''+g,
											src:app.image.crop(g,_this.getData().dynamicPicW_b,_this.getData().dynamicPicH_b)
										});
									});
								};
								item.pics = newPics;
							};
							if(item.videos&&item.videos.file){
								item.videos.file = app.config.filePath+''+item.videos.file;
								item.videos.pic = app.config.filePath+''+item.videos.pic;
								item.videos.status = 0;
							};
						});
					};
					if (loadMore) {
						list = _this.getData().dynamicList.concat(backData.data);
					} else {
						if (_this.defaultSize) {
							formData.page = _this.defaultPage;
							formData.size = _this.defaultSize;
							_this.defaultPage = null;
							_this.defaultSize = null;
						};
					};
					_this.setData({
						dynamicList: list,
						dynamicCount: backData.count || 0
					});
				}, '', function () {
					_this.setData({
						'showLoading': false
					});
				});
			},
			loadMore: function () {
				let _this = this,
					form = this.getData().dynamicForm;
				form.page++;
				this.setData({
					dynamicForm: form
				});
				this.getList(true);
			},
			onReachBottom: function () {
				if (this.getData().settings.bottomLoad){
					this.loadMore();
				};
			},
			toShare: function () {
				this.toCloseInvite();
				this.selectComponent('#newShareCon').openShare();
			},
			onShareAppMessage: function () {
				this.toCloseInvite();
				return app.shareData;
			},
			onShareTimeline: function () {
				let data = app.urlToJson(app.shareData.pagePath),
					shareData = {
						title: app.shareData.title,
						query: 'scene=' + data.id + '_' + data.pocode+'_'+(data.clubid||''),
						imageUrl: app.shareData.imageUrl
					};
				return shareData;
			},
			submit: function () {
				let _this = this,
					options = this.getData().options,
					data = this.getData().data,
					tipsText = '确定报名吗？',
					toJoin = function(){
						if(data.isfree == 2 && data.price && data.paytype=='cash'){
							//后面改成多票形式的，跳转去买票
							if(options.clubid||options.joinclubid){
								app.navTo('../../activity/ticketBuy/ticketBuy?id=' + options.id+'&clubid='+(options.clubid||options.joinclubid));
							}else{
								app.navTo('../../activity/ticketBuy/ticketBuy?id=' + options.id);
							};
						}else{
							app.confirm(tipsText, function () {
								app.request('//activityapi/applyActivity', {id:options.id},function(res){
									if(data.isfree == 2 && data.price && data.paytype=='cash'){//付费活动，并且现金支付
										app.navTo('../../pay/pay/pay?id='+options.id+'&ordertype=' + res.ordertype + '&ordernum=' + res.ordernum + '&total=' + res.paymoney);
									}else{
										app.tips('报名成功', 'success');
										wx.pageScrollTo({
											scrollTop: 1
										});
										_this.load();
										_this.setData({
											'userForm.page': 1
										});
										_this.getJoinUserList();
									};
								},function(msg){
									app.tips(msg,'error');
									if(msg=='该活动仅限指定会员参加'&&data.clubid){
										app.navTo('../../suboffice/clubDetail/clubDetail?id='+data.clubid);
									};
								});
							});
						};
					};
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
					_this.setData({
						userInfo:myInfo
					});
					if(myInfo.username=='微信用户'||myInfo.username.indexOf('hi3')==0||myInfo.headpic.indexOf('16872518696971749.png')>=0){
						app.tips('请先完善资料再报名','error');
						setTimeout(function(){
							_this.toShowEditInfoDialog();
						},800);
					}else{
						if(data.isfree == 2 && data.price && !options.freecode){
							if(data.paytype=='diamond'){//钻石支付
								if(data.myDiamond>=data.price){//钻石足够
									tipsText = '本次活动需支付'+data.price+'钻石，确定报名吗？';
									toJoin();
								}else{
									app.confirm({
										title:'余额不足',
										content:'您的钻石余额不足，是否立即充值',
										confirmText:'确认充值',
										success:function(req){
											if(req.confirm){
												let rechargeTotal = Number(data.price-data.myDiamond);
												rechargeTotal = rechargeTotal<10?10:Math.ceil(rechargeTotal);
												app.request('//diamondapi/createRechargeOrder',{total:rechargeTotal},function(reb){
													if(reb.ordernum){
														app.storage.set('payActivityInfo',{
															id:options.id,
															payStatus:0,
														});
														app.navTo('../../pay/pay/pay?ordertype=' + reb.ordertype + '&ordernum=' + reb.ordernum + '&total=' + reb.paymoney+'&backStep=1');
													}else{
														app.tips('创建订单失败','error');
													};
												});
											};
										},
									});
								};
							}else if(data.paytype=='cash'){//现金支付
								tipsText = '本次活动需支付'+data.price+'元，确定报名吗？';
								toJoin();
							}else if(data.paytype=='wallte'){//友币支付
								if(Number(data.myWallte)>=data.price){//友币足够
									tipsText = '本次活动需支付'+data.price+'友币，确定报名吗？';
									toJoin();
								}else{
									app.confirm({
										content:'您的友币数量不足',
										confirmText:'去赚友币',
										success:function(req){
											if(req.confirm){
												app.navTo('../../user/myWallte/myWallte');
											};
										},
									});
								};
							};
						}else{
							toJoin();
						};
					}
				});
			},
			cancelThis: function () { //取消报名
				let _this = this,
					options = this.getData().options,
					data = this.getData().data;
				_this.stopInterval();
				if(data.selfcancel==1){//不可以取消
					app.alert('该活动不能自己取消，请联系活动发起者');
				}else{
					app.confirm('确定取消报名吗？', function () {
						app.request('//activityapi/cancelSiup', {
							id: options.id
						}, function () {
							app.tips('取消成功', 'success');
							wx.pageScrollTo({
								scrollTop: 1
							});
							_this.load();
							_this.setData({
								'userForm.page': 1
							});
							_this.getJoinUserList();
						});
					});
				};
			},
			updateNum: function () { //修改报名人数
				this.setData({
					showDialog: true,
					isUpdateNum: true, //修改报名人数模式
					maxuser: this.getData().ismaster_maxuser
				});
			},
			selectThis: function (e) {
				this.setData({
					maxuser: Number(app.eData(e).num)
				});
			},
			toHideDialog: function () {
				this.setData({
					showDialog: false
				});
			},
			toConfirmDialog: function () {
				let _this = this,
					data = this.getData().data,
					ismaster_maxuser = this.getData().ismaster_maxuser,
					options = this.getData().options,
					maxuser = this.getData().maxuser,
					isUpdateNum = this.getData().isUpdateNum,
					formList = [];
				app.each(data.formList, function (i, item) {
					if (item.active == 1) {
						formList.push(item.title);
					};
				});
				console.log(formList);
				if (isUpdateNum) {
					if (data.limituser && data.joinnum - ismaster_maxuser + maxuser > data.limituser) {
						app.tips('报名人数上限，最多' + (data.limituser - data.joinnum + ismaster_maxuser) + '人');
					} else {
						app.request('//clubapi/updateActivityJoinnum', {
							id: options.id,
							joinnum: maxuser || 1,
							formList: formList
						}, function () {
							app.tips('修改成功', 'success');
							wx.pageScrollTo({
								scrollTop: 1
							});
							_this.load();
							_this.setData({
								'userForm.page': 1
							});
							_this.getJoinUserList();
							_this.toHideDialog();
						});
					};
				} else {
					if (data.limituser && data.joinnum + maxuser > data.limituser) {
						app.tips('报名人数上限，最多' + (data.limituser - data.joinnum) + '人');
					} else if(data.mustpay == 1) { //需要支付
						app.navTo('../../club/client_activityTicket/client_activityTicket?id=' + options.id);
					} else {
						app.request('//clubapi/applyFreeActivity', {
							id: options.id,
							maxuser: maxuser || 1,
							formList: formList
						}, function () {
							app.tips('报名成功', 'success');
							wx.pageScrollTo({
								scrollTop: 1
							});
							_this.load();
							_this.setData({
								'userForm.page': 1
							});
							_this.getJoinUserList();
							_this.toHideDialog();
						});
					};
				};
			},
			toLogin: function () {
				let _this = this;
				app.userLogining = false;
				app.userLogin({
					success: function () {
						_this.setData({
							isUserLogin: true
						});
					}
				});
			},
			checkLogin:function(callback){
				let _this = this;
				if(app.checkUser()){
					callback();
				}else{
					app.confirm({
						content:'您还没有登录',
						confirmText:'立即登录',
						success:function(res){
							if(res.confirm){
								app.userLogining = false;
								app.userLogin({
									success: function (){
										app.tips('登录成功','success');
										_this.setData({isUserLogin:true});
										callback();
									}
								});
							};
						}
					});
				};
			},
			changeFormList: function (e) {
				let index = Number(app.eData(e).index),
					formList = this.getData().data.formList;
				formList[index].active = formList[index].active == 1 ? 0 : 1;
				this.setData({
					'data.formList': formList
				});
			},
			toMyTicket: function () {
				let options = this.getData().options;
				this.stopInterval();
				if(options.clubid||options.joinclubid){
					app.navTo('../../activity/ticketMy/ticketMy?id='+ options.id+'&clubid='+(options.clubid||options.joinclubid));
				}else{
					app.navTo('../../activity/ticketMy/ticketMy?id='+ options.id);
				};
			},
			toEndTicket:function(){
				let options = this.getData().options;
				this.stopInterval();
				//已结束的，不显示购买门票按钮
				app.navTo('../../activity/ticketMy/ticketMy?hideAdd=1&id='+ options.id);
			},
			//导航
			openLocation: function (e) {
				let address = app.eData(e).address;
				//根据地址获取经纬度
				var QQMapWX = require('../../../static/js/qqmap-wx-jssdk.min.js');
				var myAmapFun = new QQMapWX({
					key: 'GE2BZ-GNDHF-DPMJR-N32JG-7VYD3-B3BLY'
				});
				myAmapFun.geocoder({
					address: address,
					success: function (data) {
						if (data.result && data.result.location) {
							wx.openLocation({
								longitude: Number(data.result.location.lng),
								latitude: Number(data.result.location.lat),
								name: address
							});
						} else {
							app.tips('获取导航结果失败', 'error');
						};
					},
					fail: function (info) {
						app.tips('获取导航结果失败', 'error');
						console.log(app.toJSON(info));
					}
				});
			},
			viewImage: function (e) { //查看多张图片
				let _this = this,
					data = this.getData().data,
					index = Number(app.eData(e).index),
					viewSrc = [],
					files = data.pics;
				app.each(files, function (i, item) {
					viewSrc.push(item.split('?')[0]);
				});
				app.previewImage({
					current: viewSrc[index],
					urls: viewSrc
				})
			},
			viewThisImage: function (e) { //查看单张图片
				let _this = this,
					pic = app.eData(e).pic;
				pic = pic.split('?')[0];
				app.previewImage({
					current: pic,
					urls: [pic]
				})
			},
			toEdit:function(){
				let _this = this,
					data = this.getData().data;
				app.navTo('../../activity/add/add?id='+data._id);
			},
			toDel:function(){
				let _this = this,
					data = this.getData().data;
				app.actionSheet(['下架','删除'],function(res){
					switch(res){
						case 0:
						app.confirm('确定要下架吗？',function(){
							app.request('//activityapi/updateActivityStatus',{id:data._id,showstatus:0},function(){
								app.tips('下架成功','success');
								data.showstatus = 0;
								_this.setData({data:data});
							});
						});
						break;
						case 1:
						app.confirm('确定要删除吗？',function(){
							app.request('//activityapi/delMyActivity',{id:data._id},function(){
								app.tips('删除成功','success');
								setTimeout(app.navBack,800);
							});
						});
						break;
					};
				});
			},
			toUp:function(){//上架活动	
				let _this = this,
					data = this.getData().data;
				app.request('//activityapi/updateActivityStatus',{id:data._id,showstatus:1},function(){
					app.tips('上架成功','success');
					data.showstatus = 1;
					_this.setData({data:data});
				});
			},
			toUserDetail:function(e){
				if(app.eData(e).id){
					app.navTo('../../user/businessCard/businessCard?id='+app.eData(e).id);
				};
			},
			toClubDetail:function(e){
				if(app.eData(e).id){
					app.navTo('../../suboffice/clubDetail/clubDetail?id='+app.eData(e).id);
				};
			},
			toFreeInvite:function(){//获取免费邀请key
				let _this = this,
					options = this.getData().options;
				app.request('//activityapi/createFreeCode',{id:options.id},function(res){
					if(res.code){
						_this.setData({
							'inviteDialog.show':true,
							'inviteDialog.freecode':res.code,
						});
						_this.setShareData();
					}else{
						app.tips('获取失败，稍后再试','error');
					};
				});
			},
			toCloseInvite:function(){
				this.setData({
					'inviteDialog.show':false,
					'inviteDialog.freecode':'',
				});
				setTimeout(this.setShareData,2000);
			},
			setShareData:function(){
				let _this = this,
					sharepic = '',
					data = this.getData().data,
					inviteDialog = this.getData().inviteDialog,
					options = this.getData().options,
					newData = {
						id: options.id,
						pocode: app.storage.get('pocode'),
						freecode:inviteDialog.freecode,
					},
					pathUrl = app.mixURL('/p/activity/detail/detail', newData);
				if (app.config.client == 'wx') {
					sharepic = data.miniwxsharepic||data.pic
				} else {
					sharepic = data.h5sharepic||data.pic
				};
				if(options.clubid){//用长id去获取短的id进行分享
					app.request('//clubapi/getClubBasicinfo',{id:options.clubid},function(res){
						pathUrl = pathUrl+'&clubid='+res.shortid;
						let pageURL = '../../user/getSharePic/getSharePic?type=activity&id='+(data.shortid||data._id)+'&clubid='+res.shortid+'&client='+app.config.client;
						if(app.config.client=='wx'){
							pageURL = '../../home/webview/webview?url=https://' + app.config.domain + '/p/user/getSharePic/getSharePic&type=activity&id='+(data.shortid||data._id)+'&clubid='+res.shortid+'&client=wx';
						};
						let shareData = {
								shareData: {
									title: data.name||data.title,
									content: data.describe,
									path: 'https://' + app.config.domain + pathUrl,
									pagePath: pathUrl,
									img: sharepic,
									imageUrl: sharepic,
									weixinH5Image: sharepic,
								},
								loadPicData:{
									pageURL:pageURL
								},
								loadCodeData: {
									ajaxURL: '//homeapi/getUserWxpic',
									requestData: {
										url:'p/activity/detail/detail',
										scene:data.shortid+'_'+app.storage.get('pocode')+'_'+res.shortid,
									}
								}
							},
							reSetData = function () {
								setTimeout(function () {
									if (_this.selectComponent('#newShareCon')) {
										_this.selectComponent('#newShareCon').reSetData(shareData);
									} else {
										reSetData();
									};
								}, 500);
							};
						reSetData();
					});
				}else{
					let pageURL = '../../user/getSharePic/getSharePic?type=activity&id='+(data.shortid||data._id)+'&client='+app.config.client;
					if(app.config.client=='wx'){
						pageURL = '../../home/webview/webview?url=https://' + app.config.domain + '/p/user/getSharePic/getSharePic&type=activity&id='+(data.shortid||data._id)+'&client=wx';
					};
					let shareData = {
							shareData: {
								title: data.name||data.title,
								content: data.describe,
								path: 'https://' + app.config.domain + pathUrl,
								pagePath: pathUrl,
								img: sharepic,
								imageUrl: sharepic,
								weixinH5Image: sharepic,
							},
							loadPicData:{
								pageURL:pageURL
							},
							loadCodeData: {
								ajaxURL: '//homeapi/getUserWxpic',
								requestData: {
									url:'p/activity/detail/detail',
									scene:data.shortid+'_'+app.storage.get('pocode'),
								}
							}
						},
						reSetData = function () {
							setTimeout(function () {
								if (_this.selectComponent('#newShareCon')) {
									_this.selectComponent('#newShareCon').reSetData(shareData);
								} else {
									reSetData();
								};
							}, 500);
						};
					reSetData();
				};
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
						_this.setData({
							'userInfo.username':showEditInfoDialog.username,
							'userInfo.headpic':app.image.crop(showEditInfoDialog.headpic,60,60),
						});
						_this.toHideEditInfoDialog();
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
			toSendTickets:function(){
				let data = this.getData().data;
				app.navTo('../../activity/ticketSend/ticketSend?id='+data._id);
			},
			viewImage: function (e) {//查看动态图
				let _this = this,
					dynamicList = this.getData().dynamicList,
					parent = Number(app.eData(e).parent),
					index = Number(app.eData(e).index),
					viewSrc = [],
					files = dynamicList[parent].pics;
				app.each(files, function (i, item) {
					viewSrc.push(item.file);
				});
				app.previewImage({
					current: viewSrc[index],
					urls: viewSrc
				})
			},
			viewDynamicVideo: function (e) {//播放视频
				let _this = this,
					index = Number(app.eData(e).index),
					data = this.getData().dynamicList,
					videoFile = data[index].videos;
				if(app.config.client=='wx'){
					let myVideo = wx.createVideoContext("myVideo_"+index);
					myVideo.requestFullScreen();
					if(videoFile.status){
						videoFile.status = 0;
						myVideo.pause();
					}else{
						videoFile.status = 1;
						myVideo.play();
					};
					//暂停其他视频
					app.each(data,function(i,item){
						if(i!=index&&item.videoFile&&item.videoFile.file&&item.videoFile.status){
							item.videoFile.status = 0;
							let newVideo = wx.createVideoContext("myVideo_"+i);
							newVideo.pause();
						};
					});
					this.setData({dynamicList:data});
				}else{
					this.selectComponent('#videoPlay').openVideo({
						title: videoFile.title || '',
						src: videoFile.file,
						poster: videoFile.pic,
					});
				};
			},
			fullScreenChange:function(e){//全屏/退出全屏
				let _this = this,
					index = Number(app.eData(e).index),
					data = this.getData().dynamicList,
					videoFile = data[index].videos,
					myVideo = wx.createVideoContext("myVideo_"+index);
				if(e.detail.fullScreen){//当前是全屏
					videoFile.status = 1;
					myVideo.play();
				}else{
					videoFile.status = 0;
					myVideo.pause();
				};
				this.setData({dynamicList:data});
			},
			toUserDetail:function(e){
				if(app.eData(e).id){
					app.navTo('../../user/businessCard/businessCard?id='+app.eData(e).id);
				};
			},
			delThisDynamic:function(e){//删除评价
				let _this = this,
					dynamicList = this.getData().dynamicList,
					index = Number(app.eData(e).index);
				app.confirm('确定要删除这条评价吗',function(){
					//删除动态//homeapi/delMyDynamic
					app.request('//activityapi/delActivityComment',{id:dynamicList[index].id},function(){
						dynamicList.splice(index,1);
						_this.setData({
							dynamicList:dynamicList,
							dynamicCount:_this.getData().dynamicCount-1,
						});
					});
				});
			},
			hideThisDynamic:function(e){
				let _this = this,
					dynamicList = this.getData().dynamicList,
					index = Number(app.eData(e).index);
				app.request('//homeapi/updateShowStatus',{id:dynamicList[index].id,status:0},function(){
					app.tips('操作成功','success');
					dynamicList[index].showstatus = 0;
					_this.setData({dynamicList:dynamicList});
				});
			},
			showThisDynamic:function(e){
				let _this = this,
					dynamicList = this.getData().dynamicList,
					index = Number(app.eData(e).index);
				app.request('//homeapi/updateShowStatus',{id:dynamicList[index].id,status:1},function(){
					app.tips('操作成功','success');
					dynamicList[index].showstatus = 1;
					_this.setData({dynamicList:dynamicList});
				});
			},
			changeShowType:function(e){
				let _this = this;
				this.setData({
					showDetailType:app.eData(e).type
				});
				if(app.eData(e).type=='content'){
					if(app.config.client=='wx'){
						const query = wx.createSelectorQuery().in(_this);
						query.select('#divContent').boundingClientRect((res) => {
							if (res) {
								wx.pageScrollTo({
									scrollTop:res.top,
									duration:500
								});
							}
						}).exec();
					}else{
						document.getElementById('divContent').scrollIntoView({
							behavior:'smooth'//设置滚动行为为平滑滚动，若不想要平滑滚动可使用 'auto'
						});
					};
				}else if(app.eData(e).type=='dynamic'){
					if(app.config.client=='wx'){
						const query = wx.createSelectorQuery().in(_this);
						query.select('#divDynamic').boundingClientRect((res) => {
							if (res) {
								wx.pageScrollTo({
									scrollTop:res.top,
									duration:500
								});
							}
						}).exec();
					}else{
						document.getElementById('divDynamic').scrollIntoView({
							behavior:'smooth'//设置滚动行为为平滑滚动，若不想要平滑滚动可使用 'auto'
						});
					};
				}else if(app.eData(e).type=='gift'){
					if(app.config.client=='wx'){
						const query = wx.createSelectorQuery().in(_this);
						query.select('#divGift').boundingClientRect((res) => {
							if (res) {
								wx.pageScrollTo({
									scrollTop:res.top,
									duration:500
								});
							}
						}).exec();
					}else{
						document.getElementById('divGift').scrollIntoView({
							behavior:'smooth'//设置滚动行为为平滑滚动，若不想要平滑滚动可使用 'auto'
						});
					};
				};
			},
			toCopy:function(){//再次发布活动
				let _this = this,
					data = this.getData().data;
				app.confirm('确定再次发布吗?',function(){
					app.request('//activityapi/copyActivity',{id:data._id},function(res){
						if(res.id){
							app.navTo('../../activity/add/add?id='+res.id+'&toDetail=1');
						};
					});
				});
			},
			changeCodeType:function(e){
				this.setData({
					showCodeType:app.eData(e).type
				});
			},
			toOtherActivity:function(e){//打开其他活动详情
				let id = app.eData(e).id,
					data = this.getData().data;
				if(id!=data._id){
					app.navTo('../../activity/detail/detail?id='+id);
				};
			},
			getGiftList:function(){//获取送礼记录
				let _this = this,
					data = this.getData().data;
				app.request('//activityapi/getActivityGiftlist',{activityid:data._id,page:1,size:30},function(res){
					if(res.data&&res.data.length){
						app.each(res.data,function(i,item){
							item.headpic = app.image.crop(item.headpic,40,40);
							item.pic = app.image.crop(item.pic,45,45);
						});
						_this.setData({
							activityGiftList:res.data,
							activityGiftCount:res.count,
						});
					}else{
						_this.setData({
							activityGiftList:[],
							activityGiftCount:0,
						});
					};
				});
			},
			toHideGiftDialog:function(){//关闭礼物弹框
				this.setData({'giftDialog.show':false});
			},
			toSendGift:function(){//我要送礼
				let _this = this,
					giftDialog = this.getData().giftDialog;
				this.checkLogin(function(){
					//获取钻石余额
					app.request('//diamondapi/getMyDiamond',{},function(res){
						_this.setData({
							'giftDialog.balance':res.balance,
						});
						if(giftDialog.data&&giftDialog.data.length){
							_this.setData({
								'giftDialog.show':true,
							});
						}else{
							app.request('//set/get',{type:'activitygift'},function(res){
								if(res.data&&res.data.length){
									app.each(res.data,function(i,item){
										item.pic = app.image.crop(item.pic,60,60);
										item.selectCount = 0;
									});
									_this.setData({
										'giftDialog.data':res.data,
										'giftDialog.show':true,
									});
								};
							});
						};
					});
				});
			},
			selectThisGift:function(e){
				let _this = this,
					id = app.eData(e).id,
					index = Number(app.eData(e).index),
					data = this.getData().giftDialog.data,
					total = 0;
				app.each(data,function(i,item){
					if(id==item.giftid){
						item.selectCount = item.selectCount?item.selectCount+1:1;
						total = item.diamond*item.selectCount;
					}else{
						item.selectCount = 0;
					};
				});
				this.setData({
					'giftDialog.data':data,
					'giftDialog.num':data[index].selectCount,
					'giftDialog.total':Number(app.getPrice(total)),
					'giftDialog.giftid':id,
				});
			},
			changeGiftNum:function(e){
				let type = app.eData(e).type,
					index = Number(app.eData(e).index),
					total = 0,
					data = this.getData().giftDialog.data;
				if(app.config.client!='wx'){
					e.preventDefault();
				};
				if(type=='reduce'){
					data[index].selectCount = data[index].selectCount - 1;
				}else if(type=='add'){
					data[index].selectCount = data[index].selectCount + 1;
				};
				if(data[index].selectCount<0){
					data[index].selectCount = 0;
				};
				total = data[index].selectCount * data[index].diamond;
				this.setData({
					'giftDialog.data':data,
					'giftDialog.num':data[index].selectCount,
					'giftDialog.total':Number(app.getPrice(total)),
				});
			},
			toSubmitGift:function(){
				let _this = this,
					data = this.getData().data,
					giftDialog = this.getData().giftDialog,
					msg = '';
				if(!giftDialog.giftid||!giftDialog.num){
					msg = '请选择礼物';
				};
				if(msg){
					app.tips(msg,'error');
				}else{
					app.confirm('此次赠送将花费'+giftDialog.total+'钻石，确定赠送吗？',function(){
						app.request('//activityapi/sendActivityGift',{
							activityid:data._id,
							giftid:giftDialog.giftid,
							giftnum:giftDialog.num,
						},function(res){
							if(res.status==1){
								app.tips('赠送成功','success');
								_this.toHideGiftDialog();
								_this.getGiftList();
							}else{
								app.tips('钻石余额不足','error');
							};
						});
					});
				};
			},
			toJoinInfo:function(){
				let data = this.getData().data;
				app.navTo('../../activity/submitInfo/submitInfo?id='+data._id);
			},
			addJoinclub:function(){
				let _this = this,
					data = this.getData().data,
					selectIds = [],
					joinclubList = data.joinclubList,
					url = '../../suboffice/clubSelect/clubSelect',
					urlData = {};
				if(joinclubList.length){
					app.each(joinclubList,function(i,item){
						selectIds.push(item._id);
					});
				};
				if(data.clubid){
					urlData['clubid'] = data.clubid;
				};
				if(selectIds.length){
					urlData['selectIds'] = selectIds.join(',');
				};
				this.dialog({
					title:'选择俱乐部',
					url:app.mixURL(url,urlData),
					success:function(res){
						if(res&&res.length){
							let ids = [];
							app.each(res,function(i,item){
								ids.push(item._id);
							});
							app.request('//activityapi/updateActivity',{id:data._id,joinclubids:ids},function(){
								app.tips('设置成功','success');
								_this.load();
							});
						}else{
							app.request('//activityapi/updateActivity',{id:data._id,joinclubids:''},function(){
								app.tips('设置成功','success');
								_this.load();
							});
						};
					},
				});
			},
			joinclubMoreSet:function(e){//点击联办方
				let _this = this,
					index = Number(app.eData(e).index),
					data = this.getData().data,
					joinclubList = data.joinclubList,
					id = joinclubList[index]._id;
				if(data.ismy==1){
					app.actionSheet(['查看俱乐部','移除联办'],function(res){
						switch(res){
							case 0:
							app.navTo('../../suboffice/clubDetail/clubDetail?id='+id);
							break;
							case 1:
							joinclubList.splice(index,1);
							let ids = [];
							if(joinclubList&&joinclubList.length){
								app.each(joinclubList,function(a,b){
									ids.push(b._id);
								});
							}else{
								ids = '';
							};
							app.request('//activityapi/updateActivity',{id:data._id,joinclubids:ids},function(){
								app.tips('移除成功','success');
								_this.load();
							});
							break;
						};
					});
				}else{
					app.navTo('../../suboffice/clubDetail/clubDetail?id='+id);
				};
			},
			backIndex: function () {
				app.switchTab({
					url: '../../home/index/index'
				});
			},
		}
	});
})();