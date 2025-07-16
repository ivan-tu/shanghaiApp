/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Component({

        //组件名称，不需要改变
        comName: 'picker',

        /**
         * 组件的属性列表
         */
        properties: {
            value: {
                type: null,
                default: 0
            },
            'custom-item': {
                type: String,
                default: ''
            },
            mode: {
                type: String,
                default: 'selector'
            },
            index: {
                type: Number,
                default: 0
            },
            range: {
                type: Array,
                default: []
            },
            rangeKey: {
                type: String,
                default: 'value'
            },
            fields: {
                type: String,
                default: 'day'
            },
            start: {
                type: String,
                default: ''
            },
            end: {
                type: String,
                default: ''
            },
            yearText: {
                type: String,
                default: '年'
            },
            monthText: {
                type: String,
                default: '月'
            },
            dayText: {
                type: String,
                default: '日'
            },
            data: {
                type: Array,
                default: []
            },
            dataModel: {
                type: String,
                default: ''
            },
            change: {
                type: Function,
                default: () => {}
            },
			future:{
				type: Number,
				default: 0
			}
        },

        /**
         * 组件的初始数据
         */
        data: {
            currentIndexList: [], // save groups's index
            lastCurrentIndexList: [], // for detect which group's current index if it is changed

            groupsRectList: 0, // save the dom rect list of this picker's groups

            dragInfo: { // save drag(ing) info
                isTouchable: 'ontouchstart' in window, // for detect event belongs to touch or mouse
                isMouseDown: false, // save the status of mouse (touch) is start and it is not end

                isDragging: false, // for detect the status of mouse (touch) is dragging (moving) after isMouseDown or not
                groupIndex: null, // save which group is dragging now
                startPageY: null // save the pageY value of mouse (touch) after begin isMouseDown
            },

            supInfo: { // supporting for picker usefulness
                getRectTimeoutId: null, // save timeout id
                lastStyleDisplay: null, // for detect picker style display if it is changed
                watchDomObserver: null // for watching this picker dom
            },
            pickerShow: ''
        },


        /**
         *组件布局完成时执行
         */

        ready: function() {
        	this.reset();
        },

        destroyed() {
            this.supInfo.watchDomObserver.disconnect()

            window.removeEventListener('resize', this.safeGetGroupRectList)
        },

        /**
         * 组件的函数列表
         */
        methods: {
            reset() {
                let _this = this;
                _this.isReady = true;
                if (this.mode == 'region') {
                    require(app.config.staticPath + 'common/chinaRegion.js');
                    register('chinaRegion', () => {
                        let data = [];
                        data[0] = _this.getRegionData('86', 0);
                        data[1] = _this.getRegionData(((data[0].list)[data[0].currentIndex]).id, 1);
                        data[2] = _this.getRegionData(((data[1].list)[data[1].currentIndex]).id, 2);
                        _this.setData({ data: data });
                        _this.init();
                    })
                } else {

                    let range = this.range,
                        data = [],
                        flexs = [3, 2, 2, 2, 3];

                    switch (this.mode) {

                        case 'multiSelector':

                            app.each(range, function(i, item) {
                                data.push({ list: _this.tranKey(range[i]), flex: range.length == 5 ? flexs[i] : 12 / range.length, index: _this.value[i] });
                            });
                            break;

                        case 'date':
                            data = [];
                            if (this.start === '') {
                                this.start = '1900-01-01';
                            };
                            if (this.end === '') {
                                this.end = '2100-12-31';
                            };
                            let start = this.start.split('-'),
                                end = this.end.split('-'),
                                value = this.value ? this.value.split('-') : '',
                                gDay = function() {
                                    let list = [],
                                        index = 0;
                                    for (let i = 1; i <= 31; i++) {
                                        let val = i < 10 ? '0' + i : i;
                                        list.push({
                                            value: val + _this.dayText,
                                            val: val
                                        });

                                        if (value.length && val == value[2]) {
                                            index = i - 1;
                                        }
                                    };
                                    return { list: list, currentIndex: index };
                                },
                                gMonth = function() {
                                    let list = [],
                                        index = 0;
                                    for (let i = 1; i <= 12; i++) {
                                        let val = i < 10 ? '0' + i : i;
                                        list.push({
                                            value: val + _this.monthText,
                                            val: val
                                        });
                                        if (value.length && val == value[1]) {
                                            index = i - 1;
                                        }
                                    };
                                    return { list: list, currentIndex: index };
                                },
                                gYear = function() {
                                    let list = [],
                                        index = 0,
                                        j = 0;
                                    for (let i = start[0]; i <= end[0]; i++) {
                                        list.push({
                                            value: i + _this.yearText,
                                            val: i
                                        });
                                        if (value.length && i == value[0]) {
                                            index = j;
                                        };
                                        j++;
                                    };
                                    return { list: list, currentIndex: index };
                                };

                            switch (this.fields) {
                                case 'year':
                                    data = [app.extend({ flex: 12 }, gYear())];
                                    break;
                                case 'month':
                                    data.push(app.extend({ flex: 6 }, gYear()));
                                    data.push(app.extend({ flex: 6 }, gMonth()));
                                    break;

                                default:
                                    data.push(app.extend({ flex: 6 }, gYear()));
                                    data.push(app.extend({ flex: 3 }, gMonth()));
                                    data.push(app.extend({ flex: 3 }, gDay()));
                            };
                            break;

                        case 'time':
                            let vae = this.value ? this.value.split(':') : '',
                                gHour = function() {
                                    let list = [],
                                        index = 0;
                                    for (let i = 0; i <= 23; i++) {
                                        let val = i < 10 ? '0' + i : i;
                                        list.push(val);
                                        if (vae.length && val == vae[0]) {
                                            index = i;
                                        }
                                    };
                                    return { list: list, currentIndex: index };
                                },
                                gMinutes = function() {
                                    let list = [],
                                        index = 0;
                                    for (let i = 0; i <= 59; i++) {
                                        let val = i < 10 ? '0' + i : i;
                                        list.push(val);
                                        if (vae.length && val == vae[1]) {
                                            index = i;
                                        }
                                    };
                                    return { list: list, currentIndex: index };
                                };
                            data.push(app.extend({ flex: 6 }, gHour()));
                            data.push(app.extend({ flex: 6 }, gMinutes()));
                            break;

                        default:
                            data.push({ list: _this.tranKey(range), flex: 12, index: _this.value });


                    };
                    this.setData({
                        data: data
                    })

                    this.init();
                };

                window.addEventListener('resize', this.safeGetGroupRectList);
            },
            init() {
                this.setData({
                    currentIndexList: this.getInitialCurrentIndexList(),
                    groupsRectList: new Array(this.data.length)
                });
                this.eventsRegister();
                this.$nextTick(this.getGroupsRectList());
                this.supInfo.watchDomObserver = this.createDomObserver()
                this.supInfo.watchDomObserver.observe(this.$el, { attributes: true });

                setTimeout(this.getGroupsRectList, 100);
            },
            tranKey(range) {
                let _this = this;
                if (_this.rangeKey != 'value' && typeof range[0] == 'object') {
                    let data = [];
                    app.each(range, function(i, item) {
                        item.value = item[_this.rangeKey];
                        data.push(item);
                    });
                    range = data;
                };

                return range;

            },
            togglePicker(ev) {
				let _this = this,
					value = this.value,
					range = this.range;
				if((this.mode=='region'||this.mode=='date'||this.mode=='time'||this.mode=='selector')&&app.config.client=='app'){//app使用原生
					switch(this.mode){
						case'region':
							wx.app.call('areaSelect', {
								success: function(data) {
									if(data.value){
										//app返回:{"code":"310000-310100-310115","value":"上海市-上海市-浦东新区"}
										_this.setData({
											value:data.value.split('-')
										});
										_this.pEvent('change',{ids:data.code?data.code.split('-'):[],value:data.value?data.value.split('-'):[]});
									};
								},
								data:{name:value?value.join('-'):''}
							});
						break;
						case'date':
							wx.app.call('dateSelect', {
								success: function(data) {
									if(data.value){
										_this.setData({
											value:data.value
										});
										_this.pEvent('change',{value:data.value});
									};
								},
								data: {future:_this.future,value:value}
							});
						break;
						case'time':
							wx.app.call('timeSelect', {
								success: function(data) {
									if(data.value){
										_this.setData({
											value:data.value
										});
										_this.pEvent('change',{value:data.value});
									};
								},
								data:{value:value}
							});
						break;
						case'selector':
							let newValue = [],
								hasValue = true;
							app.each(range,function(i,item){
								let itemName = typeof item === 'string' ? item : item.name;
								if(!itemName){
									hasValue = false;
									return false;
								};
								if(value){
									newValue.push({'name':itemName,'codeId':i.toString(),'selected':(i==value?'true':'')});
								}else{
									newValue.push({'name':itemName,'codeId':i.toString(),'selected':(i==0?'true':'')});
								};
							});
							if(hasValue){
								wx.app.call('fancySelect', {
									success: function(data) {
										if(data){
											_this.setData({
												value:Number(data.value)
											});
											_this.pEvent('change',{value:Number(data.value)});
										};
									},
									data:{value:newValue}
									//newValue:['name':'名称',codeId:'下标',selected:'true'];
								});
							}else{
								if (!_this.isReady) {
									_this.ready();
								};
								_this.pickerShow = _this.pickerShow ? '' : 'show';
								if (_this.pickerShow) {
									setTimeout(_this.getGroupsRectList, 100);
								};
							};	
						break;
					};
				}else{
					if (!this.isReady) {
						this.ready();
					};
					this.pickerShow = this.pickerShow ? '' : 'show';
					if (this.pickerShow) {
						setTimeout(this.getGroupsRectList, 100);
					};
				};
            },
            getRegionData(pid, gid) {

                let _this = this,
                    data = [],
                    index = 0,
                    i = 0;
                if (this.getData().customItem) {
                    data[0] = {
                        id: '',
                        value: this.getData().customItem
                    };
                    i = 1;
                };

                app.each(chinaRegion[pid], (id, value) => {
                    let item = {
                        id: id,
                        value: value
                    };
                    data.push(item);

                    if (value == _this.value[gid]) {
                        index = i;
                    };
                    i++;
                });

                return {
                    list: data,
                    flex: 4,
                    currentIndex: index
                };
            },
            setGroupData(gIndex, groupData) {
                // for current index list
                const iCI = groupData.currentIndex
                let movedIndex = 0
                if (typeof iCI === 'number' && iCI >= 0 && groupData.list && groupData.list.length && iCI <= groupData.list.length - 1) {
                    movedIndex = Math.round(iCI)
                }
                this.currentIndexList[gIndex] = movedIndex
                this.lastCurrentIndexList = [].concat(this.currentIndexList)

                // for detect group flex if changed
                const gF = groupData.flex
                if (gF && this.data[gIndex].flex !== gF) {
                    this.safeGetGroupRectList()
                }

                // set group data
                this.$set(this.data, gIndex, groupData)
            },
            getInitialCurrentIndexList() {
                return this.data.map((item, index) => {
                    const iCI = item.currentIndex
                    if (typeof iCI === 'number' && iCI >= 0 && item.list && item.list.length && iCI <= item.list.length - 1) {
                        return Math.round(iCI)
                    }
                    return 0
                })
            },
            createDomObserver() {

                return new window.MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'attributes') {
                            // for get correct rect list after v-show true (when $el style display not none)
                            const elDisplay = this.$el.style.display
                            if (elDisplay !== 'none' && this.supInfo.lastStyleDisplay !== elDisplay) {
                                this.supInfo.lastStyleDisplay = elDisplay
                                this.$nextTick(this.getGroupsRectList())
                            }
                        }
                    })
                })
            },
            safeGetGroupRectList() {
                this.supInfo.getRectTimeoutId && clearTimeout(this.supInfo.getRectTimeoutId)
                this.supInfo.getRectTimeoutId = setTimeout(() => {
                    this.getGroupsRectList()
                }, 200)
            },
            getGroupsRectList() {

                if (this.$refs.smoothGroup) {
                    this.$refs.smoothGroup.forEach((item, index) => {
                        this.groupsRectList[index] = item.getBoundingClientRect()
                    })

                }
            },
            eventsRegister() {
                const handleEventLayer = this.$refs.smoothHandleLayer
                if (handleEventLayer) {
                    this.addEventsForElement(handleEventLayer)
                }
            },
            addEventsForElement(el) {
                const _ = this.dragInfo.isTouchable;
                const eventHandlerList = [
                    { name: _ ? 'touchstart' : 'mousedown', handler: this.handleStart },
                    { name: _ ? 'touchmove' : 'mousemove', handler: this.handleMove },
                    { name: _ ? 'touchend' : 'mouseup', handler: this.handleEnd },
                    { name: _ ? 'touchcancel' : 'mouseleave', handler: this.handleCancel }
                ]
                eventHandlerList.forEach((item, index) => {
                    if (item.name) {
                        el.removeEventListener(item.name, item.handler, false);
                        el.addEventListener(item.name, item.handler, false);
                    };
                });

            },
            triggerMiddleLayerGroupClick(gIndex) {
                const data = this.data
                if (typeof gIndex === 'number' && typeof data[gIndex].onClick === 'function') {
                    data[gIndex].onClick(gIndex, this.currentIndexList[gIndex])
                }
            },
            triggerAboveLayerClick(ev, gIndex) {
                const movedIndex = this.currentIndexList[gIndex] + 1
                this.$set(this.currentIndexList, gIndex, movedIndex)
                this.correctionCurrentIndex(ev, gIndex)
            },
            triggerMiddleLayerClick(ev, gIndex) {
                this.triggerMiddleLayerGroupClick(gIndex)
            },
            triggerBelowLayerClick(ev, gIndex) {
                const movedIndex = this.currentIndexList[gIndex] - 1
                this.$set(this.currentIndexList, gIndex, movedIndex)
                this.correctionCurrentIndex(ev, gIndex)
            },
            getTouchInfo(ev) {
                return this.dragInfo.isTouchable ? ev.changedTouches[0] || ev.touches[0] : ev
            },
            getGroupIndexBelongsEvent(ev) {
                const touchInfo = this.getTouchInfo(ev)

                for (let i = 0; i < this.groupsRectList.length; i++) {
                    const item = this.groupsRectList[i]
                    if (item.left < touchInfo.pageX && touchInfo.pageX < item.right) {
                        return i
                    }
                }
                return null
            },

            handleEventClick(ev) {
                const gIndex = this.getGroupIndexBelongsEvent(ev)

                switch (ev.target.dataset.type) {
                    case 'top':
                        this.triggerAboveLayerClick(ev, gIndex)
                        break
                    case 'middle':
                        this.triggerMiddleLayerClick(ev, gIndex)
                        break
                    case 'bottom':
                        this.triggerBelowLayerClick(ev, gIndex)
                        break
                    default:
                };

            },
            handleStart(ev) {
                if (ev.cancelable) {
                    ev.preventDefault()
                    ev.stopPropagation()
                }

                const touchInfo = this.getTouchInfo(ev)
                this.dragInfo.startPageY = touchInfo.pageY
                if (!this.dragInfo.isTouchable) {
                    this.dragInfo.isMouseDown = true
                }
            },
            handleMove(ev) {
                ev.preventDefault()
                ev.stopPropagation()

                if (this.dragInfo.isTouchable || this.dragInfo.isMouseDown) {
                    this.dragInfo.isDragging = true
                    this.setCurrentIndexOnMove(ev)
                }
            },
            handleEnd(ev) {
                ev.preventDefault()
                ev.stopPropagation()

                if (!this.dragInfo.isDragging) {
                    this.handleEventClick(ev)
                }
                this.dragInfo.isDragging = false
                this.dragInfo.isMouseDown = false

                this.correctionAfterDragging(ev);
				
				//new
				if(this.mode=='multiSelector'){
					let _this = this;
					setTimeout(() => {
						_this.pEvent('columnchange', { value: _this.currentIndexList.slice(0), model: _this.dataModel ,index:_this.getData().index});
					},100);
				};

            },
            handleCancel(ev) {
                ev.preventDefault()
                ev.stopPropagation()

                if (this.dragInfo.isTouchable || this.dragInfo.isMouseDown) {
                    this.correctionAfterDragging(ev)
                    this.dragInfo.isMouseDown = false
                    this.dragInfo.isDragging = false
                }
            },
            setCurrentIndexOnMove(ev) {

                const touchInfo = this.getTouchInfo(ev)

                if (this.dragInfo.groupIndex === null) {
                    this.dragInfo.groupIndex = this.getGroupIndexBelongsEvent(ev)
                }

                const gIndex = this.dragInfo.groupIndex
                if (typeof gIndex === 'number' && (this.data[gIndex].divider || !this.data[gIndex].list)) {
                    return
                }

                const moveCount = (this.dragInfo.startPageY - touchInfo.pageY) / 32
                const movedIndex = this.currentIndexList[gIndex] + moveCount

                this.$set(this.currentIndexList, gIndex, movedIndex)

                this.dragInfo.startPageY = touchInfo.pageY
            },
            correctionAfterDragging(ev) {
                const gIndex = this.dragInfo.groupIndex
                this.correctionCurrentIndex(ev, gIndex)

                this.dragInfo.groupIndex = null
                this.dragInfo.startPageY = null
            },
            correctionCurrentIndex(ev, gIndex) {
                setTimeout(() => {
                    if (typeof gIndex === 'number' && this.data[gIndex].divider !== true && this.data[gIndex].list.length > 0) {
                        const unsafeGroupIndex = this.currentIndexList[gIndex]

                        let movedIndex = unsafeGroupIndex
                        if (unsafeGroupIndex > this.data[gIndex].list.length - 1) {
                            movedIndex = this.data[gIndex].list.length - 1
                        } else if (unsafeGroupIndex < 0) {
                            movedIndex = 0
                        }
                        movedIndex = Math.round(movedIndex)

                        this.$set(this.currentIndexList, gIndex, movedIndex);

                        if (movedIndex !== this.lastCurrentIndexList[gIndex]) {
                            //如果是地区选择
                            if (this.mode == 'region') {
                                if (gIndex == 0) {
                                    let data1 = this.getRegionData(((this.data[0].list)[movedIndex]).id, 1);
                                    data2 = this.getRegionData(((data1.list)[0]).id, 2);
                                    this.data[0].currentIndex = movedIndex;
                                    this.setGroupData(1, data1);
                                    this.setGroupData(2, data2);
                                } else if (gIndex == 1) {
                                    let data2 = this.getRegionData(((this.data[1].list)[movedIndex]).id, 2);
                                    this.data[1].currentIndex = movedIndex;
                                    this.setGroupData(2, data2);
                                } else {
                                    this.data[2].currentIndex = movedIndex;
                                    this.setGroupData(2, this.data[2]);
                                };
                            };
                        }
                        this.lastCurrentIndexList = [].concat(this.currentIndexList)
                    }
                }, 100)
            },
            isCurrentItem(gIndex, iIndex) {
                return this.currentIndexList[gIndex] === iIndex
            },
            getCurrentIndexList() {
                return this.currentIndexList
            },
            getGroupClass(gIndex) {
                const group = this.data[gIndex]
                const defaultFlexClass = 'flex-' + (group.flex || 1)
                const groupClass = [defaultFlexClass]
                if (group.className) {
                    groupClass.push(group.className)
                }
                return groupClass
            },
            getItemClass(gIndex, iIndex, isDevider = false) {
                const itemClass = []
                const group = this.data[gIndex]
                if (group.textAlign) {
                    itemClass.push('text-' + group.textAlign)
                }
                if (!isDevider && this.isCurrentItem(gIndex, iIndex)) {
                    itemClass.push('smooth-item-selected')
                }
                return itemClass
            },
            getItemStyle(gIndex, iIndex) {

                const gapCount = this.currentIndexList[gIndex] - iIndex;
                if (!isNaN(gapCount)) {

                    if (Math.abs(gapCount) < 4) {
                        let rotateStyle = 'transform: rotateX(' + gapCount * 23 + 'deg) translate3d(0, 0, 5.625em);'
                        if (!this.dragInfo.isDragging) {
                            rotateStyle += ' transition: transform 150ms ease-out;'
                        };

                        return rotateStyle
                    }
                    if (gapCount > 0) {
                        return 'transform: rotateX(100deg) translate3d(0, 0, 5.625em)'
                    } else {
                        return 'transform: rotateX(-100deg) translate3d(0, 0, 5.625em)'
                    }
                }
            },
            noop() {

            },
            cancel(e) {
                this.pickerShow = '';
                this.pEvent('cancel');
            },
            confirm(e) {
                let _this = this,
                    value,
					ids;
                switch (this.mode) {
                    case 'region':
                        value = [],
						ids = [];

                        app.each(_this.currentIndexList, function(i, item) {
                            value.push(_this.data[i].list[item].value);
							ids.push(_this.data[i].list[item].id);
                        });
						
                        break;

                    case 'multiSelector':
                        value = _this.currentIndexList.slice(0);
                        break;

                    case 'date':
                        value = [];
                        app.each(_this.currentIndexList, function(i, item) {
                            value.push(_this.data[i].list[item].val);
                        });
                        value = value.join('-');
                        break;

                    case 'time':
                        value = [];
                        app.each(_this.currentIndexList, function(i, item) {
                            value.push(_this.data[i].list[item]);
                        });
                        value = value.join(':');
                        break;

                    default:
                        value = _this.currentIndexList[0];
                };
                this.pickerShow = '';
				if(this.mode=='region'){
					this.pEvent('change', { ids:ids,value: value, model: this.dataModel ,index:this.getData().index});
				}else{
                	this.pEvent('change', { value: value, model: this.dataModel ,index:this.getData().index});
				};
            }
        }
    });
})();
