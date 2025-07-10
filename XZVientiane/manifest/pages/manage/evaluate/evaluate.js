/**
 *模块组件构造器
 */
(function() {

	let app = getApp();

	app.Page({
		pageId: 'manage-evaluate',
		data: {
			systemId: 'manage',
			moduleId: 'evaluate',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {},
			language: {},
			form: {
				page:1,
				size:10,
				type:'my',//my gh xh
				keyword:'',
			},
			myAuthority:app.storage.get('myAuthority'),
			picWidth:((app.system.windowWidth>480?480:app.system.windowWidth)-38)/3,
			showLoading:false,
			showNoData:false,
			pageCount:0,
			count:0,
			showReplayDialog:false,
			replayForm:{
				id:'',
				replaycontent:''
			}
		},
		methods: {
			onLoad:function(options){
				this.setData({myAuthority:app.storage.get('myAuthority')});
				if(!this.getData().myAuthority){
					app.navTo('../../manage/index/index');
				};

				let _this=this;
			  _this.setData({options:options});
			  if(options.keyword){
				  _this.setData({'form.keyword':options.keyword});
			  };
			  if(options.type){
				  _this.setData({'form.type':options.type});
			  };
			  app.checkUser(function(){
				  _this.setData({isUserLogin:true});
				  _this.load();
			  });
			},
			onShow: function(){
				//检查用户登录状态
				let isUserLogin=app.checkUser();
				if(isUserLogin!=this.getData().isUserLogin){
					this.setData({isUserLogin:isUserLogin});
					if(isUserLogin){
						this.load();	
					};
				};
			},
			onPullDownRefresh: function() {
				this.setData({'form.page':1});
				if(this.getData().isUserLogin){
					this.load();
				};
				wx.stopPullDownRefresh();
			},
			load:function(){
				let _this=this;
				if(_this.getData().myAuthority.evaluate){
					_this.getList();
				};
			},
			changeKeyword: function(e) {
                let keyword = e.detail.keyword;
                this.setData({ 'form.keyword': e.detail.keyword, 'form.page': 1 });
                this.getList();
            },
            closeKeyword: function(e) {
                let keyword = e.detail.keyword;
                this.setData({ 'form.keyword': '', 'form.page': 1 });
                this.getList();
            },
			delThis:function(e){
				let _this = this,
					index = Number(app.eData(e).index),
					id = app.eData(e).id,
					data = this.getData().data;
				app.confirm('确定删除吗？',function(){
					app.request('//shopapi/updateGoodsCommentStatus',{status:-1,id:id},function(){
						app.tips('删除成功','success');
						data.splice(index,1);
						_this.setData({data:data});
					});
				});
			},
			setOpen:function(e){
				let _this = this,
					index = Number(app.eData(e).index),
					id = app.eData(e).id,
					data = this.getData().data;
				app.confirm('显示后在商品详情页能看到该评价，确认显示？',function(){
					app.request('//shopapi/updateGoodsCommentStatus',{status:1,id:id},function(){
						data[index].status=1;
						_this.setData({data:data});
					});
				});
			},
			setClose:function(e){
				let _this = this,
					index = Number(app.eData(e).index),
					id = app.eData(e).id,
					data = this.getData().data;
				app.confirm('隐藏后在商品详情页无法看到该评价，确认隐藏？',function(){
					app.request('//shopapi/updateGoodsCommentStatus',{status:0,id:id},function(){
						data[index].status=0;
						_this.setData({data:data});
					});
				});
			},
			viewImage:function(e){
				let _this = this,
					data = this.getData().data,
					parent = Number(app.eData(e).parent),
                    index = Number(app.eData(e).index),
					viewSrc = [],
                    files = data[parent].pics;
                app.each(files, function(i, item) {
                    viewSrc.push(app.config.filePath+''+item.key);
                });
                app.previewImage({
                    current: viewSrc[index],
                    urls: viewSrc
                });
			},
			replayThis:function(e){
				this.setData({
					showReplayDialog:true,
					'replayForm.index':Number(app.eData(e).index),
					'replayForm.replaycontent':'',
				});
			},
			toHideReplayDialog:function(){
				this.setData({
					showReplayDialog:false
				});
			},
			toConfirmReplayDialog:function(){
				let _this = this,
					data = this.getData().data,
					replayForm = this.getData().replayForm;
				if(!replayForm.replaycontent){
					app.tips('请输入回复内容');
				}else{
					app.request('//shopapi/addCommentReplay',{id:data[replayForm.index].id,replaycontent:replayForm.replaycontent},function(){
						app.tips('回复成功','success');
						data[replayForm.index].replaycontent = replayForm.replaycontent;
						_this.setData({data:data});
						_this.toHideReplayDialog();
					});
				};
			},
			getList:function(loadMore){
				let _this = this,
					picWidth = this.getData().picWidth,
					formData = _this.getData().form,
					pageCount = _this.getData().pageCount;
				_this.setData({'showLoading':true});
				if(loadMore) {
                    if(formData.page >= pageCount) {
                        _this.setData({ 'settings.bottomLoad': false, 'settings.noMore': true});
                    };
                }else {
                    _this.setData({ 'settings.bottomLoad': true, 'settings.noMore': false});
                };
				app.request('//shopapi/getGoodsComment',formData,function(backData){
					if(!backData.data){
						backData.data=[];
					};
					if(!loadMore) {
                        if(backData.count) {
                            pageCount = Math.ceil(backData.count / formData.size);
                            _this.setData({ pageCount: pageCount });
                            if(pageCount == 1) {
                                _this.setData({ 'settings.bottomLoad': false });
                            };
							_this.setData({'showNoData':false});
                        }else{
							_this.setData({'showNoData':true});
						};
                    };
                    let list = backData.data;
					if(list&&list.length){
						app.each(list,function(i,item){
							if(item.headpic){
								item.headpic = app.image.crop(item.headpic,40,40);
							};
							if(item.pics&&item.pics.length){
								let newPic = [];
								app.each(item.pics,function(l,g){
									newPic.push({
										key:g,
										file:app.image.crop(g,picWidth,picWidth),
									});
								});
								item.pics = newPic;
							}else{
								item.pics = [];
							};
						});
					};
					
                    if(loadMore) {
                        list = _this.getData().data.concat(backData.data);
                    };
                    _this.setData({
                        data:list,
						count:backData.count||0
                    });
				},'',function(){
					_this.setData({'showLoading':false});
				});
			},
			
			loadMore:function() {
				let _this = this,
                    form = this.getData().form;
                form.page++;
                this.setData({
                    form: form
                });
                this.getList(true);
            },
			onReachBottom: function() {
                if(this.getData().settings.bottomLoad) {
                    this.loadMore();
                };
            },
		}
	});
})();