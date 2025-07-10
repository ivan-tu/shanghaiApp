(function () {

  let app = getApp();

  app.Page({
    pageId: 'home-editor',
    data: {
      systemId: 'home',
      moduleId: 'editor',
      data: [],
      options: {},
      settings: {},
      language: {},
      form: {
        moduleId: '',
        type: '',
        title: '',
        showTitle: '',
        content: '',
      },
      contentImgWidth: (app.system.windowWidth > 480 ? 480 : app.system.windowWidth) - 30,
      videoWidth: (app.system.windowWidth > 480 ? 480 : app.system.windowWidth) - 60,
      uploadSuccess: true, //上传状态
      contentData: [{
        'type': 'text',
        'content': '选中后输入文字',
        'wContent': '选中后输入文字',
        link: ''
      }], //详情数组
      editType: 1, //1编辑模式 2预览模式
      client: app.config.client,
      selectedIndex: '',
      contentId: '',
      showDialog: false,
      showDialog_animate: false,
      linkInput: '',
      linkIndex: ''
    },
    methods: {
      onLoad: function (options) {
		app.setPageTitle('编辑内容');
        let _this = this,
          filePath = app.config.filePath,
          contentImgWidth = this.getData().imageWidth,
          resetContent = function (content) {
            app.each(content, function (i, item) {
              if (item.type == 'image' && item.src) {
                item.file = app.image.width(item.src, contentImgWidth);
              } else if (item.type == 'video') {
                item.file = filePath + '' + item.src;
                if (item.poster) {
                  item.cover = item.poster;
                  item.poster = app.image.width(item.poster, contentImgWidth);
                };
              } else if (item.type == 'audio') {
                item.file = filePath + '' + item.src;
              } else if (item.type == 'text') {
                item.wContent = item.content || '';
                item.content = item.content ? item.content.replace(/<br>/g, "\n") : '';
              };
              if (!item.link) {
                item.link = '';
              };
            });
            _this.setData({
              contentData: content
            });
          };
        _this.options = options;

        if (options.contentKey) {
          let content = app.storage.get(options.contentKey);
          if (content && content != 'undefined' && content.length) {
            resetContent(content);
          };
          // app.storage.remove(options.contentKey);
        } else if (options.geturl && options.id) {
          app.request(options.geturl, {
            id: options.id
          }, function (res) {
            if (res) {
              if (res.content && res.content.length) {
                // alert(app.toJSON(content));
                resetContent(res.content);
              };
            }
          });
        };
      },
      onShow: function () {
        this.load();
      },
      load: function () {
        let _this = this;
      },
      onPullDownRefresh: function () {
        this.load();
        wx.stopPullDownRefresh();
      },
      selecteditType: function (e) {
        let value = Number(app.eValue(e));
        console.log(value);
        this.setData({
          editType: value
        });
      },
      resetHeight: function (index) {
        let _this = this,
          contentData = this.getData().contentData,
          textareaHeight = '200px';
        if (app.config.client == 'wx') {
          let query = wx.createSelectorQuery();
          query.select('.textContent_wrapper_' + index).boundingClientRect(function (res) {
            if (res) {
              textareaHeight = Number(res.height);
              contentData[index].textareaHeight = (textareaHeight + 20) + 'px';
              _this.setData({
                contentData: contentData
              });
            };
          }).exec();
        } else {
          $('body').find('.textContent_wrapper_' + index).each(function (i, item) {
            textareaHeight = $(item).height();
            contentData[index].textareaHeight = (textareaHeight + 20) + 'px';
            _this.setData({
              contentData: contentData
            });
          });
        };
      },
      resetText: function (index, value) {
        let _this = this,
          contentData = _this.getData().contentData;

        contentData[index].content = value;
        contentData[index].wContent = value ? value.replace(/\n/g, "<br>") : '';
        this.setData({
          contentData: contentData
        });

        _this.resetHeight(index);
      },
      inputTextarea: function (e) {
        let index = Number(app.eData(e).index),
          value = app.eValue(e);

        this.resetText(index, value);

      },
      keyup: function (e) {

        if (e.keyCode == 13) {
          let index = Number(app.eData(e).index),
            value = app.eValue(e);
          this.resetText(index, value);
        };
      },
      focusText: function (e) {
        let index = Number(app.eData(e).index),
          value = app.eValue(e),
          contentData = this.getData().contentData;
        if (value == '选中后输入文字') {
          contentData[index].content = '';
          contentData[index].wContent = '';
          this.setData({
            contentData: contentData
          });
        };

      },
      addContent: function (e) {
        let _this = this,
          list = ['添加文字', '添加图片', '添加视频'],
          contentData = this.getData().contentData,
          hasSelected = this.getData().selectedIndex !== '',
          index = hasSelected ? this.getData().selectedIndex : contentData.length - 1;
        app.actionSheet(list, function (res) {
          switch (list[res]) {
            case '添加文字':
              contentData.splice(index + 1, 0, {
                type: 'text',
                content: '选中后输入文字',
                wContent: '选中后输入文字',
                link: ''
              });
              _this.setData({
                contentData: contentData,
                selectedIndex: index + 1
              });
              break;
            case '添加图片':
              _this.uploadContentPic(index + 1);
              break;
            case '添加视频':

              _this.uploadContentVideo(index + 1);
              break
			case '添加音频':
              _this.uploadContentAudio(index + 1);
              break
          };
          if (!hasSelected) {
            setTimeout(function () {
              wx.pageScrollTo({
                scrollTop: 100000
              });
            }, 50);
          }

        });
      },
      uploadContentPic: function (newIndex) {//上传图片
        let _this = this,
          contentData = this.getData().contentData,
          uploadSuccess = this.getData().uploadSuccess,
          index = Number(newIndex),
          imageWidth = this.getData().contentImgWidth;
        if (!uploadSuccess) {
          app.tips('还有文件正在上传', 'error');
        } else {
          app.upload({
            count: 30,
            mimeType: 'image',
            choose: function (res) {
              app.each(res, function (i, item) {
                contentData.splice(index + i, 0, {
                  type: 'image',
                  src: '',
                  file: '',
                  percent: 0,
                  link: ''
                });
              });
              _this.setData({
                contentData: contentData,
                uploadSuccess: false
              });
            },
            progress: function (res) {
              contentData[index + res.index].percent = res.percent;
              _this.setData({
                contentData: contentData
              });
            },
            success: function (res) {
              contentData[index + res.index].src = res.key;
              contentData[index + res.index].file = app.image.width(res.key, imageWidth);
            },
            fail: function (msg) {
              if (msg.errMsg && msg.errMsg == 'max_files_error') {
                app.tips('出错了');
                _this.setData({
                  uploadSuccess: true
                });
              };
            },
            complete: function () {
              _this.setData({
                contentData: contentData,
                uploadSuccess: true
              });
            }
          });
        };
      },
      uploadContentVideo: function (newIndex) {//上传视频
        let _this = this,
          contentData = this.getData().contentData,
          uploadSuccess = this.getData().uploadSuccess,
          index = Number(newIndex),
          imageWidth = this.getData().imageWidth;
        if (!uploadSuccess) {
          app.tips('还有文件正在上传', 'error');
        } else {
          app.upload({
            count: 1,
            mimeType: 'video',
            choose: function (res) {
              contentData.splice(index, 0, {
                type: 'video',
                src: '',
                file: '',
                sFile: '',
                cover: '',
                poster: '',
                error: true,
                percent: 0
              });
              _this.setData({
                uploadSuccess: false,
                contentData: contentData,
                selectedIndex: index
              });
            },
            progress: function (res) {
              contentData[index].percent = res.percent;
              _this.setData({
                contentData: contentData
              });
            },
            success: function (res) {
              contentData[index].src = res.key;
              contentData[index].file = app.config.filePath + '' + res.key;
              contentData[index].cover = res.cover;

              contentData[index].poster = res.cover ? app.image.width(res.cover, imageWidth) : '';

              _this.updateVideoStatus(index);
            },
            fail: function (msg) {
              if (msg.errMsg && msg.errMsg == 'max_files_error') {
                app.tips('出错了');
                _this.setData({
                  uploadSuccess: true
                });
              };
            },
            complete: function () {
              _this.setData({
                contentData: contentData,
                uploadSuccess: true
              });
            }
          });
        };
      },
	  uploadContentAudio:function(newIndex){//上传音频
	  	let _this = this,
          contentData = this.getData().contentData,
          uploadSuccess = this.getData().uploadSuccess,
          index = Number(newIndex),
          imageWidth = this.getData().imageWidth;
        if (!uploadSuccess) {
          app.tips('还有文件正在上传', 'error');
        } else {
          app.upload({
            count: 1,
            mimeType: 'audio',
            choose: function (res) {
              contentData.splice(index, 0, {
                type: 'audio',
                src: '',
                file: '',
                sFile: '',
                error: true,
                percent: 0
              });
              _this.setData({
                uploadSuccess: false,
                contentData: contentData,
                selectedIndex: index
              });
            },
            progress: function (res) {
              contentData[index].percent = res.percent;
              _this.setData({
                contentData: contentData
              });
            },
            success: function (res) {
              contentData[index].src = res.key;
              contentData[index].file = app.config.filePath + '' + res.key;
            },
            fail: function (msg) {
              if (msg.errMsg && msg.errMsg == 'max_files_error') {
                app.tips('出错了');
                _this.setData({
                  uploadSuccess: true
                });
              };
            },
            complete: function (res) {
              _this.setData({
                contentData: contentData,
                uploadSuccess: true
              });
            }
          });
        };
	  },
      delThis: function (e) {
        let index = this.getData().selectedIndex,
          contentData = this.getData().contentData;
        if (index === '') {
          return;
        };
        if (contentData.length == 1) {
          app.tips('至少要保留一个内容', 'error');
        } else {
          contentData.splice(index, 1);
          this.setData({
            contentData: contentData,
            selectedIndex: ''
          });
        };
      },
      move: function () {
        let _this = this,
          list = ['置顶', '上移', '下移', '置底'];
        if (_this.getData().selectedIndex === '') {
          return;
        };
        app.actionSheet(list, function (res) {
          let contentData = _this.getData().contentData,
            index = _this.getData().selectedIndex,
            firstData = contentData[index],
            lastData,
            selectedIndex;

          switch (res) {
            case 0:
              if (index != 0) {
                contentData.splice(index, 1);
                contentData.unshift(firstData);
                selectedIndex = 0;
              }
              break;
            case 1:
              if (index != 0) {
                lastData = contentData[index - 1];
                contentData[index - 1] = firstData;
                contentData[index] = lastData;
                selectedIndex = index - 1;
              }
              break;
            case 2:
              if (index != contentData.length - 1) {
                lastData = contentData[index + 1];
                contentData[index + 1] = firstData;
                contentData[index] = lastData;
                selectedIndex = index + 1;
              }
              break;
            case 3:
              contentData.splice(index, 1);
              contentData.push(firstData);
              selectedIndex = contentData.length - 1;
              break;
          };
          _this.setData({
            contentData: contentData,
            selectedIndex: selectedIndex
          });

        });
      },
      submit: function () {
        let _this = this,
          contentData = this.getData().contentData,
          uploadSuccess = this.getData().uploadSuccess,
          msg = '';

        let newContent = [];

        if (contentData && contentData.length) {
          app.each(contentData, function (i, item) {
            let nData = {};
            if (item.type == 'image') {
              if (!item.src) {
                msg = '请上传图片';
                return false;
              } else {
                nData = {
                  'type': 'image',
                  'src': item.src
                }

              };
            } else if (item.type == 'video') {
              if (!item.src) {
                msg = '请上传视频';
                return false;
              } else {
                nData = {
                  'type': 'video',
                  'src': item.src,
                  'poster': item.cover
                };
              };
            } else if (item.type == 'audio') {
              if (!item.src) {
                msg = '请上传音频';
                return false;
              } else {
                nData = {
                  'type': 'audio',
                  'src': item.src
                };
              };
            } else {
              nData = {
                type: 'text',
                content: item.wContent
              };
            };
            if (item.link) {
              nData.link = item.link;
            };
			if(nData.content!='选中后输入文字'){
            	newContent.push(nData);
			};
          });
        };

        if (!uploadSuccess) {
          msg = '还有文件正在上传';
        };
        if (msg) {
          app.tips(msg, 'error');
        } else {
          if (_this.options.contentKey) {
			if(newContent.length==0){
				newContent = '';
			};
            app.storage.set(_this.options.contentKey, newContent);
            if (_this.options.dialogPage) {
              app.dialogSuccess(newContent);
            } else {
              app.navBack();
            };
          } else if (_this.options.submiturl) {
            app.request(_this.options.submiturl, {
              id: _this.options.id,
              content: newContent
            }, function () {
              app.tips('保存成功', 'success');
              setTimeout(function () {
                app.navBack();
              }, 500);
            });
          };

        }
      },

      selectedItem: function (e) {
        let _this = this,
          index = Number(app.eData(e).index),
          selectedIndex = _this.getData().selectedIndex,
          contentData = _this.getData().contentData;
        this.resetHeight(index);
        if (selectedIndex !== index) {
          _this.setData({
            contentData: contentData,
            selectedIndex: index
          });
        } else if (contentData[index]['type'] != 'text') {
          _this.setData({
            contentData: contentData,
            selectedIndex: ''
          });
        };

      },
      updateVideoStatus: function (index) {
        let _this = this,
          contentData = _this.getData().contentData,
          src = contentData[index].src;

        app.request('//api/checkVideoPrefop', {
          file: src
        }, function (res) {
          if (res.status == '0') {
            contentData[index].error = false;

            contentData[index].poster = app.image.width(contentData[index].cover, _this.getData().imageWidth);

          } else {
            contentData[index].error = true;
            setTimeout(function () {
              _this.updateVideoStatus(index);
            }, 2000);
          };
          _this.setData({
            contentData: contentData
          });
        });
      },
      selectLink: function (e) {
        let index = app.eData(e).index,
          contentData = this.getData().contentData,
          _this = this,
          list = ['编辑链接'];
        if (contentData[index].link) {
          list = list.concat(['查看链接', '删除链接']);
        };
        app.actionSheet(list, function (res) {
          switch (res) {
            case 0:
              _this.dialog({
                title: '选择链接',
                url: '../../manage/linkSelect/linkSelect',
                success: function (res) {
                  contentData[index].link = res.link;
                  _this.setData({
                    contentData: contentData
                  });
                }
              });
              break;
            case 1:

              if (app.config.client == 'web') {
                window.open(contentData[index].link);
              } else {
                app.navTo(contentData[index].link);
              }
              break;

            case 2:
              contentData[index].link = '';
              _this.setData({
                contentData: contentData
              });
              break;
          }
        });
      }
    }
  });
})();