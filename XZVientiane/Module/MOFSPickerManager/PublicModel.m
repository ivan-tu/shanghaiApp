//
//  PublicModel.m
//  MOFSPickerManagerDemo
//
//  Created by cuifengju on 2017/9/27.
//  Copyright © 2017年 luoyuan. All rights reserved.
//

#import "PublicModel.h"

@implementation PublicModel
- (instancetype)initWithDictionary:(NSDictionary *)Dic {
    self.name = [Dic objectForKey:@"name"];
    self.codeId = [Dic objectForKey:@"codeId"];
    if ([Dic objectForKey:@"selected"]) {
        self.selected = [Dic objectForKey:@"selected"];
    }
    return self;
}
@end
