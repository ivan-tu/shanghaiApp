/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'suboffice-officeUserList',
        data: {
            systemId: 'suboffice',
            moduleId: 'officeUserList',
            data: [],
            options: {},
            settings: {
				bottomLoad:false,
			},
            form: {
				page:1,
				size:10,
				keyword:'',
				verifyStatus:'1',
				payStatus:1,
				sort:'',
				clubid:'',
				levelid:'',
			},
			client:app.config.client,
			showLoading:false,
			showNoData:false,
			count:0,
			pageCount:0,
			picWidth:((app.system.windowWidth>480?480:app.system.windowWidth)-40)*0.5,
			picHeight:((app.system.windowWidth>480?480:app.system.windowWidth)-40)*0.5/0.875,
			ismy:0,
			levelList:[],
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
				this.setData({
					options: options,
					form:app.extend(this.getData().form,options),
				});
				//获取会员等级
				app.request('//clubapi/getClubsLevel',{clubid:options.clubid,sort:'taix'},function(res){
					if(res&&res.length){
						_this.setData({
							levelList:res
						});
					}else{
						_this.setData({
							levelList:[]
						});
					};
				});
				this.load();
            },
            onPullDownRefresh: function() {
				this.setData({'form.page':1});
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
			screenType:function(e){
				let type = app.eData(e).type,
					value = app.eData(e).value,
					formData = this.getData().form;
				formData.page = 1;
				if(type=='payStatus'){
					formData.verifyStatus = '';
				}else{
					formData.payStatus = '1';
				};
				formData[type] = value;
				this.setData({form:formData});
				this.getList();
			},
			toDetail:function(e){
				let _this = this,
					options = this.getData().options,
					index = Number(app.eData(e).index),
					data = this.getData().data,
					id = data[index]._id,
					uid = data[index].userid;
				if(!uid)return;
				if(this.getData().ismy==1){
					app.navTo('../../suboffice/officeUserDetail/officeUserDetail?id='+uid+'&clubid='+options.clubid);
				}else{
					app.navTo('../../user/businessCard/businessCard?id='+uid+'&clubid='+options.clubid);
				};
			},
			toAddUser:function(){
				let options = this.getData().options;
				app.navTo('../../suboffice/officeUserAdd/officeUserAdd?clubid='+options.clubid);
			},
			getList:function(loadMore){
				let _this = this,
					formData = _this.getData().form,
					pageCount = _this.getData().pageCount,
					ajaxURL = '//subofficeapi/getSubofficeUserList';
				if(loadMore){
					if (formData.page >= pageCount) {
						_this.setData({'settings.bottomLoad':false});
					};
				};
				_this.setData({'showLoading':true});
				if(formData.clubid){
					ajaxURL = '//clubapi/getClubUserList';
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
							item.id = item.id||item._id;
							if(item.headpic){
								item.headpic = app.image.crop(item.headpic,70,70);
							};
							if(item.giftlist&&item.giftlist.length){
								app.each(item.giftlist,function(a,b){
									item.giftlist[a].pic = app.image.crop(b.giftdata.pic,30,30);
								});
							};
						});
					};
					if(loadMore){
						list = _this.getData().data.concat(list);
					}else{
						_this.setData({
							ismy:backData.ismy||0,
						});
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