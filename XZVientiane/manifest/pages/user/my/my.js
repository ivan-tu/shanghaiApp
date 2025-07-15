/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-my',
        data: {
            systemId: 'user',
            moduleId: 'my',
            data: {
				diamond:0,//钻石
				balance:0,//可提现
				wallte:0,//友币
				todayTotal:0,//今日收入
				total:0,//总收入
			},
            options: {},
            settings: {
			},
            form: {},
			isUserLogin: app.checkUser(),
			client:app.config.client,
			adPicWidth:(app.system.windowWidth>480?480:app.system.windowWidth)-20,
			settingData:{},
			showSharePic:false,
			picWidth: app.system.windowWidth - 120,
			loadOk:false,
			loadPic:'',
			loadPicUrl:'',
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
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
				}else if(app.storage.get('pageReoload')==1){
					app.storage.remove('pageReoload');
					this.load();
				}else if(!isUserLogin){
					setTimeout(function(){
						app.checkUser(function() {
							_this.setData({
								isUserLogin: true
							});
							_this.load();
						});
					},1000);
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
				app.request('//homeapi/getMyInfo', {}, function(res){
					if (res.headpic) {
						res.headpicUrl = res.headpic;
						res.headpic = app.image.crop(res.headpic, 120, 120);
					};
					if(res.invitationNum){
						app.storage.set('pocode',res.invitationNum);
					};
					res.balance = Number(app.getPrice(res.balance));
					res.todayTotal = Number(app.getPrice(res.todayTotal));
					res.total = Number(app.getPrice(res.total));
					_this.setData({
						data: res
					});
					/*if(res.username=='微信用户'||res.username.indexOf('hi3')==0||!res.sex||!res.birthday){
						app.alert({
							content:'您还没有完善资料',
							confirmText:'去完善',
							success:function(req){
								if(req.confirm){
									app.navTo('../../user/info/info');
								};
							},
						});
						
					};*/
					if(!res.account){
						app.tips('请先绑定账号','error');
						setTimeout(function(){
							app.navTo('../../user/bindAccount/bindAccount');
						});
					};
					//设置分享参数
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
			getSharePic:function(){
				/*if(app.config.client=='wx'){
					app.navTo('../../home/webview/webview?url=https://' + app.config.domain + '/p/user/getSharePic/getSharePic&type=user');
				}else{
					app.navTo('../../user/getSharePic/getSharePic?type=user&client=web');
				};*/
				let _this = this,
					loadPicUrl = this.getData().loadPicUrl;
				if(!loadPicUrl){
					let scene = app.storage.get('pocode');
					app.request('//homeapi/getExpertWxpic',{url:'p/user/myExpertInfo/myExpertInfo',scene:scene}, function(res) {
						if(res){
							_this.setData({
								loadPic: app.config.filePath + '' + res,
								loadPicUrl: app.image.width(res, _this.getData().picWidth),
								showSharePic:true
							});
						};
					});
				}else{
					this.setData({showSharePic:true});
				};			
			},
			loadSuccess: function() {
				this.setData({
				   loadOk: true
				});
			},
			closeSharePic:function(){
				this.setData({showSharePic:false});
			},
			saveImage: function() {
				let loadPic = this.getData().loadPic;
				app.saveImage({
				   filePath: loadPic,
				   success: function() {
					  app.tips('保存成功', 'success');
				   }
				});
			},
			toPage:function(e){
				if(app.eData(e).page){
					app.navTo(app.eData(e).page);
				};
			},
			toService:function(){
				if(app.config.client=='wx'){
					wx.openCustomerServiceChat({
						extInfo: {url:'https://work.weixin.qq.com/kfid/kfc72ffe0810ff7f651'},
						corpId: '',
						success(res) {}
					});
				}else if(app.config.client=='web'&&isWeixin){
					window.location.href = 'https://work.weixin.qq.com/kfid/kfc72ffe0810ff7f651';
				}else{
					app.alert({
						title:'请在微信中打开',
						content:'https://work.weixin.qq.com/kfid/kfc72ffe0810ff7f651'
					});
				};
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
				} else{
					$('body').append('<input class="readonlyInput" value="'+content+'" id="readonlyInput" readonly />');
					var originInput = document.querySelector('#readonlyInput');
					originInput.select();
					if(document.execCommand('copy')) {
						document.execCommand('copy');
						app.tips('复制成功','error');
					}else{
						app.tips('浏览器不支持，请手动复制','error');
					};
					originInput.remove();
				};
			},
			toShareExperInfo:function(){//邀请达人
				let _this = this;
				let newData = {
					pocode: app.storage.get('pocode')
				};
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
								_this.selectComponent('#newShareCon').reSetData(shareData);
								_this.selectComponent('#newShareCon').openShare();
							} else {
								reSetData();
							}
						}, 500)
					};
				reSetData();
			},
			toLevelList:function(){
				app.navTo('../../user/userLevelList/userLevelList');
			},
        }
    });
})();