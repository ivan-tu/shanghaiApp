//
//  XZPackageH5.h
//  XiangZhan
//
//  Created by CFJ on 15/10/12.
//  Copyright © 2015年 tuweia. All rights reserved.
//

#import <Foundation/Foundation.h>
//TODO 修改appleid   响见：1128668754
typedef void(^CLDownloadAppsourceBlock)(id aResponseObject, NSError* anError);

@interface XZPackageH5 : NSObject 

AS_SINGLETON(XZPackageH5)
@property (nonatomic,strong)NSArray *ulrArray;
-(BOOL)isWXAppInstalled;
//统计应用下载量
- (void)setAppInstall;

//检查版本更新
- (void)checkVersion;

//下载manifest资源包
- (void)downloadAppH5:(CLDownloadAppsourceBlock)block;

//新老manifest资源包替换
- (void)replaceManifest;

//下载appsource和skin
- (void)downloadAppsourceH5:(BOOL)isTheme andBlock:(CLDownloadAppsourceBlock)block;

- (NSString *)getNumberWithLink:(NSString *)linkUrl;
@end
