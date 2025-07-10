//
//  XZPicNavBar.h
//  XiangZhanBase
//
//  Created by yiliu on 16/6/8.
//  Copyright © 2016年 TuWeiA. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface XZPicNavBar : UIView
@property (nonatomic,strong) UIButton *leftBarButton; //左button
@property (nonatomic,strong) UIButton *rightBarButton; //右button
@property (nonatomic,strong) UILabel *titleLable; //标题
@property (nonatomic,strong) UIView *lineView; //导航分隔线

- (void)updataFrame;
@end
