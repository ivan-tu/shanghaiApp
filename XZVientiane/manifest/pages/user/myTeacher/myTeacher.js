(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-myTeacher',
        data: {
            systemId: 'user',
            moduleId: 'myTeacher',
			isUserLogin: app.checkUser(),
            data: [],
            options: {},
            settings: {},
            language: {},
            client: app.config.client,
            form: {
				page:1,
				size:20
			},
			showLoading:false,
			showNoData:false,
			getType:1,
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
				this.setData({
					options:options,
					form:app.extend(this.getData().form,options)
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
				};
			},
			onPullDownRefresh: function() {
				this.setData({
					'form.page': 1
				});
				if (this.getData().isUserLogin) {
					this.load();
				};
				wx.stopPullDownRefresh();
			},
			load: function() {
				let _this = this;
				
			},
			screen:function(e){
				this.setData({
					getType:app.eData(e).value,
					'form.page':1,
				});
				this.getList();
			},
			getList:function(loadMore){
				let _this = this,
					formData = _this.getData().form,
					getType = _this.getData().getType,
					ajaxURL = '//homeapi/getMyBeansLog',
					pageCount = _this.getData().pageCount;
				if(loadMore){
					if (formData.page >= pageCount) {
						_this.setData({'settings.bottomLoad':false});
					};
				};
				_this.setData({'showLoading':true});
				if(getType==2){
					ajaxURL = '//homeapi/getBeansApplyList';
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
						
					};
					if(loadMore){
						list = _this.getData().data.concat(list);
					};
					_this.setData({
						data:list,
						count:backData.count||0,
						total:backData.total||0,
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
        }
    });
})();