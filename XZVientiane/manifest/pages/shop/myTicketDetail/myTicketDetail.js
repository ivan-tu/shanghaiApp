(function() {

    let app = getApp();

    app.Page({
        pageId: 'shop-myTicketDetail',
        data: {
            systemId: 'shop',
            moduleId: 'myTicketDetail',
            data:{},
            options: {},
            settings: {},
            language: {},
            form: {
				id:''
			},
			client: app.config.client,
			pageLoaded:app.storage.get('pageLoaded'),
			isUserLogin: app.checkUser(),
			address: {
				name:'',
				mobile:'',
				area:[],
				address:'',
			},
        },
        methods: {
			onLoad:function(options){
				//status 1-可使用 2-已使用 3-已过期 4-已退款
				if(options.id){
					this.setData({'form.id':options.id});
				};
			},
			onShow:function(){
				let _this = this;
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
			onHide: function () {
				this.stopInterval();
			},
			onUnload:function(){
				this.stopInterval();
			},
			stopInterval: function () {
				if (this.setIntervalLoad) {
					clearInterval(this.setIntervalLoad);
				};
			},
			onPullDownRefresh: function() {
				this.load();
                wx.stopPullDownRefresh();
            },
			load:function(){
				let _this = this;
				this.setData({pageLoaded:app.storage.get('pageLoaded')});
				this.getInfo();
				this.getAddress();
				if(this.setIntervalLoad){
					clearInterval(this.setIntervalLoad);
				};
				this.setIntervalLoad = setInterval(_this.getInfo,3000);
			},
			getInfo:function(){
				let _this = this,
					pageLoaded=this.getData().pageLoaded,
					formData = this.getData().form;
				if(pageLoaded!=app.storage.get('pageLoaded')){
					if(_this.setIntervalLoad){
						clearInterval(_this.setIntervalLoad);
					};
					return;
				};
				app.request('//vorderapi/getClientTicketsDetail',formData,function(backData){
					if(backData.id){
						backData.codeUrl = app.getQrCodeImg('https://'+app.config.domain+'/p/manage/ticketDetail/ticketDetail?id='+backData.id);
					};
					if(backData.status!=1&&_this.setIntervalLoad){
						clearInterval(_this.setIntervalLoad);
					};
					_this.setData({
						data:backData
					});
				});
			},
			//获取收货地址
			getAddress: function() {
				let _this = this;
				app.request('//userapi/getUserAddress', {
					justdefault: 1
				}, function(res) {
					if (res.data.length) {
						_this.setData({
							address:res.data[0]
						});
					};
				})
			},
			selectAddress: function () {
				let _this = this;
				_this.dialog({
					title: '选择收货地址',
					url: '../../user/address/address?select=1',
					success: function (res) {
						if (res.data) {
							_this.setData({
								address:res.data
							});
						};
					}
				});
			},
			submitPick:function(){//申请提货
				let _this = this,
					formData = this.getData().form,
					address = this.getData().address;
				if(!address.name||!address.mobile){
					app.tips('请添加收货地址','error');
				}else{
					app.confirm('确定申请提货吗？',function(){
						app.request('//bulkapi/addPickOrder',{ticketid:formData.id,address:address},function(){
							app.confirm({
								content:'申请成功',
								cancelText:'返回',
								confirmText:'查看订单',
								success:function(req){
									if(req.confirm){
										app.navTo('../../shop/myPickOrderList/myPickOrderList');
									}else{
										app.navBack();
									};
								},
							});
						});
					});
				};
			},
        }
    });
})();