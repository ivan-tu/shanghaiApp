/**
 *模块组件构造器
 */
(function() {
	let app = getApp();
	app.Component({
		comName: 'editor-content',
		lifetimes: {
			// 生命周期函数，可以为函数，或一个在methods段中定义的方法名
			attached: function () {},
			moved: function () {},
			detached: function () {
				this.toStopAudio();
			},
	    },
		properties: {
			content: Array
		},
    	data: {
			picWidth:((app.system.windowWidth > 480 ? 480 : app.system.windowWidth) - 48) / 3,
			imageWidth:(app.system.windowWidth > 480 ? 480 : app.system.windowWidth) - 40,
			videoWidth:(app.system.windowWidth > 480 ? 480 : app.system.windowWidth) - 30,
			windowWidth: app.system.windowWidth,
		},
		ready: function() {
        },
		methods: {
			init:function(){
				let _this = this,
					content = this.getData().content;
				if(content.length){
					app.each(content, function(i, item) {
						if (item.type == 'audio') {
							content[i].active = 0;
							content[i].now = '00:00';
							content[i].time = '';
							content[i].progress = 0;
							//创建audio实例
							if(app.config.client=='wx'){
								let myAudio;
								myAudio = wx.createInnerAudioContext();
								myAudio.src = app.config.filePath+''+item.src;
								let getDuration = function(){
									setTimeout(function(){
										let duration = myAudio.duration;
										if(duration == 0){
											getDuration();
										}else{
											duration = Number(myAudio.duration);
											let duration_minutes = parseInt(duration / 60);
											if (duration_minutes < 10) {
												duration_minutes = "0" + duration_minutes;
											};
											let duration_seconds = parseInt(duration % 60);
											duration_seconds = Math.round(duration_seconds);
											if (duration_seconds < 10) {
												duration_seconds = "0" + duration_seconds;
											};
											content[i].time = duration_minutes+':'+duration_seconds;
											_this.setData({content:content});
										};
									},300);
								};
								//播放位置发生改变
								myAudio.onTimeUpdate(function(){
									let duration = Number(myAudio.duration),
										currentTime = Number(myAudio.currentTime);
									let duration_minutes = parseInt(duration / 60);
									if (duration_minutes < 10) {
										duration_minutes = "0" + duration_minutes;
									};
									let duration_seconds = parseInt(duration % 60);
									duration_seconds = Math.round(duration_seconds);
									if (duration_seconds < 10) {
										duration_seconds = "0" + duration_seconds;
									};
									
									let seconds = parseInt(currentTime);
									let minutes = parseInt(seconds / 60);
									if (minutes < 10) {
										minutes = "0" + minutes;
									};
									seconds = parseInt(seconds % 60);
									if (seconds < 10) {
										seconds = "0" + seconds;
									};
									content[i].time = duration_minutes+':'+duration_seconds;
									content[i].now = minutes+':'+seconds;
									content[i].progress = !Number(currentTime)?0:parseInt(Number(currentTime) / Number(duration)*100);
									_this.setData({
										content:content
									});
								});
								//播放结束
								myAudio.onEnded(function(){
									content[i].now = '00:00';
									content[i].progress = 0;
									_this.setData({
										content:content
									});
								});
								//准备就绪
								myAudio.onCanplay(function(){
									getDuration();
								});
								content[i]['myAudio'] = myAudio;
							}else{
								let myAudio = new Audio();
								myAudio.src = app.config.filePath+''+item.src;;
								myAudio.load();
								//播放准备就绪
								myAudio.addEventListener('canplaythrough',function(){
									var minutes = parseInt(myAudio.duration / 60);
									if (minutes < 10) {
										minutes = "0" + minutes;
									};
									var seconds = parseInt(myAudio.duration % 60);
									seconds = Math.round(seconds);
									if (seconds < 10) {
										seconds = "0" + seconds;
									};
									content[i].time = minutes+':'+seconds;
									_this.setData({content:content});
								});
								//播放位置发生改变
								myAudio.addEventListener('timeupdate',function(){
									let seconds = parseInt(myAudio.currentTime);
									let minutes = parseInt(seconds / 60);
									if (minutes < 10) {
										minutes = "0" + minutes;
									};
									seconds = parseInt(seconds % 60);
									if (seconds < 10) {
										seconds = "0" + seconds;
									};
									content[i].now = minutes+':'+seconds;
									content[i].progress = !Number(myAudio.currentTime)?0:parseInt(Number(myAudio.currentTime) / Number(myAudio.duration)*100);
									_this.setData({content:content});
								});
								//播放结束
								myAudio.addEventListener('ended',function(){
									content[i].now = '00:00';
									content[i].progress = 0;
									_this.setData({
										content:content
									});
								});
								content[i]['myAudio'] = myAudio;
							};
						};
					});
					this.setData({content:content});
				};
			},
			viewImage: function(e) { //预览图片
				let _this = this,
					index = Number(app.eData(e).index),
					windowWidth = this.getData().windowWidth,
					content = _this.getData().content,
					newSrc = [],
					current = '';
				app.each(content, function(i, item) {
					if (item.type == 'image') {
						newSrc.push(app.image.width(item.file, windowWidth));
						if (i == index) {
							current = app.image.width(item.file, windowWidth);
						};
					};
				});
				app.previewImage({
					current: current,
					urls: newSrc
				});
			},
			toLink: function(e) {
		  		let client = app.config.client,
			  		urlLink = app.eData(e).link;
				if (!urlLink) return;
				if (client == 'web') {
					if (urlLink.indexOf('http') == 0) {
						window.location.href = urlLink;
					} else {
						app.navTo(urlLink);
					};
		  		} else if (client == 'app') {
			 		app.navTo(urlLink);
		  		} else {
					if (urlLink.indexOf('http') == 0) {
					} else {
						if (urlLink.indexOf('/p/shop/index/index?id=')>=0){//打开各店小程序
							let data = app.urlToJson(urlLink);
							wx.navigateToMiniProgram({
							   appId: 'wxc82e04dbe29b6b66',
							   path: urlLink,
							   extraData: {
								  id: data.id
							   },
							   envVersion: 'release',
							   success(res) {
								  // 打开成功
							   }
							});
						}else if(urlLink=='/p/shop/index/index'||urlLink=='/p/shop/goodsList/goodsList'||urlLink=='/p/shop/cart/cart'||urlLink=='/p/shop/userCenter/userCenter'){
							  app.switchTab({
								  url:urlLink
							  });
						}else{
							app.navTo(urlLink);
						};
			 		};
				};
		  	},
			toAdLink:function(e){//打开广告链接
				let client = app.config.client,
					wxlink = app.eData(e).wxlink,
			  		urlLink = app.eData(e).link;
				if(client=='wx'){
					if(!wxlink)return;
					if(app.eData(e).appid){//打开各店小程序
						let urlData = app.urlToJson(wxlink);
						wx.navigateToMiniProgram({
						   appId: app.eData(e).appid,
						   path: wxlink,
						   extraData: urlData,
						   envVersion: 'release',
						   success(res) {
						   }
						});
					}else{
						app.navTo(wxlink);
					};
				}else if(client=='app'){
					app.navTo(urlLink);
				}else{
					if (urlLink.indexOf('http') == 0) {
						window.location.href = urlLink;
					} else {
						app.navTo(urlLink);
					};
				};
			},
			toPlayAudio:function(e){	
				let _this = this,
					content = this.getData().content,
					index = Number(app.eData(e).index),
					myAudio = content[index].myAudio;
				if(!myAudio){
					console.log('myAudio is null');
					return;
				};
				if(content[index].active==1){//暂停
					myAudio.pause();
					content[index].active = 0;
					_this.setData({content:content});
				}else{
					app.each(content,function(i,item){
						if(item.type=='audio'&&i!=index&&item.active==1){
							let newAudio = content[i].myAudio;
							newAudio.pause();
							content[i].active = 0;
							_this.setData({content:content});
						};
					});
					if(app.config.client=='wx'){
						myAudio.play();
						content[index].active = 1;
						_this.setData({content:content});
					}else{
						audioPlaying = setInterval(function() {
							myAudio.play();
							if(myAudio.readyState==4){
								content[index].active = 1;
								_this.setData({content:content});
								clearInterval(audioPlaying);
							};
						},20);
					};
				};
			},
			toStopAudio:function(){
				let _this = this,
					content = this.getData().content;
				app.each(content,function(i,item){
					if(item.type=='audio'){
						let newAudio = content[i].myAudio;
						newAudio.pause();
						content[i].active = 0;
						_this.setData({content:content});
					};
				});
			},
			adError:function(e){//腾讯广告加载失败
				let _this = this,
					index = Number(app.eData(e).index),
					content = this.getData().content,
					errCode = e.detail.errCode;
				app.request('//pushapi/getOnePushAd',{},function(res){
					if(res&&res.length){
						let backData = res[0];
						if(backData.pics){
							backData.pics = [app.image.width(backData.pics,_this.getData().videoWidth)];
						};
						content[index] = {
							type:'ad',
							content:backData
						};
						_this.setData({content:content});
					};
				},function(){
				});
			},
		}
  });
})();