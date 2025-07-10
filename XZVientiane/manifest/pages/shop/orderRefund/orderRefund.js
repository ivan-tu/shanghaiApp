(function() {

    let app = getApp();

    app.Page({
        pageId: 'shop-orderRefund',
        data: {
            systemId: 'shop',
            moduleId: 'orderRefund',
            data:{
				goodslist:[],
				address:{
					name:'',
					mobile:'',
					area:[]
				}
			},
            options: {},
            settings: {},
            language: {},
            form: {
				orderid:'',
				content:'',
				pics:[]
			},
			imageWidth: (app.system.windowWidth - 49) / 4,
            imageHeight: (app.system.windowWidth - 49) / 4,
			uploadSuccess:true,//上传状态
			files: [],
            src: [],
			orderid:'',//订单id
			client: app.config.client,
			returnAddress:{
				"areaname":"",
				"name":"",
				"mobile":"",
				"address":"",
			},//退货地址
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
					orderid = this.getData().orderid;
				if(orderid){
					app.request('//vorderapi/getClientOrderDetail',{orderid:orderid},function(backData){
						if(backData.goodslist&&backData.goodslist.length){
							app.each(backData.goodslist,function(i,item){
								item.pic = app.image.crop(item.pic,80,80);
								item.totalPrice = app.getPrice(item.price*item.quantity);
							});
						};
						let returnTotal = Number(backData.totalPrice) - Number(backData.freightTotal||0);
						backData.returnTotal = returnTotal.toFixed(2);
						_this.setData({
							data:backData
						});
						//获取退货地址
						if(backData.goodslist[0].goodsCategoryType!=2){
							app.request('//vshopapi/getShopReturnaddress',{orderid:orderid},function(res){
								if(res){
									_this.setData({returnAddress:res});
								};
							});
						};
					});
				}else{
					app.tips('订单不存在，请重新下单','error');
				};
			},
			confirmOrder:function(){//申请退款
				let formData = this.getData().form,
					_this = this,
					src = this.getData().src,
					msg = '';
				formData.pics = src;
				console.log(app.toJSON(formData));
				if(!formData.content){
					msg='请输入退款原因';
				};
				if(msg){
					app.tips(msg,'error');
				}else{
					app.request('//vorderapi/applyReturnOrder',formData,function(){
						app.tips('申请成功','success');
						setTimeout(function(){
							app.navBack();
						},500);
					});
				};
			},
			upload: function(e) {
                let _this = this,
                    result = _this.getData().src,
                    files = _this.getData().files,
                    index = files.length,
					uploadSuccess = _this.getData().uploadSuccess;
				if(index>=3){
					app.tips('最多只能上传3张图片','error');
				}else if(!uploadSuccess){
					app.tips('还有图片正在上传','error');
				}else{
					app.upload({
						count: 3-index,
						mimeType: 'image',
						choose: function(res) {
							app.each(res, function() {
								files = files.concat({ src: '', percent: '' });
							});
							_this.setData({ files: files,uploadSuccess:false});
						},
						progress: function(res) {
							let newIndex = index + res.index;
							files[newIndex].hidePercent = false;
							files[newIndex].percent = res.percent;
							_this.setData({ files: files });
						},
						success: function(res) {
							let imageWidth = _this.getData().imageWidth,
								imageHeight = _this.getData().imageHeight,
								newIndex = index + res.index;
	
							result[newIndex] = res.key;
							files[newIndex].key = res.key;
							files[newIndex].hidePercent = true;
							files[newIndex].src = app.image.crop(res.key, imageWidth, imageHeight);
						},
						fail: function(msg) {
							let count = _this.getData().count;
							if (msg.errMsg && msg.errMsg == 'max_files_error') {
								app.tips('最多只能上传3张图片','error');
							};
						},
						complete: function() {
							_this.setData({ files: files, src: result,uploadSuccess:true});
						}
	
					});
				};
            },
			del: function(e) {
                let index = app.eData(e).index,
                    result = this.getData().src,
                    files = this.getData().files;
                result = app.removeArray(result, index);
                files = app.removeArray(files, index);
                this.setData({ src: result, files: files });
            },
        }
    });
})();