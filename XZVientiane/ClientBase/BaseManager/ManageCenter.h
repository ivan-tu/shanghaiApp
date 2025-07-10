//
//  ManageCenter.h
//  XiangZhanClient
//
//  Created by cuifengju on 2017/11/1.
//  Copyright © 2017年 TuWeiA. All rights reserved.
//

#import <Foundation/Foundation.h>
typedef void(^CFJBlock)(id aResponseObject, NSError* anError);

@interface ManageCenter : NSObject
+ (void)requestMessageNumber:(CFJBlock)block;
+ (void)requestshoppingCartNumber:(CFJBlock)block;

@end
