(function() {

    let app = getApp();

    app.Page({
        pageId: 'shop-orderDetail',
        data: {
            systemId: 'shop',
            moduleId: 'orderDetail',
            data:{
				goodslist:[],
				address:{
					name:'',
					mobile:'',
					area:[]
				},
				returninfo:{
					addtime:'',
					content:''
				},
			},
            options: {},
            settings: {},
            language: {},
            form: {},
			orderid:'',//订单id
			client: app.config.client,
			paytypeText:{'alipay':'支付宝','weixin':'微信','balance':'余额','projectpay':'项目余额','shopredpacketpay':'红包支付'},
			hasBtn:false,
			hexiaoUrl:'',
			isUserLogin: app.checkUser(),
			userHomeData:{customertel:'',customerwx:''},
			showCancelDialog:false,
			cancelForm:{orderid:'',content:''},
			showRemindDeliver:true,
			commentpicWidth:((app.system.windowWidth>480?480:app.system.windowWidth)-38)/3,
        },
        methods: {
			onLoad:function(options){
				//status1-6 待付款 待发货 待收货 已完成 已退款 已过退款期
				if(options.id){
					this.setData({orderid:options.id});
				};
			},
			onShow:function(){
				let _this = this;
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load()
				});
			},
			onPullDownRefresh: function() {
				this.load();
                wx.stopPullDownRefresh();
            },
			load:function(){
				let _this = this,
					paytypeText = this.getData().paytypeText,
					orderid = this.getData().orderid;
				if(orderid){
					app.request('//vorderapi/getClientOrderDetail',{orderid:orderid},function(backData){
						//记录访问网店
						if(backData.shopShortid){
							app.visitShop(backData.shopShortid);
						};
						//获取客服电话客服微信
						/*app.request('//vshopapi/getUserHome', {}, function(res){
							_this.setData({
								userHomeData: res
							});
						});*/
						if(backData.status==1||backData.status==2||backData.status==3||((backData.status==4||backData.status==6)&&!backData.commentstatus)){
							_this.setData({hasBtn:true});
						}else{
							_this.setData({hasBtn:false});
						};
						if(backData.goodslist&&backData.goodslist.length){
							app.each(backData.goodslist,function(i,item){
								item.pic = app.image.crop(item.pic,80,80);
								item.total = app.getPrice(item.price*item.quantity);
							});
						};
						if(backData.address&&backData.address.name){
							backData.address_name = backData.address.name;
						};
						if(backData.address&&backData.address.mobile){
							backData.address_mobile = backData.address.mobile;
						};
						if(backData.address&&backData.address.area&&backData.address.area.length){
							backData.address_address = backData.address.area[0]+' '+backData.address.area[1]+' '+backData.address.area[2]+' '+backData.address.address;
						};
						if(backData.paytype){
							backData.paytypeText = paytypeText[backData.paytype];
						};
						if(backData.status>1&&backData.status<4){
							if(backData.afterstatus==1){
								backData.afterstatusName='已申请退款';
							}else if(backData.afterstatus==2){
								backData.afterstatusName='通过退款申请';
							}else if(backData.afterstatus==3){
								backData.afterstatusName='拒绝退款申请';
							};
						};
						if(backData.returninfo&&backData.returninfo.pics&&backData.returninfo.pics.length){
							let newArray = [];
							app.each(backData.returninfo.pics,function(i,item){
								newArray.push({
									key:item,
									file:app.image.crop(item,60,60)
								});
							});
							backData.returninfo.pics = newArray;
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
						backData.goodsTotalPrice = app.getPrice(backData.goodsTotalPrice-(backData.discountTotalprice||0));
						_this.setData({
							data:backData
						});
						if(backData.status==2&&backData.deliveryType==2){
							let hexiaoUrl = 'https://'+app.config.domain+'/p/manage/orderDetail/orderDetail?id='+orderid+'&deliverySafeNum='+backData.deliverySafeNum;
							if(backData.supplystatus==1){//是供货商品
								hexiaoUrl = 'https://'+app.config.domain+'/p/manage/supplyOrderDetail/supplyOrderDetail?id='+orderid+'&deliverySafeNum='+backData.deliverySafeNum+'&type=sypply';
							};
							_this.setData({
								hexiaoUrl:app.getQrCodeImg(hexiaoUrl)
							});
						};
					});
				}else{
					app.tips('订单不存在，请重新下单','error');
				};
				
			},
			viewReturnImage:function(e){//查看退款凭证
				let _this = this,
					data = this.getData().data,
                    index = Number(app.eData(e).index),
					viewSrc = [],
                    files = data.returninfo.pics;
                app.each(files, function(i, item) {
                    viewSrc.push(app.config.filePath+''+item.key);
                });
                app.previewImage({
                    current: viewSrc[index],
                    urls: viewSrc
                });
			},
			//删除订单
			delOrder:function(){
				let _this = this,
					orderid = this.getData().orderid;
				app.confirm('确定要取消吗?',function(){
					app.request('//vorderapi/cancelOrder', {orderid:orderid},function(){
						app.tips('取消成功','success');
						setTimeout(function(){
							app.navBack();
						},500);
					});
				});
			},
			//取消订单
			cancelOrder:function(){
				let _this = this,
					id = this.getData().orderid;
				/*app.confirm('确定要取消吗?',function(){
					app.request('//vorderapi/rebackOrder', {orderid:orderid},function(){
						app.tips('取消成功','success');
						_this.load();
					});
				});*/
				this.setData({showCancelDialog:true,'cancelForm.content':'','cancelForm.orderid':id});
			},
			toHideCancelDialog:function(){
				this.setData({showCancelDialog:false});
			},
			toConfirmCancelDialog:function(){
				let _this = this,
					cancelForm = this.getData().cancelForm;
				app.request('//vorderapi/rebackOrder',cancelForm,function(){
					app.tips('申请成功', 'success');
					_this.toHideCancelDialog();
					_this.load();
				});
			},
			//支付订单
			payOrder:function(){
				let _this = this,
					data = this.getData().data;
				app.request('//vorderapi/createGoodsPayOrder',{ordernums:data.ordernum},function(res){
					if(res.ordernum){
						if(app.config.client=='web'){
							window.location.href=(res.payurl);	
						}else{
							app.navTo('../../pay/pay/pay?ordernum=' + res.ordernum + '&ordertype='+res.ordertype);
						};
					};
				});
			},
			//查看物流
			viewLogistics:function(e){
				let _this = this,
					id = this.getData().orderid,
					deliverynum = app.eData(e).deliverynum;
				if(deliverynum){
					app.navTo('../../shop/orderLogistics/orderLogistics?id='+id+'&deliverynum='+deliverynum);
				}else{
					app.navTo('../../shop/orderLogistics/orderLogistics?id='+id);
				};
			},
			//确认收货
			reveiveOrder:function(e){
				let _this = this,
					id = this.getData().orderid;
				app.confirm('收货后不能再退款，确定要收货吗？',function(){
					app.request('//vorderapi/confirmOrder',{orderid:id},function(){
						app.tips('收货成功','success');
						_this.load();
					});
				});
			},
			//申请退款
			refundOrder:function(e){
				let _this = this,
					id = this.getData().orderid;
				app.navTo('../../shop/orderRefund/orderRefund?id='+id);
			},
			//去评价
			toEvaluate:function(e){
				let _this = this,
					id = this.getData().orderid;
				app.navTo('../../shop/orderEvaluate/orderEvaluate?id='+id);
			},
			longReceive:function(e){
				let _this = this,
					id = this.getData().orderid;
				app.confirm('一个订单只能延长一次，确认后延长7天',function(){
					app.request('//vorderapi/updateConfirmdate',{orderid:id},function(){
						app.tips('延长成功','success');
						_this.load();
					});
				});
			},
			//拨打电话
			callTel:function(e){
				let tel = app.eData(e).tel;
				if(!tel)return;
				wx.makePhoneCall({
					phoneNumber: tel
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
			//查看大图
			viewImage:function(e){
				let newSrc = [app.eData(e).src];
				app.previewImage({
					current: newSrc[0],
					urls: newSrc
				});
			},
			//保存提货码
			saveThis:function(e){
				let hexiaoUrl = this.getData().hexiaoUrl;
				app.saveImage({
					filePath: hexiaoUrl,
					success:function(){
						app.tips('保存成功', 'success');
					}
				});
			},
			//导航
			openLocation: function (e) {
				let address = app.eData(e).address;
				//根据地址获取经纬度
				var QQMapWX = require('../../../static/js/qqmap-wx-jssdk.min.js');
				var myAmapFun = new QQMapWX({ key: 'GE2BZ-GNDHF-DPMJR-N32JG-7VYD3-B3BLY' });
				myAmapFun.geocoder({
				  address: address,
				  success: function (data) {
					if (data.result&&data.result.location) {
					  wx.openLocation({
						longitude: Number(data.result.location.lng),
						latitude: Number(data.result.location.lat),
						name: address
					  });
					}else{
					  app.tips('获取导航结果失败', 'error');
					};
				  },
				  fail: function (info) {
					app.tips('获取导航结果失败', 'error');
					console.log(app.toJSON(info));
				  }
				});
			},
			callTel: function(e) {
				let tel = app.eData(e).tel;
				if (!tel) return;
				wx.makePhoneCall({
					phoneNumber: tel
				});
			},
			showWx:function(e){
				app.confirm({
					title: '微信号',
					content: app.eData(e).wx
				});
			},
			remindDeliver:function(){//提醒发货
				let _this = this,
					id = this.getData().orderid;
				app.request('//vshopapi/addRemindDelivery',{orderid:id},function(){
					app.tips('提醒发货成功','success');
					_this.setData({showRemindDeliver:false});
				});
			},
			toViewTickets:function(){//查看票券
				app.navTo('../../shop/myTicket/myTicket?orderid='+this.getData().orderid);
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
			changeFloorno:function(){//修改楼号
				let _this = this,
					orderid = this.getData().orderid,
					data = this.getData().data,
					textInputData = {
						type:'text',
						placeholder:'请输入楼号',
						tips:'例如：1号101室',
					};
				app.storage.set('textInputData',textInputData);
				this.dialog({
					title:'修改楼号',
					url:'../../home/textInput/textInput',
					success:function(res){
						if(res.value){
							setTimeout(function(){
								app.request('//vorderapi/updateFloorno',{orderid,floorno:res.value},function(){
									app.tips('修改成功','success');
									data.address.floorno = res.value;
									_this.setData({data:data});
								});
							},1200);
						};
					},
				});
			},
        }
    });
})();