/**
 *模块组件构造器
 */
(function() {

	let app = getApp();

	app.Page({
		pageId: 'shop-cart',
		data: {
			systemId: 'shop',
			moduleId: 'cart',
			isUserLogin: app.checkUser(),
			data: {
				realTotalPrice:0,
				data:[]	
			},
			options: {},
			settings: {},
			language: {},
			form: {
				checkbox:[]
			},
			client:app.config.client,
			selectedAll:true,
			showLoading:false,
			showNoData:false,
			disabledCount:0,//不可购买商品
			refundType:'',//商品退款状态
			refundStatus:1,//退款方式有几种
			goodsList:[],//猜你喜欢列表
		},
		methods: {
			onLoad:function(options){
				//app.config.needBindAccount = 0;
				let _this=this;
				app.checkUser(function(){
					_this.setData({isUserLogin:true});
					_this.load();
				});
				_this.setData({showLoading:true});
			},
			onShow: function(){
				//检查用户登录状态
				let isUserLogin=app.checkUser();
				if(isUserLogin!=this.getData().isUserLogin){
					this.setData({isUserLogin:isUserLogin});
				};
				if(isUserLogin&&this.loaded){
					this.load();	
				};
			},
		    onPullDownRefresh: function() {
				if(this.getData().isUserLogin){
					 this.load();
				};
				wx.stopPullDownRefresh();
		    },
			load:function(){
				if(app.storage.get('oldShopShortId')){
					app.visitShop(app.storage.get('oldShopShortId'));
				};
				let _this=this;
				_this.getList();
			},
			getList:function(loadMore){
				let _this=this;
				app.request('//vorderapi/getMyCartV2',function(res){
					_this.loaded=true;
					if(res.data&&res.data.length){
						let checkbox=[],
							disabledCount=0,
							refundType='',
							refundStatus=1,
							totalCount=0;
						app.each(res.data,function(a,b){
							if(b.shopdata){
								b.shopdata.logo=app.image.crop(b.shopdata.logo,40,40);
							};
							app.each(b.data,function(i,item){
								if(i==0){
									refundType=item.refundType;
								};
								if(item.pic){
									item.pic=app.image.crop(item.pic,80,80);
								};
								if(item.limitCount){
									 item.canbuyCount=item.limitCount-item.buynum;
									 if(item.canbuyCount<0){
										 item.canbuyCount=0;
									 };
								 }else{
									 item.canbuyCount='';
								 };
								if(item.canBuy&&item.hasstock){
									if(item.refundType==refundType){
										item.checked=true;
										checkbox.push(i);
									}else{
										refundStatus=2;
									};
								}else{
									disabledCount++;
								};
								totalCount++;
							});
						});
						_this.setData({
							data:res,
							'form.checkbox':checkbox,
							disabledCount:disabledCount,
							refundType:refundType,
							selectedAll:checkbox.length==totalCount-disabledCount,
							refundStatus:refundStatus,
						});
						_this.resetPrice();
					}else{
						_this.setData({data:{data:[]}});
						_this.resetPrice();
						//_this.getGoods();
					};
					_this.setData({showLoading:false});
				},function(msg){
					app.tips(msg,'error');
					_this.setData({showLoading:false});
				});
				
			},
			//增加数量
			addCount:function(e){
				let _this=this,
					selectedIndex = Number(app.eData(e).index),
					parent = Number(app.eData(e).parent),
					data = _this.getData().data.data,
					sku = data[parent].data[selectedIndex],
					count = sku.quantity;
				if(count<sku.sku.stock){
					count++;
					if(sku.limitCount&&count>sku.canbuyCount){
						app.tips('最多可买'+sku.canbuyCount+'件');
						count=sku.canbuyCount;
					};
					sku.quantity=count;
					_this.setData({'data.data':data});
					_this.edit(parent,selectedIndex);
					_this.resetPrice();		
				}else{
					app.tips('数量不能超过库存');
				};						
			},
			//减少数量
			minusCount:function(e){
				let _this=this,
					selectedIndex = Number(app.eData(e).index),
					parent = Number(app.eData(e).parent),
					data = _this.getData().data.data,
					sku = data[parent].data[selectedIndex],
					count=sku.quantity;
				if(count>1){
					count--;
					sku.quantity=count;
					_this.setData({'data.data':data});
					_this.edit(parent,selectedIndex);	
					_this.resetPrice();	
				}else{
					app.tips('数量最少为1');
				};	
					
			},
			//输入数量
			inputCount:function(e){
				let _this=this,
					value=Number(app.eValue(e)),
					selectedIndex = Number(app.eData(e).index),
					parent = Number(app.eData(e).parent),
					data = _this.getData().data.data,
					sku = data[parent].data[selectedIndex];
				if(value>sku.sku.stock){
					value=sku.sku.stock;
				}else if(value<1){
					value=1;
				}else{
					if(sku.limitCount&&value>sku.canbuyCount){
						app.tips('最多可买'+sku.canbuyCount+'件');
						value=sku.canbuyCount;
					};
				};
				//console.log(value);
				sku.quantity=value;
				_this.edit(parent,selectedIndex);
				_this.setData({'data.data':data});	
				_this.resetPrice();
			},
			//编辑购物车数量
			edit:function(parent,index){
				let _this=this,
					data=_this.getData().data.data[parent].data[index];
				app.request('//vorderapi/updateCartQuantity',{
					id:data.id||data._id,
					quantity:data.quantity
					},function(){
				},function(){});		
			},
			//删除商品
			del:function(e){
				let _this=this,
					selectedIndex = Number(app.eData(e).index),
					parent = Number(app.eData(e).parent),
					data=_this.getData().data.data,
					id=data[parent].data[selectedIndex].id||data[parent].data[selectedIndex]._id,
					attrs=[];
				/*data[parent].data.splice(selectedIndex,1);
				app.each(data,function(a,b){
					app.each(b.data,function(i,item){
						if(item.checked){
							attrs.push(i);
						};
					});
				});	
				_this.setData({'form.checkbox':attrs,'data.data':data,selectedAll:attrs.length==data.length});
				_this.resetPrice();	*/
				app.request('//vorderapi/deleteCart',{id:id},function(){
					_this.getList();
				});
			},
			//重算价格
			resetPrice:function(){
				let _this=this,
					data=_this.getData().data.data,
					total=0;//按件运费
				app.each(data,function(a,b){
					app.each(b.data,function(i,item){
						if(item.checked){
							total+=item.quantity*item.price;
						};
					});
				});
				_this.setData({'data.realTotalPrice':app.getPrice(total)});
			},
			//选择数据
			selectItem:function(e){
				let _this=this,
					index=Number(app.eData(e).index),
					data=_this.getData().data.data,
					item=data[index],
					selectedAll=true,
					checked=[],
					refundType=this.getData().refundType,
					msg='';
				if(item.checked){
					item.checked=false;
					selectedAll=false;
				}else{
					refundType=item.refundType;
					item.checked=true;
				};
				app.each(data,function(i,item){
					if(item.checked&&item.refundType!=refundType){
						item.checked=false;
						if(refundType==1){
							msg='已取消选择不可退款商品';
						}else{
							msg='已取消选择可退款商品';
						};
					};
					if(!item.checked){
						selectedAll=false;
					}else{
						checked.push(i);
					};
				});
				data[index]=item;
				_this.setData({
					'form.checkbox':checked,
					'data.data':data,
					selectedAll:selectedAll,
					refundType:refundType
				});
				_this.resetPrice();
				if(msg){
					app.tips(msg);
				};
				
			},
			//全选
			selectAll:function(e){
				let _this=this,
					value=app.eValue(e),
					data=_this.getData().data.data,
					selected=[],
					selectedAll=value.length?true:false;
				if(_this.getData().refundStatus==2){
					app.tips('不能同时选择不同退款方式的商品');
				}else{
					app.each(data,function(i,item){
						if(value.length){
							if(item.canBuy&&item.hasstock){
								item.checked=true;
								selected.push(i);
							};
						}else{
							item.checked=false;
						}
					});
					//console.log(app.toJSON(data));
					_this.setData({'form.checkbox':selected,'data.data':data,selectedAll:selectedAll});
					_this.resetPrice();
				};
			},
			//跳转页面
			toPage:function(e){
				let page=app.eData(e).page;
				app.navTo(page);
			},
			//前往结算
			submit:function(){
				let _this=this,
					data=_this.getData().data.data,
					attrs=[];
				app.each(data,function(a,b){
					app.each(b.data,function(i,item){
						if(item.checked){
							attrs.push({
								goodsid:item.goodsid,
								format:item.format,
								quantity:item.quantity,
								weight:item.sku.weight||'',
								cartId:item.id,
							});
						};
					});
				});		
				if(attrs.length){
					app.storage.set('checkoutData',attrs);		
					app.navTo('../../shop/checkout/checkout?cart=1');
				}else{
					app.tips('还没有选择商品');
				};
			},
			//获取猜你喜欢商品
			getGoods:function(){
				let _this = this,
					picWidth = (app.system.windowWidth-40)/2,
					formData = {
						page:1,
						size:4,
						sort:'top',
						commend:1
					};
				app.request('//vshopapi/getShopGoodsList',formData,function(backData){
					if(!backData.data){
						backData.data=[];
					};
					if(backData.data&&backData.data.length){
						app.each(backData.data,function(i,item){
							if(item.pic){
								item.pic = app.image.crop(item.pic,picWidth,picWidth);
							};
						});
					};
                    _this.setData({
                        goodsList:backData.data
                    });
				});
			},
			backIndex:function(){
				app.switchTab({url:'../../home/index/index'});
			},
			toStorIndex:function(e){
				if(app.eData(e).shortid){
					app.visitShop(app.eData(e).shortid);
					app.navTo('../../shop/index/index');
				};
			},
		}
	});
})();