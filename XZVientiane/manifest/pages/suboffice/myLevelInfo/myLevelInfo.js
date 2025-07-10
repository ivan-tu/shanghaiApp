(function() {

    let app = getApp();

    app.Page({
        pageId: 'suboffice-myLevelInfo',
        data: {
            systemId: 'suboffice',
            moduleId: 'myLevelInfo',
			isUserLogin: app.checkUser(),
            data: {},
            options: {},
            settings: {
				bottomLoad:true
			},
            language: {},
            client: app.config.client,
            form: {
				clubid:'',
				levelid:'',
			},
			ajaxLoading:true,
			levelList:[],
			myLevelInfo:'',
			levelInfo:{},
			totalPrice:0,
			canBuy:0,//0-不能买，1-能买，2-续费，3-只允许推广升级
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
				let _this = this,
					isUserLogin = app.checkUser();
				if (isUserLogin != this.getData().isUserLogin) {
					this.setData({
						isUserLogin: isUserLogin
					});
					if (isUserLogin) {
						_this.load();
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
				app.request('//clubapi/getClubDetail',{id:options.clubid},function(res){
					_this.setData({data:res});
					//设置分享
					let newData = {
						id: res._id,
						pocode: app.storage.get('pocode')
					},
					shareTitle = res.name;
					res.activity_sharepic = app.image.crop(res.pic,480,480);	
					if(app.config.client=='wx'){
						shareTitle+='-'+res.slogan;
					};
					let pathUrl = app.mixURL('/p/suboffice/clubDetail/clubDetail', newData),
						shareData = {
							shareData: {
								title: shareTitle,
								content: res.slogan||'',
								path: 'https://' + app.config.domain + pathUrl,
								pagePath: pathUrl,
								img: res.activity_sharepic,
								imageUrl: res.activity_sharepic,
								weixinH5Image: res.activity_sharepic,
								wxid: 'gh_601692a29862',
								showMini: false,
								hideCopy: app.config.client=='wx'?true:false,
							},
							loadPicData: {
								ajaxURL: '//clubapi/getClubSharePic',
								requestData: {
									clubid:res._id
								}
							},
						},
						reSetData = function () {
							setTimeout(function () {
								if (_this.selectComponent('#newShareCon')) {
									if(!res.sharepic){
										shareData.loadPicData = '';
									};
									_this.selectComponent('#newShareCon').reSetData(shareData);
								} else {
									reSetData();
								};
							}, 500);
						};
					reSetData();
				});
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
						ajaxLoading:false,
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
					if(Number(myLevelInfo.taix)==Number(res.taix)&&res.payUpgradeStatus>0&&res.payUpgradeDays>0){
						//当前等级，开启了主动升级并且是有效期的
						_this.setData({
							canBuy:2,
							totalPrice:Number(app.getPrice(res.payUpgradePrice))
						});
					}else if(Number(myLevelInfo.taix)<Number(res.taix)){
						//高等级
						if(res.payUpgradeStatus==1&&!res.payUpgradePrice){
							//开启了主动升级并且是免费
							_this.setData({
								canBuy:1,
								totalPrice:0
							});
						}else if(res.payUpgradeStatus==1&&res.payUpgradePrice){
							//开启了主动升级并且是付费
							_this.setData({
								canBuy:1,
								totalPrice:Number(app.getPrice(res.payUpgradePrice))
							});
						}else if(res.payUpgradeStatus==0&&res.remUpgradeStatus>0){
							//关闭了主动升级，并且开启了推广升级
							_this.setData({
								canBuy:3,
								totalPrice:0
							});
						};
					}else{
						_this.setData({
							canBuy:0
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
					app.request('//clubapi/buyClubLevel',formData,function(res){
						if(res.ordernum){
							app.navTo('../../pay/pay/pay?ordertype=' + res.ordertype + '&ordernum=' + res.ordernum + '&total=' + res.paymoney+'&backStep=1&clubid='+formData.clubid);
						}else{
							app.tips('升级成功','success');
							app.storage.set('pageReoload',1);
							_this.load();
						};
					});
				};
			},
			toShare:function(){
				this.selectComponent('#newShareCon').openShare();
			},
			onShareAppMessage: function () {
				return app.shareData;
			},
			toOut:function(){
				let _this = this,
					formData = this.getData().form;
				app.confirm({
					title:'提示',
					content:'退出后费用不退还，重新加入需再次付费',
					cancelText:'先不退出',
					confirmText:'确定退出',
					success:function(req){
						if(req.confirm){
							app.request('//clubapi/signoutClub',{clubid:formData.clubid},function(){
								app.tips('退出成功','success');
								app.storage.set('pageReoload',1);
								setTimeout(app.navBack,1000);
							});
						};
					},
				});
			},
        }
    });
})();