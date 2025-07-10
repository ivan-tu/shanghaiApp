//
//  LocationCell.m
//  AddressFromMap
//
//  Created by 崔逢举 on 2018/8/27.
//  Copyright © 2018年 uxiu.me. All rights reserved.
//

#import "LocationCell.h"
#import <Masonry.h>
@interface LocationCell ()
@property (nonatomic,strong)UIView *line1;
@property (nonatomic,strong)UIView *line2;

@end

@implementation LocationCell

- (instancetype)initWithStyle:(UITableViewCellStyle)style reuseIdentifier:(NSString *)reuseIdentifier {
    if (self = [super initWithStyle:style reuseIdentifier:reuseIdentifier]) {
        UILabel *label = [[UILabel alloc] initWithFrame:CGRectMake(10, 0, 200, 50)];
        label.backgroundColor = [UIColor whiteColor];
        label.textColor = [UIColor blackColor];
        label.textAlignment = NSTextAlignmentLeft;
        label.font = [UIFont systemFontOfSize:17];
        [self addSubview:label];
        self.line1 = [[UIView alloc]init];
        self.line2 = [[UIView alloc]init];
        self.line1.backgroundColor = [UIColor colorWithHexString:@"#CCCCCC"];
        self.line2.backgroundColor = [UIColor colorWithHexString:@"#CCCCCC"];

        [self addSubview:self.line1];
        [self addSubview:self.line2];
        [self.line1 mas_makeConstraints:^(MASConstraintMaker *make) {
            make.top.left.right.mas_equalTo(self);
            make.height.mas_equalTo(0.2);
        }];
        [self.line2 mas_makeConstraints:^(MASConstraintMaker *make) {
            make.bottom.left.right.mas_equalTo(self);
            make.height.mas_equalTo(0.5);
        }];
        self.locationLabel = label;
        self.reButton = [UIButton buttonWithType:(UIButtonTypeSystem)];
        self.reButton.frame = CGRectMake(UIScreen.mainScreen.bounds.size.width - 70, 5, 65, 40);
        [self.reButton setTitle:@"重新定位" forState:(UIControlStateNormal)];
        [self.reButton setTitleColor:[UIColor colorWithHexString:@"#7BBD28"] forState:(UIControlStateNormal)];
        [self.reButton.titleLabel setFont:[UIFont systemFontOfSize:15]];
        UIButton *image = [UIButton buttonWithType:(UIButtonTypeCustom)];
        image.frame = CGRectMake(CGRectGetMinX(self.reButton.frame)-35, 10,30,30);
        [image setImage:[UIImage imageNamed:@"reLocation"] forState:(UIControlStateNormal)];
        [self addSubview:self.reButton];
        [self addSubview:image];
        self.locationButton = image;
    }
    return self;

}

- (void)layoutSubviews {
    [super layoutSubviews];

}
- (void)setTitle:(NSString *)title {
    self.locationLabel.text = title;
}
- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];

    // Configure the view for the selected state
}

@end
