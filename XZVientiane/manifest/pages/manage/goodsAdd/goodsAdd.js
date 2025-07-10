/**
 *模块组件构造器
 */
(function () {

	let app = getApp();

	app.Page({
		pageId: 'manage-goodsAdd',
		data: {
			systemId: 'manage',
			moduleId: 'goodsAdd',
			isUserLogin: app.checkUser(),
			data: {},
			options: {},
			settings: {},
			language: {},
			form: {
				name: '',
				//名称
				goodsTypeid: [], //品类ID一级，二级
				goodsTypeName: [], //品类名称一级，二级
				//goodsCategoryName: '',//分类名称
				//goodsCategoryId: '',//分类id
				goodsCategoryType: 1, //分类类型
				pic: '',//商品封面
				pics: [],//轮播图片
				abstract: '',//商品摘要
				tags: '',//商品标签
				content: '',//商品详情
				basicCount: 0,//基础销量
				sku: [],//商品规格
				//ticket: [],//票券（仅限goodsCategoryType为2的票券商品）
				freightType: 0,//运费类型0包邮，1按单计算，2按件计算，3按重量计算
				freight: '',//运费价格
				refundType: 1,//7天退款，1可退款，2不可退款
				canBuyUser: '',//允许购买用户为空是所有人可购买，否则为会员分组
				deliveryTempId: '', //配送区域模板id
				freightTempId: '', //运费模板id
				safeDelivery: 0, //是否可以自提
				serialnumber:'',//sku编码
				ticketsType:1,//票券类型，1-核销券，2-提货券
				pickBeginDate:'',
				pickEndDate:'',
			},
			showInfoData: {
				deliveryTempName: '', //配送区域模板名称
				freightTempName: '', //配送费模板名称
			}, //不需要保存起来的数据
			skuDefault: {
				name: '默认',
				//名称
				pic: '',
				//图片
				stock: 10000,
				//库存
				price: '',
				//现价
				days: 365, //购买后几天有效（仅限goodsCategoryType为2的票券商品）
				weight: '', //重量
				serialnumber: '', //SKU编码
				count: 1,//数量
				content: '全场无门槛使用', //使用规则
				priceList:{'标准价':''},
			},
			ticketDefault: {
				name: '',//名称
				count: 1,//数量
				price:'',
				content: '全场无门槛使用' //使用规则
			},
			salesSetting: {
				discounts: 0,
				salestype: 1,
				saleslevel: 1
			},
			myAuthority: app.storage.get('myAuthority'),
			client: app.config.client,
			pics_files: [], //轮播图片地址
			uploadSuccess: true,
			windowWidth: app.system.windowWidth,
			imageWidth: ((app.system.windowWidth > 480 ? 480 : app.system.windowWidth) - 30 - 100 - 20) / 5,
			pickBeginDate:app.getNowDate(),
			pickEndDate:app.getNowDate(30),
			clubLevelList:[],
		},
		methods: {

			onLoad: function (options) {
				if(options.id){
					app.setPageTitle('编辑商品');
				};
				this.setData({
					myAuthority: app.storage.get('myAuthority')
				});
				if (!this.getData().myAuthority) {
					app.navTo('../../manage/index/index');
				};
				let _this = this;
				this.setData({
					options: options
				});
				app.checkUser(function () {
					_this.load();
				});
			},
			onShow: function () {
				let _this = this;
				//检查用户登录状态
				let isUserLogin = app.checkUser();
				if (isUserLogin != this.getData().isUserLogin) {
					this.setData({
						isUserLogin: isUserLogin
					});
				};
			},
			onPullDownRefresh: function () {
				wx.stopPullDownRefresh();
			},
			load: function () {
				let _this = this;
				if (_this.getData().options.id) {
					app.request('//shopapi/getMyGoodsDetail', {
						id: _this.getData().options.id
					}, function (res) {
						//假如是票券,只留下一个规格
						/*if (res.goodsCategoryType == 2) {
							res.ticket = [res.ticket];
						};*/
						_this.setData({
							form: app.extend(_this.getData().form, res),
							//promotesetup: res.promotesetup || {}
						});
						if (res.pics && res.pics.length) {
							let imageWidth = _this.getData().imageWidth,
								pics_files = [];
							app.each(res.pics, function (i, item) {
								pics_files.push({
									key: item,
									hidePercent: true,
									src: app.image.crop(item, imageWidth, imageWidth)
								});
							});
							_this.setData({
								pics_files: pics_files
							});
						};
						_this.setData({
							'showInfoData.deliveryTempName': res.deliveryName || '',
							'showInfoData.freightTempName': res.freightName || ''
						});
						setTimeout(function () {
							_this.selectComponent('#uploadPic').reset(res.pic || '');
							if (res.goodsCategoryType == 1) {
								app.each(res.sku, function (j, item1) {
									if (item1.pic) {
										_this.selectComponent('#uploadPic' + j).reset(item1.pic || '');
									}
								});
							}
						}, 200);
						if(res.goodsCategoryType==2&&res.ticketsType==2){
							_this.setData({
								pickBeginDate: res.pickBeginDate,
								pickEndDate: res.pickEndDate
							});
							setTimeout(function () {
								_this.selectComponent('#pickerBeginDate').reset();
								_this.selectComponent('#pickerEndDate').reset();
							}, 100);
						};
						//获取本俱乐部所有会员等级，专门用于编辑状态
						if(app.session.get('manageShopClubId')){
							let formData = app.deepCopy(_this.getData().form),
								clubid = app.session.get('manageShopClubId'),
								skuDefault = _this.getData().skuDefault;
							app.request('//clubapi/getClubsLevel',{clubid:clubid,sort:'taix'},function(req){
								if(req&&req.length){
									app.each(req,function(i,item){
										skuDefault.priceList[item.name] = '';
										app.each(res.sku,function(a,b){
											res.sku[a].priceList[item.name] = res.sku[a].priceList[item.name]||'';
										});
									});
									_this.setData({clubLevelList:req});
								}else{
									_this.setData({clubLevelList:[]});
								};
								formData.sku = res.sku;
								_this.setData({
									form:formData,
									skuDefault:skuDefault,
								});
							});
						};
					});
				} else {
					if(app.session.get('manageShopClubId')){
						let clubid = app.session.get('manageShopClubId');
						//获取本俱乐部所有会员等级
						app.request('//clubapi/getClubsLevel',{clubid:clubid,sort:'taix'},function(res){
							let skuDefault = _this.getData().skuDefault;
							if(res&&res.length){
								app.each(res,function(i,item){
									skuDefault.priceList[item.name] = '';
								});
								_this.setData({clubLevelList:res});
							}else{
								_this.setData({clubLevelList:[]});
							};
							_this.setData({
								skuDefault:skuDefault
							});
							_this.addSku();
						});
					}else{
						this.addSku();
						//this.addTicket();
					};
				};
			},
			//选择类目
			selectCategory: function () {
				let _this = this,
					formData = this.getData().form,
					categoryid = '';
				if (formData.goodsTypeid && formData.goodsTypeid.length) {
					categoryid = formData.goodsTypeid.length == 2 ? formData.goodsTypeid[1] : formData.goodsTypeid[0];
				};
				this.dialog({
					title: '选择商品类目',
					url: '../../manage/selectCategory/selectCategory?selectType=1&id=' + categoryid + '&type=' + formData.goodsCategoryType,
					success: function (res) {
						console.log(app.toJSON(res));
						if (res.sId) {
							_this.setData({
								'form.goodsTypeid': [res.pId, res.sId],
								'form.goodsTypeName': [res.pTitle, res.sTitle]
							});
						} else if (res.pId) {
							_this.setData({
								'form.goodsTypeid': [res.pId],
								'form.goodsTypeName': [res.pTitle]
							});
						} else {
							_this.setData({
								'form.goodsTypeid': [],
								'form.goodsTypeName': []
							});
						};
					}
				});
			},
			//选择分类
			selectGoodsCategory: function () {
				let _this = this,
					formData = _this.getData().form;
				_this.dialog({
					url: '../../manage/goodsCategory/goodsCategory?select=1',
					title: '选择商品分类',
					success: function (res) {
						//console.log(app.toJSON(res));
						formData.goodsCategoryName = res.title;
						formData.goodsCategoryId = res.id;
						_this.setData({
							form: formData
						});
					}
				});
			},
			//修改图片
			uploadPic: function (e) {
				let _this = this,
					file = e.detail.src[0];
				_this.setData({
					'form.pic': file
				});
			},
			//设置商品详情
			setContent: function () {
				let _this = this,
					goodsContent = _this.getData().form.content || '';
				app.storage.set('goodsContent', goodsContent);
				_this.dialog({
					url: '../../home/editor/editor?contentKey=goodsContent',
					title: '编辑内容',
					success: function (e) {
						_this.setData({
							'form.content': app.storage.get('goodsContent')
						});
						app.storage.remove('goodsContent');
					}
				});

			},
			//设置商品摘要
			setTextInput: function (e) {
				let _this = this,
					formData = _this.getData().form,
					inputData = app.eData(e);
				inputData.content = formData[inputData.name];
				_this.dialog({
					url: '../../home/textInput/textInput?content='+inputData.content+'&tips='+inputData.tips,
					title: inputData.title || '编辑文字',
					success: function (res) {
						if (res) {
							formData[inputData.name] = res.content;
							_this.setData({
								form: formData
							});
						};
					}
				});
			},
			//设置规格图片
			uploadSkuPic: function (e) {

				let _this = this,
					index = e.detail.index,
					formData = _this.getData().form,
					file = e.detail.src[0];
				formData.sku[index].pic = file;

				_this.setData({
					'form.sku': formData.sku
				});
			},
			//设置规格信息
			setSku: function (e) {
				let _this = this,
					index = app.eData(e).index,
					name = app.eData(e).name,
					value = app.eValue(e),
					formData = _this.getData().form;
				formData.sku[index][name] = value;
				_this.setData({
					'form.sku': formData.sku
				});
			},
			changeSku: function (e) {
				let _this = this,
					index = Number(app.eData(e).index),
					name = app.eData(e).name,
					value = app.eValue(e),
					formData = _this.getData().form;
				setTimeout(function () {
					let supplyPrice = Number(formData.sku[index]['supplyPrice']),
						advicePrice = Number(formData.sku[index]['advicePrice']);
					if (name == 'supplyPrice' || name == 'advicePrice') {
						formData.sku[index]['purchasePrice'] = _this.getPurchasePrice(supplyPrice, advicePrice);
					};
					_this.setData({
						'form.sku': formData.sku
					});
				}, 200);
			},
			//添加规格
			addSku: function (name) {
				let _this = this,
					formData = _this.getData().form,
					skuDefault = app.extend({}, _this.getData().skuDefault);

				if (typeof name == 'string') {
					skuDefault.name = name;
				};
				formData.sku.push(skuDefault);
				_this.setData({
					'form.sku': formData.sku
				});
			},
			//删除规格
			removeSku: function (e) {
				let _this = this,
					index = app.eData(e).index,
					formData = _this.getData().form;
				formData.sku.splice(index, 1);
				_this.setData({
					'form.sku': formData.sku
				});
			},
			//添加票券
			addTicket: function (name) {
				let _this = this,
					formData = _this.getData().form,
					ticketDefault = app.extend({}, _this.getData().ticketDefault);
				formData.ticket.push(ticketDefault);
				_this.setData({
					'form.ticket': formData.ticket
				});
			},
			//删除票券
			removeTicket: function (e) {
				let _this = this,
					index = app.eData(e).index,
					formData = _this.getData().form;
				formData.ticket.splice(index, 1);
				_this.setData({
					'form.ticket': formData.ticket
				});
			},
			//设置票券信息
			setTicket: function (e) {
				let _this = this,
					index = app.eData(e).index,
					name = app.eData(e).name,
					value = app.eValue(e),
					formData = _this.getData().form;
				formData.ticket[index][name] = value;
				_this.setData({
					'form.ticket': formData.ticket
				});
			},
			//设置票券使用规则
			setTicketContent: function (e) {
				let _this = this,
					formData = _this.getData().form,
					inputData = app.eData(e);
				inputData.content = formData.sku[Number(inputData.index)][inputData.name];
				//app.storage.set('textInputData', inputData);
				_this.dialog({
					url: '../../home/textInput/textInput?content='+inputData.content+'&tips='+inputData.tips,
					title: inputData.title || '编辑文字',
					success: function (res) {
						//app.storage.remove('textInputData');
						console.log(app.toJSON(res));
						if (res) {
							formData.sku[inputData.index][inputData.name] = res.content;
							_this.setData({
								form: formData
							});
						};
					}
				});

			},
			//选择购买用户
			selectSalesLevel: function () {
				let _this = this,
					formData = _this.getData().form;
				app.storage.set('selectUserData', formData.canBuyUser);
				_this.dialog({
					url: '../../manage/salesLevelSelect/salesLevelSelect?key=selectUserData',
					title: '选择用户等级',
					success: function (res) {
						//console.log(app.toJSON(res));
						formData.canBuyUser = res.length ? res.join(',') : '';
						_this.setData({
							form: formData
						});
						app.storage.remove('selectUserData');

					}
				});
			},
			//选择配送区域模板
			selectDeliveryAreaTemplate: function () {
				let _this = this,
					formData = _this.getData().form;
				_this.dialog({
					url: '../../manage/settingDeliveryAreaTemplate/settingDeliveryAreaTemplate?select=1&id=' + formData.deliveryTempId,
					title: '选择配送区域模板',
					success: function (res) {
						formData.deliveryTempId = res.id || '';
						_this.setData({
							form: formData,
							'showInfoData.deliveryTempName': res.name || ''
						});
					}
				});
			},
			//选择配送费模板
			selectFreightTemplate: function () {
				let _this = this,
					formData = _this.getData().form;
				_this.dialog({
					url: '../../manage/settingFreightTemplate/settingFreightTemplate?select=1&id=' + formData.freightTempId,
					title: '选择配送费模板',
					success: function (res) {
						formData.freightTempId = res.id || '';
						_this.setData({
							form: formData,
							'showInfoData.freightTempName': res.name || ''
						});
					}
				});
			},
			uploadPics: function (e) {
				let _this = this,
					imageWidth = _this.getData().imageWidth,
					index = _this.getData().pics_files.length,
					files = _this.getData().pics_files,
					uploadSuccess = _this.getData().uploadSuccess;
				if (!uploadSuccess) {
					app.tips('还有图片正在上传', 'error');
				} else if (index >= 5) {
					app.tips('最多上传5张图片', 'error')
				} else {
					app.upload({
						count: 5 - files.length,
						mimeType: 'image',
						choose: function (res) {
							app.each(res, function () {
								files.push({
									src: '',
									percent: '',
									id: ''
								});
							});
							_this.setData({
								files: files,
								uploadSuccess: false
							})
						},
						progress: function (res) {
							files[index + res.index].hidePercent = false;
							files[index + res.index].percent = res.percent;
							_this.setData({
								pics_files: files
							})
						},
						success: function (res) {
							//添加
							files[index + res.index].key = res.key;
							files[index + res.index].hidePercent = true;
							files[index + res.index].src = app.image.crop(res.key, imageWidth, imageWidth);
						},
						fail: function (msg) {
							if (msg.errMsg && msg.errMsg == 'max_files_error') {
								app.tips('一次最多只能上传' + (5 - files.length) + '张图片', 'error')
							}
						},
						complete: function () {
							_this.setData({
								pics_files: files,
								uploadSuccess: true
							})
						}
					});
				}
			},
			showMenu: function (e) {
				let _this = this,
					index = Number(app.eData(e).index),
					files = this.getData().pics_files,
					list = ['查看', '前移', '后移', '删除'];
				app.actionSheet(list, function (res) {
					switch (list[res]) {
						case '查看':
							let windowWidth = _this.getData().windowWidth,
								viewSrc = [];
							app.each(files, function (i, item) {
								viewSrc.push(app.image.width(item.key, windowWidth));
							});
							app.previewImage({
								current: viewSrc[index],
								urls: viewSrc
							});
							break;
						case '前移':
							if (index != 0) {
								let first_files = files[index],
									last_files = files[index - 1];
								files.splice(index, 1);
								files.splice(index - 1, 0, first_files);
								_this.setData({
									pics_files: files
								});
							};
							break;
						case '后移':
							if (index != files.length - 1) {
								let first_files = files[index],
									last_files = files[index + 1];
								files.splice(index, 1);
								files.splice(index + 1, 0, first_files);
								_this.setData({
									pics_files: files
								});
							};
							break;
						case '删除':
							files.splice(index, 1);
							_this.setData({
								pics_files: files
							});
							break;
					};

				});
			},
			selectGoodsType: function (e) { //修改类型
				let options = this.getData().options;
				if (options.id) {
					app.tips('编辑商品不允许修改类型');
				} else {
					this.setData({
						'form.goodsCategoryType': Number(app.eData(e).type)
					});
				};
			},
			//获取教练提成
			getCoachMoney:function($total){//传入利润
				if ($total >= 3 && $total < 10){
					return 1;
				} else if ($total >= 10 && $total < 20){
					return 2;
				} else if ($total >= 20 && $total < 50){
					return 3;
				} else if ($total >= 50){
					return 5;
				};
				return 0;
			},
			//获取进价
			getPurchasePrice:function(supplyPrice,price){//传入供货价,售价
				//利润= 销售价*98%-供货价-服务费
				//进价=供货价+销售价*3%+教练提成+服务费
				//教练提成
				let servicePrice = this.getData().servicePrice||0,
					totalPrice = 0;
				if(!supplyPrice||!price){
					return 0;
				};
				let profit = price*0.98 - supplyPrice - servicePrice;
				profit = profit>0?profit:0;
				let teachCommission = 0;//this.getCoachMoney(profit);//教练提成
				totalPrice = supplyPrice + price*0.02 + teachCommission + servicePrice;
				return Number(app.getPrice(totalPrice));
			},
			submit: function () {
				let _this = this,
					options = _this.getData().options,
					formData = app.deepCopy(_this.getData().form),
					files = _this.getData().pics_files,
					isPrice = /^[0-9]+.?[0-9]*$/,
					pics = [],
					msg = '';
				if (files && files.length) {
					app.each(files, function (i, item) {
						pics.push(item.key);
					});
				};
				formData.pics = pics;
				if (!formData.goodsCategoryType) {
					msg = '请选择商品类型';
				} else if (!formData.goodsTypeid || !formData.goodsTypeid.length) {
					msg = '请选择商品类目';
				} else if (!formData.name) {
					msg = '请填写商品名称';
				} else if (!formData.pic) {
					msg = '请上传商品封面';
				} else if (!formData.content) {
					msg = '请填写详情';
				} else if (formData.goodsCategoryType == 1 && !formData.deliveryTempId) {
					msg = '请选择配送区域模板';
				} else if (formData.goodsCategoryType == 1 && formData.freightType != 0 && !formData.freightTempId) {
					msg = '请选择运费模板';
				} else if (formData.goodsCategoryType == 2 && formData.ticketsType == 2 && !formData.pickBeginDate){
					msg = '请选择提货开始日期';
				} else if(formData.goodsCategoryType == 2 && formData.ticketsType == 2 && !formData.pickEndDate){
					msg = '请选择提货结束日期';
				} else {
					//验证规格
					let skuName = []; //规格名称数组，验证唯一性
					app.each(formData.sku, function (i, item) {
						if (formData.goodsCategoryType == 1 && formData.freightType == 3 && !item.weight) {
							msg = '请输入重量';
						} else if(!item.name){
							msg = formData.goodsCategoryType == 2?'请输入票券名称':'请输入规格名称';
						} else if (Number(item.stock) < 0) {
							msg = '请输入正确的库存';
						} else if (formData.goodsCategoryType == 1) {
							if (!item.name) {
								msg = '请输入规格名称';
							} else {
								if (skuName.length && app.inArray(item.name, skuName) >= 0) {
									msg = '规格名称不能重复';
								} else {
									skuName.push(item.name);
								};
							};
						} else if(formData.goodsCategoryType == 2){
							if(!item.content){
								msg = '请输入票券使用规则';
							} else if (!item.count) {
								msg = '请输入票券数量';
							} else if (item.count > 100) {
								msg = '票券数量最多100张';
							};
						};
						app.each(item.priceList,function(a,b){
							if(!isPrice.test(b)){
								msg = '请输入正确的'+a+'价格';
							};
						});
						if (msg) {
							return;
						};
					});
					/*if (!msg && formData.goodsCategoryType == 2) {
						app.each(formData.ticket, function (i, item) {
							if (!item.name) {
								msg = '请输入票券名称';
							} else if (!item.content) {
								msg = '请输入票券使用规则';
							} else if (!item.price) {
								msg = '请输入票券单价';
							} else if (!item.count) {
								msg = '请输入票券数量';
							} else if (item.count > 100) {
								msg = '票券数量最多100张';
							};
							if (msg) {
								return;
							};
						});
						formData.ticket = formData.ticket[0];
					};*/
				};
				console.log(app.toJSON(formData));
				
				if (msg) {
					app.tips(msg, 'error');
				} else {
					//编辑商品
					if (options.id) {
						formData.id = options.id;
						app.request('//shopapi/updateShopGoods', formData, function (res) {
							app.confirm({
								content: '商品编辑成功，点继续编辑可保留数据',
								cancelText: '返回',
								confirmText: '继续编辑',
								success: function (res) {
									if (res.confirm) {
										wx.pageScrollTo({
											scrollTop: 1
										});
									} else if (res.cancel) {
										app.navBack();
									}
								},
								fail: function () {

								}
							});
						});
					}
					//添加商品
					else {
						app.request('//shopapi/addShopGoods', formData, function (backData) {
							if (options.type == 'addSupply') {
								app.dialogSuccess();
							} else {
								app.confirm({
									content: '商品添加成功，点继续添加可保留数据',
									cancelText: '返回',
									confirmText: '继续添加',
									success: function (res) {
										if (res.confirm) {
											wx.pageScrollTo({
												scrollTop: 1
											});
										} else if (res.cancel) {
											app.navBack();
										}
									},
									fail: function () {
	
									}
								});
							};
						});
					}
				};
			},
			moveSku:function(e){
				let _this = this,
					type = app.eData(e).type,
					index = Number(app.eData(e).index),
					formData = this.getData().form;
				if(type=='up'){
					if(index!=0){
						let firstData = formData.sku[index],
							lastData = formData.sku[index-1];
						formData.sku.splice(index,1);
						formData.sku.splice(index - 1, 0, firstData);
						this.setData({
							form:formData
						});
						setTimeout(function () {
							app.each(formData.sku, function (i, item) {
								_this.selectComponent('#uploadPic' + i).reset(item.pic||'');
							});
						}, 200);
					};
				}else if(type=='down'){
					if(index != formData.sku.length - 1){
						let firstData = formData.sku[index],
							lastData = formData.sku[index+1];
						formData.sku.splice(index,1);
						formData.sku.splice(index + 1, 0, firstData);
						this.setData({
							form:formData
						});
						setTimeout(function () {
							app.each(formData.sku, function (i, item) {
								_this.selectComponent('#uploadPic' + i).reset(item.pic||'');
							});
						}, 200);
					};
				};
			},
			bindBeginDate:function(e){
				this.setData({
					'form.pickBeginDate':e.detail.value,
					pickBeginDate:e.detail.value
				});
			},
			bindEndDate:function(e){
				this.setData({
					'form.pickEndDate':e.detail.value,
					pickEndDate:e.detail.value
				});
			},
			changePrice:function(e){//修改价格
				let type = app.eData(e).type,
					index = Number(app.eData(e).index),
					formData = this.getData().form;
				formData.sku[index].priceList[type] = app.eValue(e);
				this.setData({
					form: formData
				});
			},
		}
	});
})();