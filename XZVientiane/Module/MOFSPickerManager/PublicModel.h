//
//  PublicModel.h
//  MOFSPickerManagerDemo
//
//  Created by cuifengju on 2017/9/27.
//  Copyright © 2017年 luoyuan. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface PublicModel : NSObject
@property (nonatomic, copy) NSString *name;
@property (nonatomic, copy) NSString *codeId;
@property (nonatomic, copy) NSString *selected;
- (instancetype)initWithDictionary:(NSDictionary *)Dic;
@end
