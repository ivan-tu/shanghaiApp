//
//  ManageCenter.m
//  XiangZhanClient
//
//  Created by cuifengju on 2017/11/1.
//  Copyright © 2017年 TuWeiA. All rights reserved.
//

#import "ManageCenter.h"
#import "ClientSettingModel.h"
@implementation ManageCenter
#pragma mark -----请求消息数
+ (void)requestMessageNumber:(CFJBlock)block {
    NSString *channelId = [[NSUserDefaults standardUserDefaults] objectForKey:User_ChannelId] ? [[NSUserDefaults standardUserDefaults] objectForKey:User_ChannelId] : @"";
    BOOL isLogin = [[NSUserDefaults standardUserDefaults] boolForKey:@"isLogin"];
    channelId = isLogin ? channelId : @"";
    NSDictionary *paramDic = @{
                               @"channelId" : channelId,
                               };
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    manager.responseSerializer = [AFJSONResponseSerializer serializer];
    manager.requestSerializer = [AFHTTPRequestSerializer serializer];
    if(ISIPAD) {
        [manager.requestSerializer setValue:@"iospad" forHTTPHeaderField:@"from"];
    } else {
        [manager.requestSerializer setValue:@"ios" forHTTPHeaderField:@"from"];
    }
    manager.requestSerializer.timeoutInterval = 5;
    manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/plain", @"text/javascript", @"text/json", @"text/html", nil];
    NSString *urlCFJ = [NSString stringWithFormat:@"%@/messageapi/getUnreadMsg",Domain];
    [manager POST:urlCFJ parameters:paramDic headers:nil progress:nil success:^(NSURLSessionDataTask * _Nonnull task, id  _Nonnull responseObject) {
      NSInteger num  = [[responseObject objectForKey:@"data"] integerValue];
        if (num <= 0 || !num) {
            num = 0;
        }
        [[NSUserDefaults standardUserDefaults] setInteger:num forKey:@"clinetMessageNum"];
        [[NSUserDefaults standardUserDefaults] synchronize];
        block(responseObject,nil);
    } failure:^(NSURLSessionDataTask * _Nonnull task, NSError * _Nonnull error) {
        [[NSUserDefaults standardUserDefaults] setInteger:0 forKey:@"clinetMessageNum"];
        [[NSUserDefaults standardUserDefaults] synchronize];
        NSDictionary *dic = @{
                              @"code" : @"0",
                              @"data" : @"0",
                              @"errorMessage" : @""};
        block(dic,nil);
    }];
}
#pragma mark -----请求购物车数量
+ (void)requestshoppingCartNumber:(CFJBlock)block {
    NSString *visitorSiteId = [ClientSettingModel sharedInstance].mainWebSiteId;  //客户端webSiteID一定存在
    NSString *loginUid = [[NSUserDefaults standardUserDefaults] objectForKey:@"loginUid"] ? [[NSUserDefaults standardUserDefaults] objectForKey:@"loginUid"] : @"";
    NSString *clientKey = [[NSUserDefaults standardUserDefaults] objectForKey:@"clientKey"] ? [[NSUserDefaults standardUserDefaults] objectForKey:@"clientKey"] : @"";
    NSDictionary *paramDic = @{
                               @"data" : @"",
                               @"siteId" : visitorSiteId,
                               @"loginUid" : loginUid,
                               @"visitorSiteId" : visitorSiteId,
                               @"clientKey" : clientKey
                               };
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    manager.responseSerializer = [AFJSONResponseSerializer serializer];
    manager.requestSerializer = [AFHTTPRequestSerializer serializer];
    if(ISIPAD) {
        [manager.requestSerializer setValue:@"iospad" forHTTPHeaderField:@"from"];
    } else {
        [manager.requestSerializer setValue:@"ios" forHTTPHeaderField:@"from"];
    }
    manager.requestSerializer.timeoutInterval = 5;
    manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/plain", @"text/javascript", @"text/json", @"text/html", nil];
    [manager.requestSerializer setValue:[[NSUserDefaults standardUserDefaults] objectForKey:User_Token_String] forHTTPHeaderField:@"AUTHORIZATION"];
    NSString *urlCFJ = [NSString stringWithFormat:@"%@/goods/shopCartNum",Domain];

    [manager POST:urlCFJ parameters:paramDic headers:nil progress:nil success:^(NSURLSessionDataTask * _Nonnull task, id  _Nonnull responseObject) {
        NSInteger num = [[responseObject objectForKey:@"data"] integerValue];
        if (num == 0 || !num) {
            num = 0;
        }
        [[NSUserDefaults standardUserDefaults] setInteger:num forKey:@"shoppingCartNum"];
        [[NSUserDefaults standardUserDefaults] synchronize];
        block(responseObject,nil);
    } failure:^(NSURLSessionDataTask * _Nonnull task, NSError * _Nonnull error) {
        [[NSUserDefaults standardUserDefaults] setInteger:0 forKey:@"shoppingCartNum"];
        [[NSUserDefaults standardUserDefaults] synchronize];
        NSDictionary *dic = @{
                              @"code" : @"0",
                              @"data" : @"0",
                              @"errorMessage" : @""};
        block(dic,nil);
    }];
}
@end

