//
//  ShowAlertView.h
//  XZVientiane
//
//  Created by 崔逢举 on 2018/5/17.
//  Copyright © 2018年 崔逢举. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "ShowAlertType.h"
@class ShowAlertView;
typedef void (^alertItemCallback)(ShowAlertView *showview);

@interface ShowAlertView : UIView
/**
 * 第一步：创建一个自定义的Alert/ActionSheet
 */
+ (instancetype)showAlertWithTitle:(NSString *)title
                                       message:(NSString *)message;
+ (instancetype)showActionSheet;
/**
 * 第二步：往创建的alert上面添加事件
 */
- (void)addItemWithTitle:(NSString *)title
                itemType:(ShowAlertItemType)itemType
                callback:(alertItemCallback)callback;
// 第三步：展示alert
- (void)show;
@end
