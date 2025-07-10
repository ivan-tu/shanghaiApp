//
//  AdressHistoryCell.m
//  XZVientiane
//
//  Created by 崔逢举 on 2019/9/6.
//  Copyright © 2019 崔逢举. All rights reserved.
//

#import "AdressHistoryCell.h"
#import <Masonry.h>
@implementation AdressHistoryCell

- (instancetype)initWithStyle:(UITableViewCellStyle)style reuseIdentifier:(NSString *)reuseIdentifier {
    if (self = [super initWithStyle:style reuseIdentifier:reuseIdentifier]) {
        [self.contentView addSubview:self.locationLabel];
        [self.contentView addSubview:self.nameLabel];
        [self.contentView addSubview:self.phoneLabel];
        [self layoutSubviews];
    }
    return self;
    
}
- (void)layoutSubviews {
    [super layoutSubviews];
    [self.locationLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.mas_equalTo(self.contentView).offset(15);
        make.right.mas_equalTo(self.contentView).offset(-15);
        make.top.mas_equalTo(self.contentView).offset(5);
        make.height.mas_equalTo(20);
    }];
    [self.nameLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.mas_equalTo(self.contentView).offset(15);
        make.top.mas_equalTo(self.locationLabel.mas_bottom).offset(5);
        make.bottom.mas_equalTo(self.contentView).offset(-10);
    }];
    [self.phoneLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.mas_equalTo(self.nameLabel.mas_right).offset(15);
        make.centerY.mas_equalTo(self.nameLabel);
    }];
    
}
- (void)setModel:(NSDictionary *)model {
    self.locationLabel.text = [model objectForKey:@"address"];
    self.nameLabel.text = [model objectForKey:@"username"];
    self.phoneLabel.text = [model objectForKey:@"mobile"];

}
- (UILabel *)locationLabel {
    if (_locationLabel == nil) {
        _locationLabel = [[UILabel alloc]init];
        _locationLabel.font = [UIFont systemFontOfSize:16];
    }
    return _locationLabel;
}
- (UILabel *)nameLabel {
    if (_nameLabel == nil) {
        _nameLabel = [[UILabel alloc]init];
        _nameLabel.font = [UIFont systemFontOfSize:14];
        _nameLabel.textColor = UIColor.grayColor;
    }
    return _nameLabel;
}
- (UILabel *)phoneLabel {
    if (_phoneLabel == nil) {
        _phoneLabel = [[UILabel alloc]init];
        _phoneLabel.font = [UIFont systemFontOfSize:14];
        _phoneLabel.textColor = UIColor.grayColor;
    }
    return _phoneLabel;
}
- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];

    // Configure the view for the selected state
}

@end
