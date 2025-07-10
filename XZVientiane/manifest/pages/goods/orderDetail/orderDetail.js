(function() {

    let app = getApp();

    app.Page({
        pageId: 'goods-orderDetail',
        data: {
            systemId: 'goods',
            moduleId: 'orderDetail',
            data:{
				goodsinfo:{},
				address:{
					name:'',
					mobile:'',
					area:[]
				}
			},
            options: {},
            settings: {},
            language: {},
            form: {},
			orderid:'',//订单id
			client: app.config.client,
			paytypeText:{'alipay':'支付宝','weixin':'微信','balance':'余额'},
			hasBtn:false,
			isUserLogin: app.checkUser(),
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
					app.request('//homeapi/getClientOrderDetail',{orderid:orderid},function(backData){
						if(backData.status==1||backData.status==2||backData.status==3||((backData.status==4||backData.status==6)&&!backData.commentstatus)){
							_this.setData({hasBtn:true});
						}else{
							_this.setData({hasBtn:false});
						};
						if(backData.status==2&&backData.applyRefund==1){
							backData.statusName = '申请退款中';
						};
						if(backData.goodsinfo){
							backData.goodsinfo.pic = app.image.crop(backData.goodsinfo.pic,80,80);
							backData.goodsinfo.total = app.getPrice(backData.goodsinfo.price*backData.quantity);
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
						_this.setData({
							data:backData
						});
					});
				}else{
					app.tips('订单不存在，请重新下单','error');
				};
			},
			//删除订单
			delOrder:function(){
				let _this = this,
					orderid = this.getData().orderid;
				app.confirm('确定要取消吗?',function(){
					app.request('//homeapi/cancelOrder', {orderid:orderid},function(){
						app.tips('取消成功','success');
						setTimeout(function(){
							app.navBack();
						},500);
					});
				});
			},
			//支付订单
			payOrder:function(){
				let _this = this,
					data = this.getData().data;
				app.request('//homeapi/createPayOrder',{ordernum:data.ordernum},function(req){
					if(req.ordernum){
						app.navTo('../../pay/pay/pay?ordernum='+req.ordernum+'&ordertype='+req.ordertype);
					};
				});
			},
			//确认收货
			reveiveOrder:function(e){
				let _this = this,
					id = this.getData().orderid;
				app.confirm('确定要收货吗？',function(){
					app.request('//homeapi/confirmOrder',{orderid:id},function(){
						app.tips('收货成功','success');
						_this.load();
					});
				});
			},
			//申请退款
			cancelOrder:function(){
				let _this = this,
					data = this.getData().data,
					orderid = this.getData().orderid;
				app.confirm('确定要退款吗？',function(){
					app.request('//homeapi/applyRefund', {id:orderid},function(){
						app.alert('退款申请成功，货款'+data.totalPrice+'元将于72小时内原路退回');
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
			copyThis:function(e){
				let client = app.config.client,
					typeText = app.eData(e).type,
					content = app.eData(e).content;
				if (client == 'wx') {
				  wx.setClipboardData({
					data:content,
					success: function () {
					  app.tips('复制成功', 'success');
					},
				  });
				} else if (client == 'app') {
				  wx.app.call('copyLink', {
					data: {
					  url:content
					},
					success: function (res) {
					  app.tips('复制成功', 'success');
					}
				  });
				} else {
				  app.confirm({
					title: typeText,
					content:content
				  });
				};
			},
        }
    });
})();