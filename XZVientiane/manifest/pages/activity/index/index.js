/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'activity-index',
        data: {
            systemId: 'activity',
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
			picWidth:120,//(app.system.windowWidth>480?480:app.system.windowWidth)-15,
			picHeight:96,//Math.ceil(((app.system.windowWidth>480?480:app.system.windowWidth)-15)*0.8),
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
				let newData = app.extend({}, options);
				newData = app.extend(newData, {
					pocode: app.storage.get('pocode')
				});
				let pathUrl = app.mixURL('/p/activity/index/index', newData), 
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
            },
			onShow:function(){
				//检查用户登录状态
				let isUserLogin = app.checkUser();
				if (isUserLogin != this.getData().isUserLogin) {
					this.setData({
						isUserLogin: isUserLogin
					});
					this.load();
				}else if(app.storage.get('pageReoload')==1){
					app.storage.remove('pageReoload');
					this.load();
				};
			},
            onPullDownRefresh: function() {
				this.setData({'form.page':1});
                this.load();
                wx.stopPullDownRefresh();
            },
            load: function(){
				this.getList();
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
					formData = _this.getData().form,
					pageCount = _this.getData().pageCount,
					ajaxURL = '//activityapi/getActivityList',
					getType = this.getData().getType;
				if(loadMore){
					if (formData.page >= pageCount) {
						_this.setData({'settings.bottomLoad':false});
					};
				};
				_this.setData({'showLoading':true});
				formData.isfree = '';
				formData.status = 1;
				formData.paytype = '';
				if(getType=='free'){
					formData.isfree = 1;
				}else if(getType=='wallte'){
					formData.paytype='wallte';
				}else if(getType=='over'){
					formData.status = 2;
				}else if(getType=='join'){
					ajaxURL = '//activityapi/getMyJoinActivity';
					formData.status = '';
				}else if(getType=='my'){
					ajaxURL = '//activityapi/getMyActivity';
					formData.status = '';
				};
				app.request(ajaxURL,formData,function(backData){
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
							item.masterpic = app.image.crop(item.masterpic,30,30);
							item.pic = app.image.crop(item.pic,_this.getData().picWidth,_this.getData().picHeight);
							item.areaText = (item.area&&item.area.length)?item.area[1]+'-'+item.area[2]:'';
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
        }
    });
})();