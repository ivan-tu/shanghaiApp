//
//  AdressHistoryCell.h
//  XZVientiane
//
//  Created by 崔逢举 on 2019/9/6.
//  Copyright © 2019 崔逢举. All rights reserved.
//

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface AdressHistoryCell : UITableViewCell
@property (nonatomic,strong)UILabel *locationLabel;//位置
@property (nonatomic,strong)UILabel *nameLabel;//姓名
@property (nonatomic,strong)UILabel *phoneLabel;//电话
- (void)setModel:(NSDictionary *)model;
@end

NS_ASSUME_NONNULL_END
