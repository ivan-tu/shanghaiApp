//
//  TYJsonModel.m
//  TuiYa
//
//  Created by CFJ on 15/6/14.
//  Copyright (c) 2015年 tuweia. All rights reserved.
//

#import "XZJsonModel.h"

@implementation XZJsonModel

+(JSONKeyMapper*)keyMapper

{
    
    return [[JSONKeyMapper alloc] initWithModelToJSONDictionary:@{@"id": @"tyId",
                                                                  @"private": @"tyPrivate"
                                                                  }
            ];
    
}
/**
 *  重写父类方法，默认所有属性可选
 *
 *  @param propertyName 属性名称
 *
 *  @return bool
 */
+(BOOL)propertyIsOptional:(NSString*)propertyName
{
    return YES;
}

+ (instancetype)modelWithDict:(NSDictionary *)aDict
{
    if (![aDict isKindOfClass:[NSDictionary class]]) {
        return nil;
    }
    
    return [[self alloc] initWithDictionary:aDict error:nil];
}
@end
