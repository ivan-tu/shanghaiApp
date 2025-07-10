//
//  UIView+addition.m
//  TuiYa
//
//  Created by 崔逢举 on 15/6/15.
//  Copyright (c) 2015年 tuweia. All rights reserved.
//

#import "UIView+addition.h"

@implementation UIView (addition)

+ (instancetype)autolayoutView
{
    UIView *view = [[self alloc] initWithFrame:CGRectZero];
    view.translatesAutoresizingMaskIntoConstraints = NO;
    view.backgroundColor = [UIColor clearColor];
    return view;
}

- (void)setTitleImageWith:(CGFloat)fontSize andColor:(UIColor *)fontColor andText:(NSString *)textStr {
    
    if ([self isKindOfClass:[UIButton class]]) {
        
        UIButton *btn = (UIButton *)self;
        [btn setTitle:textStr forState:UIControlStateNormal];
        btn.titleLabel.font =[UIFont fontWithName:@"icomoon" size:fontSize];
        [btn setTitleColor:fontColor forState:UIControlStateNormal];
        [btn setTitleShadowColor:[UIColor clearColor] forState:UIControlStateNormal];
    }
    else if ([self isKindOfClass:[UILabel class]]) {
        
        UILabel *label = (UILabel *)self;
        label.font = [UIFont fontWithName:@"icomoon" size:fontSize];
        label.text = textStr;
        [label setTextColor:fontColor];
        label.shadowColor = [UIColor clearColor];
    }

}

- (void)setTitleIconWith:(CGFloat)fontSize andColor:(UIColor *)fontColor andText:(NSString *)textStr {
    
    if ([self isKindOfClass:[UIButton class]]) {
        UIButton *btn = (UIButton *)self;
        [btn setTitle:textStr forState:UIControlStateNormal];
        btn.titleLabel.font =[UIFont fontWithName:@"iconfont" size:fontSize];
        [btn setTitleColor:fontColor forState:UIControlStateNormal];
        [btn setTitleShadowColor:[UIColor clearColor] forState:UIControlStateNormal];
        
    }
    else if ([self isKindOfClass:[UILabel class]]) {
        
        UILabel *label = (UILabel *)self;
        label.font = [UIFont fontWithName:@"iconfont" size:fontSize];
        label.text = textStr;
        [label setTextColor:fontColor];
        label.shadowColor = [UIColor clearColor];
    }
    
}


- (UIImageView *) imageInNavController: (UINavigationController *) navController
{
    if ([[UIScreen mainScreen] respondsToSelector:@selector(scale)])
        UIGraphicsBeginImageContextWithOptions(navController.view.bounds.size, NO, [UIScreen mainScreen].scale);
    else
        UIGraphicsBeginImageContext(navController.view.bounds.size);
    
//    [self.layer setContentsScale:[[UIScreen mainScreen] scale]];
    
//    UIGraphicsBeginImageContextWithOptions(self.bounds.size, self.opaque, 1.0);
    [self.layer renderInContext:UIGraphicsGetCurrentContext()];
    
    CGContextSetInterpolationQuality(UIGraphicsGetCurrentContext(), kCGInterpolationHigh);
    UIImage * img = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    
    UIImageView *currentView = [[UIImageView alloc] initWithImage: img];
    
    //Fix the position to handle status bar and navigation bar
//    float yPosition = [navController calculateYPosition];
//    [currentView setFrame:CGRectMake(0, yPosition, currentView.frame.size.width, currentView.frame.size.height)];
    
    return currentView;
}

+ (UIView *)noDataViewWithView:(UIView *)view content:(NSString *)content
{
    UILabel *label = [[UILabel alloc] initWithFrame:CGRectMake(view.bounds.origin.x, view.bounds.origin.y, view.bounds.size.width, view.bounds.size.height - 100)];
    label.text = content;
    [label setFont:[UIFont systemFontOfSize:14]];
    [label setTextAlignment:NSTextAlignmentCenter];
    [label setBackgroundColor:[UIColor clearColor]];
    label.numberOfLines = 0;
    label.lineBreakMode = NSLineBreakByCharWrapping;
    [label setTextColor:[UIColor color666666]];
    
    
    UIView *noDataView = [[UIView alloc] initWithFrame:view.bounds];
    [noDataView addSubview:label];
    
    return noDataView;
}

+ (UIView *)noDataViewWithView:(UIView *)view
{
    UIView *nodataView = [UIView noDataViewWithView:view content:@"这里还什么都没有\n\n╮（﹀＿﹀）╭\n"];
    return nodataView;
}


- (UIViewController *)getViewController {
    for (UIView* next = [self superview]; next; next = next.superview) {
        UIResponder *nextResponder = [next nextResponder];
        if ([nextResponder isKindOfClass:[UIViewController class]]) {
            return (UIViewController *)nextResponder;
        }
    }
    return nil;
}

- (UINavigationController *)getNavController {
    for (UIView* next = [self superview]; next; next = next.superview) {
        UIResponder *nextResponder = [next nextResponder];
        if ([nextResponder isKindOfClass:[UINavigationController class]]) {
            return (UINavigationController *)nextResponder;
        }
    }
    return nil;
}

- (void)removeAllConstraint {
    [self removeConstraints:self.constraints];
    for (NSLayoutConstraint *constraint in self.superview.constraints) {
        if ([constraint.firstItem isEqual:self]) {
            [self.superview removeConstraint:constraint];
        }
    }
}

//判断当前正在显示的UIViewController
+ (UIViewController *)getCurrentVC
{
    UIViewController *result = nil;
    
    UIWindow * window = [[UIApplication sharedApplication] keyWindow];
    if (window.windowLevel != UIWindowLevelNormal)
    {
        NSArray *windows = [[UIApplication sharedApplication] windows];
        for(UIWindow * tmpWin in windows)
        {
            if (tmpWin.windowLevel == UIWindowLevelNormal)
            {
                window = tmpWin;
                break;
            }
        }
    }
    
    UIView *frontView = [[window subviews] objectAtIndex:0];
    id nextResponder = [frontView nextResponder];
    
    if ([nextResponder isKindOfClass:[UIViewController class]])
        result = nextResponder;
    else
        result = window.rootViewController;
    
    return result;
}
@end
