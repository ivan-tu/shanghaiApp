//
//  XZTabBarController.m
//  XZVientiane
//
//  Created by 崔逢举 on 2017/12/11.
//  Copyright © 2017年 崔逢举. All rights reserved.
//

#import "XZTabBarController.h"
//model
#import "ClientSettingModel.h"
//view
#import "LoadingView.h"
//tool
#import "SDWebImageManager.h"
#import "ClientJsonRequestManager.h"
#import "ClientNetInterface.h"
#import "HTMLCache.h"
#import <UMShare/UMShare.h>
#import <UMCommon/UMCommon.h>
#import "CustomTabBar.h"
#import <UserNotifications/UserNotifications.h>
#import <HybridSDK/HybridSDK.h>

//VC
#import "CFJClientH5Controller.h"
#import "XZNavigationController.h"
#import "XZBaseHead.h"

#define Scale  [UIScreen mainScreen].scale

@interface XZTabBarController ()<CustomTabBarDelegate,UITabBarControllerDelegate>
{
    NSUInteger KselectedIndex;
}

@property (strong, nonatomic) NSDictionary *dataDic;
@property (nonatomic,strong)NSMutableArray *sortList;

@end

@implementation XZTabBarController
- (NSMutableArray *)sortList {
    if (_sortList == nil) {
        _sortList = [NSMutableArray arrayWithCapacity:0];
    }
    return _sortList;
}
- (void)addNotif {
    WEAK_SELF;
    //HideTabBarNotif   ShowTabBarNotif  上滑显示下滑隐藏tabbar
    [[NSNotificationCenter defaultCenter] addObserverForName:@"HideTabBarNotif" object:nil queue:[NSOperationQueue mainQueue] usingBlock:^(NSNotification *note) {
        STRONG_SELF;
        [UIView animateWithDuration:0.5 animations:^{
            NSNumber *scrollHide = [[NSUserDefaults standardUserDefaults] objectForKey:@"TabBarHideWhenScroll"];
            if (scrollHide.integerValue == 1) {
                self.tabBar.frame = CGRectMake(self.tabBar.frame.origin.x, [UIScreen mainScreen].bounds.size.height, self.tabBar.frame.size.width, self.tabBar.frame.size.height);
            }
        }];
    }];
    
    [[NSNotificationCenter defaultCenter] addObserverForName:@"ShowTabBarNotif" object:nil queue:[NSOperationQueue mainQueue] usingBlock:^(NSNotification *note) {
        STRONG_SELF;
        [UIView animateWithDuration:0.5 animations:^{
            NSNumber *scrollHide = [[NSUserDefaults standardUserDefaults] objectForKey:@"TabBarHideWhenScroll"];
            if (scrollHide.integerValue == 1) {
                self.tabBar.frame = CGRectMake(self.tabBar.frame.origin.x, [UIScreen mainScreen].bounds.size.height - 49, self.tabBar.frame.size.width, self.tabBar.frame.size.height);
            }
        }];
    }];
    
    //首页加载完成后才显示tabbar界面
    [[NSNotificationCenter defaultCenter] addObserverForName:@"showTabviewController" object:nil queue:[NSOperationQueue mainQueue] usingBlock:^(NSNotification *note) {
        STRONG_SELF;
        if ([[UIApplication sharedApplication].keyWindow viewWithTag:2001]) {
            //移除遮罩视图
            dispatch_async(dispatch_get_main_queue(), ^(void) {
                __block UIView *View = [[UIApplication sharedApplication].keyWindow viewWithTag:2001];
                View.alpha = 1.0;
                self.view.hidden = NO;
                [UIView animateWithDuration:0.3 animations:^{
                    View.alpha = 0.0;
                } completion:^(BOOL finished) {
                    [View removeFromSuperview];
                    View.alpha = 1.0;
                }];
            });
        }
    }];
    
}

- (void)viewDidLoad {
    [super viewDidLoad];
    KselectedIndex = 0;
    [self addNotif];
    self.delegate = self;
    [UIApplication sharedApplication].statusBarStyle = UIStatusBarStyleDefault;
    self.view.hidden = YES;
}
- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    //    CustomTabBar *tabBar = [[CustomTabBar alloc] init];
    //    tabBar.tabbardelegate = self;
    //    // KVC：如果要修系统的某些属性，但被设为readOnly，就是用KVC，即setValue：forKey：。
    //    [self setValue:tabBar forKey:@"tabBar"];
    //    UINavigationController *navi = self.viewControllers[self.selectedIndex];
    //    if(navi && navi.viewControllers.count > 1) {
    //        tabBar.hidden = YES;
    //    }
    //    if ([[NSUserDefaults standardUserDefaults] objectForKey:@"tabbarBgColor"]) {
    //        self.tabBar.barTintColor = [UIColor colorWithHexString:[[NSUserDefaults standardUserDefaults] objectForKey:@"tabbarBgColor"]];
    //    }
}

//更新Tabbar界面
- (void)reloadTabbarInterface {
    NSLog(@"CFJClientH5Controller - reloadTabbarInterface 开始");
    WEAK_SELF;
    [[HybridManager shareInstance] reloadTabbarInterfaceSuccess:^(NSArray * _Nonnull tabs, NSString * _Nonnull tabItemTitleSelectColor, NSString * _Nonnull tabbarBgColor) {
        NSLog(@"CFJClientH5Controller - reloadTabbarInterface 回调 - tabs: %@", tabs);
        STRONG_SELF;
        NSMutableArray *tabbarItems = [NSMutableArray arrayWithCapacity:2];
        for (NSDictionary *dic in tabs) {
            CFJClientH5Controller *homeVC = [[CFJClientH5Controller alloc] init];
            if ([[dic objectForKey:@"isCheck"] isEqualToString:@"1"]) {
                homeVC.isCheck = YES;
            }
            homeVC.isTabbarShow = YES;
            homeVC.pinUrl =  [dic objectForKey:@"url"];
            UINavigationController *nav = [[UINavigationController alloc] initWithRootViewController:homeVC];
            nav.navigationBar.translucent = NO;
            UIImage *image = [UIImage imageNamed:[dic objectForKey:@"icon"]];
            image = [image scaleToSize:CGSizeMake(45, 45)];
            [nav.tabBarItem setTitleTextAttributes:@{NSForegroundColorAttributeName :[UIColor colorWithHexString:tabItemTitleSelectColor]} forState:UIControlStateSelected];
            UIImage *tabImage = [UIImage imageWithCGImage:image.CGImage scale:2.0 orientation:UIImageOrientationUp];
            nav.tabBarItem.image = [tabImage imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal];
            UIImage *selectedImage = [UIImage imageNamed:[dic objectForKey:@"activeIcon"]];
            selectedImage = [selectedImage scaleToSize:CGSizeMake(45, 45)];
            UIImage *selectedTabImage = [UIImage imageWithCGImage:selectedImage.CGImage scale:2.0 orientation:UIImageOrientationUp];
            nav.tabBarItem.selectedImage =  [selectedTabImage imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal];
            nav.tabBarItem.title = [dic objectForKey:@"name"];
            [tabbarItems addObject:nav];
        }
        self.tabBar.translucent = NO;
        self.tabBar.barTintColor = [UIColor colorWithHexString:tabbarBgColor];
        self.viewControllers = tabbarItems;
    }];
}
#pragma mark - <UITabBarControllerDelegate>
//tabarController 代理
- (void)tabBarController:(UITabBarController *)tabBarController didSelectViewController:(UIViewController *)viewController {
    [[NSNotificationCenter defaultCenter]postNotificationName:@"refreshCurrentViewController" object:nil];
    //如果底部导航数量大于1点击tabBarItem动画
    [self tabBarButtonClick:[self getTabBarButton]];
}
//获取当前选中tab
- (UIControl *)getTabBarButton{
    if (self.sortList.count == 0) {
        NSMutableArray *tabBarButtons = [[NSMutableArray alloc]initWithCapacity:0];
        for (UIView *child in self.tabBar.subviews) {
            Class class = NSClassFromString(@"UITabBarButton");
            if (![child isKindOfClass:class]) {
                continue;
            }
            else{
                [tabBarButtons addObject:child];
            }
        }
        int number = (int)tabBarButtons.count;
        self.sortList = [self QuickSort:tabBarButtons StartIndex:0 EndIndex: number- 1];
    }
    UIControl *tabBarButton = [self.sortList safeObjectAtIndex:self.selectedIndex];
    return tabBarButton;
}
#pragma mark - 点击动画
- (void)tabBarButtonClick:(UIControl *)tabBarButton
{
    for (UIView *imageView in tabBarButton.subviews) {
        if ([imageView isKindOfClass:NSClassFromString(@"UITabBarSwappableImageView")]) {
            //需要实现的帧动画,这里根据自己需求改动
            CAKeyframeAnimation *animation = [CAKeyframeAnimation animation];
            animation.keyPath = @"transform.scale";
            animation.values = @[@1.0,@1.1,@1.3,@0.9,@1.0];
            animation.duration = 0.3;
            animation.calculationMode = kCAAnimationCubic;
            //添加动画
            [imageView.layer addAnimation:animation forKey:nil];
        }
    }
}
- (void)tabBarDidClickPlusButton:(CustomTabBar *)tabBar {
    [[NSNotificationCenter defaultCenter]postNotificationName:@"openServiceCenter" object:nil];
}
//快速排序
-(NSMutableArray *)QuickSort:(NSMutableArray *)list StartIndex:(int)startIndex EndIndex:(int)endIndex{
    
    if(startIndex >= endIndex)return nil;
    
    UIView * temp = [list objectAtIndex:startIndex];
    int tempIndex = startIndex; //临时索引 处理交换位置(即下一个交换的对象的位置)
    
    for(int i = startIndex + 1 ; i <= endIndex ; i++){
        
        UIView *t = [list objectAtIndex:i];
        
        if(temp.frame.origin.x > t.frame.origin.x){
            
            tempIndex = tempIndex + 1;
            
            [list exchangeObjectAtIndex:tempIndex withObjectAtIndex:i];
        }
    }
    [list exchangeObjectAtIndex:tempIndex withObjectAtIndex:startIndex];
    [self QuickSort:list StartIndex:startIndex EndIndex:tempIndex -1];
    [self QuickSort:list StartIndex:tempIndex+1 EndIndex:endIndex];
    return list;
}

@end
