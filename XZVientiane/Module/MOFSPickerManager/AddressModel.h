//
//  AddressModel.h
//  MOFSPickerManager
//
//  Created by luoyuan on 16/8/31.
//  Copyright © 2016年 luoyuan. All rights reserved.
//

#import <Foundation/Foundation.h>

@class CityModel,DistrictModel;
@interface AddressModel : NSObject

@property (nonatomic, copy) NSString *name;
@property (nonatomic, copy) NSString *zipcode;
@property (nonatomic, copy) NSString *index;
@property (nonatomic, strong) NSMutableArray *list;

- (instancetype)initWithDictionary:(NSDictionary *)Dic;

@end

@interface CityModel : NSObject

@property (nonatomic, copy) NSString *name;
@property (nonatomic, copy) NSString *zipcode;
@property (nonatomic, copy) NSString *index;
@property (nonatomic, strong) NSMutableArray *list;

- (instancetype)initWithDictionary:(NSDictionary *)Dic;

@end

@interface DistrictModel : NSObject

@property (nonatomic, copy) NSString *name;
@property (nonatomic, copy) NSString *zipcode;
@property (nonatomic, copy) NSString *index;

- (instancetype)initWithDictionary:(NSDictionary *)Dic;


@end
