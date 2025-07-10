//
//  JFAreaDataManager.h
//  JFFootball
//
//  Created by 崔逢举 on 2016/11/18.
//  Copyright © 2016年 崔逢举. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface JFAreaDataManager : NSObject
@property (nonatomic,strong)NSMutableArray *cityArray;
+ (JFAreaDataManager *)shareInstance;



/**
 使用搜索框，搜索城市

 @param searchObject 搜索对象
 @param result 搜索回调结果
 */
- (void)searchCityData:(NSString *)searchObject result:(void (^)(NSMutableArray *result))result;
@end
