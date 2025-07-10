//
//  ClientNetInterface.h
//  XiangZhanClient
//
//  Created by CFJ on 16/5/1.
//  Copyright © 2016年 TuWeiA. All rights reserved.
//
#import <Foundation/Foundation.h>
#import "ClientJsonRequestManager.h"

@interface ClientNetInterface : NSObject
//获取页面导航配置信息
+ (void)getNavagationSetMessageWithParam:(NSDictionary *)paramDic block:(ClientCompletionBlock) block;
/**
 * 根据websiteid获取配置信息
 */
+ (void)getTabbarSetMessageWithParam:(NSDictionary *)paramDic block:(ClientCompletionBlock) block;

/**
 * 获取分享、推送的设置信息
 */
+ (void)getShareAndPushInfo:(NSDictionary *)paramDic block:(ClientCompletionBlock)block;

/**
 * 获取h5版本信息
 */
+ (void)getAppVersionByWebsiteId:(NSDictionary *)paramDic block:(ClientCompletionBlock) block;

/**
 * 框架版本比对
 */
+ (void)appVersionWithParam:(NSDictionary *)paramDic block:(ClientCompletionBlock) block;

/**
 * 根据扫描二维码获取信息
 */
+ (void)getTabbarSetMessageByQRCodeWithParam:(NSDictionary *)paramDic block:(ClientCompletionBlock) block;

/**
 * 获取应用版本号
 */
+ (void)getAppVersionByWidParam:(NSDictionary *)paramDic block:(ClientCompletionBlock)block;

/**
 * 获取门店列表
 */
+ (void)getStoreListParam:(NSDictionary *)paramDic block:(ClientCompletionBlock) block;

/**
 * 通知后台应用安装，统计安装量
 */
+ (void)setAppInstallParam:(NSDictionary *)paramDic block:(ClientCompletionBlock)block;
@end
