/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-test',
        data: {
            systemId: 'user',
            moduleId: 'test',
			userSession:false,
            data: {},
            options: {},
            settings: {},
            language: {},
            form: {
				id:'',
				username:'',
				content:'',
				type:1,//1-未知，2-机枪，3-狙击，4-双修
			},
			userList:[],
			type:1,//1-普通模式 2-内定模式 3-查看名单模式 4-名单管理模式
			showForm:false,
			showLoading:false,
			showNoData:false,
			showPwForm:false,
			password:'',//密码
			keyword:'',//筛选的username关键词
			content:'',//筛选的content关键词
			searchTypeText:'',//筛选的type关键词
			selectIndex:'',//当前选择是第几个
			kongweiList:[],//[[],[]]
			kongweiData:[],//[]
			sex:1,
			userName:'',
			showNameForm:{
				show:false,
				name:'',
				parent:'',
				index:'',
			},
			manPic:'https://static.eshopshanghai.com/17271993280616278.jpg',//'https://statics.tuiya.cc/17166545355121645.jpg',
			womanPic:'https://static.eshopshanghai.com/17271993530053168.jpg',//'https://statics.tuiya.cc/17169950364955179.jpg',
			kongweiTips:'',
			textColor:'#0066CC',
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
				$('title').html('队内专用随机器');
				
				if(app.system.windowWidth<=480){
					this.setData({type:3});
					this.getUserList();
				};
				var main = $('.app-wrapper'),
					choseArray = [],//选人麦序
					choseIndex = '',//第几轮选人
					choseNowIndex = '',//当前第几个
					firstChoseIndex = 1,//生成队长的顺序
					beChose = [],//被选顺序
					historyArry = [];//历史记录
				function getResult(narray,i){//从一个数组中拿i个数字
					var newArray = [],
						array = $.extend(true,[],narray);
						index = Math.floor(Math.random()*array.length);
					for(var a=0;a<i;a++){
						var index  = Math.floor(Math.random()*array.length);
						newArray.push(array[index]);
						array.splice(index,1);
					};
					return newArray;
				};
				function setResult(narray,target){
					var tar = target;
					target = target==1?$('#captain_result'):$('#team_result');
					target.html('');
					function setText(text,i){
						setTimeout(function(i){
							var newText ='';
							if(tar==2){
								newText = target.html()+'<span class="teamLine">'+text+'</span></br>';
							}else{
								newText = target.html()+''+text+',';
							};
							target.html(newText);
						},i);
					};
					for(var i=0;i<narray.length;i++){
						console.log(narray);
						if(tar==1&&i%2==0){
							//narray[i]+='<font class="duida">打</font>';
						};
						if(tar==1&&i%2==1){
							//narray[i]+='，';
						};
						setText(narray[i],i*15);
					};
					if(tar==2){
						historyArry.push(narray);
					};
				};
				
				function set_teamLine(){
					$('#team_result').find('.teamLine.active').removeClass('active');
					$('#team_result').find('.teamLine').eq(choseIndex||0).addClass('active');
				};
				
				function set_history(){
					if(historyArry&&historyArry.length){
						$('#history_result').html('');
						$.each(historyArry,function(i,item){
							var html = '<p class="history_result_list">第'+(i+1)+'次：';
							for(var a=0;a<item.length;a++){
								html+='<span class="numberList">'+item[a]+'</span>';
							};
							html+='</p>';
							$('#history_result').append(html);
						});
					};
				};
				
				main.delegate('a[role]','click',function(){
					var $this = $(this),
						role = $this.attr('role'),
						re = /^[+]{0,1}(\d+)$/;
					switch(role){
						case'captain_reSet':
						$('#captain_result').text('');
						break;
						case'team_reSet':
						$('#team_result').text('');
						break;
						case'captain_submit':
						var captain_min = Number($('#captain_min').val()),
							captain_max = Number($('#captain_max').val()),
							captain_length = Number($('#captain_length').val());
						if(!re.test(captain_min)||!re.test(captain_max)||!re.test(captain_length)||captain_min>=captain_max||(captain_max-captain_min+1<captain_length)){

							alert('数学老师哪年死的？')
						}else{
							var newArray = [],
								begin = captain_min,
								end = captain_max;
							for(var i=begin;i<captain_max+1;i++){
								newArray.push(i);
							};
							setResult(getResult(newArray,captain_length),1);
						};
						break;
						case'team_submit':
						var captain_length = Number($('#captain_length').val()),
							team = Number($('#team').val());
						if(!re.test(captain_length)||!re.test(team)){
							alert('你给劳资填数字行不？')
						}else{
							var newArray = [],
								teamArray = [];
							for(var a=1;a<captain_length+1;a++){
								newArray.push(a);
							};
							for(var b=1;b<team+1;b++){
								var nArray = newArray;
								teamArray.push(getResult(nArray,nArray.length));
							};
							choseArray = teamArray;
							setResult(teamArray,2);
							set_history();
						};
						break;
						case'remaining_reSet'://生成麦序
						var value = $('#team_result').text(),
							captain_length = Number($('#captain_length').val()),
							captain_max = Number($('#captain_max').val());
						if(!value){
							alert('先生成选人麦序');
						}else if(!captain_max){
							alert('最大值要大于0');
						}else{
							$('#remaining,#remaining_result').html('');
							for(var i=1;i<=captain_max;i++){
								$('#remaining').append('<a href="javascript:;" role="remainingSpan" data-num="'+i+'">'+i+'</a>');
							};
							for(var i=1;i<=captain_length;i++){
								$('#remaining_result').append('<div class="remaining_list">'+i+'麦：<div class="remaining" data-num="'+i+'"></div></div>');
							};
							choseIndex = '';
							choseNowIndex = '';
							firstChoseIndex = 1;
							beChose = [];
							set_teamLine();
						};
						break;
						case'remaining_submit'://撤销选人
						if(beChose.length==0){
							choseIndex = '';
							choseNowIndex = '';
							firstChoseIndex = 1;
						}else{
							var lastNum = beChose.pop(),
								captain_length = Number($('#captain_length').val());
							$('#remaining_result').find('a[data-id="'+lastNum+'"]').remove();
							$('#remaining').find('a[role="remainingSpan"][data-num="'+lastNum+'"]').removeClass('disable').removeClass('captainSpan');
							//正常情况的
							if(choseIndex.toString()==''&&choseIndex.toString()==''){//选队长阶段
								firstChoseIndex--;
							}else if(choseIndex==0&&choseNowIndex==0){//选完最后一个队长了
								firstChoseIndex--;
								choseIndex='';
								choseNowIndex='';
							}else{
								if(choseNowIndex==0&&choseIndex>0){//非第一轮的第一个了
									choseIndex--;
									choseNowIndex=captain_length-1;
								}else{
									choseNowIndex--;
								};
							};
						};
						set_teamLine();
						break;
						case'remainingSpan':
						var num = $(this).data('num'),
							captain_length = Number($('#captain_length').val());
						if($(this).hasClass('disable')||$(this).hasClass('captainSpan')){
							return;
						};
						if(choseIndex.toString()==''&&choseIndex.toString()==''){//选队长
							$('#remaining_result').find('.remaining[data-num="'+firstChoseIndex+'"]').append('<a href="javascript:;" data-id="'+num+'" class="captainSpan">'+num+'</a>');
							firstChoseIndex++;
							if(firstChoseIndex==captain_length+1){
								choseIndex=0;
								choseNowIndex=0;
							};
						}else{
							var choseNow = choseArray[choseIndex][choseNowIndex];
							$('#remaining_result').find('.remaining[data-num="'+choseNow+'"]').append('<a href="javascript:;" data-id="'+num+'">'+num+'</a>');
							choseNowIndex++;
							if(choseNowIndex==choseArray[choseIndex].length){
								choseIndex++;
								choseNowIndex=0;
							};
						};
						beChose.push(num);
						$(this).addClass('disable');
						set_teamLine();
						break;
						case'neiding':
						let type = _this.getData().type;
						if(type==2){
							_this.setData({type:1});
							$('#captain_result').html($('#captain_resultInput').val());
						}else{
							_this.setData({type:2});
							//$('#captain_resultInput').val('');
							$('#captain_resultInput').val($('#captain_result').html());
						};
						break;
						case'advertList':
						alert('你想点进去干嘛？');
						break;
						case'viewUser':
						_this.setData({type:3});
						_this.getUserList();
						break;
						case'editUser'://修改名单
						_this.setData({
							password:'',
							showPwForm:true
						});
						break;
						case'backControl'://返回随机器
						_this.setData({type:1});
						break;
						case'kongwei_reSet':
						app.confirm('确定要清空？',function(){
							_this.setData({
								kongweiList:[],
								kongweiData:[],
							});
							$('#kongwei_length').val('10');
						});
						break;
						case'kongwei_submit'://生成空位
						var value = $('#team_result').text(),
							length = Number($('#kongwei_length').val()),
							sex = _this.getData().sex,
							kongweiList = _this.getData().kongweiList,
							kongweiData = _this.getData().kongweiData,
							coulumn = 10,
							newList = [];
						if(!length){
							alert('请输入数字');
							return;
						};
						for(var a=0;a<length;a++){
							kongweiData.push({
								index:kongweiData.length+1,
								name:'',
								sex:sex,
							});
						};
						_this.setData({
							kongweiList:_this.changeKongweiData(kongweiData,1)
						});
						_this.checkKongweiData();
						break;
						case'tianxie_submit':
						var userName = _this.getData().userName,
							kongweiData = _this.getData().kongweiData;
						if(!userName){
							alert('请输入名单');
							return;
						};
						userName = _this.getNameList(userName);
						if(userName.length){
							app.each(userName,function(i,item){
								if(kongweiData.length){
									app.each(kongweiData,function(a,b){
										if(kongweiData[a]&&app.getLength(kongweiData[a].name)==0){
											kongweiData[a].name = item;
											return false;
										}else if(a==kongweiData.length-1&&app.getLength(kongweiData[a].name)!=0){
											kongweiData.push({
												index:kongweiData.length+1,
												name:item,
												sex:1,
											});
											return false;
										};
									});
								}else{
									kongweiData.push({
										index:kongweiData.length+1,
										name:item,
										sex:1,
									});
								};
							});
							_this.setData({
								userName:'',
								kongweiList:_this.changeKongweiData(kongweiData,1)
							});
							_this.checkKongweiData();
						};
						break;
						case'kongwei_sort'://排序
						var isNum = /^[1-9]\d*$/,
							newList = _this.changeKongweiData(_this.getData().kongweiList,2),
							realList = [],
							all = {
								'1':[],
								'12':[],
								'2':[],
								'23':[],
								'3':[],
								'34':[],
								'4':[],
								'45':[],
								'5':[],
								'56':[],
								'6':[],
								'other':[],
							};
						app.each(newList,function(i,item){
							let lastName_a = item.name[item.name.length-1],
								lastName_b = item.name[item.name.length-2];
							if(isNum.test(lastName_a)&&isNum.test(lastName_b)){
								var c = lastName_b+''+lastName_a;
								all[c].push(item);
							}else if(isNum.test(lastName_a)){
								all[lastName_a].push(item);
							}else{
								all['other'].push(item);
							};
						});
						realList = realList.concat(all['1']);
						realList = realList.concat(all['12']);
						realList = realList.concat(all['2']);
						realList = realList.concat(all['23']);
						realList = realList.concat(all['3']);
						realList = realList.concat(all['34']);
						realList = realList.concat(all['4']);
						realList = realList.concat(all['45']);
						realList = realList.concat(all['5']);
						realList = realList.concat(all['56']);
						realList = realList.concat(all['6']);
						realList = realList.concat(all['other']);
						app.each(realList,function(i,item){
							item.index = i+1;
						});
						_this.setData({
							kongweiData:realList,
							kongweiList:_this.changeKongweiData(realList,1),
						});
						_this.checkKongweiData();
						break;
						case'kongwei_zhuanhuan':
						let kw = _this.getData().kongweiData,
							content = '';
						app.confirm('转换会覆盖输入框内容，确认吗？',function(){
							app.each(kw,function(i,item){
								if(item.name.length>0){
									content+=item.name+'，';
								};
							});
							_this.setData({userName:content});
						});
						break;
					};
				});
            },
			checkKongweiData:function(){//检测一下是否有重复的情况
				let _this = this,
					kw = _this.getData().kongweiData,
					checkList = [],
					sameList = [];
				if(kw&&kw.length){
					for(let i=0;i<kw.length;i++){
						if(checkList.includes(kw[i].name)){
							sameList.push(kw[i].name);
						}else if(kw[i].name.length>0){
							checkList.push(kw[i].name);
						};
					};
					if(sameList&&sameList.length){
						_this.setData({
							kongweiTips:'有重复的名字：'+sameList.join('、')
						});
					}else{
						_this.setData({
							kongweiTips:''
						});
					};
				};
			},
			changeKongweiData:function(data,type){//根据数据转换
				if(type==1){//把kongweiData转化为kongweiList[[],[]]
					let newList = [],
						coulumn = 10;
					app.each(data,function(i,item){
						let index = Math.ceil((i+1)/coulumn);
						if(newList[index-1]&&newList[index-1].length){
							newList[index-1].push(item);
						}else{
							newList[index-1] = [];
							newList[index-1].push(item);
						};
					});
					return newList;
				}else if(type==2){//把kongweiList转化为kongweiData
					let newList = [];
					app.each(data,function(i,item){
						app.each(item,function(a,b){
							newList.push(b);
						});
					});
					return newList;
				};
			},
			/**********名单相关*******/
			getUserList:function(){
				let _this = this,
					content = this.getData().content,//筛选的content关键词
					searchTypeText = this.getData().searchTypeText,//筛选的type关键词
					keyword = this.getData().keyword;
				this.setData({showLoading:true});
				app.request('//test/getUserList',{keyword:keyword},function(res){
					if(res&&res.length){
						let newArray = [];
						if(content&&searchTypeText){
							app.each(res,function(i,item){
								if(item.content.indexOf('女')>0){
									item.isGirl = 1;
								}else{
									item.isGirl = 0;
								};
								if(item.content.indexOf(content)>=0&&item.type==searchTypeText){
									newArray.push(item);
								};
							});
						}else if(content){
							app.each(res,function(i,item){
								if(item.content.indexOf('女')>0){
									item.isGirl = 1;
								}else{
									item.isGirl = 0;
								};
								if(item.content.indexOf(content)>=0){
									newArray.push(item);
								};
							});
						}else if(searchTypeText){
							app.each(res,function(i,item){
								if(item.content.indexOf('女')>0){
									item.isGirl = 1;
								}else{
									item.isGirl = 0;
								};
								if(item.type==searchTypeText){
									newArray.push(item);
								};
							});
						}else{
							app.each(res,function(i,item){
								if(item.content.indexOf('女')>0){
									item.isGirl = 1;
								}else{
									item.isGirl = 0;
								};
								newArray.push(item);
							});
						};
						_this.setData({
							userList:newArray,
							showNoData:newArray.length>0?false:true
						});
					}else{
						_this.setData({userList:[],showNoData:true});
					};
				},'',function(){
					_this.setData({showLoading:false});
				});
			},
			changeKeyword:function(e){
				let _this = this;
				this.setData({keyword:app.eValue(e)});
				if(this.changeKeywordFn){
					clearTimeout(this.changeKeywordFn);
				};
				_this.changeKeywordFn = setTimeout(function(){
					_this.toSearch();
				},600);
			},
			toSearch: function () {
				let keyword = this.getData().keyword;
				keyword = keyword.trim();
				this.getUserList();
			},
			closeSearch: function () {
				this.setData({
					keyword: ''
				});
				this.getUserList();
			},
			reSetUser:function(){
				this.setData({
					content:'',
					keyword:'',
					searchTypeText:'',
				});
				this.getUserList();
			},
			screenText:function(e){
				let text = app.eData(e).text,
					content = this.getData().content;
				if(content==text){
					this.setData({content:''});
				}else{
					this.setData({content:text});
				};
				this.getUserList();
			},
			toAddUser:function(){
				this.setData({
					showForm:true,
					'form.id':'',
					'form.username':'',
					'form.content':'',
					'form.type':1,
				});
			},
			screenType:function(e){
				this.setData({
					'form.type':Number(app.eData(e).type)
				});
			},
			toHideForm:function(){
				this.setData({showForm:false});
			},
			toConfirmForm:function(){
				let _this = this,
					selectIndex = this.getData().selectIndex,
					userList = this.getData().userList,
					formData = this.getData().form,
					msg = '';
				if(!formData.username){
					msg = '姓名不能为空';
				}else if(!formData.content){
					msg = '内容不能为空';
				};
				if(msg){
					app.tips(msg,'error');
				}else{
					app.request('//test/saveUserList',formData,function(res){
						if(formData.id&&selectIndex>=0){
							userList[selectIndex].username = formData.username;
							userList[selectIndex].content = formData.content;
							userList[selectIndex].type = formData.type||1;
							_this.setData({userList:userList});
							_this.toHideForm();
						}else{
							app.confirm('继续添加？',function(){
								_this.setData({
									'form.username':'',
									'form.content':'',
									'form.type':1,
								});
							},function(){
								_this.toHideForm();
							});
							_this.getUserList();
						};
					});
				};
			},
			toHidePwForm:function(){
				this.setData({showPwForm:false});
			},
			toConfirmPwForm:function(){
				let password = this.getData().password,
					thisTime = app.getNowDate(),
					month = thisTime.split('-')[1],
					day = thisTime.split('-')[2],
					result = month+day;
				if(password==result){
					app.tips('成功进入');
					this.setData({
						showPwForm:false,
						type:4
					});
				}else{
					app.tips('密码不正确');
				};
			},
			delUser:function(e){
				let _this = this,
					index = Number(app.eData(e).index),
					userList = this.getData().userList;
				app.request('//test/delUserList',{id:userList[index]._id},function(){
					userList.splice(index,1);
					_this.setData({userList:userList});
					if(!userList.length){
						_this.setData({showNoData:true});
					};
				});
			},
			editUser:function(e){
				let _this = this,
					index = Number(app.eData(e).index),
					userList = this.getData().userList;
				this.setData({
					showForm:true,
					'form.id':userList[index]._id,
					'form.username':userList[index].username,
					'form.content':userList[index].content,
					'form.type':userList[index].type||1,
					selectIndex:index,
				});
			},
			screenTypeText:function(e){
				let type = Number(app.eData(e).type),
					searchTypeText = this.getData().searchTypeText;
				if(searchTypeText==type){
					this.setData({searchTypeText:''});
				}else{
					this.setData({searchTypeText:type});
				};
				this.getUserList(type,true);
			},
			changeSex:function(e){
				this.setData({sex:app.eData(e).sex});
			},
			getNameList: function (str) {
				if(!str){
					return '';
				};
				var pattern = /^\d+\./;
				if(pattern.test(str)){//是以一个整数+.开头的
					str = str.split(/[\r\n]/);
					if(str.length){
						var newStr = [];
						for(var a=0;a<str.length;a++){
							newStr.push(str[a].replace(/(\d+\.)([^0-9]+)/g, '$2'));
						};
						str = newStr;
					};
					console.log(str);
				}else{
					str = str.replace(/\ +/g, ""); //去掉空格
					str = str.replace(/[ ]/g, ""); //去掉空格
					str = str.replace(/[\r\n]/g, ""); //去掉回车换行
					str = str.replace(/，/g, ","); //把大写换成小写
					str = str.split(',');
				};
				if(str[str.length-1]==''){
					str.pop();
				};
				return str;
			},
			changeThisSex:function(e){
				let kongweiList = this.getData().kongweiList,
					parent = Number(app.eData(e).parent),
					index = Number(app.eData(e).index);
				kongweiList[parent][index].sex = kongweiList[parent][index].sex == 2?1:2;
				this.setData({kongweiList:kongweiList});
			},
			changeThisUser:function(e){
					parent = Number(app.eData(e).parent),
					index = Number(app.eData(e).index);
				this.setData({
					'showNameForm.show':true,
					'showNameForm.parent':parent,
					'showNameForm.index':index,
					'showNameForm.name':'',
				});
			},
			toHideNameForm:function(){
				this.setData({'showNameForm.show':false});
			},
			toConfirmNameForm:function(){
				let kongweiList = this.getData().kongweiList,
					showNameForm = this.getData().showNameForm;
				kongweiList[parent][index].name = showNameForm.name;
				this.setData({kongweiList:kongweiList});
				this.checkKongweiData();
				this.toHideNameForm();
			},
			colorChange:function(e){
				this.setData({textColor:app.eValue(e)});
			},
        }
    });
})();