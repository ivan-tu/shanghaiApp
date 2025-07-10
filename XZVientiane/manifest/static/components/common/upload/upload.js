/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Component({

        //组件名称，不需要改变
        comName: 'upload',

        /**
         * 组件的属性列表
         */
        properties: {
            count: {
                type: Number,
                value: 1
            },
            value: {
                type: String,
                value: ''
            },
            type: {
                type: String,
                value: 'image'
            },
            width: {
                type: Number,
                value: 88
            },
            height: {
                type: Number,
                value: 88
            },
            index: {
                type: Number,
                value: 0
            }
        },

        /**
         * 组件的初始数据
         */
        data: {
            files: [],
            src: []
        },

        /**
         *组件布局完成时执行
         */

        ready: function() {
            this.reset(this.getData().value);
        },

        /**
         * 组件的函数列表
         */
        methods: {
            reset: function(res) {
                let _this = this,
                    value = res,
                    type = _this.getData().type,
                    width = _this.getData().width,
                    height = _this.getData().height,
                    files = [],
                    newSrc = [];

                if (value) {
                    if (app.type(value) == 'string') {
                        let src = app.image.crop(value, width, height);
                        if (type == 'video') {
                            src = app.config.staticPath + '/images/video.png';
                        };
                        files = [{ key: value, src: src, hidePercent: true }];
                        newSrc = [value];
                    } else if (value.length) {
                        app.each(value, function(i, item) {
                            let src = app.image.crop(item, width, height),
                                value=item;
                            if (type == 'video') {
                                src = app.config.staticPath + '/images/video.png';
                                item=app.config.staticPath + '/images/video.png';
                            };
                            files = files.concat({ src: src, hidePercent: true });
                            newSrc = newSrc.concat(item);
                        });
                    };
                    _this.setData({ files: files, src: newSrc });
                } else {
                    _this.setData({ files: [], src: [] });
                };
            },
            upload: function(e) {
                let _this = this,
                    type = _this.getData().type,
                    files = _this.getData().files,
                    result = _this.getData().src,
                    count = _this.getData().count,
                    newCount = count - files.length,
                    index = files.length,
                    edit = false;

                if (app.type(e) == 'number') {
                    edit = true;
                    newCount = 1;
                    index = e;
                };
                app.upload({
                    count: newCount,
                    mimeType: type,
                    choose: function(res) {
                        if (edit) {
                            app.extend(files[index], { src: '', percent: '' });
                        } else {
                            app.each(res, function() {
                                files = files.concat({ src: '', percent: '' });
                            });
                        };
                        _this.setData({ files: files });
                    },
                    progress: function(res) {
                        let newIndex = index;
                        if (!edit) {
                            newIndex += res.index;
                        };

                        files[newIndex].hidePercent = false;
                        files[newIndex].percent = res.percent;
                        _this.setData({ files: files });
                    },
                    success: function(res) {
                        let width = _this.getData().width,
                            height = _this.getData().height,
                            newIndex = index;
                        if (!edit) {
                            newIndex += res.index;
                        };
                        result[newIndex] = res.key;
                        files[newIndex].key = res.key;
                        files[newIndex].hidePercent = true;

                        if (type == 'image') {
                            files[newIndex].src = app.image.crop(res.key, width, height);
                        } else if (type == 'video') {
                            files[newIndex].pic = app.config.staticPath + '/images/video.png';
                            files[newIndex].src = app.config.staticPath + '/images/video.png';
                        };
                    },
                    fail: function(msg) {
                        let count = _this.getData().count;

                        if (msg.errMsg && msg.errMsg == 'max_files_error') {
                            app.tips('最多只能上传' + count + (type == 'image' ? '张图片' : '个视频'));
                        };
                    },
                    complete: function() {

                        _this.setData({ files: files, src: result });
                        _this.change();
                    }

                });
            },
            tool: function(e) {
                let _this = this,
                    files = _this.getData().files,
                    result = _this.getData().src,
                    type = _this.getData().type,
                    index = app.eData(e).index,
                    tools = [];

                app.actionSheet(['修改', '查看', '删除'], function(res) {
                    switch (res) {
                        case 0:
                            _this.upload(Number(index));
                            break;
                        case 1:
                            if (type == 'image') {
                                let src = files[index].key;
                                let urls = [];

                                app.each(files, function(i, item) {
                                    urls.push(app.image.width(item.key, 500));
                                });
                                app.previewImage({
                                    current: urls[index],
                                    urls: urls
                                });
                            } else {
                                let src = files[index].src;
                                app.previewImage(app.image.width(src, 500));
                            };
                            break;
                        case 2:
                            files = app.removeArray(files, index);
                            result = app.removeArray(result, index);
                            _this.setData({ files: files, src: result });
                            _this.change();
                            break;
                    };
                });
            },
            change: function() { 
                this.pEvent('change', this.getData());
            }
        }
    });
})();