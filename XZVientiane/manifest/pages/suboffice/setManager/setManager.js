/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'suboffice-setManager',
        data: {
            systemId: 'suboffice',
            moduleId: 'setManager',
            data: [],
            options: {},
            settings: {
				bottomLoad:false,
			},
            form: {
				page:1,
				size:99,
				clubid:'',
			},
			client:app.config.client,
			showLoading:false,
			showNoData:false,
			sendForm:{
				show:false,
				account:'',
			},
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
				this.setData({
					'form.clubid':options.clubid,
					options:options,
				});
				app.checkUser({
					success: function () {
						_this.setData({
							isUserLogin: true
						});
						_this.load();
					}
				});
            },
            onPullDownRefresh: function() {
                this.load();
                wx.stopPullDownRefresh();
            },
            load: function() {
				this.getList();
            },
			getList:function(loadMore){
				let _this = this,
					formData = _this.getData().form;
				_this.setData({'showLoading':true});
				app.request('//clubapi/getClubManager',formData,function(backData){
					if(backData&&backData.length){
						app.each(backData,function(i,item){
							item.headpic = app.image.crop(item.headpic,60,60);
						});
						_this.setData({
							data:backData,
							showNoData:false,
						});
					}else{
						_this.setData({
							data:[],
							showNoData:true,
						});
					};
				},'',function(){
					_this.setData({
						'showLoading':false,
					});
				});
			},
			toMore:function(e){
				let _this = this,
					options = this.getData().options,
					index = Number(app.eData(e).index),
					data = this.getData().data,
					id = data[index]._id,
					listArray = ['移除'];
				app.actionSheet(listArray,function(num){
					switch(listArray[num]){
						case '移除':
						app.confirm('确定要移除吗？',function(){
							app.request('//clubapi/delClubManager',{id:id},function(){
								app.tips('移除成功','success');
								data.splice(index,1);
								_this.setData({
									data:data
								});
							});
						});
						break;
					};
				});
			},
			addThis:function(e){
                this.setData({
					'sendForm.show':true,
					'sendForm.account':'',
				});
            },
			toHideDialog:function(){
				this.setData({'sendForm.show':false});
			},
			toConfirmDialog:function(){
				let _this = this,
					options = this.getData().options,
					sendForm = this.getData().sendForm,
					formData = {
						clubid:options.clubid,
						userid:'',
						account:sendForm.account,
					},
					msg = '';
				if(!formData.account){
					msg = '请输入账号'
				};
				console.log(app.toJSON(formData));
				if(msg){
					app.tips(msg,'error');
				}else{
					app.request('//userapi/getInfoByAccount',{account:formData.account},function(res){
						if(res&&res._id){
							formData.userid = res._id;
							app.request('//clubapi/addClubManager',formData,function(){
								app.tips('添加成功','success');
								_this.getList();
								_this.toHideDialog();
							});
						}else{
							app.tips('账号不存在','error');
						};
					});
				};
			},
        }
    });
})();