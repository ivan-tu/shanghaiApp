//
//  JFModel.h
//  JFCitySelector
//
//  Created by 崔逢举 on 2018/8/4.
//  Copyright © 2018年 崔逢举. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface JFModel : NSObject
@property (nonatomic,copy)NSString *index;
@property (nonatomic,strong)NSMutableArray *list;
-(instancetype)initWithDictionary:(NSDictionary*)jsonObject;

@end
@interface JFCityModel : NSObject
@property (nonatomic,copy)NSString *area;
@property (nonatomic,copy)NSString *code;
-(instancetype)initWithDictionary:(NSDictionary*)jsonObject;

@end
