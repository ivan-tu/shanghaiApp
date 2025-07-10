(function() {

    let app = getApp();

    app.Page({
        pageId: 'shop-orderEvaluate',
        data: {
            systemId: 'shop',
            moduleId: 'orderEvaluate',
            data:{},
			goodsList:[],
            options: {},
            settings: {},
            language: {},
            form: {
				orderid:'',
				content:'',
				pics:[]
			},
			imageWidth: ((app.system.windowWidth>480?480:app.system.windowWidth)-49) / 4,
            imageHeight: ((app.system.windowWidth>480?480:app.system.windowWidth)-49) / 4,
			uploadSuccess:true,//上传状态
			orderid:'',//订单id
			client: app.config.client,
        },
        methods: {
			onLoad:function(options){
				//status1-6 待付款 待发货 待收货 已完成 已退款 已过售后期
				if(options.id){
					this.setData({
						orderid:options.id,
						'form.orderid':options.id
					});
				};
			},
			onShow:function(){
				this.load();
			},
			onPullDownRefresh: function() {
				this.load();
                wx.stopPullDownRefresh();
            },
			load:function(){
				let _this = this,
					goodsList = [],
					orderid = this.getData().orderid;
				if(orderid){
					app.request('//vorderapi/getClientOrderDetail',{orderid:orderid},function(backData){
						if(backData.goodslist&&backData.goodslist.length){
							app.each(backData.goodslist,function(i,item){
								item.totalPrice = app.getPrice(item.price*item.quantity);
								item.pic = app.image.crop(item.pic,80,80);
								item.eva_stars = 5;
								item.eva_content = '';
								item.eva_pics = [];
								item.eva_picsArray = [];//{src:'',hidePercent:'',percent:''}
								goodsList.push(item);
							});
						};
						_this.setData({
							goodsList:goodsList,
							data:backData
						});
					});
				}else{
					app.tips('订单不存在','error');
				};
			},
			addStar:function(e){//评星
				let _this = this,
					index = Number(app.eData(e).index),
					num = Number(app.eData(e).num),
					goodsList = this.getData().goodsList;
				goodsList[index].eva_stars = num;
				this.setData({goodsList:goodsList});
			},
			changeContent:function(e){//输入评价内容
				let _this = this,
					index = Number(app.eData(e).index),
					content = app.eValue(e),
					goodsList = this.getData().goodsList;
				goodsList[index].eva_content = content;
				this.setData({goodsList:goodsList});
			},
			submit:function(){//提交评价
				let _this = this,
					goodsList = this.getData().goodsList,
					requestData = {orderid:_this.getData().orderid,data:[]};
				app.each(goodsList,function(i,item){
					requestData.data.push({
						name:item.goodsname,
						goodsid:item.goodsid,
						content:item.eva_content,
						stars:item.eva_stars,
						pics:item.eva_pics
					});
				});
				console.log(app.toJSON(requestData));
				app.request('//vorderapi/addOrderComment',requestData,function(){
					app.tips('提交成功','success');
					setTimeout(function(){
						app.navBack();
					},500);
				});
			},
			upload: function(e) {
                let _this = this,
                    parent = Number(app.eData(e).parent),
                    goodsList = _this.getData().goodsList,
                    eva_picsArray = goodsList[parent].eva_picsArray,
					eva_pics = goodsList[parent].eva_pics,
					index = eva_picsArray.length,
					uploadSuccess = _this.getData().uploadSuccess;
				if(index>=5){
					app.tips('最多只能上传5张图片','error');
				}else if(!uploadSuccess){
					app.tips('还有图片正在上传','error');
				}else{
					app.upload({
						count: 5-index,
						mimeType: 'image',
						choose: function(res) {
							app.each(res, function() {
								eva_picsArray = eva_picsArray.concat({ src: '', percent: '' ,hidePercent:false});
							});
							goodsList[parent].eva_picsArray = eva_picsArray;
							_this.setData({goodsList:goodsList,uploadSuccess:false});
						},
						progress: function(res) {
							let newIndex = index + res.index;
							eva_picsArray[newIndex].hidePercent = false;
							eva_picsArray[newIndex].percent = res.percent;
							goodsList[parent].eva_picsArray = eva_picsArray;
							_this.setData({ goodsList: goodsList });
						},
						success: function(res) {
							let imageWidth = _this.getData().imageWidth,
								imageHeight = _this.getData().imageHeight,
								newIndex = index + res.index;
							eva_pics[newIndex] = res.key;
							eva_picsArray[newIndex].key = res.key;
							eva_picsArray[newIndex].hidePercent = true;
							eva_picsArray[newIndex].src = app.image.crop(res.key, imageWidth, imageHeight);
						},
						fail: function(msg) {
							if (msg.errMsg && msg.errMsg == 'max_files_error') {
								app.tips('最多只能上传5张图片','error');
							};
						},
						complete: function() {
							goodsList[parent].eva_picsArray = eva_picsArray;
							goodsList[parent].eva_pics = eva_pics;
							_this.setData({ goodsList:goodsList,uploadSuccess:true});
						}
	
					});
				};
            },
			del: function(e) {
                let index = Number(app.eData(e).index),
					parent = Number(app.eData(e).parent),
					goodsList = this.getData().goodsList,
                    eva_picsArray = goodsList[parent].eva_picsArray,
					eva_pics = goodsList[parent].eva_pics;
                goodsList[parent].eva_picsArray = app.removeArray(eva_picsArray, index);
                goodsList[parent].eva_pics = app.removeArray(eva_pics, index);
                this.setData({ goodsList:goodsList});
            },
        }
    });
})();