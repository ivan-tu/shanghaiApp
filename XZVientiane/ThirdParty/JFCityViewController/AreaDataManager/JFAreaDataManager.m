//
//  JFAreaDataManager.m
//  JFFootball
//
//  Created by 崔逢举 on 2016/11/18.
//  Copyright © 2016年 崔逢举. All rights reserved.
//

#import "JFAreaDataManager.h"
#import "JFModel.h"
@class CityModel;
@interface JFAreaDataManager ()


@end

@implementation JFAreaDataManager

static JFAreaDataManager *manager = nil;
+ (JFAreaDataManager *)shareInstance {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        manager = [[self alloc] init];
        manager.cityArray = [NSMutableArray arrayWithCapacity:0];
    });
    return manager;
}



- (void)searchCityData:(NSString *)searchObject result:(void (^)(NSMutableArray *result))result {
    NSMutableArray *resultArray = [[NSMutableArray alloc] init];
    //加个多线程，否则数量量大的时候，有明显的卡顿现象
    //这里最好放在数据库里面再进行搜索，效率会更快一些
    dispatch_queue_t globalQueue = dispatch_get_global_queue(0, 0);
    dispatch_async(globalQueue, ^{
        if (searchObject!=nil && searchObject.length>0) {
            //遍历需要搜索的所有内容，其中self.dataArray为存放总数据的数组
            for (JFCityModel *model in self.cityArray) {
                NSString *tempStr = model.area;
                if ([tempStr containsString:searchObject]) {
                    [resultArray addObject:model];
                }
            }
            dispatch_async(dispatch_get_main_queue(), ^{
                result(resultArray);
            });
            //返回结果
        }
    });

}

@end
