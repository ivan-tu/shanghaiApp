//
//  AFAppManagerAPIClient.m
//  TuWeiAApp
//
//  Created by tuweia on 15/12/21.
//  Copyright © 2015年 hans. All rights reserved.
//

#import "ClientJsonRequestManager.h"
#import "ClientSettingModel.h"
#import "QNUploadManager.h"
#import "CLFileManager.h"
#import "EGOCache.h"
#import "NSString+addition.h"
@implementation ClientJsonRequestManager

+ (instancetype)sharedClient {
    static ClientJsonRequestManager *_sharedClient = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        NSString *domain = [[ClientSettingModel sharedInstance] domain];
        NSLog(@"ClientJsonRequestManager 初始化 - 域名: %@", domain);
        
        NSURL *url = [NSURL URLWithString:domain];
        NSLog(@"ClientJsonRequestManager 初始化 - URL: %@", url);
        
        _sharedClient = [[ClientJsonRequestManager alloc] initWithBaseURL:url];
        _sharedClient.responseSerializer = [AFJSONResponseSerializer serializer];
        _sharedClient.requestSerializer = [AFHTTPRequestSerializer serializer];
        _sharedClient.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/plain", @"text/javascript", @"text/json", @"text/html", nil];
        
        if(ISIPAD) {
            [_sharedClient.requestSerializer setValue:@"iospad" forHTTPHeaderField:@"from"];
        } else {
            [_sharedClient.requestSerializer setValue:@"ios" forHTTPHeaderField:@"from"];
        }
        _sharedClient.requestSerializer.timeoutInterval = 45;
        
        NSLog(@"ClientJsonRequestManager 初始化完成 - baseURL: %@", _sharedClient.baseURL);
    });
    return _sharedClient;
}

- (BOOL)cachedDataWithKey:(NSString *)key block:(ClientCompletionBlock)block {
    if ([AFNetworkReachabilityManager manager].networkReachabilityStatus == AFNetworkReachabilityStatusNotReachable) {
        if (![[EGOCache globalCache] hasCacheForKey:key]) {
            return NO;
        }
        NSDictionary *cachedDic = (NSDictionary *)[[EGOCache globalCache] objectForKey:key];
        if (block) {
            block(cachedDic,nil);
        }
        return YES;
    }
    return NO;
}
- (void)GET:(NSString *)URLString parameters:(id)parameters block:(ClientCompletionBlock)block {
    if ([self cachedDataWithKey:[NSString urlWithParam:parameters andHead:URLString] block:block]) {
        return;
    }
    [self checkAppToken];
    [self GET:URLString parameters:parameters headers:nil progress:nil success:^(NSURLSessionDataTask *task, id responseObject) {
        //没有返回数据或者返回数据格式有误
        if (!responseObject || ![responseObject isKindOfClass:[NSDictionary class]]) {
            if (block) {
                block(nil, [NSError errorWithDomain:@"没有返回数据或数据格式错误" code:10000 userInfo:nil]);
            }
            return ;
        }
        //返回错误码
        NSNumber *codenumber = [responseObject objectForKey:@"code"];
        NSAssert(codenumber.integerValue == 0, @"请求失败");
        [[EGOCache globalCache] setObject:responseObject forKey:[NSString urlWithParam:parameters andHead:URLString]];
        if (block) {
            block(responseObject, nil);
        }
    } failure:^(NSURLSessionDataTask *task, NSError *error) {
        if(block){
            block (nil,error);
        }
    }];
}

- (void)POSTRPC:(NSString *)URLString parameters:(id)parameters block:(ClientCompletionBlock)block
{
    if ([self cachedDataWithKey:[NSString urlWithParam:parameters andHead:URLString] block:block]) {
        return;
    }
    
    [self checkAppToken];
    NSString *dataJsonStr = @"";
    if (parameters) {
        NSData *data = [NSJSONSerialization dataWithJSONObject:parameters
                                                       options:NSJSONWritingPrettyPrinted error:nil];
        dataJsonStr = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    }
    NSString *loginWebsiteUid = [[NSUserDefaults standardUserDefaults] objectForKey:@"loginUid"] ? [[NSUserDefaults standardUserDefaults] objectForKey:@"loginUid"] : @"";
    NSDictionary *paramDic = @{
        @"data" : dataJsonStr,
        @"userid" : loginWebsiteUid,
        @"userToken" : @""
    };
    [self POST:URLString parameters:paramDic headers:nil progress:nil success:^(NSURLSessionDataTask *task, id responseObject) {
        //没有返回数据或者返回数据格式有误
        NSLog(@"%@",[responseObject objectForKey:@"errorMessage"]);
        if (!responseObject || ![responseObject isKindOfClass:[NSDictionary class]]) {
            if (block) {
                block(nil, [NSError errorWithDomain:@"没有返回数据或数据格式错误" code:10000 userInfo:nil]);
            }
            return ;
        }
        //返回错误码
        NSNumber *codenumber = [responseObject objectForKey:@"code"];
        //        NSString *erromessage = [responseObject objectForKey:@"errorMessage"];
        NSAssert(codenumber.integerValue == 0, @"请求失败");
        [[EGOCache globalCache] setObject:responseObject forKey:[NSString urlWithParam:parameters andHead:URLString]];
        if (block) {
            block(responseObject, nil);
        }
    } failure:^(NSURLSessionDataTask *task, NSError *error) {
        if(block){
            block (nil,error);
        }
    }];
}

- (void)POST:(NSString *)URLString parameters:(id)parameters block:(ClientCompletionBlock)block
{
    if ([self cachedDataWithKey:[NSString urlWithParam:parameters andHead:URLString] block:block]) {
        return;
    }
    [self checkAppToken];
    [self POST:URLString parameters:parameters headers:nil progress:nil success:^(NSURLSessionDataTask *task, id responseObject) {
        //没有返回数据或者返回数据格式有误
        NSLog(@"%@",[responseObject objectForKey:@"errorMessage"]);
        if (!responseObject || ![responseObject isKindOfClass:[NSDictionary class]]) {
            if (block) {
                block(nil, [NSError errorWithDomain:@"没有返回数据或数据格式错误" code:10000 userInfo:nil]);
            }
            return ;
        }
        //返回错误码
        //        NSNumber *codenumber = [responseObject objectForKey:@"code"];
        //        NSString *erromessage = [responseObject objectForKey:@"errorMessage"];
        //        NSAssert(codenumber.integerValue == 0, @"请求失败");
        [[EGOCache globalCache] setObject:responseObject forKey:[NSString urlWithParam:parameters andHead:URLString]];
        if (block) {
            block(responseObject, nil);
        }
    } failure:^(NSURLSessionDataTask *task, NSError *error) {
        if(block){
            block (nil,error);
        }
    }];
}

#pragma mark - CheckToken -
//检查appToken，如果过期，同步请求Token
- (void)checkAppToken {
    NSString *appTkn = [[NSUserDefaults standardUserDefaults] objectForKey:User_Token_String];
    [[ClientJsonRequestManager sharedClient].requestSerializer setValue:appTkn forHTTPHeaderField:@"AUTHORIZATION"];
    NSDate *expireDate = [[NSUserDefaults standardUserDefaults] objectForKey:@"User_Token_Expire_Time"];
    if ([expireDate compare:[NSDate date]] != NSOrderedDescending) {
        NSString *urlString = [NSString stringWithFormat:@"%@/oauth/getAccessToken?appId=%@&appSecret=%@",[ClientSettingModel sharedInstance].domain,[ClientSettingModel sharedInstance].appId,[ClientSettingModel sharedInstance].appSecret];
        NSString *resultString = [NSString stringWithContentsOfURL:[NSURL URLWithString:urlString] encoding:NSUTF8StringEncoding error:nil];
        if (!resultString) {
            return;
        }
        NSDictionary *result = [NSJSONSerialization JSONObjectWithData:[resultString dataUsingEncoding:NSUTF8StringEncoding] options:NSJSONReadingAllowFragments error:nil];
        if (result) {
            NSDictionary *dataDic = [result objectForKey:@"data"];
            NSString *appTkn = [dataDic objectForKey:@"access_token"];
            if(appTkn) {
                [[ClientJsonRequestManager sharedClient].requestSerializer setValue:appTkn forHTTPHeaderField:@"AUTHORIZATION"];
                NSInteger intervalTime = [[dataDic objectForKey:@"expire"] integerValue];
                NSDate *expireDate = [NSDate dateWithTimeIntervalSinceNow:intervalTime];
                [[NSUserDefaults standardUserDefaults] setObject:expireDate forKey:@"User_Token_Expire_Time"];
                [[NSUserDefaults standardUserDefaults] setObject:appTkn forKey:User_Token_String];
                [[NSUserDefaults standardUserDefaults] synchronize];
            }
        }
    }
}



@end
