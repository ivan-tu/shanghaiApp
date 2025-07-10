//
//  LocationCell.h
//  AddressFromMap
//
//  Created by 崔逢举 on 2018/8/27.
//  Copyright © 2018年 uxiu.me. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface LocationCell : UITableViewCell
@property (nonatomic,strong)UILabel *locationLabel;//位置label
@property (nonatomic,strong)UIButton *locationButton;//位置图标
@property (nonatomic,strong)UIButton *reButton;//位置图标

@property (nonatomic, copy) NSString *title;

@end
