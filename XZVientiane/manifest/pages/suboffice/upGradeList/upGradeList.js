(function() {

    let app = getApp();

    app.Page({
        pageId: 'suboffice-upGradeList',
        data: {
            systemId: 'suboffice',
            moduleId: 'upGradeList',
			isUserLogin: app.checkUser(),
            data: {},
            options: {},
            settings: {},
            language: {},
            client: app.config.client,
            form: {
				id:'',
				clubid:'',
				parentAccount:'',
			},
			showLoading:true,
			levelList:[],
			levelInfo:{},//等级介绍数据
			myLevelInfo:{},
			canBuy:true,
			totalPrice:0,
			checkParentDialog:{
				show:false,
				height:200,
				parentData:{},
				edit:0,//0-没修改，1-修改中，2-已修改
				account:'',
			},
        },
        methods: {
            onLoad:function(options){
				let _this = this;
				_this.setData({
					options: options,
					'form.clubid':options.clubid,
				});
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
			onShow: function(){
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
			onPullDownRefresh: function(){
				if (this.getData().isUserLogin) {
					this.load();
				};
				wx.stopPullDownRefresh();
			},
            load:function(){
				let _this = this,
					options = this.getData().options;
				app.request('//clubapi/getClubsLevel',{clubid:options.clubid,sort:'taix'},function(backData){
					if(backData&&backData.length){
						app.each(backData,function(i,item){
							if(item.ismylevel==1){
								_this.setData({myLevelInfo:item});
								_this.setLevelInfo(item._id);
								return false;
							}else if(i==backData.length-1&&item.ismylevel!=1){
								_this.setLevelInfo(backData[0]._id);
							};
						});
					};
					_this.setData({
						levelList:backData,
						showLoading:false,
					});
				});
			},
			changeLevel:function(e){
				let id = app.eData(e).id;
				this.setLevelInfo(id);
			},
			setLevelInfo:function(id){
				if(!id)return;
				let _this = this,
					myLevelInfo = this.getData().myLevelInfo;
				app.request('//clubapi/getClubsLevelDetail',{id:id},function(res){
					if(res.content){
						res.content = app.image.width(res.content,480);
					};
					_this.setData({
						'form.levelid':id,
						levelInfo:res
					});
					myLevelInfo.taix = myLevelInfo.taix?myLevelInfo.taix:0;
					res.taix = res.taix?res.taix:0;
					//等级大并且要开启了主动升级
					if(Number(myLevelInfo.taix)<Number(res.taix)&&res.payUpgradeStatus==1){
						_this.setData({canBuy:true});
					}else{
						_this.setData({canBuy:false});
					};
					if(res.payUpgradeStatus>0){
						_this.setData({
							totalPrice:Number(app.getPrice(res.payUpgradePrice))
						});
					}else{
						_this.setData({
							totalPrice:0
						});
					};	
				});
			},
			toBuy:function(){
				let _this = this,
					formData = this.getData().form;
				if(!formData.levelid){
					app.tips('选择一个升级类型','error');
				}else{
					app.request('//clubapi/applyJoinClub',formData,function(res){
						if(res.ordernum){
							app.navTo('../../pay/pay/pay?ordertype=' + res.ordertype + '&ordernum=' + res.ordernum + '&total=' + res.paymoney+'&backStep=1&clubid='+formData.clubid);
						}else{
							app.tips('加入成功','success');
							app.storage.set('pageReoload',1);
							setTimeout(app.navBack,1000);
						};
					});
				};
			},
			toCheckParent:function(){
				let _this = this,
					formData = this.getData().form;
				app.request('//clubapi/getJoinParent',{clubid:formData.clubid,vcode:app.session.get('vcode')||''},function(res){
					if(res&&res.canupdate!=1){//不能修改了
						_this.toBuy();
					}else{
						if(res&&res._id){
							if(res.headpic){
								res.headpic = app.image.crop(res.headpic,60,60);
							};
							_this.setData({
								'checkParentDialog.parentData':res,
								'checkParentDialog.show':true,
								'checkParentDialog.edit':0
							});
						}else{
							_this.setData({
								'checkParentDialog.parentData':'',
								'checkParentDialog.show':true,
								'checkParentDialog.edit':1
							});
						};
					};
				},function(){
					_this.setData({
						'checkParentDialog.parentData':'',
						'checkParentDialog.show':true,
						'checkParentDialog.edit':1
					});
				});
			},
			toHideCheckDialog:function(){
				this.setData({
					'checkParentDialog.show':false,
				});
			},
			toEditParent:function(){
				this.setData({
					'checkParentDialog.edit':1,
					'checkParentDialog.parentData':'',
					'checkParentDialog.account':'',
				});
			},
			checkAccount:function(){
				let _this = this,
					checkParentDialog = this.getData().checkParentDialog;
				if(!checkParentDialog.account){
					app.tips('请输入账号','error');
				}else{
					app.request('//userapi/getInfoByAccount',{account:checkParentDialog.account},function(res){
						if(res&&res._id){
							res.headpic = app.image.crop(res.headpic,60,60);
							res.account = checkParentDialog.account;
							_this.setData({
								'checkParentDialog.parentData':res,
								'checkParentDialog.edit':2
							});
						}else{
							app.tips('用户不存在','error');
						};
					});
				};
			},
			toConfirmCheckDialog:function(){
				let _this = this,
					checkParentDialog = this.getData().checkParentDialog,
					msg = '';
				if(!checkParentDialog.parentData||!checkParentDialog.parentData._id){
					msg = '请确认推荐人';
				};
				if(msg){
					app.tips(msg,'error');
				}else{
					_this.toHideCheckDialog();
					if(checkParentDialog.edit==2){
						_this.setData({'form.parentAccount':checkParentDialog.parentData.account});
						_this.toBuy();
					}else{
						_this.toBuy();
					};
				};
			},
			toCancelCheckDialog:function(){
				this.setData({'form.parentAccount':''});
				this.toBuy();
				this.toHideCheckDialog();
			},
        }
    });
})();