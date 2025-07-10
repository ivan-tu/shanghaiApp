/**
 *模块组件构造器
 */
(function () {

	let app = getApp();

	app.Page({
		pageId: 'activity-signupList',
		data: {
			systemId: 'activity',
			moduleId: 'signupList',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {
				bottomLoad:true,
				noMore:false,
			},
			language: {},
			form: {
				page: 1,
				size: 20,
				activityid: '',
				getype: '', //friend
				ticketname: '',
				signstatus:'',
				level:'',
				keyword:'',
				userid:'',
				status:'',
			},
			showLoading: false,
			showNoData: false,
			pageCount: 0,
			count: 0,
			ismaster: 0, //是否为活动发起人
			tkcountinfo: [],// 票的类型
			typeList: [],// 已购已领
			buy: 0,
			receive: 0,
			mustpay: 0,
			joinTotal:0,
			showInfo:true,
			client:app.config.client,
			levelData:[],
			selectStatus:false,
			getType:'user',//order1 order2
			filePath:app.config.filePath,
		},
		methods: {
			onLoad: function (options) {
				let _this = this;
				this.setData({
					options:options,
					'form.activityid': options.id
				});
				//获取票种类
				app.request("//activityapi/getActivityTicket", {id: options.id}, function (backData) {
					if (backData.tickets && backData.tickets.length) {
						_this.setData({
							typeList: backData.tickets
						});
					}else{
						_this.setData({
							typeList: []
						});
					};
				});
				/*if(options.clubid){
					app.request('//clubapi/getClubsLevel',{clubid:options.clubid,sort:'taix'},function(res){
						if(res&&res.length){
							_this.setData({
								levelData:res
							});
						}else{
							_this.setData({
								levelData:[]
							});
						};
					});
				};*/
				this.load();
			},
			onShow:function (){
			},
			onPullDownRefresh: function () {
				this.setData({
					'form.page': 1
				});
				if (this.getData().isUserLogin) {
					this.load();
				};
				wx.stopPullDownRefresh();
			},
			load: function () {
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
			screenType: function (e) {
				let _this = this,
					type = app.eData(e).type,
					value = app.eData(e).value,
					formData = this.getData().form;
				formData[type] = value;
				if(type!='signstatus'){
					formData['signstatus'] = '';
				};
				if(type!='status'){
					formData['status'] = '';
				};
				formData.page = 1;
				this.setData({form:formData});
				this.getList();
			},
			toUserDetail:function(e){
				let _this = this,
					ismaster = this.getData().ismaster,
					options = this.getData().options,
					data = this.getData().data,
					index = Number(app.eData(e).index),
					btnArray = ['取消报名','购票记录','个人主页'],
					id = data[index]._id,
					userid = data[index].userid;
				if(!ismaster){
					app.navTo('../../user/businessCard/businessCard?id='+userid);
					return;
				};
				if(options.clubid){
					btnArray.push('修改会员等级');
				};
				app.actionSheet(btnArray,function(res){
					switch(btnArray[res]){
						case '个人主页':
						app.navTo('../../user/businessCard/businessCard?id='+userid);
						break;
						case '修改会员等级':
						_this.dialog({
							title:'选择会员等级',
							url:'../../suboffice/clubLevelSelect/clubLevelSelect?clubid='+options.clubid,
							success:function(req){
								setTimeout(function(){
									app.confirm({
										content:'确定修改'+data[index].username+'为：'+req.name,
										success:function(reb){
											if(reb.confirm){
												let requestData = {
													clubid:options.clubid,
													ids:[id],
													levelid:req._id,
												};
												app.request('//clubapi/batchAddClubUser',requestData,function(){
													app.tips('修改成功','success');
												});
											};
										},
									});
								},500);
							},
						});
						break;
						case'购票记录':
							_this.setData({
								'form.userid':userid,
								'form.page':1,
								'getType':'order1',
							});
							_this.getList();
						break;
						case '取消报名':
							app.confirm('确定取消报名吗？',function(){
								app.request('//activityapi/delSignup',{id:id},function(){
									app.tips('取消成功','success');
									data.splice(index,1);
									_this.setData({data:data});
								});
							});
						break;
					};
				});
				//app.navTo('../../businessCard/info/info?id='+data[index].userid+'&activityid='+options.id);
			},
			getList: function (loadMore) {
				let _this = this,
					formData = _this.getData().form,
					pageCount = _this.getData().pageCount,
					getType = this.getData().getType,
					ajaxURL = '//activityapi/getActivityUser';
				if(getType=='order1'){//购票
					ajaxURL = '//activityapi/getActivityTicketList';
					formData.sendstatus = 0;
				}else if(getType=='order2'){//赠票
					ajaxURL = '//activityapi/getActivityTicketList';
					formData.sendstatus = 1;
				};
				_this.setData({
					'showLoading': true
				});
				if (loadMore) {
					if (formData.page >= pageCount) {
						_this.setData({
							'settings.bottomLoad': false,
							'settings.noMore': true
						});
					};
				} else {
					_this.setData({
						'settings.bottomLoad': true,
						'settings.noMore': false
					});
				};
				app.request(ajaxURL, formData, function (backData) {
					if (!backData.data) {
						backData.data = [];
					};
					if (!loadMore) {
						if (backData.count) {
							pageCount = Math.ceil(backData.count / formData.size);
							_this.setData({
								pageCount: pageCount
							});
							if (pageCount == 1) {
								_this.setData({
									'settings.bottomLoad': false
								});
							};
							_this.setData({
								'showNoData': false
							});
						} else {
							_this.setData({
								'showNoData': true
							});
						};
					};
					let list = backData.data;
					if (list && list.length) {
						app.each(list, function (i, item) {
							item.id = item.id||item._id;
							if(item.headpic){
								item.headpic = app.image.crop(item.headpic, 80, 80);
							};
							if(item.userdata&&item.userdata.headpic){
								item.userdata.headpic = app.image.crop(item.userdata.headpic, 80, 80);
							}else{
								item.userdata = {};
							};
							item.select = 0;
						});
					};
					if (loadMore) {
						list = _this.getData().data.concat(backData.data);
					};
					_this.setData({
						data: list,
						count: backData.count || 0,
					});
					if(!loadMore&&getType=='user'){
						_this.setData({
							ismaster:backData.ismaster || 0
						});
					};
				}, '', function () {
					_this.setData({
						'showLoading': false
					});
				});
			},
			callTel: function (e) {
				let tel = app.eData(e).tel;
				if (!tel) return;
				wx.makePhoneCall({
					phoneNumber: tel
				});
			},
			exportThis:function(){
				let activityid = this.getData().form.activityid,
					content = 'https://'+app.config.domain+'/export/exportAcvityUser?id='+activityid;
				app.confirm({
					title:'复制到浏览器中打开',
					content:content,
					confirmText:'复制',
					success:function(res){
						if(res.confirm){
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
							} else {
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
						};
					},
				});
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
			loadMore: function () {
				let _this = this,
					form = this.getData().form;
				form.page++;
				this.setData({
					form: form
				});
				this.getList(true);
			},
			onReachBottom: function () {
				if (this.getData().settings.bottomLoad) {
					this.loadMore();
				};
			},
			cancelThis:function(e){
				let _this = this,
					index = Number(app.eData(e).index),
					data = this.getData().data;
				app.confirm('确定要取消吗？',function(){
					app.request('//activityapi/delSignup',{id:data[index]._id},function(){
						app.tips('取消成功','success');
						data.splice(index,1);
						_this.setData({data:data});
					})
				});
			},
			exploreThis:function(){
				let _this = this,
					options = this.getData().options,
					url = 'https://'+app.config.domain+'/export/exportActivityUser?id='+options.id;
				if(app.config.client=='wx'){
				}else{
					app.confirm({
						title:'下载地址',
						content:url,
						confirmText:'复制',
						cancelText:'关闭',
						success:function(req){
							if(req.confirm){
								  $('body').append('<input class="readonlyInput" value="'+url+'" id="readonlyInput" readonly />');
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
					});
				};
			},
			changeShowInfo:function(){
				this.setData({showInfo:!this.getData().showInfo});
			},
			toSelectThis:function(e){
				let index = Number(app.eData(e).index),
					data = this.getData().data;
				data[index].select = data[index].select==1?0:1;
				this.setData({data:data});
			},
			cancelSelect:function(){
				this.setData({selectStatus:!this.getData().selectStatus});
			},
			confirmSelect:function(){
				let _this = this,
					options = this.getData().options,
					data = this.getData().data,
					ids = [];
				app.each(data,function(i,item){
					if(item.select==1){
						ids.push(item._id);
					};
				});
				if(ids.length>0){
					_this.dialog({
						title:'选择会员等级',
						url:'../../suboffice/clubLevelSelect/clubLevelSelect?clubid='+options.clubid,
						success:function(req){
							setTimeout(function(){
								app.confirm({
									content:'确定修改'+ids.length+'个用户为：'+req.name,
									success:function(reb){
										if(reb.confirm){
											let requestData = {
												clubid:options.clubid,
												ids:ids,
												levelid:req._id,
											};
											app.request('//clubapi/batchAddClubUser',requestData,function(){
												app.tips('修改成功','success');
												_this.setData({selectStatus:false});
											});
										};
									},
								});
							},500);
						},
					});
				}else{
					app.tips('请选择用户','error');
				};
			},
			screenGetType:function(e){
				this.setData({
					'form.userid':'',
					'form.signstatus':'',
					'form.status':'',
					getType:app.eData(e).type,
					'form.page':1,
				});
				this.getList();
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
			toRefund:function(e){
				let _this = this,
					index = Number(app.eData(e).index),
					id = app.eData(e).id,
					data = this.getData().data;
				app.confirm('确定要退票吗?',function(){
					app.request('//activityapi/delTicket',{id:id},function(){
						app.tips('退票成功','success');
						data[index].status = 2;
						_this.setData({data:data});
					});
				});
			},
		}
	});
})();