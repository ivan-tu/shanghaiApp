/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'suboffice-officeUserDetail',
        data: {
            systemId: 'suboffice',
            moduleId: 'officeUserDetail',
            data: {
				todayTotal:0,
				total:0,
				balance:0,
				activity:0,
			},
            options: {},
            settings: {},
            form: {},
			client:app.config.client,
			ajaxLoading:true,
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
				this.setData({options:options});
				this.load();
            },
			onShow:function(){
			},
            onPullDownRefresh: function() {
				if(app.checkUser()){
					this.load();
				};
                wx.stopPullDownRefresh();
            },
            load: function() {
				let _this = this,
					options = this.getData().options;
				this.setData({ajaxLoading:true});
				app.request('//clubapi/getClubsUserInfo',{userid:options.id,clubid:options.clubid},function(res){
					if(res){
						res.headpic = app.image.crop(res.headpic,80,80);
						_this.setData({
							data:res,
							ajaxNoData:false,
						});
					}else{
						_this.setData({ajaxNoData:true});
					};
				},'',function(){
					_this.setData({ajaxLoading:false});
				});
            },
			toUserDetail:function(){
				let options = this.getData().options;
				app.navTo('../../user/businessCard/businessCard?id='+options.id+'&clubid='+options.clubid);
			},
			changeParent:function(e){//修改推荐人
				let _this = this,
					options = this.getData().options,
					data = this.getData().data,
					type = app.eData(e).type,
					title = '';
				if(type=='parent'){
					title = '修改邀请人';
				}else if(type=='commander'){
					title = '修改团队长';
				}else if(type=='partner'){
					title = '修改合伙人';
				};
				app.storage.remove('clubUserEditData');
				this.dialog({
					title:title,
					url:'../../suboffice/officeUserDetailEdit/officeUserDetailEdit?title='+title+'&type=editParent',
					success:function(req){
						app.request('//clubapi/updateClubUserParent',{id:data._id,account:req.content,type:type},function(){
							app.tips('修改成功','scuess');
							_this.load();
						});
					},
				});
			},
			changeLevel:function(){//修改等级
				let _this = this,
					data = this.getData().data,
					options = this.getData().options;
				app.storage.set('clubUserEditData',{content:data.levelid||''});
				this.dialog({
					title:'修改会员等级',
					url:'../../suboffice/officeUserDetailEdit/officeUserDetailEdit?title=修改会员等级&type=editLevel&clubid='+options.clubid,
					success:function(req){
						app.request('//clubapi/updateClubUserLevel',{id:data._id,levelid:req.content},function(){
							app.tips('修改成功','scuess');
							_this.load();
						});
					},
				});
			},
			changeExpireTime:function(){//修改有效期
				let _this = this,
					data = this.getData().data,
					options = this.getData().options;
				app.storage.remove('clubUserEditData');
				this.dialog({
					title:'修改会员有效期',
					url:'../../suboffice/officeUserDetailEdit/officeUserDetailEdit?title=修改会员有效期&type=editTime',
					success:function(req){
						app.request('//clubapi/updateClubUserExpiretime',{id:data._id,date:req.content},function(){
							app.tips('修改成功','scuess');
							_this.load();
						});
					},
				});
			},
			changeBeizhu:function(){//修改备注
				let _this = this,
					data = this.getData().data,
					options = this.getData().options;
				app.storage.set('clubUserEditData',{content:data.summary||''});
				this.dialog({
					title:'修改备注',
					url:'../../suboffice/officeUserDetailEdit/officeUserDetailEdit?title=修改备注&type=editSummary',
					success:function(req){
						app.request('//clubapi/updateClubUserSummary',{id:data._id,summary:req.content},function(){
							app.tips('修改成功','scuess');
							_this.load();
						});
					},
				});
			},
			cancelLevel:function(){//取消会员
				let _this = this,
					data = this.getData().data,
					options = this.getData().options;
				app.confirm('确定移除吗？',function(){
					app.request('//clubapi/delClubUser',{id:data._id},function(){
						app.tips('移除成功','success');
						setTimeout(app.navBack,1000);
					});
				});
			},
        }
    });
})();