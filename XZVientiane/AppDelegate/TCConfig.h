/**
 * Module: TCConfig
 *
 * Function: 配置常量
 */

#ifndef TCConfig_h
#define TCConfig_h

#define kHttpTimeout                         30

//错误码
#define kError_InvalidParam                            -10001
#define kError_ConvertJsonFailed                       -10002
#define kError_HttpError                               -10003
#define kError_NotSupport                              -10004

//播放端错误信息
#define kErrorMsgLiveStopped @"直播已结束"
#define kErrorMsgRtmpPlayFailed @"视频流播放失败，Error:"
#define kErrorMsgOpenCameraFailed  @"无法打开摄像头，需要摄像头权限"
#define kErrorMsgPushClosed  @"推流断开"

//是否展示log按钮，测试的时候打开，正式发布的时候关闭
#define ENABLE_LOG 0

//提示语
#define  kTipsMsgStopPush  @"当前正在直播，是否退出直播？"

// 如果工程里面没有使用PiTu动效（没有定义POD_PITU)，那就定义为0，这样为了兼容UI显示
#ifndef POD_PITU
#define POD_PITU 0
#endif

#endif /* TCConfig_h */
