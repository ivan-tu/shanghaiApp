//
//  XZPackageH5.m
//  XiangZhan
//
//  Created by CFJ on 15/10/12.
//  Copyright © 2015年 tuweia. All rights reserved.
//

#import "XZPackageH5.h"
#import "ClientJsonRequestManager.h"
#import "CLFileManager.h"
#import "ClientSettingModel.h"
#import "ClientNetInterface.h"
#import "AppDelegate.h"
#import "JHSysAlertUtil.h"
#import "WXApi.h"

@implementation XZPackageH5

DEF_SINGLETON(XZPackageH5)
-(BOOL)isWXAppInstalled {
    return [WXApi isWXAppInstalled];
}
- (NSArray *)ulrArray {
    if (_ulrArray == nil) {
       _ulrArray = @[
//        @"https://test.mendianquan.com/p/useTicket/list/list",
//                      @"https://test.mendianquan.com/p/message/list/list",
//                      @"https://test.mendianquan.com/p/user/me/me",
                      @"https://m.caiwel.com/p/home/index/index"];
    }
    return _ulrArray;
}
- (void)setAppInstall {
    NSString *deviceType;
    if (ISIPAD) {
        deviceType = @"iospad";
    } else {
        deviceType = @"iosphone";
    }
    NSDictionary *paramDic = @{
                               @"siteId" : [ClientSettingModel sharedInstance].mainWebSiteId,
                               @"type" : deviceType
                               };
    [ClientNetInterface setAppInstallParam:paramDic block:^(id aResponseObject, NSError *anError) {
        if (aResponseObject && [aResponseObject objectForKey:@"code"]) {
            if ([[aResponseObject objectForKey:@"code"] integerValue] == 0) {
                [[NSUserDefaults standardUserDefaults] setObject:@"yes" forKey:@"appInstalled"];
                [[NSUserDefaults standardUserDefaults] synchronize];
            }
        }
    }];
}

-(void)checkVersion {
    NSURL *url = [NSURL URLWithString:MY_APP_URL];
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
//    [request setHTTPMethod:@"GET"];
    [request setTimeoutInterval:10.0];
    NSURLSession *session = [NSURLSession sharedSession];
    NSURLSessionDataTask *dataTask = [session dataTaskWithRequest:request completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
        
        if (!error) {
            //返回正确；
            NSError* jasonErr = nil;
            // jason 解析
            NSDictionary* responseDict = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingAllowFragments error:&jasonErr];
            if (responseDict && [responseDict objectForKey:@"results"]) {
                NSArray *resultAry = [responseDict objectForKey:@"results"];
                if (!resultAry || ![[resultAry class] isSubclassOfClass:[NSArray class]]) {
                    return ;
                }
                
                if (resultAry.count < 1) {
                    return;
                }
                NSDictionary* results = [[responseDict objectForKey:@"results"] safeObjectAtIndex:0];
                if (results) {
                    NSString * fVeFromNet = [results objectForKey:@"version"];
                    NSString *strVerUrl = [results objectForKey:@"trackViewUrl"];
                    NSString *notes = [results objectForKey:@"releaseNotes"];
                    
                    if (0 < fVeFromNet && strVerUrl) {
                        NSString *fCurVer = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];
                        if ([fCurVer compare:fVeFromNet options:NSNumericSearch] == NSOrderedAscending) {
                            dispatch_async(dispatch_get_main_queue(), ^{
                                [JHSysAlertUtil presentAlertViewWithTitle:@"版本更新" message:notes cancelTitle:@"下次更新" defaultTitle:@"立即更新" distinct:YES cancel:nil confirm:^{
                                    //TODO 修改应用id  响见：1128668754
                                    NSURL *appUrl = [NSURL URLWithString:strVerUrl];
                                    [[UIApplication sharedApplication] openURL:appUrl];
                                }];
                            });
                        }
                    }
                }
            }
            
        }else{
            //出现错误；
        }
        
    }];
    
    
    [dataTask resume];
  
}
- (void)downloadAppH5:(CLDownloadAppsourceBlock)block
{
    NSString *appH5Version = [[NSUserDefaults standardUserDefaults] objectForKey:User_AppH5_Version];
    NSString *h5DocumentPath = [NSString stringWithFormat:@"%@/manifest",[CLFileManager appDocPath]];
    NSString *AppStoreVersion = [[NSUserDefaults standardUserDefaults] objectForKey:@"AppStoreVersion(1.0.1)"];
    if (!appH5Version) {
            [[NSUserDefaults standardUserDefaults] setBool:NO forKey:@"isCopy"];
            [[NSUserDefaults standardUserDefaults] synchronize];
            [CLFileManager copyH5ToDocument];
            [[NSUserDefaults standardUserDefaults] setObject:XiangJianAppH5Version forKey:User_AppH5_Version];
            [[NSUserDefaults standardUserDefaults] setObject:@"1.0.1" forKey:@"AppStoreVersion(1.0.1)"];
            [[NSUserDefaults standardUserDefaults] synchronize];
        block(@"success",nil);
        return;
    }
    else if (!AppStoreVersion) {
            [[NSUserDefaults standardUserDefaults] setBool:NO forKey:@"isCopy"];
            [[NSUserDefaults standardUserDefaults] setObject:@"1.0.1" forKey:@"AppStoreVersion(1.0.1)"];
            [[NSUserDefaults standardUserDefaults] setBool:NO forKey:@"HasSkinOrPlugins"];
            [[NSUserDefaults standardUserDefaults] synchronize];
            [CLFileManager copyH5ToDocument];
        block(@"success",nil);
        return;
    }
    else {
        //TODO
        //第一次安装直接拷贝工程manifest，系统不存在manifest也再次拷贝
        if (![[NSFileManager defaultManager] fileExistsAtPath:h5DocumentPath]) {
            [CLFileManager copyH5ToDocument];
            [[NSUserDefaults standardUserDefaults] setObject:XiangJianAppH5Version forKey:User_AppH5_Version];
            [[NSUserDefaults standardUserDefaults] setBool:NO forKey:@"HasSkinOrPlugins"];
            [[NSUserDefaults standardUserDefaults] synchronize];
            block(@"success",nil);
            return; //在工程中调试js时把这句注释去掉，调试好后别忘了改回来
        }
    }
    block(@"success",nil);
    return;
}

- (void)downloadAppsourceH5:(BOOL)isTheme andBlock:(CLDownloadAppsourceBlock)block {
  
}

- (void)replaceManifest {
    //有新版本的manifest的时候才去替换，否则直接返回
    if (![[NSUserDefaults standardUserDefaults] boolForKey:User_Manifest_HaveNewVersion]) {
        return;
    }
    ///先把manifest下的appsource拷贝到NewManifest下，然后再把newmanifest替换manifest，完成更新
    NSError *error;
    NSString *appsourceManifestPath = [NSString stringWithFormat:@"%@/appsources",[CLFileManager appH5ManifesPath]];
    NSString *appsourceNewManifestPath = [NSString stringWithFormat:@"%@/manifest/appsources",[CLFileManager appH5ManifesNewPath]];
    if ([[NSFileManager defaultManager] fileExistsAtPath:appsourceNewManifestPath]) {
        [[NSFileManager defaultManager] removeItemAtPath:appsourceNewManifestPath error:nil];
    }
    [[NSFileManager defaultManager] copyItemAtURL:[NSURL fileURLWithPath:appsourceManifestPath] toURL:[NSURL fileURLWithPath:appsourceNewManifestPath] error:&error];
    
    ///先把manifest下的skins拷贝到NewManifest下，然后再把newmanifest替换manifest，完成更新
    NSString *skinsManifestPath = [NSString stringWithFormat:@"%@/static/skins",[CLFileManager appH5ManifesPath]];
    NSString *skinsNewManifestPath = [NSString stringWithFormat:@"%@/manifest/static/skins",[CLFileManager appH5ManifesNewPath]];
    if ([[NSFileManager defaultManager] fileExistsAtPath:skinsNewManifestPath]) {
        [[NSFileManager defaultManager] removeItemAtPath:skinsNewManifestPath error:nil];
    }
    [[NSFileManager defaultManager] copyItemAtURL:[NSURL fileURLWithPath:skinsManifestPath] toURL:[NSURL fileURLWithPath:skinsNewManifestPath] error:nil];
    ///拷贝newmanifest替换老的manifest
    NSString *sourcePath = [NSString stringWithFormat:@"%@/manifest",[CLFileManager appH5ManifesNewPath]];
    [[NSFileManager defaultManager] removeItemAtPath:[CLFileManager appH5ManifesPath] error:nil];
    BOOL success = [[NSFileManager defaultManager] copyItemAtURL:[NSURL fileURLWithPath:sourcePath] toURL:[NSURL fileURLWithPath:[CLFileManager appH5ManifesPath]] error:&error];
    if (success) {
        [[NSUserDefaults standardUserDefaults] setBool:NO forKey:User_Manifest_HaveNewVersion];
        [[NSUserDefaults standardUserDefaults] synchronize];
    }
}

- (NSString *)getNumberWithLink:(NSString *)linkUrl {
    if ([linkUrl containsString:@"home/index/index"]) {
        return @"0";
    }
   else if ([linkUrl containsString:@"shop/cart/cart"]) {
        return @"1";
    }
   else  if ([linkUrl containsString:@"orderList/orderList"]) {
        return @"2";
    }
   else {
       return @"3";
   }
}
@end
