/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'suboffice-index',
        data: {
            systemId: 'suboffice',
            moduleId: 'index',
            data: [],
            options: {},
            settings: {},
            form: {
				page:1,
				size:10,
				sort:'active',//active
				keyword:'',
				gettype:'',
			},
			isUserLogin:app.checkUser(),
			client:app.config.client,
			showLoading:false,
			showNoData:false,
			myClubList:[],
			count:0,
			pageCount:0,
			groupPicWidth:Math.ceil(((app.system.windowWidth>480?480:app.system.windowWidth)-40)/3),
			//groupPicWidth:110,
			//groupPicHeight:135,
			//groupPicHeightMax: 155,
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
				_this.setData({
					options: options
				});
				this.load();
            },
			onShow:function(){
				//检查用户登录状态
				let isUserLogin = app.checkUser(),
					data = this.getData().data;
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
				};
			},
            onPullDownRefresh: function() {
				this.setData({
					'form.page':1
				});
				this.load();
                wx.stopPullDownRefresh();
            },
			changeKeyword: function(e) {
				let keyword = e.detail.keyword;
				this.setData({
					'form.keyword': e.detail.keyword,
					'form.page': 1
				});
				this.getList();
			},
			closeKeyword: function(e) {
				let keyword = e.detail.keyword;
				this.setData({
					'form.keyword': '',
					'form.page': 1
				});
				this.getList();
			},
			screenType:function(e){
				let type = app.eData(e).type,
					value = app.eData(e).value,
					formData = this.getData().form;
				formData.page = 1;
				formData[type] = value;
				if(type=='sort'){
					formData.gettype = '';
				};
				this.setData({
					form:formData
				});
				this.getList();
			},
            load: function() {
				let _this = this;
				if(app.checkUser()){
					this.getMyList();
				};
				this.getList();
            },
			getMyList:function(){
				let _this = this;
				app.request('//clubapi/getMyClubs',{},function(res){
					let newArray = [];
					if(res.myclubs&&res.myclubs.length){
						app.each(res.myclubs,function(i,item){
							item.pic = app.image.crop(item.pic,_this.getData().groupPicWidth,_this.getData().groupPicWidth);
						});
						newArray = newArray.concat(res.myclubs);
					};
					if(res.joinclubs&&res.joinclubs.length){
						app.each(res.joinclubs,function(i,item){
							item.pic = app.image.crop(item.pic,_this.getData().groupPicWidth,_this.getData().groupPicWidth);
						});
						newArray = newArray.concat(res.joinclubs);
					};
					_this.setData({myClubList:newArray});
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
				app.request('//clubapi/getClubList',formData,function(backData){
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
							item.pic = app.image.crop(item.pic||'16870792940383251.jpg',120,120);
							item.headpic = app.image.crop(item.headpic,35,35);
							let newUserList = [];
							if(item.userList&&item.userList.length){
								app.each(item.userList,function(a,b){
									b.headpic = app.image.crop(b.headpic,35,35);
									if(a<5){
										newUserList.push(b);
									};
								});
							};
							item.userList = newUserList;
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
        }
    });
})();