(function () {

	let app = getApp();

	app.Page({
		pageId: 'manage-orderDetail',
		data: {
			systemId: 'manage',
			moduleId: 'orderDetail',
			data: {
				goodslist: [],
				address: {
					name: '',
					mobile: '',
					area: []
				},
				returninfo: {
					addtime: '',
					content: ''
				},
			},
			options: {},
			settings: {},
			language: {},
			form: {},
			isUserLogin: app.checkUser(),
			orderid: '', //订单id
			client: app.config.client,
			paytypeText: {
				'alipay': '支付宝',
				'weixin': '微信',
				'balance': '余额',
				'projectpay':'项目余额',
			},
			showEdit: false,
			showDeilvery: false,
			editForm: {
				orderid: '',
				type: 'low',
				total: ''
			},
			deilveryForm: {
				orderid:'',
				key:'',
				deliverynum:'',
				deliveryname:'',
				type:'add',//'edit'
			},
			hasBtn: false,
			deliverySafeNum: '', //自提码
			isEditDeilvery: false, //是否修改物流单号模式
			from: '', //来源
			showCancelDialog:false,
			cancelForm:{orderid:'',content:''},
			commentpicWidth:((app.system.windowWidth>480?480:app.system.windowWidth)-38)/3,
			showReplayDialog:false,
			replayForm:{
				id:'',
				replaycontent:''
			},
			canCancelGoods:false,//是否支持对某个商品退款，仅限区快团
			iscancelGoods:false,
			showRefund:false,//退款弹框，仅限区快团
			refundForm:{
				id:'',
				type:'1',
				total:''
			},
		},
		methods: {
			onLoad: function (options) {
				//status1-6 待付款 待发货 待收货 已完成 已退款 已过售后期
				if (options.id) {
					this.setData({
						orderid: options.id
					});
				};
				if (options.from) {
					this.setData({
						from: options.from
					});
				};
				if (options.deliverySafeNum) {
					this.setData({
						deliverySafeNum: options.deliverySafeNum
					});
				};
				if(app.session.get('manageShopId')=='6229cdfa1904ff55487475cc'||app.session.get('manageShopId')=='5dae7240c926c6561d499da6'){
					this.setData({canCancelGoods:true});
				};
				let _this = this;
				app.checkUser(function () {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
			onShow: function () {
				//检查用户登录状态
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
			onPullDownRefresh: function () {
				this.load();
				wx.stopPullDownRefresh();
			},
			load: function () {
				let _this = this,
					deliverySafeNum = this.getData().deliverySafeNum,
					from = this.getData().from,
					paytypeText = this.getData().paytypeText,
					orderid = this.getData().orderid;
				if (orderid) {
					app.request('//shopapi/getOrderDetail', {
						orderid: orderid
					}, function (backData) {
						if (app.config.client!='app' && backData.shopid && from != 'evaluate') {
							app.session.set('manageShopId', backData.shopid);
							app.session.set('manageShopShortId', backData.shortid);
						};
						if (backData.status == 1 || backData.afterstatus == 1 || backData.afterstatus == 2 || backData.status == 2) {
							_this.setData({
								hasBtn: true
							});
						} else {
							_this.setData({
								hasBtn: false
							});
						};
						if (backData.goodslist && backData.goodslist.length) {
							app.each(backData.goodslist, function (i, item) {
								item.pic = app.image.crop(item.pic, 80, 80);
								item.total = app.getPrice(item.sku.price * item.quantity);
								item.selected = 0;
								if(item.quantity==0){
									item.disabled = 1;
								};
							});
						};
						if (backData.address && backData.address.name) {
							backData.address_name = backData.address.name;
						};
						if (backData.address && backData.address.mobile) {
							backData.address_mobile = backData.address.mobile;
						};
						if (backData.address && backData.address.area && backData.address.area.length) {
							backData.address_address = backData.address.area[0] + ' ' + backData.address.area[1] + ' ' + backData.address.area[2] + ' ' + backData.address.address;
						};
						if (backData.paytype) {
							backData.paytypeText = paytypeText[backData.paytype];
						};
						if (backData.status > 1 && backData.status < 4) {
							if (backData.afterstatus == 1) {
								backData.afterstatusName = '已申请退款';
							} else if (backData.afterstatus == 2) {
								backData.afterstatusName = '通过退款申请';
							} else if (backData.afterstatus == 3) {
								backData.afterstatusName = '拒绝退款申请';
							};
						};
						if (backData.returninfo && backData.returninfo.pics && backData.returninfo.pics.length) {
							let newArray = [];
							app.each(backData.returninfo.pics, function (i, item) {
								newArray.push({
									key: item,
									file: app.image.crop(item, 60, 60)
								});
							});
							backData.returninfo.pics = newArray;
						};
						if (backData.headpic) {
							backData.headpic = app.image.crop(backData.headpic, 60, 60);
						};
						if(backData.commentlist&&backData.commentlist.length){
							app.each(backData.commentlist,function(i,item){
								if(item.pics&&item.pics.length){
									let newPic = [];
									app.each(item.pics,function(l,g){
										newPic.push({
											key:g,
											file:app.image.crop(g,_this.getData().commentpicWidth,_this.getData().commentpicWidth),
										});
									});
									item.pics = newPic;
								}else{
									item.pics = [];
								};
							});
						};
						_this.setData({
							data: backData
						});
						if (deliverySafeNum && backData.status == 2) { //如果是扫码进来的
							_this.toCheckDeilvery();
						};
					});
				} else {
					app.tips('订单不存在或者无权访问', 'error');
					app.navTo('../../manage/index/index');
				};
			},
			editOrder:function(){//修改订单
				let _this = this,
					id = this.getData().orderid;
				app.navTo('../../manage/orderEdit/orderEdit?id=' + id);
			},
			viewReturnImage: function (e) {
				let _this = this,
					data = this.getData().data,
					index = Number(app.eData(e).index),
					viewSrc = [],
					files = data.returninfo.pics;
				app.each(files, function (i, item) {
					viewSrc.push(app.config.filePath + '' + item.key);
				});
				app.previewImage({
					current: viewSrc[index],
					urls: viewSrc
				});
			},
			//查看物流
			viewLogistics: function (e) {
				let _this = this,
					id = this.getData().orderid;
				app.navTo('../../shop/orderLogistics/orderLogistics?id=' + id);
			},
			//隐藏弹框
			toHideEdit: function (e) {
				this.setData({
					showEdit: false
				});
			},
			//显示弹框
			toShowEdit: function (e) {
				this.setData({
					showEdit: true,
					'editForm.orderid': this.getData().orderid,
					'editForm.total': '',
					'editForm.type': 'low'
				});
			},
			//提交修改
			toConfirmEdit: function (e) {
				let editForm = this.getData().editForm,
					isPrice = re = /^[0-9]+.?[0-9]*$/,
					_this = this;
				if (!editForm.type) {
					app.tips('请选择类型', 'error');
				} else if (!editForm.total || !isPrice.test(editForm.total)) {
					app.tips('请输入正确的金额', 'error');
				} else {
					app.request('//shopapi/updateShopOrderPrice', editForm, function () {
						app.tips('修改成功', 'success');
						_this.load();
					}, '', function () {
						_this.toHideEdit();
					});
				};
			},
			editType: function (e) {
				this.setData({
					'editForm.type': app.eData(e).type
				});
			},
			toHideDeilvery: function () {
				this.setData({
					showDeilvery: false
				});
			},
			toConfirmDeilvery: function(){
				let _this = this,
					deilveryForm = this.getData().deilveryForm,
					msg = '';
				if(!deilveryForm.deliverynum){
					app.tips('请输入物流单号','error');
				}else{
					if(deilveryForm.type=='edit'){//修改物流单号	
						app.request('//shopapi/updateDelivery', deilveryForm, function () {
							app.tips('修改成功', 'success');
							_this.load();
						}, '', function () {
							_this.toHideDeilvery();
						});
					}else{
						app.request('//shopapi/deliveryShopOrder', deilveryForm, function () {
							app.tips('填写成功', 'success');
							_this.load();
						}, '', function () {
							_this.toHideDeilvery();
						});
					};
				};
			},
			toShowDeilvery: function (e) {//发货
				let _this = this,
					data = this.getData().data;
				/*this.setData({
					showDeilvery: true,
					'deilveryForm.type': 'add',
					'deilveryForm.orderid': this.getData().orderid,
					'deilveryForm.deliverynum': ''
				});*/
				app.storage.set("addressObj", {
					name: data.address_name,
					mobile: data.address_mobile,
					address: data.address_address
				})
				app.navTo('../../manage/deliverGoods/deliverGoods?id=' +_this.getData().orderid);
			},
			toEditDeilvery: function (e) { //修改物流单号
				let _this = this,
					data = this.getData().data;
				app.storage.set("addressObj", {
					name: data.address_name,
					mobile: data.address_mobile,
					address: data.address_address
				})
				app.navTo('../../manage/deliverGoods/deliverGoods?id=' +_this.getData().orderid + '&isedit=1');
				/*this.setData({
					showDeilvery: true,
					'deilveryForm.type': 'edit',
					'deilveryForm.orderid': this.getData().orderid,
					'deilveryForm.deliverynum': ''
				});*/
			},
			//扫码进来审核发货
			toCheckDeilvery: function (e) {
				let _this = this;
				app.confirm('确定审核发货吗？', function () {
					app.request('//shopapi/deliveryShopOrder', {
						deliverynum: '',
						orderid: _this.getData().orderid,
						deliverySafeNum: _this.getData().deliverySafeNum
					}, function () {
						app.confirm({
							content: '审核发货成功',
							cancelText: '取消',
							confirmText: '首页',
							success: function (res) {
								if (res.confirm) {
									app.switchTab({
										url: '../../manage/index/index'
									});
								};
							},
							fail: function () {

							}
						});
						_this.load();
					});
				});
			},
			
			//取消订单直接退款
			toCancel: function (e) {
				let _this = this,
					id = this.getData().orderid,
					data = this.getData().data;
				if((app.session.get('manageShopId')=='6229cdfa1904ff55487475cc'||app.session.get('manageShopId')=='5dae7240c926c6561d499da6')&&data.status>1){//已支付并且是区快团订单，走申请退款流程，让财务去退款
					this.setData({showRefund:true});
				}else{
					this.setData({showCancelDialog:true,'cancelForm.content':'','cancelForm.orderid':id});
				};
				/*app.confirm('确定要取消订单？', function () {
					app.request('//shopapi/cancelOrder', {
						orderid: id
					}, function () {
						app.tips('取消成功', 'success');
						app.navBack();
					});
				});*/
			},
			toHideCancelDialog:function(){
				this.setData({showCancelDialog:false});
			},
			toConfirmCancelDialog:function(){
				let _this = this,
					cancelForm = this.getData().cancelForm;
				app.request('//shopapi/cancelOrder',cancelForm,function(){
					app.tips('取消成功', 'success');
					_this.toHideCancelDialog();
					_this.load();
				});
			},
			//同意售后申请
			toAfter: function (e) {
				let _this = this,
					index = Number(app.eData(e).index),
					data = this.getData().data,
					id = this.getData().orderid;
				app.confirm('同意申请后，就可以办理退款，款项将原路退回给客户', function () {
					app.request('//shopapi/doOrderAfterSale', {
						orderid: id,
						status: 2
					}, function () {
						app.tips('同意成功', 'success');
						_this.load();
					});
				});
			},
			//拒绝售后申请
			noAfter: function (e) {
				let _this = this,
					index = Number(app.eData(e).index),
					data = this.getData().data,
					id = this.getData().orderid;
				app.confirm('确定拒绝吗？', function () {
					app.request('//shopapi/doOrderAfterSale', {
						orderid: id,
						status: 3
					}, function () {
						app.tips('拒绝成功', 'success');
						_this.load();
					});
				});
			},
			//售后立即退款
			toRefund: function (e) {
				let _this = this,
					data = this.getData().data,
					id = this.getData().orderid,
					totalPrice = Number(data.totalPrice),
					freightTotal = Number(data.freightTotal),
					total = totalPrice - freightTotal;
				app.confirm('退款后，款项将原路退回给客户，请确认是否立即退款', function () {
					app.request('//shopapi/doOrderRefund', {
						orderid: id,
						total: total
					}, function () {
						app.tips('退款成功', 'success');
						_this.load();
					});
				});
			},
			//复制内容
			copyThis: function (e) {
				let client = app.config.client,
					content = app.eData(e).content;
				if (client == 'wx') {
					wx.setClipboardData({
						data: content,
						success: function () {
							app.tips('复制成功', 'error');
						},
					});
				} else if (client == 'app') {
					wx.app.call('copyLink', {
						data: {
							url: content
						},
						success: function (res) {
							app.tips('复制成功', 'error');
						}
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
			},
			copyInfo: function () {
				let _this = this,
					client = app.config.client,
					data = _this.getData().data,
					text = '';
				text += '订单号：' + data.ordernum;
				text += ' 姓名：' + data.address_name;
				text += ' 电话：' + data.address_mobile;
				text += ' 地址：' + data.address_address;
				if (data.message) {
					text += ' 备注：' + data.message;
				};

				app.each(data.goodslist, function (i, item) {
					text += ' 商品：' + item.goodsname;
					text += ' 规格：' + item.format;
					text += ' 数量：' + item.quantity;
				});

				if (client == 'wx') {
					wx.setClipboardData({
						data: text,
						success: function () {
							app.tips('复制成功', 'success');
						},
					});
				} else if (client == 'app') {
					wx.app.call('copyLink', {
						data: {
							url: text
						},
						success: function (res) {
							app.tips('复制成功', 'success');
						}
					});
				} else {
					$('body').append('<input class="readonlyInput" value="'+text+'" id="readonlyInput" readonly />');
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
			printOrder: function () { //打印订单
				let _this = this;
				if (this.printIng == 1) {
					app.tips('打印中，请稍后');
				} else {
					this.printIng = 1;
					app.request('//ylprintapi/printOrder', {
						orderid: _this.getData().orderid
					}, function () {
						app.tips('订单打印成功', 'success');
						_this.printIng = 0;
					}, function (msg) {
						app.tips(msg || '打印失败');
						_this.printIng = 0;
					});
				};
			},
			toViewTickets:function(){
				app.navTo('../../manage/ticketRecord/ticketRecord?orderid='+this.getData().orderid);
			},
			replayThis:function(e){
				this.setData({
					showReplayDialog:true,
					'replayForm.index':Number(app.eData(e).index),
					'replayForm.id':app.eData(e).id,
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
					app.request('//shopapi/addCommentReplay',{id:replayForm.id,replaycontent:replayForm.replaycontent},function(){
						app.tips('回复成功','success');
						data.commentlist[replayForm.index].replaycontent = replayForm.replaycontent;
						_this.setData({data:data});
						_this.toHideReplayDialog();
					});
				};
			},
			viewImage2:function(e){
				let _this = this,
					data = this.getData().data.commentlist,
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
			toCancelThis:function(e){
				this.setData({iscancelGoods:true});
			},
			toCancelCancel:function(){
				this.setData({iscancelGoods:false});
			},
			toSelectThis:function(e){
				let _this = this,
					index = Number(app.eData(e).index),
					goodslist = this.getData().data.goodslist;
				if(!goodslist[index].disabled){
					goodslist[index].selected = goodslist[index].selected==1?0:1;
					this.setData({'data.goodslist':goodslist});
				};
			},
			toConfirmCancel:function(e){
				let _this = this,
					index = Number(app.eData(e).index),
					goodslist = this.getData().data.goodslist,
					orderid = this.getData().orderid,
					requestData = {
						orderid:orderid,
						list:[]
					};
				app.each(goodslist,function(i,item){
					if(item.selected==1){
						requestData.list.push(item.goodsid+''+item.format);
					};
				});
				if(requestData.list.length){
					app.confirm('确定退款吗？',function(){
						console.log(app.toJSON(requestData));
						app.request('//bulkapi/mRefundGoodsV2',requestData,function(){
							app.tips('退款提交成功','success');
							_this.toCancelCancel();
							_this.load();
						});
					});
				}else{
					app.tips('没有勾选商品','error');
				};
			},
			toHideRefund:function(){
				this.setData({showRefund:false});
			},
			editRefundType:function(e){
				this.setData({'refundForm.type':app.eData(e).type});
			},
			toConfirmRefund:function(){
				let _this = this,
					isPrice = re = /^[0-9]+.?[0-9]*$/,
					orderid = this.getData().orderid,
					refundForm = this.getData().refundForm,
					msg = '';
				refundForm.id = orderid;
				console.log(app.toJSON(refundForm));
				if(refundForm.type==2&&(!refundForm.total||!isPrice.test(refundForm.total))){
					msg = '请输入正确的退款金额';
				};
				if(msg){
					app.tips(msg,'error');
				}else{
					app.request('//shopapi/mApplyRefund',refundForm, function () {
						app.tips('提交成功', 'success');
						_this.toHideRefund();
						_this.load();
					});
				};
			},
		}
	});
})();