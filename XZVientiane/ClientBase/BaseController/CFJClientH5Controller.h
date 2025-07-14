//
//  CFJClientH5Controller.h
//  XiangZhanClient
//
//  Created by cuifengju on 2017/10/13.
//  Copyright © 2017年 TuWeiA. All rights reserved.
//

#import "XZWKWebViewBaseController.h"
typedef void(^CallBackToNative)(id aResponseObject,NSString *function);

@interface CFJClientH5Controller : XZWKWebViewBaseController

@property (nonatomic, assign) BOOL imVC;//判断是不是从聊天模块过来的，是的话不要显示messageBtn

@property (nonatomic, copy) CallBackToNative callBackToNative;//回调给原生页面

@property (nonatomic, copy) NSString *removePage;//移除页面

// 兼容性属性 - 用于JavaScript回调
@property (nonatomic, copy) XZWebViewJSCallbackBlock webviewBackCallBack;


@end
