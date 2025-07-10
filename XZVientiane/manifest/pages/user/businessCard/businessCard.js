/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-businessCard',
        data: {
            systemId: 'user',
            moduleId: 'businessCard',
            data: {},
            options: {},
            settings: {},
            form: {
				page:1,
				size:10,
				userid:'',
				type:''
			},
			ajaxLoading:true,
			client:app.config.client,
			activityList:[],
			activityPicW:((app.system.windowWidth>480?480:app.system.windowWidth)-40)*0.5,
			activityPicH:((app.system.windowWidth>480?480:app.system.windowWidth)-40)*0.5*0.8,
			giftDialog:{
				show:false,
				height:340,
				balance:0,
				giftid:'',
				num:0,
				total:0,
				data:[],
				picWidth:35,
				type:1,//1-送礼模式，2-加好友送礼模式
			},
			dynamicList:[],//动态列表
			showLoading:false,
			showNoData:false,
			count:0,
			pageCount:0,
			dynamicPicW_a:Math.floor(((app.system.windowWidth>480?480:app.system.windowWidth)-35)/2),
			dynamicPicH_a:Math.floor(((app.system.windowWidth>480?480:app.system.windowWidth)-35)/2*1.1),
			dynamicPicW_b:Math.floor(((app.system.windowWidth>480?480:app.system.windowWidth)-40)/3),
			dynamicPicH_b:Math.floor(((app.system.windowWidth>480?480:app.system.windowWidth)-40)/3*1.1),
			userInfo:{
				wallte:0,
			},
			myClubList:[],
			clubPicWidth:Math.floor(((app.system.windowWidth>480?480:app.system.windowWidth)-40)/2),
        },
        methods: {
            onLoad: function(options) {
				console.log(app.toJSON(options));
				if(app.config.client == 'wx' && options.scene) {
					let scenes = options.scene.split('_');
					options.id = scenes[0];
					if(options.id.length==9){
						options.pocode = options.id;
						app.session.set('vcode', options.id);
					};
					delete options.scene;
				};
				this.setData({
					options:options,
					'form.userid':options.id,
				});
            },
			onShow:function(){
				this.load();
			},
            onPullDownRefresh: function() {
                this.load();
                wx.stopPullDownRefresh();
            },
            load: function() {
				let _this = this,
					options = this.getData().options;
				this.setData({ajaxLoading:true});
				app.request('//homeapi/getUserHomeInfo',{id:options.id},function(res){
					if(res.headpic){
						res.sharePic = app.image.width(res.headpic,480);
						res.headpic = app.image.crop(res.headpic,80,80);
					};
					if(!res.hideactivity&&res.activityList&&res.activityList.length){
						app.each(res.activityList,function(i,item){
							item.pic = app.image.crop(item.pic,_this.getData().activityPicW,_this.getData().activityPicH);
						});
					}else{
						res.activityList = [];
					};
					if(res.giftLogs&&res.giftLogs.length){
						app.each(res.giftLogs,function(i,item){
							item.pic = app.image.crop(item.pic,50,50);
						});
					};
					res.areaText = (res.area&&res.area.length)?res.area[0]:'';
					_this.setData({
						data:res,
						'form.userid':res._id,
						ajaxLoading:false,
					});
					
					//获取俱乐部
					if(!res.hideclubs){
						_this.getClubList();
					};
					
					//获取动态列表
					_this.getList();
					
					//设置分享参数
					let newData = app.extend({}, options);
					newData = app.extend(newData, {
						pocode: app.storage.get('pocode')
					});
					let pathUrl = app.mixURL('/p/user/businessCard/businessCard', newData), 
						sharePic = res.sharePic||'https://statics.tuiya.cc/16866758576014017.jpg',
						shareData = {
							shareData: {
								title: res.username+'的个人主页',  
								content: res.desctext||'在局活动社交平台',
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
				});
				
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
			toPage:function(e){
				if(app.eData(e).page){
					app.navTo(app.eData(e).page);
				};
			},
			getClubList:function(){
				let _this = this,
					formData = this.getData().form;
				app.request('//clubapi/getMyClubs',{userid:formData.userid},function(res){
					let newArray = [];
					if(res.myclubs&&res.myclubs.length){
						app.each(res.myclubs,function(i,item){
							item.pic = app.image.crop(item.pic,_this.getData().clubPicWidth,_this.getData().clubPicWidth);
						});
						newArray = newArray.concat(res.myclubs);
					};
					if(res.joinclubs&&res.joinclubs.length){
						app.each(res.joinclubs,function(i,item){
							item.pic = app.image.crop(item.pic,_this.getData().clubPicWidth,_this.getData().clubPicWidth);
						});
						newArray = newArray.concat(res.joinclubs);
					};
					_this.setData({myClubList:newArray});
				});
			},
			toMoreDynamic:function(){
				let formData = this.getData().form,
					data = this.getData().data;
				if(data.ismy==1){
					app.navTo('../../dynamic/dynamicList/dynamicList?type=my');
				}else{
					app.navTo('../../dynamic/dynamicList/dynamicList?userid='+formData.userid);
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
										callback();
									}
								});
							};
						}
					});
				};
			},
			toHideGiftDialog:function(){
				this.setData({'giftDialog.show':false});
			},
			toSendGift:function(){
				let _this = this,
					giftDialog = this.getData().giftDialog;
				this.checkLogin(function(){
					app.request('//diamondapi/getMyDiamond',{},function(res){
						_this.setData({
							'giftDialog.balance':res.balance,
						});
						if(giftDialog.data&&giftDialog.data.length){
							_this.setData({
								'giftDialog.show':true,
								'giftDialog.type':1,
							});
						}else{
							app.request('//set/get',{type:'gift'},function(res){
								if(res.data&&res.data.length){
									app.each(res.data,function(i,item){
										item.id = item._id||item.id;
										item.pic = app.image.crop(item.pic,60,60);
										item.selectCount = 0;
									});
									_this.setData({
										'giftDialog.data':res.data,
										'giftDialog.show':true,
										'giftDialog.type':1,
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
					options = this.getData().options,
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
						if(giftDialog.type==2){//加好友模式
							app.request('//homeapi/applyFriend',{
								frienduid:options.id,
								giftid:giftDialog.giftid,
								clubid:options.clubid||'',
								activityid:options.activityid||'',
							},function(res){
								if(res.status==1){
									app.tips('申请成功，等待好友通过','success');
									_this.toHideGiftDialog();
									_this.load();
								}else{
									_this.toHideGiftDialog();
									app.tips('钻石余额不足','error');
								};
							});
						}else{//单纯送礼物
							app.request('//homeapi/sendUserGift',{
								id:data._id,
								giftid:giftDialog.giftid,
								num:giftDialog.num,
							},function(res){
								if(res.status==1){
									app.tips('赠送成功','success');
									_this.toHideGiftDialog();
									_this.load();
								}else{
									_this.toHideGiftDialog();
									app.tips('钻石余额不足','error');
								};
							});
						};
					});
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
			viewThisImage: function (e) {
				let _this = this,
					pic = app.eData(e).pic;
				pic = pic.split('?')[0];
				app.previewImage({
					current: pic,
					urls: [pic]
				});
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
			checkMember:function(title,callback){//检测是否会员
				let _this = this;
				app.request('//homeapi/getMyInfo',{},function(res){
					_this.setData({userInfo:res});
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
			addFriend:function(){
				let _this = this,
					giftDialog = this.getData().giftDialog,
					formData = this.getData().form,
					options = this.getData().options;
				this.checkLogin(function(){
					app.request('//homeapi/applyFriend',{frienduid:formData.userid,clubid:options.clubid||''},function(res){
						app.tips('申请成功，等待好友通过','success');
						_this.load();
					});
					/*_this.checkMember('添加好友',function(){
						app.confirm({
							content:'添加好友需赠送礼物，好友未通过，礼物会退回。',
							confirmText:'挑选礼物',
							success:function(req){
								if(req.confirm){
									if(giftDialog.data&&giftDialog.data.length){
										_this.setData({
											'giftDialog.show':true,
											'giftDialog.type':2,
										});
									}else{
										app.request('//set/get',{type:'gift'},function(res){
											if(res.list&&res.list.length){
												app.each(res.list,function(i,item){
													item.id = item._id||item.id;
													item.pic = app.image.crop(item.pic,60,60);
													item.selectCount = 0;
												});
												_this.setData({
													'giftDialog.data':res.list,
													'giftDialog.type':2,//加好友模式
													'giftDialog.show':true
												});
											};
										});
									};
								};
							},
						});
					});*/
				});
			},
			sendMsg:function(){
				let _this = this,
					formData = this.getData().form;
				app.navTo('../../user/sendMsg/sendMsg?userid='+formData.userid);
			},
			toPublishDybamic:function(){//发布动态
				let _this = this;
				this.checkLogin(function(){
					app.navTo('../../dynamic/publish/publish');
				});
			},
			delThisDynamic:function(e){//删除动态
				let _this = this,
					dynamicList = this.getData().dynamicList,
					index = Number(app.eData(e).index);
				app.confirm('确定要删除这条动态吗',function(){
					app.request('//homeapi/delMyDynamic',{id:dynamicList[index]._id},function(){
						dynamicList.splice(index,1);
						_this.setData({dynamicList:dynamicList});
					});
				});
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
						dynamicList:list,
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
			toIndexMenu:function(e){
				app.switchTab({
					url:app.eData(e).page
				});
			},
        }
    });
})();