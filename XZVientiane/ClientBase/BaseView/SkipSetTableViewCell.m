//
//  SkipSetTableViewCell.m
//  XiangZhan
//
//  Created by yiliu on 16/5/30.
//  Copyright © 2016年 tuweia. All rights reserved.
//

#import "SkipSetTableViewCell.h"

@implementation SkipSetTableViewCell

- (id)initWithStyle:(UITableViewCellStyle)style reuseIdentifier:(NSString *)reuseIdentifier
{
    self = [super initWithStyle:style reuseIdentifier:reuseIdentifier];
    if (self) {
        self.picLab = [[UILabel alloc] initWithFrame:CGRectZero];
        [self addSubview:self.picLab];
        self.contentLab = [[UILabel alloc] initWithFrame:CGRectZero];
        [self addSubview:self.contentLab];
    }
    return self;
}

- (void)awakeFromNib {
    [super awakeFromNib];
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];
    
    // Configure the view for the selected state
}

@end
