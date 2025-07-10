(function () {
	let app = getApp();
	app.Page({
		pageId: 'activity-add',
		data: {
			systemId: 'activity',
			moduleId: 'add',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {},
			language: {},
			form: {
				name:'', //活动名称
				isfree:2,//是否免费1-是2-不是
				bDate: '', //开始日期
				eDate: '', //结束日期
				sDate: '', //截止日期
				bTime: '', //开始时间
				eTime: '', //结束时间
				sTime: '',//截止时间
				area:[], //地区
				address:'',
				addressName:'', //酒店场所名称
				limitnum:'', //限制人数
				content: '', //内容
				describe: '', //分享描述
				pic: '16872518055668487.jpg', //封面
				h5sharepic: '', //h5分享图
				miniwxsharepic: '', //微信分享图
				//price:'',//价格
				showusernum: 1, //是否显示报名人数
				selfcancel:0,//是否可以取消活动
				paytype:'cash',//diamond/cash/wallte钻石，现金，友币
				diamondpay:0,//是否允许钻石支付
				publicity:1,//报名范围1-所有2-俱乐部
				levelset:0,//所有人，所有会员0-5
				joinclubids:'',//俱乐部id
				category:'',//活动分类
				pics:[],//活动图片
				levelids:[],//限制俱乐部自定义会员等级
				//priceList:{},
				tickets:[],
				grouppic:'', //群二维码
				signRefund:0,//签到后退款
				acceptGift:1,//开启收礼
				joinclubStatus:0,//联合举办
				joinclubids:[],//联合举办俱乐部id
				joinratio:'',//联合举办分润
				iscollect:0,//信息采集
				collectTips:'',
				collectList:[],
				showstatus:1,//是否私密 0 是 1 否
				typeid:'',
				typename:'',
				customerTel:'',//客服手机号
				/*
				poster: [], //海报图片
				area: {
					province: '',
					country: '',
					city: '',
					areaname: ''
				}, //地区
				address: '',
				addressName: '', //酒店场所名称
				otheruser: 0, //默认允许带人
				jionstatus: 1, //报名开关
				limituser: '', //活动总参与数
				target: [0], //允许报名的对象
				formList: [], //表单列表,暂时没用到复杂的表单
				mustpay: 0, //是否需要付费
				tickets: [], //票的种类价格
				projectname: '',
				projectid: '',
				weixinId:'',*/
			},
			defaultCollectList:[{
					"id": "name",
					"title": "姓名",
					"value": 0,
					"type": "text"
				},
				{
					"id": "mobile",
					"title": "电话",
					"value": 0,
					"type": "tel"
				},
				{
					"id": "sex",
					"title": "性别",
					"value": 0,
					"type": "radio",
					"data": [{
							"name": "男",
							"value": 1
						},
						{
							"name": "女",
							"value": 2
						}
					]
				},
				{
					"id": "age",
					"title": "年龄",
					"value": 0,
					"type": "number"
				},
				{
					"id": "idcard",
					"title": "身份证号",
					"value": 0,
					"type": "text"
				},
				{
					"id": "cardpic",
					"title": "身份证照",
					"value": 0,
					"type": "cardpic"
				},
				{
					"id": "company",
					"title": "公司",
					"value": 0,
					"type": "text"
				},
				{
					"id": "position",
					"title": "职位",
					"value": 0,
					"type": "text"
				},
				{
					"id": "job",
					"title": "职业",
					"value": 0,
					"type": "text"
				}
			],
			bDate: app.getNowDate(),
			eDate: app.getNowDate(1),
			sDate: app.getNowDate(1),
			area: [],
			files: [],
			uploadSuccess: true,
			imageWidth: Math.ceil(((app.system.windowWidth>480?480:app.system.windowWidth) - 120-20) / 3),
			showAddFormDialog: false, //是否显示添加表单弹框
			dialogFormData: {
				title: '', //名称
				targetList: [], //对象数组临时用
				target: [], //对象
			},
			targetList: [],
			editIndex: '', //编辑状态
			files2: [], //分享海报
			userInfo:{},
			clubList:[],
			activityCategory:[],
			cagegoryIndex:'',
			clubLevelList:[],
			defaultPriceList:{'标准价':''},
			defaultPriceName:{0:'默认'},
			diamondTips:'',
			joinclubList:[],//联办的俱乐部列表
		},
		methods: {
			onLoad: function (options) {
				let _this = this;
				_this.setData({
					options: options
				});
				if(options.id) {
					this.setData({
						'form.id': options.id
					});
				};
				if(options.clubid){//俱乐部添加
					this.setData({
						'form.clubid':options.clubid
					});
					//获取本俱乐部所有会员等级
					app.request('//clubapi/getClubsLevel',{clubid:options.clubid,sort:'taix'},function(res){
						let defaultPriceList = _this.getData().defaultPriceList;
						let defaultPriceName = _this.getData().defaultPriceName;
						if(res&&res.length){
							app.each(res,function(i,item){
								item.active = 1;
								defaultPriceList[item.name] = '';
								defaultPriceName[item._id] = item.name;
							});
							_this.setData({clubLevelList:res});
						}else{
							_this.setData({clubLevelList:[]});
						};
						_this.setData({
							defaultPriceList:defaultPriceList,
							defaultPriceName:defaultPriceName,
						});
						if(!options.id){
							_this.addTicketList();
						};
					});
				};
				let newArray = [{
					name: '所有人',
					value: '0',
					joinStatus: 1,
					ticketPrice: '',
					optionStatus: 1,
				}];
				_this.setData({
					targetList: newArray,
					'dialogFormData.targetList': newArray
				});
				//获取我的资料-判断是否有权限发友币活动
				app.request('//userapi/info', {}, function(res){
					_this.setData({
						userInfo:res
					});
				},function(){});
				//获取我的俱乐部
				/*app.request('//homeapi/getMyClubs',{},function(res){
					if(res&&res.length){
						app.each(res,function(i,item){
							item.active = 0;
						});
						_this.setData({clubList:res});
					}else{
						_this.setData({clubList:[]});
					};
				});*/
				
				app.request('//set/get', {type: 'activityCategory'}, function (res) {
					if(res.list&&res.list.length){
						_this.setData({
							activityCategory: res.list,
							diamondTips:res.diamondTips||'',
						});
						if(app.config.client!='wx'){
							setTimeout(function () {
								_this.selectComponent('#pickerCategory').reset();
							},200);
						};
					};
				});
				_this.load();
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
				if (this.getData().isUserLogin) {
					this.load()
				};
				wx.stopPullDownRefresh()
			},
			changeArray: function (array, type) { //type=1把[0,1]转化为[1,1,0,0,0],type=2反转化
				let arrayDemo = [0, 0, 0, 0, 0],
					newArray = [];
				if (type == 1) {
					app.each(array, function (i, item) {
						array[i] = Number(item);
					});
					app.each(arrayDemo, function (i, item) {
						if (app.inArray(i, array) >= 0) {
							arrayDemo[i] = 1;
						};
					});
					return arrayDemo;
				} else if (type == 2) {
					app.each(array, function (i, item) {
						item = Number(item);
						if (item == 1) {
							newArray.push(i);
						};
					});
					return newArray;
				};
			},
			load: function () {
				let _this = this,
					imageWidth = this.getData().imageWidth,
					targetList = this.getData().targetList,
					formData = this.getData().form;
				if (formData.id) {
					app.request('//activityapi/getActivityDetail', {
						id: formData.id
					}, function (res) {
						if (res.target && res.target.length) {
							app.each(targetList, function (i, item) {
								if (app.inArray(item.value, res.target) >= 0) {
									item.joinStatus = 1;
								} else {
									item.joinStatus = 0;
								};
							});
							_this.setData({
								targetList: targetList
							});
						};

						if (res.formList && res.formList.length) {
							app.each(res.formList, function (i, item) {
								item.targetList = targetList;
								app.each(item.targetList, function (l, g) {
									if (app.inArray(g.value, item.target) >= 0) {
										g.optionStatus = 1;
									} else {
										g.optionStatus = 0;
									};
								});
							});
						};
						
						//详情
						if (res.content && typeof res.content == 'string') {
							res.content = [{
								type: 'text',
								content: res.content
							}];
						};
						console.log(app.toJSON(res));
						if(res.showstatus!==0){
							res.showstatus = 1;
						};
						_this.setData({
							'form.name': res.name,
							'form.isfree':res.isfree,
							'form.bDate': res.bDate || '',
							'form.bTime': res.bTime || '',
							'form.eDate': res.eDate || '',
							'form.eTime': res.eTime || '',
							'form.sDate': res.sDate || '',
							'form.sTime': res.sTime || '',
							'form.area':res.area||[],
							'form.address':res.address||'',
							'form.addressName':res.addressName||'',
							'form.limitnum':res.limitnum||'',
							'form.content': res.content || '',
							'form.describe': res.describe || '',
							'form.pic': res.pic||'16872518055668487.jpg',
							'form.h5sharepic': res.h5sharepic||'',
							'form.miniwxsharepic': res.miniwxsharepic||'',
							'form.showusernum':res.showusernum||0,
							'form.selfcancel':res.selfcancel||0,
							'form.paytype':res.paytype||'cash',
							'form.diamondpay':res.diamondpay||0,
							'form.publicity':res.publicity||1,
							'form.clubid':res.clubid||'',
							'form.levelset':res.levelset||0,
							'form.joinclubids':res.joinclubids||'',
							'form.category': res.category||'',
							'form.pics': res.pics||[],
							'form.levelids':res.levelids||[],
							'form.priceList':res.priceList,
							'form.tickets':res.tickets||[],
							'form.grouppic':res.grouppic||'',
							'form.signRefund':res.signRefund||0,
							'form.acceptGift':res.acceptGift||0,
							'form.joinclubStatus':res.joinclubStatus||0,
							'form.joinclubids':res.joinclubids||[],
							'form.joinratio':res.joinratio||0,
							'form.iscollect':res.iscollect||0,
							'form.collectTips':res.collectTips||'',
							'form.collectList':res.collectList||_this.getData().defaultCollectList,
							'form.showstatus':res.showstatus,
							'form.typeid':res.typeid||'',
							'form.typename':res.typename||'',
							'form.customerTel':res.customerTel||'',
							joinclubList:res.joinclubList||[],
							bDate:res.bDate,
							eDate:res.eDate,
							sDate:res.sDate,
						});
						if (res.pics && res.pics.length) {
							let files = [];
							app.each(res.pics, function (i, item) {
								if(item){
									files.push({
										key: item,
										hidePercent: true,
										src: app.image.crop(item, imageWidth, imageWidth)
									});
								};
							});
							_this.setData({
								files: files
							});
						};
						if (res.poster && res.poster.length) {
							let files2 = [];
							app.each(res.poster, function (i, item) {
								files2.push({
									key: item,
									hidePercent: true,
									src: app.image.crop(item, imageWidth, imageWidth)
								});
							});
							_this.setData({
								files2: files2
							});
						};
						//获取本俱乐部所有会员等级，专门用于编辑状态
						if(res.clubid){
							app.request('//clubapi/getClubsLevel',{clubid:res.clubid,sort:'taix'},function(req){
								let defaultPriceList = _this.getData().defaultPriceList;
								let defaultPriceName = _this.getData().defaultPriceName;
								if(req&&req.length){
									app.each(req,function(i,item){
										if(res.levelids&&res.levelids.length&&app.inArray(item._id,res.levelids)>=0){
											item.active = 1;
										}else{
											item.active = 0;
										};
										defaultPriceList[item.name] = '';
										defaultPriceName[item._id] = item.name;
									});
									_this.setData({clubLevelList:req});
								}else{
									_this.setData({clubLevelList:[]});
								};
								_this.setData({
									defaultPriceList:defaultPriceList,
									defaultPriceName:defaultPriceName,
								});
							});
						};
						setTimeout(function () {
							if (res.pic) {
								_this.selectComponent('#uploadPic').reset(res.pic);
							};
							/*if (res.h5sharepic) {
								_this.selectComponent('#uploadH5sharepic').reset(res.h5sharepic);
							};
							if (res.miniwxsharepic) {
								_this.selectComponent('#uploadMiniwxsharepic').reset(res.miniwxsharepic);
							};
							*/
							if (res.grouppic) {
								_this.selectComponent('#uploadCode').reset(res.grouppic);
							};
							if(app.config.client!='wx'){
								if (res.area && res.area.areaname) {
									_this.selectComponent('#pickerArea').reset();
								};
								_this.selectComponent('#pickerBeginDate').reset();
								_this.selectComponent('#pickerEndDate').reset();
								//_this.selectComponent('#pickerEndSDate').reset();
								_this.selectComponent('#pickerBeginTime').reset();
								_this.selectComponent('#pickerEndTime').reset();
								//_this.selectComponent('#pickerEndSTime').reset();
							};
						}, 200);
					});
				}else{
					_this.setData({
						'form.collectList':_this.getData().defaultCollectList,
					});
				};
			},
			changeType: function (e) {
				let type = app.eData(e).type,
					value = app.eData(e).value,
					formData = this.getData().form;
				formData[type] = value;
				this.setData({form:formData});
			},
			bindAreaChange: function (res) {
				if (app.config.client == 'wx') {
					res.detail.ids = res.detail.code;
				};
				this.setData({
					/*'form.area': {
						province: res.detail.ids[0],
						city: res.detail.ids[1],
						country: res.detail.ids[2],
						areaname: res.detail.value.join('-'),
					},*/
					'form.area': res.detail.value
				});

			},
			bindBeginDate: function (e) {
				this.setData({
					'form.bDate': e.detail.value,
					bDate: e.detail.value
				});
			},
			bindEndDate: function (e) {
				this.setData({
					'form.eDate': e.detail.value,
					eDate: e.detail.value
				});
			},
			bindEndSDate: function (e) {
				this.setData({
					'form.sDate': e.detail.value,
					sDate: e.detail.value
				});
			},
			bindBeginTime: function (e) {
				this.setData({
					'form.bTime': e.detail.value
				});
			},
			bindEndTime: function (e) {
				this.setData({
					'form.eTime': e.detail.value
				});
			},
			bindEndSTime: function (e) {
				this.setData({
					'form.sTime': e.detail.value
				});
			},
			uploadPic: function (e) {
				this.setData({
					'form.pic': e.detail.src[0]
				});
			},
			uploadH5sharepic: function (e) {
				this.setData({
					'form.h5sharepic': e.detail.src[0]
				});
			},
			uploadMiniwxsharepic: function (e) {
				this.setData({
					'form.miniwxsharepic': e.detail.src[0]
				});
			},
			uploadCode: function (e) {
				this.setData({
					'form.grouppic': e.detail.src[0]
				});
			},
			uploadPics: function (e) {
				let _this = this,
					type = app.eData(e).type,
					files = _this.getData().files,
					index = files.length,
					uploadSuccess = _this.getData().uploadSuccess;
				if (type == 'files2') {
					files = _this.getData().files2;
					index = files.length;
				};
				if (!uploadSuccess) {
					app.tips('还有图片正在上传', 'error');
				}else if(files.length>=3){
					app.tips('最多上传3张图片', 'error');
				}else {
					app.upload({
						count: 3-files.length,
						mimeType: 'image',
						choose: function (res) {
							app.each(res, function () {
								files = files.concat({
									src: '',
									percent: ''
								});
							});
							if (type == 'files2') {
								_this.setData({
									files2: files,
									uploadSuccess: false
								});
							} else {
								_this.setData({
									files: files,
									uploadSuccess: false
								});
							};
						},
						progress: function (res) {
							let newIndex = index + res.index;
							files[newIndex].hidePercent = false;
							files[newIndex].percent = res.percent;
							if (type == 'files2') {
								_this.setData({
									files2: files
								});
							} else {
								_this.setData({
									files: files
								});
							};
						},
						success: function (res) {
							let imageWidth = _this.getData().imageWidth,
								newIndex = index + res.index;
							files[newIndex].key = res.key;
							files[newIndex].hidePercent = true;
							files[newIndex].src = app.image.crop(res.key, imageWidth, imageWidth);
						},
						fail: function (msg) {
							if (msg.errMsg && msg.errMsg == 'max_files_error') {
								app.tips('最多只能上传9张图片', 'error');
							};
						},
						complete: function () {
							if (type == 'files2') {
								_this.setData({
									files2: files,
									uploadSuccess: true
								});
							} else {
								_this.setData({
									files: files,
									uploadSuccess: true
								});
							};
						}
					});
				};
			},
			submit: function () {
				let _this = this,
					options = this.getData().options,
					formData = this.getData().form,
					files = this.getData().files,
					files2 = this.getData().files2,
					isPhone = /^0?1[2|3|4|5|6|7|8|9][0-9]\d{8}$/,
					isPrice = /^[0-9]+.?[0-9]*$/,
					isQuantity = /^[+]{0,1}(\d+)$/,//包括0
					targetList = this.getData().targetList,
					clubLevelList = this.getData().clubLevelList,
					priceList = {0:formData.price},
					msg = '',
					joinclubList = this.getData().joinclubList,//联合举办俱乐部
					begindate = formData.bDate ? Date.parse(new Date(formData.bDate)) : '',
					enddate = formData.eDate ? Date.parse(new Date(formData.eDate)) : '',
					sdate = formData.sDate ? Date.parse(new Date(formData.sDate)) : '';
					
				if (files && files.length) {
					let newFiles = [];
					app.each(files, function (i, item) {
						newFiles.push(item.key);
					});
					formData.pics = newFiles;
				} else {
					formData.pics = '';
				};
				
				if(clubLevelList&&clubLevelList.length){
					let levelids = [];
					app.each(clubLevelList,function(i,item){
						if(item.active==1){
							levelids.push(item._id);
						};
					});
					formData.levelids = levelids.length?levelids:'';
				}else{
					formData.levelids = '';
				};
				
				//处理联合俱乐部相关
				if(joinclubList&&joinclubList.length){
					let joinclubids = [];
					app.each(joinclubList,function(i,item){
						joinclubids.push(item._id);
					});
					formData.joinclubids = joinclubids.length?joinclubids:'';
				}else{
					formData.joinclubids = '';
				};
				if(!formData.joinclubStatus){
					formData.joinclubids = '';
					formData.joinratio = '';
				};
				
				if(formData.isfree!=2){//免费
					formData.diamondpay = 0;//钻石支付
					formData.signRefund = 0;//签到后退款
				};
				
				if (!formData.name) {
					msg = '请输入活动名称';
				} else if (!formData.category) {
					msg = '请选择活动类型';
				} else if (!formData.bDate) {
					msg = '请选择活动开始日期';
				} else if (!formData.bTime) {
					msg = '请选择活动开始时间';
				} else if (begindate && enddate && begindate > enddate){
					msg = '结束时间不能小于起始时间';
				} else if (begindate && sdate && begindate > sdate){
					msg = '报名截止时间不能小于起始时间';
				} else if (!formData.area.length) {
					msg = '请选择活动地区';
				} else if (!formData.address) {
					msg = '请输入详细地址';
				} else if (app.getLength(formData.describe)>80){
					msg = '简介最多40个汉字';
				} else if (!formData.pic) {
					msg = '请上传活动封面';
				} else if(formData.customerTel&&!isPhone.test(formData.customerTel)){
					msg = '请输入正确的客服手机号';
				} else if (!formData.limitnum) {
					msg = '请输入参与总人数';
				} else if(formData.joinclubStatus==1&&!formData.joinclubids){
					msg = '请选择联合举办俱乐部';
				} else if(formData.joinclubStatus==1&&(!formData.joinratio||!isPrice.test(formData.joinratio))){
					msg = '请输入正确的联办分润';
				} else if (formData.isfree == 2 && !formData.tickets.length) {
					msg = '请添加活动票种';
				} else if (formData.isfree == 2 && formData.tickets.length) {
					app.each(formData.tickets, function (i, item) {
						if (!item.name) {
							msg = '请输入票种名称';
						}else if(!isQuantity.test(item.quantity)){
							msg = '请输入票的总数';
						};
						app.each(item.priceList, function (l, g) {
							if (!isPrice.test(g)) {
								msg = '请输入正确的' +l;
							};
						});
						if (msg) {
							return false;
						};
					});
				};
				/*if (files && files.length) {
					let newFiles = [];
					app.each(files, function (i, item) {
						newFiles.push(item.key);
					});
					formData.pics = newFiles;
				} else {
					formData.pics = '';
				};
				if (files2 && files2.length) {
					let newFiles2 = [];
					app.each(files2, function (i, item) {
						newFiles2.push(item.key);
					});
					formData.poster = newFiles2;
				} else {
					formData.poster = '';
				};*/
				console.log(app.toJSON(formData));
				if (msg) {
					app.tips(msg, 'error');
				} else {
					let resultData = formData;
					//报名权限
					/*resultData.target = [];
					app.each(targetList, function (i, item) {
						if (item.joinStatus == 1) {
							resultData.target.push(item.value);
						};
					});
					//自定义选项
					if (resultData.formList && resultData.formList.length) {
						app.each(resultData.formList, function (i, item) {
							resultData.formList[i].target = [];
							app.each(item.targetList, function (l, g) {
								if (g.optionStatus == 1) {
									resultData.formList[i].target.push(g.value);
								};
							});
						});
					};*/
					console.log(app.toJSON(resultData));
					if (formData.id) {
						app.request('//activityapi/updateActivity', resultData, function () {
							app.tips('活动编辑成功', 'success');
							setTimeout(function () {
								if(options.toDetail==1){
									app.navTo('../../activity/detail/detail?id='+formData.id);
								}else{
									app.navBack();
								};
							}, 1000);
						});
					} else {
						app.request('//activityapi/addActivity', resultData, function () {
							app.tips('活动发起成功', 'success');
							app.storage.set('pageReoload',1);
							setTimeout(function () {
								app.navBack();
							}, 1000);
						});
					};
				}
			},
			switchThis: function (e) {
				let _this = this,
					type = app.eData(e).type,
					formData = this.getData().form;
				if (type == 'isfree'||type=='faceFreeStatus') {
					formData[type] = formData[type] == 2 ? 1 : 2;
					if(!formData.id&&!formData.tickets.length){//是添加的情况并且没有票，就添加默认票
						_this.addTicketList();
					};
				}else{
					formData[type] = formData[type] == 1 ? 0 : 1;
				};
				this.setData({
					form: formData
				});
			},
			selectThis:function(e){
				let type = app.eData(e).type,
					value = app.eData(e).value,
					formData = this.getData().form;
				formData[type] = value;
				this.setData({
					form: formData
				});
			},
			showMenu: function (e) {
				let _this = this,
					index = Number(app.eData(e).index),
					type = app.eData(e).type,
					files = this.getData().files,
					src = this.getData().src,
					list = ['置顶', '前移', '后移', '删除'];
				if (type == 'files2') {
					files = this.getData().files2;
				};
				app.actionSheet(list, function (res) {
					switch (list[res]) {
						case '置顶':
							if (index != 0) {
								let first_files = files[index];
								files.splice(index, 1);
								files.unshift(first_files);
							};
							break;
						case '前移':
							if (index != 0) {
								let first_files = files[index],
									last_files = files[index - 1];
								files.splice(index, 1);
								files.splice(index - 1, 0, first_files);
							};
							break;
						case '后移':
							if (index != files.length - 1) {
								let first_files = files[index],
									last_files = files[index + 1];
								files.splice(index, 1);
								files.splice(index + 1, 0, first_files);
							};
							break;
						case '删除':
							files.splice(index, 1);
							break;
					};
					if (type == 'files2') {
						_this.setData({
							files2: files
						});
					} else {
						_this.setData({
							files: files
						});
					};
				});
			},
			viewImage: function (e) {
				let _this = this,
					index = Number(app.eData(e).index),
					type = app.eData(e).type,
					windowWidth = this.getData().windowWidth,
					viewSrc = [],
					files = type == 'files2' ? _this.getData().files2 : _this.getData().files;
				app.each(files, function (i, item) {
					viewSrc.push(app.image.width(item.key, windowWidth));
				});
				app.previewImage({
					current: viewSrc[index],
					urls: viewSrc
				});
			},
			addFormList: function () {
				this.reSetDialogForm();
				this.setData({
					editIndex: '',
					showAddFormDialog: true
				});
			},
			editFormList: function (e) {
				let index = Number(app.eData(e).index),
					formList = this.getData().form.formList;
				this.reSetDialogForm(formList[index]);
				this.setData({
					editIndex: index,
					showAddFormDialog: true
				});
			},
			delFormList: function (e) {
				let index = Number(app.eData(e).index),
					formList = this.getData().form.formList;
				formList.splice(index, 1);
				this.setData({
					'form.formList': formList
				});
			},
			toHideDialog: function () {
				this.setData({
					showAddFormDialog: false
				});
			},
			reSetDialogForm: function (data) {
				let targetList = this.getData().targetList;
				if (data) {
					console.log('reSetDialogForm:' + app.toJSON(data));
					this.setData({
						dialogFormData: data
					});
				} else {
					this.setData({
						dialogFormData: {
							title: '',
							targetList: this.deepCopy(targetList),
						}
					});
				};
			},
			confirmDialog: function () {
				let _this = this,
					editIndex = this.getData().editIndex,
					formData = this.getData().form,
					dialogFormData = this.getData().dialogFormData,
					msg = '';
				if (!dialogFormData.title) {
					msg = '请输入选项名称'
				} else if (app.getLength(dialogFormData.title) > 10) {
					msg = '选项名称过长';
				};
				if (msg) {
					app.tips(msg, 'error');
				} else {
					if (editIndex || editIndex === 0) {
						console.log('编辑');
						formData.formList[editIndex] = dialogFormData;
						formData.formList[editIndex].targetList = JSON.parse(JSON.stringify(dialogFormData.targetList));
					} else {
						console.log('新增');
						formData.formList.push(dialogFormData);
					};
					console.log('confirmDialog:' + app.toJSON(dialogFormData));
					//console.log(app.toJSON(formData.formList));
					this.setData({
						form: formData
					});
					this.toHideDialog();
				};
			},
			changeTarget: function (e) { //form修改目标
				let value = app.eData(e).value,
					index = Number(app.eData(e).index),
					targetList = this.getData().targetList;
				targetList[index].joinStatus = targetList[index].joinStatus == 1 ? 0 : 1;
				if (index == 0) {
					app.each(targetList, function (i, item) {
						if (targetList[0].joinStatus == 1) {
							item.joinStatus = 1;
						} else if (i > 0) {
							item.joinStatus = 0;
						};
					});
				};
				this.setData({
					targetList: targetList
				});
			},
			changeTargetS: function (e) { //dialogForm修改目标
				let value = app.eData(e).value,
					index = Number(app.eData(e).index),
					targetList = this.getData().dialogFormData.targetList;
				targetList[index].optionStatus = targetList[index].optionStatus == 1 ? 0 : 1;
				if (index == 0) {
					app.each(targetList, function (i, item) {
						if (targetList[0].optionStatus == 1) {
							item.optionStatus = 1;
						} else if (i > 0) {
							item.optionStatus = 0;
						};
					});
				};
				this.setData({
					'dialogFormData.targetList': targetList
				});
			},
			addTicketList: function () {
				let formData = this.getData().form,
					defaultPriceList = this.deepCopy(this.getData().defaultPriceList),
					itemData = {
						name: '',
						content: '',
						priceList:defaultPriceList,
						upgradeToLevelid:'',
						upgradeToLevelname:'',
						upgradeToLevelday:'',
					};
				if(formData.tickets.length==0){
					itemData.name = '通用票';
				};
				formData.tickets.push(itemData);
				this.setData({
					form: formData
				});
			},
			delTicket: function (e) {
				let formData = this.getData().form,
					index = Number(app.eData(e).index);
				formData.tickets.splice(index, 1);
				this.setData({
					form: formData
				});
			},
			changeTicketInput: function (e) {
				let index = Number(app.eData(e).index),
					type = app.eData(e).type,
					formData = this.getData().form;
				formData.tickets[index][type] = app.eValue(e);
				this.setData({
					form: formData
				});
			},
			changeTicketPrice: function (e) {
				let type = app.eData(e).type,
					index = Number(app.eData(e).index),
					formData = this.getData().form;
				formData.tickets[index].priceList[type] = app.eValue(e);
				this.setData({
					form: formData
				});
			},
			deepCopy: function (o) {
				let _this = this;
				if (o instanceof Array) {
					var n = [];
					for (var i = 0; i < o.length; ++i) {
						n[i] = _this.deepCopy(o[i]);
					}
					return n;
				} else if (o instanceof Function) {
					var n = new Function("return " + o.toString())();
					return n
				} else if (o instanceof Object) {
					var n = {}
					for (var i in o) {
						n[i] = _this.deepCopy(o[i]);
					}
					return n;
				} else {
					return o;
				};
			},
			//设置详情
			setContent: function () {
				let _this = this,
					content = _this.getData().form.content || '';
				app.storage.set('activityContent', content);
				_this.dialog({
					url: '../../home/editor/editor?contentKey=activityContent',
					title: '编辑内容',
					success: function (e) {
						_this.setData({
							'form.content': app.storage.get('activityContent')
						});
						app.storage.remove('activityContent');
					}
				});
			},
			bindLevelChange:function(e){
				this.setData({'form.levelset':e.detail.value});
			},
			selectClub:function(e){
				let index = Number(app.eData(e).index),
					clubList = this.getData().clubList;
				clubList[index].active = clubList[index].active==1?0:1;
				this.setData({clubList:clubList});
			},
			bindCagegoryChange:function(e){
				let value = e.detail.value,
					activityCategory = this.getData().activityCategory;
				this.setData({
					cagegoryIndex:value,
					'form.category':activityCategory[value].name,
				});
			},
			selectLevel:function(e){
				let index = Number(app.eData(e).index),
					clubLevelList = this.getData().clubLevelList;
				clubLevelList[index].active = clubLevelList[index].active==1?0:1;
				this.setData({clubLevelList:clubLevelList});
			},
			bindLevelChange:function(e){
				let value = Number(e.detail.value),
					index = Number(e.detail.index),
					formData = app.deepCopy(this.getData().form),
					clubLevelList = app.deepCopy(this.getData().clubLevelList);
				if(app.config.client=='wx'){
					index = Number(e.currentTarget.dataset.index);
				};
				formData.tickets[index]['upgradeToLevelid'] = clubLevelList[value]._id;
				formData.tickets[index]['upgradeToLevelname'] = clubLevelList[value].name;
				formData.tickets[index]['upgradeToLevelday'] = '';
				this.setData({
					form:formData
				});
			},
			delThisLevel:function(e){
				let index = Number(app.eData(e).index),
					formData = app.deepCopy(this.getData().form);
				formData.tickets[index]['upgradeToLevelid'] = '';
				formData.tickets[index]['upgradeToLevelname'] = '';
				formData.tickets[index]['upgradeToLevelday'] = '';
				this.setData({
					form:formData
				});
			},
			toSelectClub:function(){
				let _this = this,
					options = this.getData().options,
					formData = this.getData().form, 
					selectIds = [],
					joinclubList = this.getData().joinclubList,
					url = '../../suboffice/clubSelect/clubSelect',
					urlData = {};
				if(joinclubList.length){
					app.each(joinclubList,function(i,item){
						selectIds.push(item._id);
					});
				};
				if(formData.clubid){
					urlData['clubid'] = formData.clubid;
				};
				if(selectIds.length){
					urlData['selectIds'] = selectIds.join(',');
				};
				this.dialog({
					title:'选择俱乐部',
					url:app.mixURL(url,urlData),
					success:function(res){
						if(res&&res.length){
							_this.setData({joinclubList:res});
						}else{
							_this.setData({joinclubList:[]});
						};
					},
				});
			},
			delThisClub:function(e){
				let index = Number(app.eData(e).index),
					joinclubList = this.getData().joinclubList;
				joinclubList.splice(index,1);
				this.setData({
					joinclubList:joinclubList
				});
			},
			changeCollect:function(e){
				let type = app.eData(e).type,
					value = Number(app.eData(e).value),
					formData = this.getData().form;
				app.each(formData.collectList,function(i,item){
					if(item.id==type){
						item.value = value;
					};
				});
				this.setData({form:formData});
			},
			selectType:function(){
				let _this = this,
					data = this.getData().data,
					formData = this.getData().form;
				if(formData.clubid){
					app.dialog({
						title:'选择系列',
						url:'../../activity/typeManage/typeManage?clubid='+formData.clubid+'&select=1',
						success:function(req){
							if(req.id){
								_this.setData({
									'form.typeid':req.id,
									'form.typename':req.name,
								});
							};
						},
					});
				}else{
					app.tips('非俱乐部活动','error');
				};
			},
			deleteType:function(){
				this.setData({'form.typeid':'','form.typename':''});
			},
		}
	})
})();