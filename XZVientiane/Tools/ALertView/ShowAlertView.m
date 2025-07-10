//
//  ShowAlertView.m
//  XZVientiane
//
//  Created by 崔逢举 on 2018/5/17.
//  Copyright © 2018年 崔逢举. All rights reserved.
//

#import "ShowAlertView.h"
#import "EasyShowUtils.h"
#import "UIView+EasyShowExt.h"
#import "EasyShowLabel.h"
const CGFloat EasyShowAnimationTime = 0.1f ;    //动画时间
@interface EasyShowAlertItem : NSObject
@property (nonatomic,strong)NSString *title ;
@property (nonatomic,assign)ShowAlertItemType itemTpye ;
@property (nonatomic,strong)alertItemCallback callback ;
@end
@implementation EasyShowAlertItem
@end

typedef NS_ENUM(NSUInteger , alertShowType) {
    alertShowTypeAlert,
    alertShowTypeActionSheet
};

@interface ShowAlertView()<CAAnimationDelegate>
@property (nonatomic,assign)alertShowType alertShowType;
@property (nonatomic,strong)NSMutableArray<EasyShowAlertItem *> *alertItemArray;
@property (nonatomic,strong)NSMutableArray *alertButtonArray;
@property (nonatomic,strong)UIWindow *alertWindow;
@property (nonatomic,strong)UIView *alertBgView;
@property (nonatomic,strong)UIWindow *oldKeyWindow;
/**
 模态弹窗标题
 */
@property (nonatomic,strong)NSString *alertShowTitle;
/**
 模态弹窗标题label
 */
@property (nonatomic,strong)UILabel *alertTitleLabel;
/**
 模态弹窗内容label
 */
@property (nonatomic,strong)UILabel *alertMessageLabel;
/**
 模态弹窗内容
 */
@property (nonatomic,strong)NSString *alertShowMessage;


@end
@implementation ShowAlertView
#pragma mark -------- lazy loadding
- (UIView *)alertBgView
{
    if (nil == _alertBgView) {
        _alertBgView = [[UIView alloc]init];
        _alertBgView.backgroundColor =[UIColor colorWithHexString:@"#E4E4E4"];
        _alertBgView.autoresizingMask = UIViewAutoresizingFlexibleWidth|UIViewAutoresizingFlexibleHeight;
        UIPanGestureRecognizer *panGesture = [[UIPanGestureRecognizer alloc] initWithTarget:self action:@selector(bgViewPan:)];
        [_alertBgView addGestureRecognizer:panGesture];
        UITapGestureRecognizer *tapGesture = [[UITapGestureRecognizer alloc]initWithTarget:self action:@selector(bgViewTap:)];
        [_alertBgView addGestureRecognizer:tapGesture];
    }
    return _alertBgView ;
}
- (UIWindow *)alertWindow {
    if (nil == _alertWindow) {
        _alertWindow = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
        _alertBgView.autoresizingMask = UIViewAutoresizingFlexibleWidth|UIViewAutoresizingFlexibleHeight ;
        _alertWindow.backgroundColor = [[UIColor blackColor] colorWithAlphaComponent:0.3];
        _alertWindow.hidden = NO ;
    }
    
    return _alertWindow;
}
- (UILabel *)alertTitleLabel
{
    if (nil == _alertTitleLabel) {
        _alertTitleLabel = [[EasyShowLabel alloc] initWithContentInset:UIEdgeInsetsMake(10, 30, 10, 30)];
        _alertTitleLabel.textAlignment = NSTextAlignmentCenter;
        _alertTitleLabel.backgroundColor = [UIColor whiteColor];
        _alertTitleLabel.font = [UIFont boldSystemFontOfSize:17];
        _alertTitleLabel.textColor = [UIColor blackColor];
        _alertTitleLabel.numberOfLines = 0;
    }
    return _alertTitleLabel ;
}
- (UILabel *)alertMessageLabel
{
    if (nil == _alertMessageLabel) {
        _alertMessageLabel = [[EasyShowLabel alloc] initWithContentInset:UIEdgeInsetsMake(20, 30, 20, 30)];
        _alertMessageLabel.textAlignment = NSTextAlignmentCenter;
        _alertMessageLabel.backgroundColor = [UIColor whiteColor];
        _alertMessageLabel.font = [UIFont systemFontOfSize:14];
        _alertMessageLabel.textColor = [UIColor grayColor];
        _alertMessageLabel.numberOfLines = 0;
    }
    return _alertMessageLabel ;
}
- (NSMutableArray *)alertButtonArray
{
    if (nil == _alertButtonArray) {
        _alertButtonArray = [NSMutableArray arrayWithCapacity:3];
    }
    return _alertButtonArray ;
}
+ (instancetype)showAlertWithTitle:(NSString *)title
                                       message:(NSString *)message {
    ShowAlertView *showView = [[ShowAlertView alloc]initWithFrame:[UIScreen mainScreen].bounds];
    showView.alertShowTitle = title;
    showView.alertShowMessage = message ;
    showView.alertShowType = alertShowTypeAlert ;
    showView.alertItemArray = [NSMutableArray arrayWithCapacity:3];
    return showView ;
}
+ (instancetype)showActionSheet {
    ShowAlertView *showView = [[ShowAlertView alloc]initWithFrame:[UIScreen mainScreen].bounds];
    showView.alertShowType = alertShowTypeActionSheet ;
    showView.alertItemArray = [NSMutableArray arrayWithCapacity:3];
    return showView ;
}
- (void)addItemWithTitle:(NSString *)title
                itemType:(ShowAlertItemType)itemType
                callback:(alertItemCallback)callback {
    EasyShowAlertItem *item = [[EasyShowAlertItem alloc]init];
    item.title = title ;
    item.itemTpye = itemType ;
    item.callback = callback ;
    [self.alertItemArray addObject:item];
}
- (void)show
{
    self.oldKeyWindow = [UIApplication sharedApplication].keyWindow ;
    [self.alertWindow addSubview:self];
    [self.alertWindow makeKeyAndVisible];
    [self addSubview:self.alertBgView];
    [self.alertBgView addSubview:self.alertTitleLabel];
    [self.alertBgView addSubview:self.alertMessageLabel];
    self.alertTitleLabel.text = self.alertShowTitle ;
    self.alertMessageLabel.text = self.alertShowMessage;
    for (int i = 0; i < self.alertItemArray.count; i++) {
        UIButton *button = [self alertButtonWithIndex:i];
        [self.alertBgView addSubview:button];
    }
    [self layoutAlertSubViews];
    [self showStartAnimationWithType:alertAnimationTypeFade completion:nil];
    
}
- (UIButton *)alertButtonWithIndex:(long)index
{
    EasyShowAlertItem *item = self.alertItemArray[index];
    
    UIButton *button = [UIButton buttonWithType:UIButtonTypeCustom];
    button.tag = index;
    button.adjustsImageWhenHighlighted = NO;
    [button setTitle:item.title forState:UIControlStateNormal];
    [button addTarget:self action:@selector(buttonClick:) forControlEvents:UIControlEventTouchUpInside];
    
    UIImage *bgImage = [EasyShowUtils imageWithColor:[UIColor whiteColor]];
    UIImage *bgHighImage = [EasyShowUtils imageWithColor:[[UIColor whiteColor]colorWithAlphaComponent:0.7] ];
    [button setBackgroundImage:bgImage forState:UIControlStateNormal];
    [button setBackgroundImage:bgHighImage forState:UIControlStateHighlighted];
    
    UIFont *textFont = [UIFont systemFontOfSize:17] ;
    UIColor *textColor = [UIColor blackColor] ;
    switch (item.itemTpye) {
        case ShowAlertItemTypeRed: {
            textColor = [UIColor redColor];
        }break ;
        case ShowAlertItemTypeBlodRed:{
            textColor = [UIColor redColor];
            textFont  = [UIFont boldSystemFontOfSize:17] ;
        }break ;
        case ShowAlertItemTypeBlue:{
            textColor = [UIColor blueColor];
        }break ;
        case ShowAlertItemTypeBlodBlue:{
            textColor = [UIColor blueColor];
            textFont = [UIFont boldSystemFontOfSize:17] ;
        }break ;
        case ShowAlertItemTypeBlack:{
            
        }break ;
        case ShowAlertItemTypeBlodBlack:{
            textFont = [UIFont boldSystemFontOfSize:17] ;
        }break ;
        case ShowStatusTextTypeCustom:{
            textColor = [UIColor colorWithHexString:@"#24A302"];
        }break ;
    }
    [button setTitleColor:textColor forState:UIControlStateNormal];
    [button setTitleColor:[textColor colorWithAlphaComponent:0.2] forState:UIControlStateHighlighted];
    [button.titleLabel setFont:textFont] ;
    
    [self.alertButtonArray addObject:button];
    
    return button;
}

- (void)alertWindowTap
{
    void (^completion)(void) = ^{
        [self.oldKeyWindow makeKeyWindow];
        [self.subviews makeObjectsPerformSelector:@selector(removeFromSuperview)];
        [self removeFromSuperview];
        [self.alertWindow.subviews makeObjectsPerformSelector:@selector(removeFromSuperview)];
        self.alertWindow.hidden = YES ;
        [self.alertWindow removeFromSuperview];
        self.alertWindow = nil;
    };
    [self showEndAnimationWithType:alertAnimationTypeFade
                        completion:completion];
}
- (void)layoutAlertSubViews
{
    CGFloat bgViewMaxWidth = self.alertShowType==alertShowTypeAlert ?  SCREEN_WIDTH_S*0.85 : SCREEN_WIDTH_S ;
    CGFloat buttonHeight = 50 ;
    
    CGSize titleLabelSize = [self.alertTitleLabel sizeThatFits:CGSizeMake(bgViewMaxWidth, MAXFLOAT)];
    if (ISEMPTY_S(self.alertTitleLabel.text)) {
        titleLabelSize.height = 0;
    }
    self.alertTitleLabel.frame = CGRectMake(0, 0, bgViewMaxWidth, titleLabelSize.height);
    
    CGSize messageLabelSize = [self.alertMessageLabel sizeThatFits:CGSizeMake(bgViewMaxWidth, MAXFLOAT)];
    if (ISEMPTY_S(self.alertMessageLabel.text)) {
        messageLabelSize.height = 0 ;
    }
    self.alertMessageLabel.frame = CGRectMake(0, self.alertTitleLabel.bottom- 1, bgViewMaxWidth, messageLabelSize.height) ;
    
    CGFloat totalHeight = self.alertMessageLabel.bottom + 0.5 ;
    CGFloat btnCount = self.alertButtonArray.count ;
    
    if (self.alertShowType==alertShowTypeAlert && btnCount==2) {
        
        for (int i = 0; i < btnCount ; i++) {
            UIButton *tempButton = self.alertButtonArray[i];
            
            CGFloat tempButtonX = i ? (bgViewMaxWidth/2+0.5) : 0 ;
            CGFloat tempButtonY = self.alertMessageLabel.bottom +0.5 ;
            [tempButton setFrame:CGRectMake(tempButtonX, tempButtonY, bgViewMaxWidth/2, buttonHeight)];
            totalHeight = tempButton.bottom ;
        }
    }
    else{
        for (int i = 0; i < btnCount ; i++) {
            UIButton *tempButton = self.alertButtonArray[i];
            CGFloat lineHeight = ((i==btnCount-1)&&self.alertShowType==alertShowTypeActionSheet) ? 8 : 0.5 ;
            CGFloat tempButtonY = self.alertMessageLabel.bottom + lineHeight + i*(buttonHeight+ 0.5) ;
            if ((i==btnCount-1)&&self.alertShowType==alertShowTypeActionSheet && ISIPHONE_X_S) {
                [tempButton setFrame:CGRectMake(0, tempButtonY, bgViewMaxWidth, 67)];
            }
            else {
                [tempButton setFrame:CGRectMake(0, tempButtonY, bgViewMaxWidth, buttonHeight)];

            }
            totalHeight = tempButton.bottom ;
        }
    }
    
    CGFloat actionShowAddSafeHeiht = self.alertShowType==alertShowTypeActionSheet ? kEasyShowSafeBottomMargin_S : 0 ;
    self.alertBgView.bounds = CGRectMake(0, 0, bgViewMaxWidth, totalHeight);
    
    switch (self.alertShowType) {
        case alertShowTypeAlert:
        {
            self.alertBgView.center = self.center ;
            UIColor *boderColor = [self.alertBgView.backgroundColor colorWithAlphaComponent:0.2];
            [self.alertBgView setRoundedCorners:UIRectCornerAllCorners
                                    borderWidth:0.5
                                    borderColor:boderColor
                                     cornerSize:CGSizeMake(8,8)];//需要添加阴影
        }
            break;
        case alertShowTypeActionSheet:
        {
            self.alertBgView.center = CGPointMake(SCREEN_WIDTH_S/2, SCREEN_HEIGHT_S-(totalHeight/2));
        }break ;
        default:
            break;
    }
    
}
- (void)showStartAnimationWithType:(alertAnimationType)type completion:(void(^)(void))completion
{
    if (self.alertShowType == alertShowTypeActionSheet) {
        self.alertBgView.top = SCREEN_HEIGHT_S ;
        [UIView animateWithDuration:EasyShowAnimationTime animations:^{
            self.alertBgView.top = (SCREEN_HEIGHT_S-self.alertBgView.height)-5 ;
        } completion:^(BOOL finished) {
            [UIView animateWithDuration:0.05 animations:^{
                self.alertBgView.top = (SCREEN_HEIGHT_S-self.alertBgView.height) ;
            } completion:^(BOOL finished) {
            }];
        }];
        return ;
    }
    
    switch (type) {
        case alertAnimationTypeFade:
        {
            self.alertBgView.alpha = 0 ;
            [UIView beginAnimations:nil context:NULL];
            [UIView setAnimationDuration:EasyShowAnimationTime];
            self.alertBgView.alpha = 1.0f;
            [UIView commitAnimations];
        }break;
        case alertAnimationTypeZoom:
        {
            self.alertBgView.alpha = 0 ;
            self.alertBgView.transform = CGAffineTransformConcat(CGAffineTransformIdentity, CGAffineTransformMakeScale(3, 3));
            [UIView beginAnimations:nil context:NULL];
            [UIView setAnimationDuration:EasyShowAnimationTime];
            self.alertBgView.alpha = 1.0f;
            self.alertBgView.transform = CGAffineTransformIdentity;
            [UIView commitAnimations];
        }break ;
        case alertAnimationTypeBounce:
        {
            CAKeyframeAnimation *popAnimation = [CAKeyframeAnimation animationWithKeyPath:@"transform"];
            popAnimation.duration = EasyShowAnimationTime;
            popAnimation.values = @[[NSValue valueWithCATransform3D:CATransform3DMakeScale(0.01f, 0.01f, 1.0f)],
                                    [NSValue valueWithCATransform3D:CATransform3DMakeScale(1.05f, 1.05f, 1.0f)],
                                    [NSValue valueWithCATransform3D:CATransform3DMakeScale(0.95f, 0.95f, 1.0f)],
                                    [NSValue valueWithCATransform3D:CATransform3DIdentity]];
            popAnimation.keyTimes = @[@0.2f, @0.5f, @0.75f, @1.0f];
            popAnimation.timingFunctions = @[[CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut],
                                             [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut],
                                             [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut]];
            [self.alertBgView.layer addAnimation:popAnimation forKey:nil];
        }break ;
        case alertAnimationTypePush:
        {
            self.alertBgView.top = SCREEN_HEIGHT_S ;
            [UIView animateWithDuration:EasyShowAnimationTime animations:^{
                self.alertBgView.top = (SCREEN_HEIGHT_S-self.alertBgView.height)/2-5 ;
            } completion:^(BOOL finished) {
                [UIView animateWithDuration:0.05 animations:^{
                    self.alertBgView.top = (SCREEN_HEIGHT_S-self.alertBgView.height)/2 ;
                } completion:^(BOOL finished) {
                }];
            }];
        }break ;
        default:
            break;
    }
}
- (void)showEndAnimationWithType:(alertAnimationType)type completion:(void(^)(void))completion
{
    if (self.alertShowType == alertShowTypeActionSheet) {
        [UIView animateWithDuration:EasyShowAnimationTime animations:^{
            self.alertBgView.top = SCREEN_HEIGHT_S ;
        } completion:^(BOOL finished) {
            if (completion) {
                completion() ;
            }
        }];
        return ;
    }
    
    switch (type) {
        case alertAnimationTypeFade:
        {
            [UIView animateWithDuration:EasyShowAnimationTime
                                  delay:0
                                options:UIViewAnimationOptionCurveEaseIn
                             animations:^{
                                 self.alpha = .0f;
                                 self.transform = CGAffineTransformIdentity;
                             } completion:^(BOOL finished) {
                                 if (completion) {
                                     completion() ;
                                 }
                             }];
        }break;
        case alertAnimationTypeZoom:
        {
            [UIView animateWithDuration:EasyShowAnimationTime
                                  delay:0 options:UIViewAnimationOptionCurveEaseIn
                             animations:^{
                                 self.alertBgView.alpha = 0 ;
                                 self.alertBgView.transform = CGAffineTransformMakeScale(0.01, 0.01);
                             } completion:^(BOOL finished) {
                                 if (completion) {
                                     completion() ;
                                 }
                             }];
        }break ;
        case alertAnimationTypeBounce:
        {
            CABasicAnimation *bacAnimation = [CABasicAnimation animationWithKeyPath:@"transform.scale"];
            bacAnimation.duration = EasyShowAnimationTime ;
            bacAnimation.beginTime = .0;
            bacAnimation.timingFunction = [CAMediaTimingFunction functionWithControlPoints:0.4f :0.3f :0.5f :-0.5f];
            bacAnimation.fromValue = [NSNumber numberWithFloat:1.0f];
            bacAnimation.toValue = [NSNumber numberWithFloat:0.0f];
            
            CAAnimationGroup *animationGroup = [CAAnimationGroup animation];
            animationGroup.animations = @[bacAnimation];
            animationGroup.duration =  bacAnimation.duration;
            animationGroup.removedOnCompletion = NO;
            animationGroup.fillMode = kCAFillModeForwards;
            
            animationGroup.delegate = self ;
            [animationGroup setValue:completion forKey:@"handler"];
            
            [self.alertBgView.layer addAnimation:animationGroup forKey:nil];
        }break ;
        case alertAnimationTypePush:
        {
            [UIView animateWithDuration:EasyShowAnimationTime animations:^{
                self.alertBgView.top = SCREEN_HEIGHT_S ;
            } completion:^(BOOL finished) {
                if (completion) {
                    completion() ;
                }
            }];
        }break ;
        default:
        {
            if (completion) {
                completion();
            }
        }
            break;
    }
}
- (void)buttonClick:(UIButton *)button
{
    EasyShowAlertItem *item = self.alertItemArray[button.tag];
    if (item.callback) {
        item.callback(self);
    }
    [self alertWindowTap];
}
- (void)bgViewPan:(UIPanGestureRecognizer *)recognizer
{
    CGPoint location = [recognizer locationInView:self];
    
    UIButton *tempButton = nil;
    for (int i = 0; i < self.alertButtonArray.count; i++) {
        UIButton *itemBtn = self.alertButtonArray[i];
        CGRect btnFrame = [itemBtn convertRect:itemBtn.bounds toView:self];
        if (CGRectContainsPoint(btnFrame, location)) {
            itemBtn.highlighted = YES;
            tempButton = itemBtn;
        } else {
            itemBtn.highlighted = NO;
        }
    }
    if (tempButton && recognizer.state == UIGestureRecognizerStateEnded) {
        [self buttonClick:tempButton];
    }
}
- (void)bgViewTap:(UIPanGestureRecognizer *)recognizer
{
    
}
@end
