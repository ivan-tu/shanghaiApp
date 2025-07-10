//
//  UIBarButtonItem+DCBarButtonItem.m
//  CDDStoreDemo
//
//  Created by apple on 2017/3/19.
//  Copyright © 2017年 apple. All rights reserved.
//

#import "UIBarButtonItem+DCBarButtonItem.h"
#import "UIButton+HQCustomIcon.h"
#import "UIButton+EnlargeTouchArea.h"
#import "XZIcomoonDefine.h"
@implementation UIBarButtonItem (DCBarButtonItem)

+(UIBarButtonItem *)ItemWithImage:(UIImage *)image WithHighlighted:(UIImage *)HighlightedImage Target:(id)target action:(SEL)action
{
    UIButton *btn = [UIButton buttonWithType:UIButtonTypeCustom];
    [btn setImage:image forState:UIControlStateNormal];
    [btn setImage:HighlightedImage forState:UIControlStateHighlighted];
    [btn sizeToFit];
    [btn addTarget:target action:action forControlEvents:UIControlEventTouchUpInside];
    UIView *contentView = [[UIView alloc]initWithFrame:btn.frame];
    [contentView addSubview:btn];
    
    return [[UIBarButtonItem alloc]initWithCustomView:contentView];
}

+(UIBarButtonItem *)ItemWithImage:(CGFloat)fontSize andColor:(UIColor *)fontColor andText:(NSString *)textStr Target:(id)target action:(SEL)action
{
    UIButton *btn = [UIButton buttonWithType:UIButtonTypeCustom];
    [btn setTitle:textStr forState:UIControlStateNormal];
    btn.titleLabel.font =[UIFont fontWithName:@"iconfont" size:fontSize];
    [btn setTitleColor:fontColor forState:UIControlStateNormal];
    [btn setTitleShadowColor:[UIColor clearColor] forState:UIControlStateNormal];
    [btn sizeToFit];
    [btn addTarget:target action:action forControlEvents:UIControlEventTouchUpInside];
    UIView *contentView = [[UIView alloc]initWithFrame:btn.frame];
    [contentView addSubview:btn];
    return [[UIBarButtonItem alloc]initWithCustomView:contentView];
}
+(UIBarButtonItem *)leftItemWithDic:(NSDictionary *)dic Color:(NSString *)color Target:(id)target action:(SEL)action {
    if ([[dic objectForKey:@"buttonPicture"] length]  && [[dic objectForKey:@"text"] length]) {
        UIButton *button = [UIButton buttonWithType:UIButtonTypeCustom];
        [button setImage:[UIImage imageNamed:[dic objectForKey:@"buttonPicture"]] forState:UIControlStateNormal];
        [button setTitle:[dic objectForKey:@"text"] forState:UIControlStateNormal];
        [button setTitleColor:[UIColor colorWithHexString:color] forState:UIControlStateNormal];
        button.titleLabel.font = [UIFont systemFontOfSize:14];
        button.frame = CGRectMake(2, 0, 60, 20);
        [button addTarget:target action:action forControlEvents:UIControlEventTouchUpInside];
        [button setIconInLeftWithSpacing:5];
        UIView *contentView = [[UIView alloc]initWithFrame:button.frame];
        [contentView addSubview:button];
        contentView.userInteractionEnabled = YES;
        return [[UIBarButtonItem alloc]initWithCustomView:contentView];
    }
    else if ([[dic objectForKey:@"buttonPicture"] length] && ![[dic objectForKey:@"text"] length]) {
        UIButton *btn = [UIButton buttonWithType:UIButtonTypeCustom];
        [btn setTitle:@"" forState:UIControlStateNormal];
        //让按钮内容左对齐
        btn.contentHorizontalAlignment = UIControlContentHorizontalAlignmentLeft;
        [btn setImage:[UIImage imageNamed:[dic objectForKey:@"buttonPicture"]] forState:UIControlStateNormal];
        [btn addTarget:target action:action forControlEvents:UIControlEventTouchUpInside];
        //按钮大小自适应
//        [btn sizeToFit];
        btn.bounds = CGRectMake(0, 0, 35, 35);
        [btn setHitTestEdgeInsets:UIEdgeInsetsMake(-6, -6, -6, -6)];
        return [[UIBarButtonItem alloc]initWithCustomView:btn];
    }
    else {
        UIButton *btn = [UIButton buttonWithType:UIButtonTypeSystem];
        [btn setTitle:[dic objectForKey:@"text"] forState:UIControlStateNormal];
        [btn setTitleColor:[UIColor colorWithHexString:color] forState:UIControlStateNormal];
        [btn setTitleShadowColor:[UIColor clearColor] forState:UIControlStateNormal];
        [btn sizeToFit];
        [btn addTarget:target action:action forControlEvents:UIControlEventTouchUpInside];
        UIView *contentView = [[UIView alloc]initWithFrame:btn.frame];
        [contentView addSubview:btn];
        return [[UIBarButtonItem alloc]initWithCustomView:contentView];
    }
}
+(UIBarButtonItem *)rightItemWithDic:(NSDictionary *)dic Color:(NSString *)color Target:(id)target action:(SEL)action {
    if ([[dic objectForKey:@"buttonPicture"] length]  && [[dic objectForKey:@"text"] length]) {
        UIButton *button = [UIButton buttonWithType:UIButtonTypeCustom];
        [button setImage:[UIImage imageNamed:[dic objectForKey:@"buttonPicture"]] forState:UIControlStateNormal];
        [button setTitle:[dic objectForKey:@"text"] forState:UIControlStateNormal];
        [button setTitleColor:[UIColor colorWithHexString:color] forState:UIControlStateNormal];
        button.titleLabel.font = [UIFont systemFontOfSize:14];
        button.frame = CGRectMake(2, 0, 60, 20);
        [button addTarget:target action:action forControlEvents:UIControlEventTouchUpInside];
        [button setIconInLeftWithSpacing:5];
        UIView *contentView = [[UIView alloc]initWithFrame:button.frame];
        [contentView addSubview:button];
        contentView.userInteractionEnabled = YES;
        return [[UIBarButtonItem alloc]initWithCustomView:contentView];
    }
    else if ([[dic objectForKey:@"buttonPicture"] length] && ![[dic objectForKey:@"text"] length]) {
        UIButton *btn = [UIButton buttonWithType:UIButtonTypeCustom];
        [btn setTitle:@"" forState:UIControlStateNormal];
        //让按钮内容右对齐
        btn.contentHorizontalAlignment = UIControlContentHorizontalAlignmentRight;
        [btn setImage:[UIImage imageNamed:[dic objectForKey:@"buttonPicture"]] forState:UIControlStateNormal];
        [btn addTarget:target action:action forControlEvents:UIControlEventTouchUpInside];
        //按钮大小自适应
        //  [btn sizeToFit];
        btn.bounds = CGRectMake(0, 0, 35, 35);
        [btn setHitTestEdgeInsets:UIEdgeInsetsMake(-6, -6, -6, -6)];
        return [[UIBarButtonItem alloc]initWithCustomView:btn];
    }
    else {
        UIButton *btn = [UIButton buttonWithType:UIButtonTypeSystem];
        [btn setTitle:[dic objectForKey:@"text"] forState:UIControlStateNormal];
        [btn setTitleColor:[UIColor colorWithHexString:color] forState:UIControlStateNormal];
        [btn setTitleShadowColor:[UIColor clearColor] forState:UIControlStateNormal];
        [btn sizeToFit];
        [btn addTarget:target action:action forControlEvents:UIControlEventTouchUpInside];
        UIView *contentView = [[UIView alloc]initWithFrame:btn.frame];
        [contentView addSubview:btn];
        return [[UIBarButtonItem alloc]initWithCustomView:contentView];
    }
}

+(UIBarButtonItem *)rightItemTarget:(id)target action:(SEL)action {
    UIButton *btn = [UIButton buttonWithType:UIButtonTypeCustom];
    [btn setTitle:@" 扫码核券" forState:UIControlStateNormal];
    btn.titleLabel.font = [UIFont systemFontOfSize:14];
    [btn setTitleColor:[UIColor darkGrayColor] forState:(UIControlStateNormal)];
    //让按钮内容右对齐
    btn.contentHorizontalAlignment = UIControlContentHorizontalAlignmentRight;
    [btn setImage:[UIImage imageNamed:@"QR"] forState:UIControlStateNormal];
    [btn addTarget:target action:action forControlEvents:UIControlEventTouchUpInside];
    [btn setHitTestEdgeInsets:UIEdgeInsetsMake(-6, -6, -6, -6)];
    [btn  sizeToFit];
    return [[UIBarButtonItem alloc]initWithCustomView:btn];
}
+(UIBarButtonItem *)leftItemWithtitle:(NSString *)title Color:(NSString *)color Target:(id)target action:(SEL)action {
    UIButton *button = [UIButton buttonWithType:UIButtonTypeCustom];
    UIImage *image = [UIImage imageNamed:@"headerLocation"];
    image = [image scaleToSize:CGSizeMake(35, 35)];
    UIImage *iconImage = [UIImage imageWithCGImage:image.CGImage scale:2.0 orientation:UIImageOrientationUp];
    [button setImage:iconImage forState:UIControlStateNormal];
    [button setTitle:title forState:UIControlStateNormal];
    [button setTitleColor:[UIColor colorWithHexString:color] forState:UIControlStateNormal];
    button.titleLabel.font = [UIFont systemFontOfSize:14];
    button.titleLabel.lineBreakMode = NSLineBreakByTruncatingTail;
    CGSize labelSize = [button.titleLabel sizeThatFits:CGSizeMake(200.f, MAXFLOAT)];
    button.frame = CGRectMake(-10, 0, labelSize.width > 200 ? 200 : labelSize.width + 30, 25);
    [button addTarget:target action:action forControlEvents:UIControlEventTouchUpInside];
    [button setIconInLeftWithSpacing:-20];
    [button setHitTestEdgeInsets:UIEdgeInsetsMake(-10, -10, -10, -10)];
    UIView *contentView = [[UIView alloc]initWithFrame:button.frame];
    [contentView addSubview:button];
    return [[UIBarButtonItem alloc]initWithCustomView:contentView];
    
}



@end

