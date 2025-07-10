(function () {
	let app = getApp();
	app.Page({
		pageId: 'suboffice-clubLevelAdd',
		data: {
			systemId: 'suboffice',
			moduleId: 'clubLevelAdd',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {},
			language: {},
			form: {
				name:'',
				clubid:'',
				summary:'',
				content:'',
				directReward:[],//{name,id,total}
				treamRewardStatus:0,
				treamReward:[],//{name,id,total}
				payUpgradeStatus:0,//0/1
				payUpgradePrice:0,
				payUpgradeDays:'',
				remUpgradeStatus:0,//0/1/2
				remUpgradeLevelName:'',
				remUpgradeLevelId:'',
				remUpgradeLevelNum:'',
				partnerRewardStatus:0,
				partnerRewardRatio:'',
			},
			levelList:[],
			levelIndex:'',
		},
		methods: {
			onLoad: function (options) {
				let _this = this;
				this.setData({
					options: options,
					'form.clubid':options.clubid,
				});
				if(options.id){
					app.setPageTitle('编辑等级');
					this.setData({
						'form.id':options.id,
					});
				};
				this.getClubsLevel(this.load);
			},
			onShow: function () {
				let isUserLogin = app.checkUser();
				if (isUserLogin != this.getData().isUserLogin) {
					this.setData({
						isUserLogin: isUserLogin
					});
					if (isUserLogin) {
						this.load()
					}
				};
			},
			onPullDownRefresh: function () {
				wx.stopPullDownRefresh()
			},
			load: function () {
				let _this = this,
					options = this.getData().options;
				if (options.id) {
					app.request('//clubapi/getClubsLevelDetail', {id: options.id}, function (res) {
						console.log(app.toJSON(res));
						_this.setData({
							'form.name':res.name||'',
							'form.taix':res.taix||'',
							'form.summary':res.summary||'',
							'form.content':res.content||'',
							'form.directReward':_this.getLevelReward(res.directReward),
							'form.treamRewardStatus':res.treamRewardStatus,
							'form.treamReward':_this.getLevelReward(res.treamReward),
							'form.payUpgradeStatus':res.payUpgradeStatus||0,
							'form.payUpgradePrice':res.payUpgradePrice,
							'form.payUpgradeDays':res.payUpgradeDays,
							'form.remUpgradeStatus':res.remUpgradeStatus||0,
							'form.remUpgradeLevelName':res.remUpgradeLevelName||'',
							'form.remUpgradeLevelId':res.remUpgradeLevelId||'',
							'form.remUpgradeLevelNum':res.remUpgradeLevelNum||'',
							'form.partnerRewardStatus':res.partnerRewardStatus||0,
							'form.partnerRewardRatio':res.partnerRewardRatio||'',
						});
						if(res.remUpgradeStatus!=0&&app.config.client!='wx'){
							setTimeout(function () {
								_this.selectComponent('#pickerLevel').reset();
							},200);
						};
						/*setTimeout(function () {
							if (res.content) {
								_this.selectComponent('#uploadPic').reset(res.content);
							};
						}, 300);*/
					});
				}else{
					_this.setData({
						'form.directReward':_this.getLevelReward(),
						'form.treamReward':_this.getLevelReward(),
					});
				};
			},
			getClubsLevel:function(callback){
				let _this = this,
					options = this.getData().options;
				app.request('//clubapi/getClubsLevel',{clubid:options.clubid,sort:'taix'},function(res){
					let nextTaix = 1;
					if(res&&res.length){
						app.each(res,function(i,item){
							if(item.taix){
								nextTaix = Number(item.taix)+1;
							};
						});
						_this.setData({levelList:res});
					}else{
						_this.setData({levelList:[]});
					};
					if(!options.id){
						_this.setData({'form.taix':nextTaix});
					};
				},'',function(){
					if(typeof callback == 'function'){
						callback();
					};
				});
			},
			changeInput:function(e){
				let value = app.eValue(e),
					index = Number(app.eData(e).index),
					type = app.eData(e).type,
					formData = this.getData().form;
				formData[type][index].total = value;
				this.setData({form:formData});
			},
			getLevelReward:function(data){
				let levelList = this.getData().levelList,
					reSetData = {};
				if(data){
					app.each(data,function(i,item){
						reSetData[item.id] = item.total;
					});
				};
				if(levelList.length){
					let newArray = [];
					app.each(levelList,function(i,item){
						newArray.push({
							name:item.name,
							id:item._id,
							total:data&&reSetData[item._id]?reSetData[item._id]:'',
						});
					});
					return newArray;
				}else{
					return [];
				};
			},
			switchThis: function (e) {
				let type = app.eData(e).type,
					formData = this.getData().form,
					levelList = this.getData().levelList;
				if(type=='payUpgradeStatus'&&formData.payUpgradeStatus==0){
					let canSet = 1;
					app.each(levelList,function(i,item){
						if(item.payUpgradeStatus==1&&!item.payUpgradePrice){
							canSet = 0;
							return;
						};
					});
					if(!canSet){
						app.tips('只允许一个等级免费升级','error');
						return false;
					};
				};
				formData[type] = formData[type] == 1 ? 0 : 1;
				this.setData({
					form: formData
				});
			},
			selectThis:function(e){
				let _this = this,
					type = app.eData(e).type,
					value = app.eData(e).value,
					formData = this.getData().form;
				formData[type] = value;
				this.setData({
					form: formData
				});
				if(type=='remUpgradeStatus'&&value!=0&&app.config.client!='wx'){
					setTimeout(function () {
						_this.selectComponent('#pickerLevel').reset();
					},200);
				};
			},
			bindLevelChange:function(e){
				let value = e.detail.value,
					levelList = this.getData().levelList;
				if(levelList&&levelList.length){
					this.setData({
						levelIndex:value,
						'form.remUpgradeLevelName':levelList[value].name,
						'form.remUpgradeLevelId':levelList[value]._id,
					});
				}else{
					app.tips('请先添加会员等级','error');
				};
			},
			uploadPic: function (e) {
				this.setData({
					'form.content': e.detail.src[0]
				});
			},
			submit: function () {
				let _this = this,
					isPrice = /^[0-9]+.?[0-9]*$/,
					isNum = /^[1-9]\d*$/,//不包括0
					isNumt = /^[+]{0,1}(\d+)$/,//包括0
					formData = this.getData().form,
					msg = '';
				if(!formData.name) {
					msg = '请输入名称';
				}else if(!isNum.test(formData.taix)) {
					msg = '请输入正确的排序';
				}else if(formData.payUpgradeStatus!=0&&!isPrice.test(formData.payUpgradePrice)){
					msg = '请输入正确的升级费用';
				}else if(formData.payUpgradeDays&&!isNumt.test(formData.payUpgradeDays)){
					msg = '请输入正确的天数';
				}else if(formData.remUpgradeStatus==1&&!formData.remUpgradeLevelId){
					msg = '请选择推荐会员等级';
				}else if(formData.remUpgradeStatus==2&&!formData.remUpgradeLevelId){
					msg = '请选择团队会员等级';
				}else if(formData.remUpgradeStatus==1&&!isNum.test(formData.remUpgradeLevelNum)){
					msg = '请输入正确的推荐会员数量';
				}else if(formData.remUpgradeStatus==2&&!isNum.test(formData.remUpgradeLevelNum)){
					msg = '请输入正确的团队会员数量';
				}else if(formData.partnerRewardStatus==1&&!isPrice.test(formData.partnerRewardRatio)){
					msg = '请输入正确的培育团队长提成';
				}
				console.log(app.toJSON(formData));
				if (msg) {
					app.tips(msg, 'error');
				} else {
					if(formData.id){
						app.request('//clubapi/updateClubsLevel', formData, function () {
							app.tips('编辑成功', 'success');
							setTimeout(function () {
								app.navBack();
							}, 1000);
						});
					}else{
						app.request('//clubapi/addClubsLevel', formData, function () {
							app.tips('添加成功', 'success');
							_this.getClubsLevel(function(){
								_this.setData({
									'form.name':'',
									'form.taix':'',
									'form.summary':'',
									'form.content':'',
									'form.directReward':_this.getLevelReward(),
									'form.treamRewardStatus':0,
									'form.treamReward':_this.getLevelReward(),
									'form.payUpgradeStatus':0,
									'form.payUpgradePrice':0,
									'form.payUpgradeDays':'',
									'form.remUpgradeStatus':0,
									'form.remUpgradeLevelName':'',
									'form.remUpgradeLevelId':'',
									'form.remUpgradeLevelNum':'',
									'form.partnerRewardStatus':0,
									'form.partnerRewardRatio':'',
								});
								/*setTimeout(function () {
									_this.selectComponent('#uploadPic').reset();
								}, 300);*/
							});
						});
					}
				}
			},
		}
	})
})();