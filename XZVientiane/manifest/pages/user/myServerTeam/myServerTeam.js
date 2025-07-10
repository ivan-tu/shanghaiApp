/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-myServerTeam',
        data: {
            systemId: 'user',
            moduleId: 'myServerTeam',
            data: [],
            options: {},
            settings: {
				bottomLoad:false,
			},
            form: {
				page:1,
				size:10,
				keyword:'',
				isexpert:'',
				isagent:'',
				ispartner:'',
			},
			client:app.config.client,
			showLoading:false,
			showNoData:false,
			count:0,
			pageCount:0,
			picWidth:((app.system.windowWidth>480?480:app.system.windowWidth)-40)*0.5,
			picHeight:((app.system.windowWidth>480?480:app.system.windowWidth)-40)*0.5/0.875,
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
				_this.setData({
					options: options,
					form:app.extend(this.getData().form,options)
				});
				app.checkUser({
					goLogin: false,
					success: function () {
						_this.setData({
							isUserLogin: true
						});
					}
				});
				this.load();
            },
            onPullDownRefresh: function() {
                this.load();
                wx.stopPullDownRefresh();
            },
            load: function() {
				this.getList();
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
			screen:function(e){
				let formData = this.getData().form,
					type = app.eData(e).type,
					value = app.eData(e).value;
				formData[type] = value;
				formData.page = 1;
				this.setData({form:formData});
				this.getList();
			},
			screenType:function(e){
				let formData = this.getData().form,
					type = app.eData(e).type;
				switch(type){
					case 'all':
					formData.isexpert = '';
					formData.isagent = '';
					formData.ispartner = '';
					break;
					case 'isexpert':
					formData.isexpert = '1';
					formData.isagent = '';
					formData.ispartner = '';
					break;
					case 'isagent':
					formData.isexpert = '';
					formData.isagent = '1';
					formData.ispartner = '';
					break;
					case 'ispartner':
					formData.isexpert = '';
					formData.isagent = '';
					formData.ispartner = '1';
					break;
					case 'other':
					formData.isexpert = '0';
					formData.isagent = '';
					formData.ispartner = '';
					break;
				};
				formData.page = 1;
				this.setData({form:formData});
				this.getList();
			},
			toDetail:function(e){
				if(app.eData(e).id){
					//app.navTo('../../user/businessCard/businessCard?id='+app.eData(e).id);
					app.navTo('../../user/myTeamDetail/myTeamDetail?userid='+app.eData(e).id);
				};
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
				app.request('//operapi/getMyOperServerTeam',formData,function(backData){
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
								item.headpic = app.image.crop(item.headpic,70,70);
							};
							if(item.wxCodePic){
								item.wxCodePic = app.image.width(item.wxCodePic,240);
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
			callTel:function(e){
				let tel = app.eData(e).tel;
				if(app.config.client=='wx'){
					app.actionSheet(['复制号码','拨打号码'],function(res){
						switch(res){
							case 0:
							wx.setClipboardData({
								data:tel,
								success: function () {
								  app.tips('复制成功', 'success');
								},
							});
							break;
							case 1:
							wx.makePhoneCall({
								phoneNumber: tel
							});
							break;
						};
					});
				}else if(app.config.client=='app'){
					wx.app.call('copyLink', {
						data: {
							url:tel
						},
						success: function (res) {
							app.tips('复制成功', 'success');
						}
					});
				}else{
					$('body').append('<input class="readonlyInput" value="'+tel+'" id="readonlyInput" readonly />');
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
			viewThisImage: function (e) {
				let _this = this,
					pic = app.eData(e).pic;
				pic = pic.split('?')[0];
				app.previewImage({
					current: pic,
					urls: [pic]
				})
			},
        }
    });
})();