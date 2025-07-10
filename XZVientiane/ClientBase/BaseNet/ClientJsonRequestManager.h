//
//  AFAppManagerAPIClient.h
//  TuWeiAApp
//
//  Created by tuweia on 15/12/21.
//  Copyright © 2015年 hans. All rights reserved.
//

#import <AFNetworking/AFNetworking.h>
#import <Photos/Photos.h>
typedef void(^ClientCompletionBlock)(id aResponseObject, NSError* anError);

@interface ClientJsonRequestManager : AFHTTPSessionManager

+ (instancetype)sharedClient;

- (void)GET:(NSString *)URLString parameters:(id)parameters block:(ClientCompletionBlock)block;

- (void)POST:(NSString *)URLString parameters:(id)parameters block:(ClientCompletionBlock)block;

- (void)POSTRPC:(NSString *)URLString parameters:(id)parameters block:(ClientCompletionBlock)block;

- (void)checkAppToken;

@end
