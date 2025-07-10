//
//  AddressModel.m
//  MOFSPickerManager
//
//  Created by luoyuan on 16/8/31.
//  Copyright © 2016年 luoyuan. All rights reserved.
//

#import "AddressModel.h"

@implementation AddressModel

- (NSMutableArray *)list {
    if (!_list) {
        _list = [NSMutableArray array];
    }
    return _list;
}

- (instancetype)initWithDictionary:(NSDictionary *)Dic{
    self.name = [Dic objectForKey:@"name"] ;
    self.zipcode = [Dic objectForKey:@"code"];
        NSArray *arr = [Dic objectForKey:@"child"];
        for (int i = 0 ; i < arr.count ; i++ ) {
            CityModel *model = [[CityModel alloc] initWithDictionary:arr[i]];
            model.index = [NSString stringWithFormat:@"%i",i];
            [self.list addObject:model];
        }
    return self;
}

@end

@implementation CityModel

- (NSMutableArray *)list {
    if (!_list) {
        _list = [NSMutableArray array];
    }
    return _list;
}

- (instancetype)initWithDictionary:(NSDictionary *)Dic {
    self.name = [Dic objectForKey:@"name"];
    self.zipcode = [Dic objectForKey:@"code"];
        NSArray *arr = [Dic objectForKey:@"child"];
        for (int i = 0 ; i < arr.count ; i++ ) {
            DistrictModel *model = [[DistrictModel alloc] initWithDictionary:arr[i]];
            model.index = [NSString stringWithFormat:@"%i",i];
            [self.list addObject:model];
        }
    return self;
}
@end

@implementation DistrictModel

- (instancetype)initWithDictionary:(NSDictionary *)Dic {
    self.name = [Dic objectForKey:@"name"];
    self.zipcode = [Dic objectForKey:@"code"];
    return self;
}
@end
