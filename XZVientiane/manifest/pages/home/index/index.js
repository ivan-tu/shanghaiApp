/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'home-index',
        data: {
            systemId: 'home',
            moduleId: 'index',
            data: {},
            options: {},
            settings: {
				bottomLoad:false,
			},
            form: {
				page:1,
				size:10,
			},
			isUserLogin:app.checkUser(),
			client:app.config.client,
			showLoading:false,
			showNoData:false,
			count:0,
			pageCount:0,
			getType:'',
			userInfo:{},
			picWidth:120,//(app.system.windowWidth>480?480:app.system.windowWidth)-15,
			picHeight:96,//Math.ceil(((app.system.windowWidth>480?480:app.system.windowWidth)-15)*0.8),
			bannerWidth:(app.system.windowWidth>480?480:app.system.windowWidth)-15,
			bannerHeight:Math.ceil(((app.system.windowWidth>480?480:app.system.windowWidth)-15)*0.33333),
			bannerList:[],
			ingotDialog:{
				show:false,
				height:300,
				total:0,
				status:1,//1-成功了2-倒计时
				counDownTime:'00:00:00',
			},
			showCollect:false,
			showWxDialog:{
				show:false,
				height:360,
				pic:'https://statics.tuiya.cc/16875028214656539.jpg',
			},
			showWxGZHDialog:{
				show:false,
			},
			showEditInfoDialog:{
				show:false,
				height:250,
				avatarUrl:'',
				username:'',
				headpic:''
			},
			userList:[],//局友
			userForm:{
				page:1,
				size:3,
				recommend:'1',
				hot:'',
			},
			userPicWidth:((app.system.windowWidth>480?480:app.system.windowWidth)-30-20)/3,
			activityList:[],//友局
			activityForm:{
				page:1,
				size:10,
				recommend:'1',
				hot:'',
				gettype:'',//my获取我的
			},
			activityPicWidth:Math.ceil((app.system.windowWidth>480?480:app.system.windowWidth)-30),
			activityPicHeight:Math.ceil((app.system.windowWidth>480?480:app.system.windowWidth)-30),
			storeList:[],//友店
			storeForm:{
				page:1,
				size:4,
				recommend:'1',
				hot:'',
			},
			storePicWidth:((app.system.windowWidth>480?480:app.system.windowWidth)-30-10)/2,
			clubList:[],//俱乐部
			clubForm:{
				page:1,
				size:3,
				recommend:'1',
				sort:'',
			},
			clubPicWidth:((app.system.windowWidth>480?480:app.system.windowWidth)-30-20)/3,
			activityCategory:[],
			region:[],
			areaname:app.storage.get('areaname')||'上海市',
			showDate:false,
			daysColor:[{
				month:'current',
				day:'10',
				color:'#cc0000',
				background:'',
			}],
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
				if (app.config.client == 'wx' && options.scene) {
					let scenes = options.scene.split('_');
					app.session.set('vcode', scenes[0]);
					delete options.scene;
				};
				_this.setData({
					options: options
				});
				this.load();
				this.getPosition();
				let newData = app.extend({}, options);
				newData = app.extend(newData, {
					pocode: app.storage.get('pocode')
				});
				let pathUrl = app.mixURL('/p/home/index/index', newData), 
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
				
				if(app.config.client=='wx'){
					let alertArray = app.storage.get('alertArray')||{};
					if(!alertArray||alertArray.collectTip!=1){
						_this.setData({showCollect:true});
					};
				};
            },
			onShow:function(){
				//检查用户登录状态
				let isUserLogin = app.checkUser();
				if (isUserLogin != this.getData().isUserLogin) {
					this.setData({
						isUserLogin: isUserLogin
					});
					this.load();
				}else if(app.storage.get('areaname')&&app.storage.get('areaname')!=this.getData().areaname){
					this.setData({
						areaname:app.storage.get('areaname')
					})
					this.load();
				}else if(app.storage.get('pageReoload')==1){
					app.storage.remove('pageReoload');
					this.load();
				};
			},
            onPullDownRefresh: function() {
				this.setData({
					'form.page':1,
					'activityForm.page':1,
					'userForm.page':1,
					'storeForm.page':1,
					'clubForm.page':1,
				});
                this.load();
                wx.stopPullDownRefresh();
            },
            load: function(){
				let _this = this,
					isUserLogin = this.getData().isUserLogin;
				if(isUserLogin){
					app.request('//homeapi/getMyInfo', {}, function(res){
						res.headpic = res.headpic||'16872518696971749.png';
						_this.setData({
							'showEditInfoDialog.avatarUrl':app.image.crop(res.headpic,60,60),
							'showEditInfoDialog.username':res.username,
							'showEditInfoDialog.headpic':res.headpic,
						});
						if (app.config.client!='wx') {
							_this.selectComponent('#uploadPic').reset(res.headpic);
						};
						res.headpic = app.image.crop(res.headpic||'16872518696971749.png', 60, 60);
						_this.setData({
							userInfo:res
						});
						if(res.invitationNum){
							app.storage.set('pocode',res.invitationNum);
						};
						if(res.username=='微信用户'||res.username.indexOf('hi3')==0||res.headpic.indexOf('16872518696971749.png')>=0){
							//_this.toShowEditInfoDialog();
						}else{
							/*let alertArray = app.storage.get('alertArray')||{};
							if(res.issubwx!=1&&alertArray.issubwx!=1){//未关注公众号，并且没弹出过
								_this.setData({
									'showWxDialog.show':true
								});
							};*/
						};
					});
				};
				app.request('//set/get', {type: 'homeSet'}, function (res) {
					let backData = res.data||{};
					let alertArray = app.storage.get('alertArray')||{},
						wxVersion = app.config.wxVersion;
					backData.wxVersion = backData.wxVersion?Number(backData.wxVersion):1;
					if(wxVersion>backData.wxVersion&&backData.showGZH==1&&alertArray.issubwx!=1){
						_this.setData({
							'showWxGZHDialog.show':true
						});
					};
					if(res.data&&res.data.banner&&res.data.banner.length){
						app.each(res.data.banner,function(i,item){
							item.pic = app.image.crop(item.pic, _this.getData().bannerWidth, _this.getData().bannerHeight);
						});
						_this.setData({bannerList:res.data.banner});
						if (app.config.client != 'wx') {
							let swiperJs = xzSystem.getSystemDist('assets') + 'js/swiper.js',
								swiperCss = xzSystem.getSystemDist('assets') + 'css/swiper.css';
							xzSystem.loadSrcs([swiperJs, swiperCss], function () {
								var mySwiper_banner = new Swiper('#swiperBanner', {
									pagination: '#swiperBanner .pagination',
									paginationClickable: true,
									grabCursor: true,
									resizeReInit: true,
									loop: true,
									slidesPerView: 1,
									calculateHeight: true,
									autoplay: res.data.banner.length>1?3000:false,
									speed: 1000,
									autoplayDisableOnInteraction: false,
								})
							});
						};
					}else{
						_this.setData({bannerList:[]});
					};
				});
				app.request('//set/get', {type: 'activityCategory'}, function (res) {
					if(res.list&&res.list.length){
						_this.setData({
							activityCategory: res.list
						});
					};
				});
				//this.getActivityList();
				//this.getClubList();
				//this.getStoreList();
				this.getList();
            },
			bindRegionChange:function(res){
				let value = res.detail.value;
                this.setData({
					'form.page':1,
                    region: res.detail.value,
					'areaname':value[1],
                });
				app.storage.set('areaname',value[1]);
				this.load();
            },
			screenType:function(e){
				this.setData({
					'form.page':1,
					getType:app.eData(e).type,
				});
				this.getList();
			},
			getList:function(loadMore){
				let _this = this,
					formData = _this.getData().activityForm,
					pageCount = _this.getData().pageCount;
				if(loadMore){
					if (formData.page >= pageCount) {
						_this.setData({'settings.bottomLoad':false});
					};
				};
				_this.setData({'showLoading':true});
				formData.areaname = _this.getData().areaname;
				//activityapi/getHomeActivityList
				//activityapi/getActivityList
				app.request('//activityapi/getHomeActivityList',formData,function(backData){
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
							if(item.clubData){
								item.clubData.pic = app.image.crop(item.clubData.pic,45,45);
							};
							if(item.masterpic){
								item.masterpic = app.image.crop(item.masterpic,45,45);
							};
							/*let picsArray = [];
							if(item.pics&&item.pics.length){
								app.each(item.pics,function(a,b){
									picsArray.push({
										file:app.config.filePath+''+b,
										src:app.image.crop(b,_this.getData().activityPicWidth,_this.getData().activityPicHeight),
									});
								});
							}else{
								picsArray.push({
									file:app.config.filePath+''+item.pic,
									src:app.image.crop(item.pic,_this.getData().activityPicWidth,_this.getData().activityPicHeight),
								});
							};
							item.pics = picsArray;*/
							if(item.pic){
								item.pic = app.image.crop(item.pic,_this.getData().activityPicWidth,_this.getData().activityPicHeight);
							};
							if(item.joinlist&&item.joinlist.data){
								app.each(item.joinlist.data,function(a,b){
									item.joinlist.data[a].headpic = app.image.crop(b.headpic,20,20);
								});
							};
						});
					};
					if(loadMore){
						list = _this.getData().activityList.concat(list);
					};
					_this.setData({
						activityList:list,
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
					let activityForm = this.getData().activityForm;
					activityForm.page++;
					this.setData({activityForm:activityForm});
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
			toLogin:function(){
				let _this = this;
				app.userLogining = false;
				app.userLogin({
					success: function (){
						app.tips('登录成功','success');
						_this.setData({isUserLogin:true});
						_this.load();
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
			toPage:function(e){
				let _this = this,
					type = app.eData(e).type,
					page = app.eData(e).page;
				if(type==2){
					app.switchTab({url:page});
				}else{
					app.navTo(page);
				};	
			},
			toLoginPage:function(e){
				let _this = this,
					page = app.eData(e).page;
				if(page){
					this.checkLogin(function(){
						app.navTo(page);
					});
				};	
			},
			toAddActivity:function(){
				let _this = this;
				this.checkLogin(function(){
					app.request('//clubapi/getMyClubs',{},function(res){
						if(res.myclubs&&res.myclubs.length){
							app.confirm({
								title:'提示',
								content:'本次组局收入结算到个人账户，组局收入要结算到俱乐部账户，去俱乐部管理页面发布组局',
								confirmText:'去俱乐部',
								cancelText:'个人组局',
								success:function(req){
									if(req.confirm){
										app.switchTab({
											url:'../../suboffice/index/index'
										});
									}else{
										_this.checkMember('发起组局',function(){
											app.navTo('../../activity/add/add');
										});
									};
								},
							});
						}else{
							_this.checkMember('发起组局',function(){
								app.navTo('../../activity/add/add');
							});
						};
					},function(){
						_this.checkMember('发起组局',function(){
							app.navTo('../../activity/add/add');
						});
					});
				});
			},
			addMineWallte:function(){
				let _this = this,
					userInfo = this.getData().userInfo;
				app.request('//homeapi/getMyInfo',{},function(req){
					_this.setData({
						'userInfo.canMine':req.canMine,
						'userInfo.wallte':req.wallte,
					});
					if(req.canMine==0){
						app.request('//homeapi/addMineWallte',{},function(res){
							_this.setData({
								'ingotDialog.show':true,
								'ingotDialog.status':1,
								'ingotDialog.total':res.total,
								'userInfo.wallte':Number(userInfo.wallte)+Number(res.total),
							});
						});
					}else{
						_this.setData({
							'ingotDialog.show':true,
							'ingotDialog.status':2,
						});
						_this.countDown();
					};
				});
			},
			toHideDialog:function(){
				this.setData({'ingotDialog.show':false});
				if(this.countDownFn){
					clearInterval(this.countDownFn);
				};
			},
			getDateTime:function(date){  
				//var hours = parseInt((date % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
				var hours = parseInt((date / (1000 * 60 * 60 * 24)) * 24);
				var minutes = parseInt((date % (1000 * 60 * 60)) / (1000 * 60));
				var seconds = parseInt((date % (1000 * 60)) / 1000);
				return (hours<10?'0':'')+hours+':'+(minutes<10?'0':'')+minutes+':'+(seconds<10?'0':'')+seconds;
			},
			countDown:function(){//倒计时
				var _this = this,
					nowTime = (new Date(app.getNowDate(0,true).replace(/-/g, '/'))).getTime(),
					userInfo = this.getData().userInfo;
				if(this.countDownFn){
					clearInterval(this.countDownFn);
				};
				this.countDownFn = setInterval(function(){
					nowTime = nowTime + 1000;
					if(userInfo.canMine*1000 - nowTime <= 0){
						app.tips('您可以继续挖币','error');
						_this.toHideDialog();
						clearInterval(_this.countDownFn);
					}else{
						let counDownTime = _this.getDateTime(userInfo.canMine*1000 - nowTime);
						_this.setData({
							'ingotDialog.counDownTime':counDownTime
						});
					};
				},1000);
			},
			toMyDetail:function(){
				let _this = this,
					userInfo = this.getData().userInfo;
				this.checkLogin(function(){
					app.navTo('../../user/businessCard/businessCard?id='+userInfo._id);
				});
			},
			closeCollect:function(){
				let alertArray = app.storage.get('alertArray')||{};
				alertArray.collectTip = 1;
				app.storage.set('alertArray',alertArray);
				this.setData({showCollect:false});
			},
			toHideWxDialog:function(){//关闭微信公众号
				this.setData({'showWxDialog.show':false});
			},
			toFocusWxGZH:function(){
				this.setData({
					'showWxDialog.show':true
				});
				this.toCloseWxGZH();
			},
			toCloseWxGZH:function(){
				let alertArray = app.storage.get('alertArray')||{};
				alertArray.issubwx = 1;
				app.storage.set('alertArray',alertArray);
				this.setData({'showWxGZHDialog.show':false});
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
			screenAll:function(e){
				let type = app.eData(e).type,
					key = app.eData(e).key,
					value = app.eData(e).value;
				if(type=='activityForm'){
					let activityForm = this.getData().activityForm;
					activityForm.recommend = '';
					activityForm.hot = '';
					activityForm.category = '';
					activityForm.gettype = '';
					activityForm.page = 1;
					if(key){
						activityForm[key] = value;
					};
					this.setData({activityForm:activityForm});
					this.getList();
				}else if(type=='storeForm'){
					let storeForm = this.getData().storeForm;
					storeForm.recommend = '';
					storeForm.hot = '';
					storeForm.page = 1;
					if(key){
						storeForm[key] = value;
					};
					this.setData({storeForm:storeForm});
					this.getStoreList();
				}else if(type=='clubForm'){
					let clubForm = this.getData().clubForm;
					clubForm.recommend = '';
					clubForm.sort = '';
					clubForm.page = 1;
					if(key){
						clubForm[key] = value;
					};
					this.setData({clubForm:clubForm});
					this.getClubList();
				};
			},
			getActivityList:function(){
				let _this = this,
					activityForm = this.getData().activityForm;
				activityForm.areaname = _this.getData().areaname;
				//activityapi/getHomeActivityList
				//activityapi/getActivityList
				app.request('//activityapi/getHomeActivityList',activityForm,function(res){
					if(res.data&&res.data.length){
						app.each(res.data,function(i,item){
							item.id = item.id||item._id;
							if(item.clubData){
								item.clubData.pic = app.image.crop(item.clubData.pic,30,30);
							};
							let picsArray = [];
							if(item.pics&&item.pics.length){
								app.each(item.pics,function(a,b){
									picsArray.push({
										file:app.config.filePath+''+b,
										src:app.image.crop(b,_this.getData().activityPicWidth,_this.getData().activityPicHeight),
									});
								});
							}else{
								picsArray.push({
									file:app.config.filePath+''+item.pic,
									src:app.image.crop(item.pic,_this.getData().activityPicWidth,_this.getData().activityPicHeight),
								});
							};
							item.pics = picsArray;
							if(item.joinlist&&item.joinlist.data){
								app.each(item.joinlist.data,function(a,b){
									item.joinlist.data[a].headpic = app.image.crop(b.headpic,45,45);
								});
							};
						});
						_this.setData({activityList:res.data});
					}else{
						_this.setData({activityList:[]});
					};
				});
			},
			getStoreList:function(){
				let _this = this,
					storeForm = this.getData().storeForm;
				storeForm.areaname = _this.getData().areaname;
				app.request('//shopapi/getShopList',storeForm,function(res){
					if(res.data&&res.data.length){
						app.each(res.data,function(i,item){
							item.id = item.id||item._id;
							item.pic = app.image.crop(item.pic,_this.getData().storePicWidth,_this.getData().storePicWidth);
						});
						_this.setData({storeList:res.data});
					}else{
						_this.setData({storeList:[]});
					};
				});
			},
			getClubList:function(){
				let _this = this,
					clubForm = this.getData().clubForm;
				clubForm.areaname = _this.getData().areaname;
				app.request('//clubapi/getClubList',clubForm,function(res){
					if(res.data&&res.data.length){
						app.each(res.data,function(i,item){
							item.id = item.id||item._id;
							item.pic = app.image.crop(item.pic,_this.getData().clubPicWidth,_this.getData().clubPicWidth);
						});
						_this.setData({clubList:res.data});
					}else{
						_this.setData({clubList:[]});
					};
				});
			},
			toActivityDetail:function(e){
				if(app.eData(e).id){
					app.navTo('../../activity/detail/detail?id='+app.eData(e).id);
				};
			},
			getPosition: function() { //定位获取经纬度
                let _this = this,
                    client = app.config.client;
                if (client == 'web') {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            function(position) {
								if(position&&position.coords){
									let location = position.coords.longitude + ',' + position.coords.latitude;
									_this.getArea(location);
								};
                            },
                            function(e) {
                            }
                        );
                    };
                } else if (client == 'wx') {
                    wx.getLocation({
                        type: 'wgs84',
                        success: function(res) {
							if(res.longitude&&res.latitude){
								let location = res.longitude + ',' + res.latitude;
								app.storage.set('position', location);
								_this.getArea(location);
							}else{
								_this.load();
							};
                        }
                    });
                } else if (client == 'app') {
                    wx.app.call('getLocation', {
                        success: function(res) {
							if(res.city){
								app.storage.set('areaname', res.city);
								_this.setData({
									areaname: res.city
								});
								_this.load();
							};
                        }
                    });
                };
            },
			getArea: function(location) { //根据定位获取地址
                let _this = this,
					client = app.config.client;
                if (client == 'wx') {
                    let amapFile = require('../../../static/js/amap-wx.js');
                    let myAmapFun = new amapFile.AMapWX({
                        key: 'f6fc91f51e335f14a9e1c1a8322b942b'
                    });
                    myAmapFun.getRegeo({
                        location: location,
                        success: function(data) {
                            let city = data[0].regeocodeData.addressComponent.city,
								province = data[0].regeocodeData.addressComponent.province;
							if(!city||!city.length){
								city = province;
							};
                            _this.setData({
                                areaname: city
                            });
                            app.storage.set('areaname', city);
							_this.load();
                        },
                        fail: function(info) {
                        }
                    });
                } else {
                    let amapFile = require(app.config.staticPath + 'js/amap-wx.js');
                    register('AMapWX', () => {
                        let myAmapFun = new AMapWX({
                            key: 'f6fc91f51e335f14a9e1c1a8322b942b'
                        });
                        myAmapFun.getRegeo({
                            location: location,
                            success: function(data) {
                                let city = data[0].regeocodeData.addressComponent.city,
									province = data[0].regeocodeData.addressComponent.province;
								if(!city||!city.length){
									city = province;
								};
								_this.setData({
									areaname: city
								});
								app.storage.set('areaname', city);
								_this.load();
                            },
                            fail: function(info) {
                            }
                        });
                    });
                };
            },
			dayClick:function(e){
				console.log('dayClick:'+app.toJSON(e));
			},
			dateChange:function(e){
				console.log('dateChange:'+app.toJSON(e));
			},
        }
    });
})();