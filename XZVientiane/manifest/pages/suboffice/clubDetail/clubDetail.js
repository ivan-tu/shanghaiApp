/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'suboffice-clubDetail',
        data: {
            systemId: 'suboffice',
            moduleId: 'clubDetail',
            data: {},
            options: {},
            settings: {},
            form: {
				page:1,
				size:10,
				clubid:'',
			},
			isUserLogin:app.checkUser(),
			client:app.config.client,
			ajaxLoading:true,
			ajaxNoData:false,
			showLoading:false,
			showNoData:false,
			userPicWidth:((app.system.windowWidth>480?480:app.system.windowWidth)-70)/5,
			userlist:[],
			activitylist:[],
			dynamicList:[],
			pageCount:0,
			dynamicPicW_a:Math.floor(((app.system.windowWidth>480?480:app.system.windowWidth)-35-45)/2),
			dynamicPicH_a:Math.floor(((app.system.windowWidth>480?480:app.system.windowWidth)-35-45)/2*1.1),
			dynamicPicW_b:Math.floor(((app.system.windowWidth>480?480:app.system.windowWidth)-40-45)/3),
			dynamicPicH_b:Math.floor(((app.system.windowWidth>480?480:app.system.windowWidth)-40-45)/3*1.1),
			applyForm:{
				show:false,
				content:'',
			},
			firstLoad:true,//是否第一次加载
			levelList:[],//全部会员等级
			freeLevelId:'',//免费的会员等级
			joinFormData:{
				levelid:'',
				parentAccount:'',
				clubid:'',
			},
			checkParentDialog:{
				show:false,
				height:200,
				parentData:{},
				edit:0,//0-没修改，1-修改中，2-已修改
				account:'',
			},
			summaryControl:{
				height:40,
				showMore:false,//是否显示更多
				showReal:false,//是否显示全部
			},
			goodsList:[],//商品列表
			goodsPicWidth:Math.floor(((app.system.windowWidth>480?480:app.system.windowWidth)-40)/2),
			goodsPicHeight:Math.floor(((app.system.windowWidth>480?480:app.system.windowWidth)-40)/2),
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
				if (app.config.client == 'wx' && options.scene) {
					let scenes = options.scene.split('_');
					options.id = scenes[0];
					if(scenes.length>1){
						app.session.set('vcode', scenes[1]);
					};
					delete options.scene;
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
            },
			onShow:function(){
				//检查用户登录状态
				let _this = this,
					isUserLogin = app.checkUser(),
					data = this.getData().data;
				if(!this.getData().firstLoad&&data._id){//返回到页面重新设置分享，避免错串
					this.setShareData();
				};
				if (isUserLogin != this.getData().isUserLogin) {
					this.setData({
						isUserLogin: isUserLogin
					});
					if(isUserLogin){
						this.load();
					};
				}else if(app.storage.get('paySuccess')==1){
					app.storage.remove('paySuccessType');
					app.storage.remove('paySuccess');
					this.load();
				}else if(app.storage.get('pageReoload')==1){
					app.storage.remove('pageReoload');
					this.load();
				};
			},
            onPullDownRefresh: function() {
				if(this.getData().isUserLogin){
					this.load();
				};
                wx.stopPullDownRefresh();
            },
            load: function() {
				let _this = this,
					options = this.getData().options;
				this.setData({ajaxLoading:true});
				app.request('//clubapi/getClubDetail',{id:options.id},function(res){
					if(res._id){
						//是管理员并且没弹出过提醒
						if(res.ismy==1){
							let alertArray = app.storage.get('alertArray')||{};
							if(alertArray.clubManageTips!=1){//没弹出过
								app.request('//set/get', {type: 'tipsSet'}, function (res) {
									let backData = res.data||{};
									if (backData.clubManageTips){
										app.alert({
											content:backData.clubManageTips,
											confirmText:'我知道了',
											success:function(){
												alertArray.clubManageTips = 1;
												app.storage.set('alertArray',alertArray);
											},
										});
									};
								});
							};
						};
						res.activity_sharepic = app.image.crop(res.pic,480,480);
						res.pic = app.image.crop(res.pic,80,80);
						if(res.activityList&&res.activityList.data.length){
							app.each(res.activityList.data,function(i,item){
								item.masterpic = app.image.crop(item.masterpic,30,30);
								item.pic = app.image.crop(item.pic,120,96);
								item.areaText = (item.area&&item.area.length)?item.area[1]+'-'+item.area[2]:'';
								if(item.bDate){
									item.bDate = item.bDate.split('-');
									item.bDate = item.bDate[1]+'.'+item.bDate[2];
								};
							});
							_this.setData({
								activitylist:res.activityList.data
							});
						};
						if(res.userList&&res.userList.data.length){
							app.each(res.userList.data,function(i,item){
								item.headpic = app.image.crop(item.headpic,_this.getData().userPicWidth,_this.getData().userPicWidth);
							});
							_this.setData({
								userlist:res.userList.data
							});
						};
						_this.setData({
							data:res,
							firstLoad:false,
							'options.id':res._id,
							'form.clubid':res._id,
							ajaxNoData:false,
						});
						
						//检测简介是否过高
						setTimeout(function(){
							if(app.config.client=='wx'){
								wx.createSelectorQuery().in(_this).select('#summaryContent').boundingClientRect(function(rect) {
									if(rect&&rect.height>=42){
										_this.setData({
											'summaryControl.showReal':false,
											'summaryControl.showMore':true,
										});
									}else{
										_this.setData({
											'summaryControl.showReal':true,
											'summaryControl.showMore':false,
										});
									};
								}).exec();
							}else{
								if(document.getElementById('summaryContent')&&document.getElementById('summaryContent').offsetHeight>=45){
									_this.setData({
										'summaryControl.showReal':false,
										'summaryControl.showMore':true,
									});
								}else{
									_this.setData({
										'summaryControl.showReal':false,
										'summaryControl.showMore':true,
									});
								};
							};
						},600);
						
						
						if(res.isjoin!=1){//没加入俱乐部的获取一下会员等级，检测是否有免费的，有的话就显示免费加入
							_this.getLevelList();
						};
						
						_this.setShareData();
						if(res.shopid){
							app.visitShop(res.shopid);
							_this.getGoodsList();//获取商品列表
						};
						if(res.showDynamic==1&&res.ismy!=1&&res.isjoin!=1){
							
						}else{
							_this.getDynamicList();
						};
					}else{
						_this.setData({ajaxNoData:true});
					};
				},'',function(){
					_this.setData({ajaxLoading:false});
				});
            },
			getLevelList:function(){//获取俱乐部会员等级
				let _this = this,
					options = this.getData().options;
				app.request('//clubapi/getClubsLevel',{clubid:options.id,sort:'taix'},function(res){
					if(res&&res.length){
						let freeLevelId = '';
						app.each(res,function(i,item){
							if(item.payUpgradeStatus==1&&!item.payUpgradePrice){
								freeLevelId = item._id;
							};
						});
						_this.setData({
							levelList:res,
							freeLevelId:freeLevelId,
						});
					}else{
						_this.setData({
							levelList:[],
							freeLevelId:''
						});
					};
				});
			},
			setShareData:function(){
				let _this = this,
					data = this.getData().data,
					options = this.getData().options,
					newData = {
						id: data._id,
						pocode: app.storage.get('pocode')
					},
					shareTitle = data.name;
				if(app.config.client=='wx'){
					shareTitle+='-'+data.slogan;
				};
				let pathUrl = app.mixURL('/p/suboffice/clubDetail/clubDetail', newData),
					shareData = {
						shareData: {
							title: shareTitle,
							content: data.slogan||'',
							path: 'https://' + app.config.domain + pathUrl,
							pagePath: pathUrl,
							img: data.activity_sharepic,
							imageUrl: data.activity_sharepic,
							weixinH5Image: data.activity_sharepic,
							wxid: 'gh_601692a29862',
							showMini: false,
							hideCopy: app.config.client=='wx'?true:false,
						},
						loadPicData: {
							ajaxURL: '//clubapi/getClubSharePic',
							requestData: {
								clubid:data._id
							}
						},
					},
					reSetData = function () {
						setTimeout(function () {
							if (_this.selectComponent('#newShareCon')) {
								if(!data.sharepic){
									shareData.loadPicData = '';
								};
								_this.selectComponent('#newShareCon').reSetData(shareData);
							} else {
								reSetData();
							};
						}, 500);
					};
				reSetData();
			},
			toChange:function(){
				let _this = this;
				app.confirm({
					title:'提示',
					content:'请确认一下当前是否您需要加入的俱乐部，每个用户可以修改一次。',
					confirmText:'去更换',
					success:function(req){
						if(req.confirm){
							app.navTo('../../suboffice/officeChange/officeChange');
						};
					},
				});
			},
			getDynamicList:function(loadMore){
				let _this = this,
					formData = _this.getData().form,
					pageCount = _this.getData().pageCount;
				if(loadMore){
					if (formData.page >= pageCount) {
						_this.setData({'settings.bottomLoad':false});
					};
				};
				_this.setData({'showLoading':true});
				app.request('//homeapi/getDynamicList',formData,function(backData){
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
					if(loadMore){
						list = _this.getData().dynamicList.concat(list);
					};
					_this.setData({
						dynamicList:list
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
					this.getDynamicList(true);
				};
			},
			toManage:function(){
				let data = this.getData().data;
				if(data.ismanager==1){
					app.navTo('../../suboffice/officeManage/officeManage?id='+data._id+'&type=manage');
				}else{
					app.navTo('../../suboffice/officeManage/officeManage?id='+data._id);
				};
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
				let options = this.getData().options;
				if(app.eData(e).id){
					app.navTo('../../user/businessCard/businessCard?id='+app.eData(e).id+'&clubid='+options.id);
				};
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
										_this.load();
										callback();
									}
								});
							};
						}
					});
				};
			},
			checkMember:function(title,callback){//检测是否会员
				let _this = this;
				app.request('//homeapi/getMyInfo',{},function(res){
					if(res.level>0){
						if(typeof callback == 'function'){
							callback(res);
						};
					}else{
						app.confirm({
							title:'您还不是会员',
							content:'需要开通会员才能'+title,
							confirmText:'去开通',
							success:function(req){
								if(req.confirm){
									app.navTo('../../user/upGrade/upGrade');
								};
							},
						});
					};
				});
			},
			toBuy:function(){
				let _this = this,
					data = this.getData().data,
					formData = this.getData().joinFormData,
					freeLevelId = this.getData().freeLevelId;
				formData.levelid = freeLevelId;
				formData.clubid = data._id;
				if(!freeLevelId){
					app.tips('缺少升级类型','error');
				}else{
					app.request('//clubapi/applyJoinClub',formData,function(res){
						if(res.ordernum){
							app.navTo('../../pay/pay/pay?ordertype=' + res.ordertype + '&ordernum=' + res.ordernum + '&total=' + res.paymoney+'&backStep=1&clubid='+formData.clubid);
						}else{
							app.tips('加入成功','success');
							_this.load();
						};
					});
				};
			},
			toCheckParent:function(){
				let _this = this,
					data = this.getData().data;
				app.request('//clubapi/getJoinParent',{clubid:data._id,vcode:app.session.get('vcode')||''},function(res){
					if(res&&res.canupdate!=1){//不能修改了
						_this.toBuy();
					}else{
						if(res&&res._id){
							if(res.headpic){
								res.headpic = app.image.crop(res.headpic,60,60);
							};
							_this.setData({
								'checkParentDialog.parentData':res,
								'checkParentDialog.show':true,
								'checkParentDialog.edit':0
							});
						}else{
							_this.setData({
								'checkParentDialog.parentData':'',
								'checkParentDialog.show':true,
								'checkParentDialog.edit':1
							});
						};
					};
				},function(){
					_this.setData({
						'checkParentDialog.parentData':'',
						'checkParentDialog.show':true,
						'checkParentDialog.edit':1
					});
				});
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
			checkAccount:function(){
				let _this = this,
					checkParentDialog = this.getData().checkParentDialog;
				if(!checkParentDialog.account){
					app.tips('请输入账号','error');
				}else{
					app.request('//userapi/getInfoByAccount',{account:checkParentDialog.account},function(res){
						if(res&&res._id){
							res.headpic = app.image.crop(res.headpic,60,60);
							res.account = checkParentDialog.account;
							_this.setData({
								'checkParentDialog.parentData':res,
								'checkParentDialog.edit':2
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
				if(!checkParentDialog.parentData||!checkParentDialog.parentData._id){
					msg = '请确认推荐人';
				};
				if(msg){
					app.tips(msg,'error');
				}else{
					_this.toHideCheckDialog();
					if(checkParentDialog.edit==2){
						_this.setData({'joinFormData.parentAccount':checkParentDialog.parentData.account});
						_this.toBuy();
					}else{
						_this.toBuy();
					};
				};
			},
			toCancelCheckDialog:function(){
				this.setData({'joinFormData.parentAccount':''});
				this.toBuy();
				this.toHideCheckDialog();
			},
			toApply:function(){//申请俱乐部
				let _this = this,
					data = this.getData().data;
				this.checkLogin(function(){
					//app.navTo('../../suboffice/upGradeList/upGradeList?clubid='+data._id);
					app.request('//clubapi/getJoinParent',{clubid:data._id,vcode:app.session.get('vcode')||''},function(res){
						if(res&&res.canupdate!=1){//不能修改了
							_this.toBuy();
						}else{
							if(res&&res._id){
								if(res.headpic){
									res.headpic = app.image.crop(res.headpic,60,60);
								};
								_this.setData({
									'checkParentDialog.parentData':res,
									'checkParentDialog.show':true,
									'checkParentDialog.edit':0
								});
							}else{
								_this.setData({
									'checkParentDialog.parentData':'',
									'checkParentDialog.show':true,
									'checkParentDialog.edit':1
								});
							};
						};
					},function(){
						_this.setData({
							'checkParentDialog.parentData':'',
							'checkParentDialog.show':true,
							'checkParentDialog.edit':1
						});
					});
				});
				/*this.checkLogin(function(){
					if(options.freekey){//免费key
						app.request('//clubapi/applyJoinClub',{clubid:options.id,content:'',freekey:options.freekey},function(res){
							_this.load();
							app.tips('加入成功','success');
						});
					}else if(data.joinPrice>0){//收费
						app.confirm({
							title:'提示',
							content:'该俱乐部为收费俱乐部，年费'+data.joinPrice+'元。',
							confirmText:'立即加入',
							success:function(req){
								if(req.confirm){
									if(data.joinVerify==1){//加入需要审核-填写理由
										_this.setData({
											'applyForm.show':true
										});
									}else{//不需要审核
										app.request('//clubapi/applyJoinClub',{clubid:options.id,content:''},function(res){
											_this.load();
											if(res.ordernum){
												app.navTo('../../pay/pay/pay?ordertype=' + res.ordertype + '&ordernum=' + res.ordernum + '&total=' + res.paymoney);
											}else{
												app.tips('申请成功','success');
											}
										});
									};
								};
							},
						});
					}else{//免费
						if(data.joinVerify==1){//加入需要审核-填写理由
							_this.setData({
								'applyForm.show':true
							});
						}else{//不需要审核
							app.request('//clubapi/applyJoinClub',{clubid:options.id,content:''},function(res){
								_this.load();
								if(res.ordernum){
									app.navTo('../../pay/pay/pay?ordertype=' + res.ordertype + '&ordernum=' + res.ordernum + '&total=' + res.paymoney);
								}else{
									app.tips('申请成功','success');
								}
							});
						};
					};
				});*/
			},
			toHideDialog:function(){
				this.setData({'applyForm.show':false});
			},
			toConfirmDialog:function(){
				let _this = this,
					data = this.getData().data,
					applyForm = this.getData().applyForm;
				if(!applyForm.content){
					app.tips('请输入您的申请理由','error');
				}else{
					app.request('//clubapi/applyJoinClub',{clubid:data._id,content:applyForm.content},function(res){
						_this.toHideDialog();
						_this.load();
						if(res.ordernum){
							app.navTo('../../pay/pay/pay?ordertype=' + res.ordertype + '&ordernum=' + res.ordernum + '&total=' + res.paymoney);
						}else{
							app.tips('申请成功','success');
						}
					});
				};
			},
			toExit:function(){//退出俱乐部
				let _this = this,
					data = this.getData().data;
				app.confirm({
					title:'提示',
					content:'退出后费用不退还，重新加入需再次付费',
					cancelText:'先不退出',
					confirmText:'确定退出',
					success:function(req){
						if(req.confirm){
							app.request('//clubapi/signoutClub',{clubid:data._id},function(){
								app.tips('退出成功','success');
								_this.load();
							});
						};
					},
				});
			},
			toPay:function(){//继续去支付
				let _this = this,
					data = this.getData().data;
				app.request('//clubapi/createJoinClubOrder',{clubid:data._id},function(res){
					if(res.ordernum){
						app.navTo('../../pay/pay/pay?ordertype=' + res.ordertype + '&ordernum=' + res.ordernum + '&total=' + res.paymoney);
					}else{
						app.tips('订单创建失败','error');
						_this.load();
					}
				});
			},
			publishDynamic:function(){//发布动态
				let _this = this,
					data = this.getData().data;
				app.navTo('../../dynamic/publish/publish?clubid='+data._id);
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
			viewThisImage: function (e) { //查看单张图片
				let _this = this,
					pic = app.eData(e).pic;
				pic = pic.split('?')[0];
				app.previewImage({
					current: pic,
					urls: [pic]
				})
			},
			toActivity:function(){//组局
				let _this = this,
					data = this.getData().data;
				app.navTo('../../activity/add/add?clubid='+data._id);
			},
			toMyInvite:function(){
				let _this = this,
					data = this.getData().data;
				app.navTo('../../suboffice/myInvite/myInvite?clubid='+data._id);
			},
			toMyLevel:function(){
				let _this = this,
					data = this.getData().data;
				app.navTo('../../suboffice/myLevelInfo/myLevelInfo?clubid='+data._id);
			},
			toClubPage:function(e){
				let _this = this,
					data = this.getData().data;
				switch(app.eData(e).type){
					case'showUser':
					if(data.showUser==1&&data.ismy!=1&&data.isjoin!=1&&data.ismanager!=1){
						app.alert('成员不对外开放，需加入俱乐部后才能查看');
					}else{
						app.navTo('../../suboffice/officeUserList/officeUserList?clubid='+data._id);
					};
					break;
					case'showActivity':
					if(data.showActivity==1&&data.ismy!=1&&data.isjoin!=1&&data.ismanager!=1){
						app.alert('活动不对外开放，需加入俱乐部后才能查看');
					}else if(data.ismy==1||data.ismanager==1){
						app.navTo('../../activity/list/list?joinclubid='+data._id+'&ismanager=1');
					}else{
						app.navTo('../../activity/list/list?joinclubid='+data._id);
					};
					break;
					case'showGoods':
					if(data.shopid){
						app.navTo('../../shop/index/index?id='+data.shopid);
					}else if(data.ismy==1){
						app.confirm({
							content:'还未开通店铺，是否前往开通',
							confirmText:'立即开通',
							success:function(req){
								if(req.confirm){
									app.navTo('../../manage/addShop/addShop?clubid='+data._id);
								};
							},
						});
					}else{
						app.tips('该俱乐部还未开通店铺','error');
					};
					break;
					case'showDynamic':
					if(data.showDynamic==1&&data.ismy!=1&&data.isjoin!=1&&data.ismanager!=1){
						app.alert('动态不对外开放，需加入俱乐部后才能查看');
					}else{
						if (app.config.client == 'wx') {
							wx.createSelectorQuery().in(_this).select('#dynamicHead').boundingClientRect(function(rect) {
								if (rect) {
									wx.pageScrollTo({
										scrollTop: rect.top,
										duration: 300
									});
								}
							}).exec();
						} else {
							if (document.getElementById('dynamicHead')) {
								document.getElementById('dynamicHead').scrollIntoView({
									behavior: 'smooth', // 滚动效果，可以是'smooth'（平滑滚动）或者'instant'（立即滚动）
									block: 'start' // 垂直对齐方式，可以是'start'（顶部对齐）、'center'（居中对齐）、'end'（底部对齐）等
								});
							};
						};
					};
					break;
				};
			},
			toShowMoreSummary:function(){//展示所有简介
				this.setData({
					'summaryControl.showMore':false,
					'summaryControl.showReal':true
				})
			},
			getGoodsList:function(){//获取商品列表	
				let _this = this;
				app.request('//vshopapi/getShopGoodsList',{page:1,size:4},function(res){
					if(res.data&&res.data.length){
						app.each(res.data,function(i,item){
							item.pic = app.image.crop(item.pic,_this.getData().goodsPicWidth,_this.getData().goodsPicWidth)
						});
						_this.setData({goodsList:res.data});
					}else{
						_this.setData({goodsList:[]});
					};
				});
			},
        }
    });
})();