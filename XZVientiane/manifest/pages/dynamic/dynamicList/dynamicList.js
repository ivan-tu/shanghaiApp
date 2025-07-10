(function() {

	let app = getApp();

	app.Page({
		pageId: 'dynamic-dynamicList',
		data: {
			systemId: 'dynamic',
			moduleId: 'dynamicList',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {
				bottomLoad: false
			},
			language: {},
			form: {
				page:1,
				size:20,
				userid:'',
				type:'',
			},
			showLoading:false,
			showNoData:false,
			count:0,
			pageCount:0,
			client:app.config.client,
			dynamicPicW_a:Math.floor(((app.system.windowWidth>480?480:app.system.windowWidth)-35-45)/2),
			dynamicPicH_a:Math.floor(((app.system.windowWidth>480?480:app.system.windowWidth)-35-45)/2*1.1),
			dynamicPicW_b:Math.floor(((app.system.windowWidth>480?480:app.system.windowWidth)-40-45)/3),
			dynamicPicH_b:Math.floor(((app.system.windowWidth>480?480:app.system.windowWidth)-40-45)/3*1.1),
			controlShow:0,
		},
		methods: {
			onLoad: function(options) {
				let _this = this;
				if(options.controlShow==1){
					this.setData({controlShow:1});
				};
				delete options.controlShow;
				this.setData({
					form:app.extend(this.getData().form,options)
				});
				this.load();
			},
			onShow: function() {
			},
			onPullDownRefresh: function() {
				this.setData({
					'form.page': 1
				});
				this.load();
				wx.stopPullDownRefresh();
			},
			load: function() {
				this.getList();
			},
			viewImage: function (e) {//查看动态图
				let _this = this,
					dynamicList = this.getData().data,
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
					data = this.getData().data,
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
					this.setData({data:data});
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
					data = this.getData().data,
					videoFile = data[index].videos,
					myVideo = wx.createVideoContext("myVideo_"+index);
				if(e.detail.fullScreen){//当前是全屏
					videoFile.status = 1;
					myVideo.play();
				}else{
					videoFile.status = 0;
					myVideo.pause();
				};
				this.setData({data:data});
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
						list = _this.getData().data.concat(list);
					};
					_this.setData({
						data:list,
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
			delThisDynamic:function(e){//删除动态
				let _this = this,
					data = this.getData().data,
					index = Number(app.eData(e).index);
				app.confirm('确定要删除这条动态吗',function(){
					app.request('//homeapi/delMyDynamic',{id:data[index].id},function(){
						data.splice(index,1);
						_this.setData({data:data});
					});
				});
			},
			toUserDetail:function(e){
				if(app.eData(e).id){
					app.navTo('../../user/businessCard/businessCard?id='+app.eData(e).id);
				};
			},
			hideThisDynamic:function(e){
				let _this = this,
					data = this.getData().data,
					index = Number(app.eData(e).index);
				app.request('//homeapi/updateShowStatus',{id:data[index].id,status:0},function(){
					app.tips('操作成功','success');
					data[index].showstatus = 0;
					_this.setData({data:data});
				});
			},
			showThisDynamic:function(e){
				let _this = this,
					data = this.getData().data,
					index = Number(app.eData(e).index);
				app.request('//homeapi/updateShowStatus',{id:data[index].id,status:1},function(){
					app.tips('操作成功','success');
					data[index].showstatus = 1;
					_this.setData({data:data});
				});
			},
		}
	});
})();