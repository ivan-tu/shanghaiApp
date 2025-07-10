//
//  TYTableViewCell.m
//  TuiYa
//
//  Created by CFJ on 15/6/27.
//  Copyright (c) 2015年 tuweia. All rights reserved.
//

#import "XZTableViewCell.h"

@implementation XZTableViewCel

- (void)awakeFromNib {
    [super awakeFromNib];
    // Initialization code
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];

    // Configure the view for the selected state
}

//重载layoutSubviews
- (void)layoutSubviews
{
    UIImage *img = self.imageView.image;
//    self.imageView.image = [UIImage imageNamed:self.placeHolderImage];
    [super layoutSubviews];
    self.imageView.image = img;
}

+ (NSString *)cellIdentifier {
    return NSStringFromClass([self class]);
}

@end
