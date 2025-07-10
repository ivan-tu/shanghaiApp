/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'home-search',
        data: {
            systemId: 'home',
            moduleId: 'search',
            data: {},
            options: { },
            settings: {},
            language: {},
            form: {
				keyword:''
			},
			userList:[],
			activityList:[],
			clubList:[],
			showLoading:false,
			showNoData:true,
			showMoreUser:false,
			showMoreActivity:false,
			showMoreClub:false,
			clubPicWidth:Math.ceil(((app.system.windowWidth>480?480:app.system.windowWidth)-40)*0.5),
        },
        methods: {
            onLoad: function(options) {
				if(options.keyword){
					this.setData({
						'form.keyword':options.keyword
					});
					this.getList();
				};
            },
            onShow: function() {
            },
            onPullDownRefresh: function() {
                wx.stopPullDownRefresh();
            },
            load: function() {
               
            },
			toDetail:function(e){
			   
			},
            clearKeyword:function(){
                this.setData({'form.keyword':'',userList:[],livelist:[]});
            },
			getActivityTime:function(date){
				if(!date)return;
				date = app.getThatDate(date*1000,0,true);
				date = date.split(' ');//2020-01-06 11:00:05;
				let day = date[0],
					time = date[1],
					activityTime = '';
				day = day.split('-');
				day = day[1]+'.'+day[2];
				time = time.split(':');
				time = time[0]+':'+time[1];
				activityTime = day+' '+time;
				return activityTime;
			},
            getList:function(){
                let _this=this,
                    formData=_this.getData().form;
				if(app.getLength(formData.keyword)<2){
					app.tips('关键词太短');
					return;
				};
				this.setData({showLoading:true});
                app.request('//homeapi/searchAll',formData,function(res){
					if(res&&res.userList&&res.userList.length){
						app.each(res.userList,function(i,item){
							item.headpic = app.image.crop(item.headpic, 120, 120);
							if(i>=4){
								item.hide=1;
							}else{
								item.hide=0;
							};
						});
						if(res.userList.length>=5){
							_this.setData({showMoreUser:true});
						}else{
							_this.setData({showMoreUser:false});
						};
						_this.setData({userList:res.userList});
					}else{
						_this.setData({userList:[],showMoreUser:false});
					};
					if(res&&res.activityList&&res.activityList.length){
						app.each(res.activityList,function(i,item){
							item.masterpic = app.image.crop(item.masterpic,30,30);
							item.pic = app.image.crop(item.pic,120,96);
							item.areaText = (item.area&&item.area.length)?item.area[1]+'-'+item.area[2]:'';
							if(i>=4){
								item.hide=1;
							}else{
								item.hide=0;
							};
							item.begintime = _this.getActivityTime(item.begintime);
							
						});
						if(res.activityList.length>=5){
							_this.setData({showMoreActivity:true});
						}else{
							_this.setData({showMoreActivity:false});
						};
						_this.setData({activityList:res.activityList});
					}else{
                    	_this.setData({activityList:[],showMoreActivity:false});
					};
					if(res&&res.clubList&&res.clubList.length){
						app.each(res.clubList,function(i,item){
							item.pic = app.image.crop(item.pic,_this.getData().clubPicWidth,_this.getData().clubPicWidth);
							if(i>=4){
								item.hide=1;
							}else{
								item.hide=0;
							};
						});
						if(res.clubList.length>=5){
							_this.setData({showMoreClub:true});
						}else{
							_this.setData({showMoreClub:false});
						};
						_this.setData({clubList:res.clubList});
					}else{
                    	_this.setData({clubList:[],showMoreClub:false});
					};
					if(!res.userList.length&&!res.activityList.length&&!res.clubList.length){
						_this.setData({showNoData:true});
					}else{
						_this.setData({showNoData:false});
					};
                },'',function(){
					_this.setData({showLoading:false});
				});
            },
			toShowMore:function(e){
				let type = app.eData(e).type,
					activityList = this.getData().activityList,
					userList = this.getData().userList,
					clubList = this.getData().clubList;
				if(type=='user'){
					app.each(userList,function(i,item){
						item.hide = 0;
					});
					this.setData({userList:userList,showMoreUser:false});
				}else if(type=='activity'){
					app.each(activityList,function(i,item){
						item.hide = 0;
					});
					this.setData({activityList:activityList,showMoreActivity:false});
				}else if(type=='club'){
					app.each(clubList,function(i,item){
						item.hide = 0;
					});
					this.setData({clubList:clubList,showMoreClub:false});
				};
			},
        }
    });
})();