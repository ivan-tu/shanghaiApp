//
//  ClientNetInterface.m
//  XiangZhanClient
//
//  Created by CFJ on 16/5/1.
//  Copyright © 2016年 TuWeiA. All rights reserved.
//

#import "ClientNetInterface.h"
#import "ClientJsonRequestManager.h"

@implementation ClientNetInterface
+ (void)getNavagationSetMessageWithParam:(NSDictionary *)paramDic block:(ClientCompletionBlock) block {
    [[ClientJsonRequestManager sharedClient] POST:@"site/getAllPageAppSettings" parameters:paramDic block:block];
}
+ (void)getTabbarSetMessageWithParam:(NSDictionary *)paramDic block:(ClientCompletionBlock) block {
    [[ClientJsonRequestManager sharedClient] POST:@"/appPack/getAppAllInfo" parameters:paramDic block:block];
}

+ (void)getShareAndPushInfo:(NSDictionary *)paramDic block:(ClientCompletionBlock)block {
    [[ClientJsonRequestManager sharedClient] POSTRPC:@"/apppack/getAppSdk" parameters:paramDic block:block];
}

+ (void)getTabbarSetMessageByQRCodeWithParam:(NSDictionary *)paramDic block:(ClientCompletionBlock) block {
    [[ClientJsonRequestManager sharedClient] POST:@"/appPack/getAppAllInfoForScan" parameters:paramDic block:block];
}

+ (void)getAppVersionByWebsiteId:(NSDictionary *)paramDic block:(ClientCompletionBlock) block {
    [[ClientJsonRequestManager sharedClient] POST:@"/version/getAppVersionByWebsiteId" parameters:paramDic block:block];
}

+ (void)appVersionWithParam:(NSDictionary *)paramDic block:(ClientCompletionBlock) block
{
    [[ClientJsonRequestManager sharedClient] POST:@"/version/getXiangjianVersion" parameters:paramDic block:block];
}

+ (void)getAppVersionByWidParam:(NSDictionary *)paramDic block:(ClientCompletionBlock)block {
    [[ClientJsonRequestManager sharedClient] POST:@"/apppack/getAppVersionByWid" parameters:paramDic block:block];
}

+ (void)getStoreListParam:(NSDictionary *)paramDic block:(ClientCompletionBlock) block {
    [[ClientJsonRequestManager sharedClient] POST:@"/appmodule/store/apirpc/getModuleStoreList" parameters:paramDic block:block];
}

+ (void)setAppInstallParam:(NSDictionary *)paramDic block:(ClientCompletionBlock)block {
    [[ClientJsonRequestManager sharedClient] POST:@"apppack/setAppInstall" parameters:paramDic block:block];
}

@end
