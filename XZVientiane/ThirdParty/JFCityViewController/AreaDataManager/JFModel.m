//
//  JFModel.m
//  JFCitySelector
//
//  Created by 崔逢举 on 2018/8/4.
//  Copyright © 2018年 崔逢举. All rights reserved.
//

#import "JFModel.h"

@implementation JFModel
-(instancetype)initWithDictionary:(NSDictionary*)jsonObject
{
    
    if((self = [super init]))
    {
        [self setValuesForKeysWithDictionary:jsonObject];
        
    }
    return self;
}
@end

@implementation JFCityModel
-(instancetype)initWithDictionary:(NSDictionary*)jsonObject
{
    
    if((self = [super init]))
    {
        [self setValuesForKeysWithDictionary:jsonObject];
        
    }
    return self;
}
@end
