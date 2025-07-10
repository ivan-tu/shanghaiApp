//
//  TYViewController.m
//  TuiYa
//
//  Created by CFJ on 15/6/14.
//  Copyright (c) 2015年 tuweia. All rights reserved.
//

#import "XZViewController.h"
#import <UMCommon/MobClick.h>
#import "UIView+addition.h"
#import "XZIcomoonDefine.h"

@implementation XZViewController

- (void)dealloc {
    
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    NSLog(@"%@ 生命周期dealloc",[NSString stringWithUTF8String:object_getClassName(self)]);
}

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
    NSLog(@"viewAppear : %@",NSStringFromClass([self class]));
}

- (void)viewDidDisappear:(BOOL)animated {
    [super viewDidDisappear:animated];
}

- (void)viewDidLoad {
    
    [super viewDidLoad];
    
    self.view.backgroundColor= [UIColor tyBgViewColor];
    self.automaticallyAdjustsScrollViewInsets =  NO;
    [self createNavBar];
    
    UITapGestureRecognizer *ges = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(titleLableTapped:)];
    [self.navBar.titleLable addGestureRecognizer:ges];
    self.navBar.titleLable.userInteractionEnabled = YES;
    [self.navBar.leftBarButton setTitleImageWith:16 andColor:[UIColor color000000] andText:Icon_arrow_l];
    self.navBar.hidden = YES;
}

-(void)viewWillAppear:(BOOL)animated {
    
    [super viewWillAppear:animated];
    NSLog(@"%@ 生命周期appear",[NSString stringWithUTF8String:object_getClassName(self)]);
    
    //友盟页面统计
    NSString* cName = [NSString stringWithFormat:@"%@",self.navBar.titleLable.text, nil];
    [MobClick beginLogPageView:cName];
}

-(void)viewWillDisappear:(BOOL)animated{
    [super viewWillDisappear:animated];
    NSLog(@"%@ 生命周期disappear",[NSString stringWithUTF8String:object_getClassName(self)]);
    
    //友盟页面统计
    NSString* cName = [NSString stringWithFormat:@"%@",self.navBar.titleLable.text, nil];
    [MobClick endLogPageView:cName];
}

#pragma mark 创建导航栏
- (void)createNavBar {
    self.navigationController.navigationBarHidden = YES;
    self.navBar = [[XZNavBar alloc]init];
    [self.view addSubview:self.navBar];
    [self.navBar updataFrame];
    [self.navBar.leftBarButton addTarget:self action:@selector(leftNavButtonAction:) forControlEvents:UIControlEventTouchUpInside];
    [self.navBar.rightBarButton addTarget:self action:@selector(rightNavButtonAction:) forControlEvents:UIControlEventTouchUpInside];
}
#pragma mark - Methods -
- (void)leftNavButtonAction:(UIButton*)sender {
    [self.navigationController popViewControllerAnimated:YES];
}

- (void)rightNavButtonAction:(UIButton*)sender {
    NSLog(@"right");
}

- (void)titleLableTapped:(UIGestureRecognizer *)gesture {
}

//- (BOOL)shouldAutorotate {
//    return YES;
//}

//-(UIInterfaceOrientationMask)supportedInterfaceOrientations {
//    if (ISIPAD) {
//        return  UIInterfaceOrientationMaskLandscape;
//    }
//    else {
//        return  UIInterfaceOrientationMaskPortrait;
//    }
//}

- (void)didReceiveMemoryWarning {
    NSLog(@"%@ 内存警告",[NSString stringWithUTF8String:object_getClassName(self)]);

}

@end
