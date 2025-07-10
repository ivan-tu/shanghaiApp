//
//  SkipSetViewController.h
//  XiangZhan
//
//  Created by yiliu on 16/5/30.
//  Copyright © 2016年 tuweia. All rights reserved.
//

#import <UIKit/UIKit.h>

typedef NS_ENUM(NSInteger, popSetType)
{
    ShareType = 0,      //分享弹出框
    SkipType = 1,       //内置浏览界面弹出框
};

@interface SkipSetViewController : UIViewController

@property (nonatomic, strong) UITableView *tableView;
@property (strong, nonatomic) UIButton *bgViewBtn;
@property (strong, nonatomic) UIView *shadowView; //阴影
@property (strong, nonatomic) NSString *linkStr;
@property (assign, nonatomic) popSetType popSetType;

//显示动画
- (void)showInCurrentVC;

//消失动画
- (void)dismissInCurrentVC;

@end
