//
//  UIWebView+addition.h
//  TuiYa
//
//  Created by 崔逢举 on 15/6/28.
//  Copyright (c) 2015年 tuweia. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface UIWebView (addition)

/**
 *  objc 调用js loadPage方法参数组装
 *
 *  @param html loadPage给js的html代码
 *  @param url  loadPage给js的当前网址
 *
 *  @return objc调用js loadPage方法所需参数
 */
+ (NSDictionary *)objcCallJsLoadPageParamWithHtml:(NSString *)html url:(NSString *)url requestData:(id)data;
+ (NSDictionary *)objcCallJsWithFn:(NSString *)function data:(id)data;

/**
 *  持久化cookie
 */
+ (void)saveCookiesToUserDefaults;

/**
 *  把持久化的cookie数据缓存
 */
+ (void)loadCookies;

/**
 *  删除本应用所有cookie
 */
+ (void)cookieDeleteAllCookie;

/**
 *  js调用oc操作cookie
 *
 *  @param cookieDic js传过来的cookie信息
 */
+ (void)cookieJSOperateCookie:(NSDictionary *)cookieDic path:(NSString *)aPath;
@end
