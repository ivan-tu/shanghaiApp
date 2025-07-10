//
//  HybridManager.h
//  HybridSDK
//
//  Created by 崔逢举 on 2019/5/3.
//  Copyright © 2019 崔逢举. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface HybridManager : NSObject
/*
初始化
*/
+ (HybridManager *)shareInstance;

/*
 返回js所需格式参数
 */
- (NSDictionary *)objcCallJsWithFn:(NSString *)function data:(id)data;

/*
处理js传过来的链接
*/
- (void)LocialPathByUrlStr:(NSString *)str templateDic:(NSMutableDictionary *)templateDic templateStr:(NSString *)selfTemplateStr componentJsAndCs:(NSMutableArray *)componentJsAndCs componentDic:(NSMutableDictionary *)componentDic success:(void (^)(NSString* filePath,NSString* templateStr,NSString* title,BOOL isFileExsit))success;

/*
获取请求连接
*/
- (NSString *)getRequestLinkUrl;   //https://gedian.shop/ajax/getResult

/*
获取登录/退出连接
*/
- (NSString *)getloginLinkUrl;    //https://gedian.shop/api/operateChannel

/*
配置tabbar
*/
- (void)reloadTabbarInterfaceSuccess:(void (^)(NSArray *tabs,NSString *tabItemTitleSelectColor,NSString *tabbarBgColor))success;
@end

NS_ASSUME_NONNULL_END
