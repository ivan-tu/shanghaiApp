(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-getSharePic',
        data: {
            systemId: 'user',
            moduleId: 'getSharePic',
            data: {},
            options: {},
            settings: {},
            form: {},
			isUserLogin:app.checkUser(),
			pic:'',
			qrcodePic:'',
			type:'',//home-邀请去首页，user-邀请到我的主页，store-店铺二维码
			userInfo:{},
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
				_this.setData({
					type:options.type||'user',
					options: options
				});
				if(options.type=='home'){
					app.setPageTitle('邀请海报');
				}else if(options.type=='user'){
					app.setPageTitle('我的码');
				}else if(options.type=='store'){
					app.setPageTitle('店铺二维码');
				}else if(options.type=='activity'){
					app.setPageTitle('分享海报');
				};
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
            },
            onPullDownRefresh: function() {
                wx.stopPullDownRefresh();
            },
			onShow:function(){
				
			},
			toBack:function(){
				let options = this.getData().options;
				if(options.client=='web'){
					app.navBack();
				}else{
					wx.miniProgram.navigateBack();
				};
			},
			saveImage:function(){
				let options = this.getData().options,
					pic = this.getData().pic;
				if(options.client=='web'){
				
				}else{
					wx.miniProgram.postMessage({
						data:{
							imgData:pic
						},
					});
				};
			},
            load: function() {
				let _this = this,
					options = this.getData().options,
					type = this.getData().type,
					pageUrl = '';
				if(type=='user'){
					pageUrl = 'p/user/businessCard/businessCard';
					app.request('//homeapi/getMyInfo',{},function(res){
						if(res.headpic){
							res.headpic = app.image.crop(res.headpic,50,50);
						};
						_this.setData({data:res});
						app.request('//homeapi/getUserWxpic',{url:pageUrl}, function(req) {
							if(req){
								req = app.config.filePath+''+req;
								_this.setData({qrcodePic:req});
							}else{
								let url = 'https://' + app.config.domain + '/p/user/businessCard/businessCard?id='+res._id+'&pocode='+app.storage.get('pocode');
								_this.setData({qrcodePic:app.getQrCodeImg(url)});
							};
						},function(){
							app.tips('出错了，请稍后再试','error');
						},function(){
							_this.loadDataURL();
						});
					});
				}else if(type=='home'){
					pageUrl = 'p/home/index/index';
					app.request('//homeapi/getMyInfo',{},function(res){
						if(res.headpic){
							res.headpic = app.image.crop(res.headpic,50,50);
						};
						_this.setData({data:res});
						app.request('//homeapi/getUserWxpic',{url:pageUrl}, function(req) {
							if(req){
								req = app.config.filePath+''+req;
								_this.setData({qrcodePic:req});
							}else{
								let url = 'https://' + app.config.domain + '/p/home/index/index?pocode='+app.storage.get('pocode');
								_this.setData({qrcodePic:app.getQrCodeImg(url)});
							};
						},function(){
							app.tips('出错了，请稍后再试','error');
						},function(){
							_this.loadDataURL();
						});
					});
				}else if(type=='store'){
					pageUrl = 'p/store/payOrder/payOrder';
					app.request('//homeapi/getUserWxpic',{url:pageUrl,scene:options.storeId}, function(req) {
						if(req){
							req = app.config.filePath+''+req;
							_this.setData({qrcodePic:req});
						}else{
							let url = 'https://' + app.config.domain + '/p/store/payOrder/payOrder?id='+options.storeId;
							_this.setData({qrcodePic:app.getQrCodeImg(url)});
						};
					},function(){
						app.tips('出错了，请稍后再试','error');
					},function(){
						_this.loadDataURL();
					});
				}else if(type=='activity'){
					pageUrl = 'p/activity/detail/detail';
					app.request('//homeapi/getMyInfo',{},function(userInfo){
						_this.setData({userInfo:userInfo});
						let url = 'https://' + app.config.domain + '/p/activity/detail/detail?id='+options.id+'&pocode='+userInfo.invitationNum;
						if(options.clubid){
							url = url+'&clubid='+options.clubid;
						};
						app.request('//activityapi/getActivityDetail',{id:options.id}, function(res) {
							if(res){
								res.pic = app.image.crop(res.pic,300,240);
								if(res.begintime){
									res.begintime = res.begintime.split(' ');
									res.begintime = res.begintime[0];
								}else if(res.bDate){
									res.begintime = res.bDate.split('-');
									res.begintime = res.begintime[1]+'.'+res.begintime[2];
								};
								res.areaText = (res.area&&res.area.length)?res.area[1]+'-'+res.area[2]:'';
								_this.setData({
									data:res,
								});
								let scene = res.shortid+'_'+userInfo.invitationNum;
								if(options.clubid){
									scene = scene+'_'+options.clubid;
								};
								app.request('//homeapi/getUserWxpic',{url:pageUrl,scene:scene}, function(req) {
									if(req){
										req = app.config.filePath+''+req;
										_this.setData({qrcodePic:req});
									}else{
										_this.setData({qrcodePic:app.getQrCodeImg(url)});
									};
								},function(){
									app.tips('出错了，请稍后再试','error');
								},function(){
									_this.loadDataURL();
								});
							}else{
								app.tips('出错了，请稍后再试','error');
							};
						},function(){
							app.tips('出错了，请稍后再试','error');
						},function(){
							_this.loadDataURL();
						});
					});
				};
			},
			loadDataURL:function(){
				let _this = this;
				xzSystem.loadSrcs([xzSystemConfig.staticPath+'plugins/html2canvas/html2canvas.min.js'],function(){
					//获取设备比
					function getDPR(){
						if (window.devicePixelRatio && window.devicePixelRatio > 1) {
							return window.devicePixelRatio;
						}
						return 1;
					};
					const width = 300;
					const height = 400;
					const scaleBy = getDPR();
					const canvas = document.createElement('canvas');
					canvas.width = width * scaleBy;
					canvas.height = height * scaleBy;
					canvas.style.width = `${width}px`;
					canvas.style.height = `${height}px`;
					const context = canvas.getContext('2d');
					context.scale(scaleBy, scaleBy);
					setTimeout(function(){
						var template = document.getElementById('myPic');
						var rect = template.getBoundingClientRect(); //获取元素相对于视察的偏移量
						context.translate(-rect.left, -rect.top); //设置context位置，值为相对于视窗的偏移量负值，让图片复位
						html2canvas($("#myPic"), {
							canvas,
							x:0,
							y:0,
							foreignObjectRendering: true, // 是否在浏览器支持的情况下使用ForeignObject渲染
							useCORS: true, // 是否尝试使用CORS从服务器加载图像
							allowTaint: false,
							async: true, // 是否异步解析和呈现元素
							//background: "#ffffff", // 一定要添加背景颜色，否则出来的图片，背景全部都是透明的
							//scale: 2, // 处理模糊问题
							//dpi: 300, // 处理模糊问题
							onrendered: function (canvas) {
								_this.setData({
									pic:canvas.toDataURL(),
								});
							},
						});
					},500);
				});
			},
        }
    });
})();