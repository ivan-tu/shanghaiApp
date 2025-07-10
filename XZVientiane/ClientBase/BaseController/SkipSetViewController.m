//
//  SkipSetViewController.m
//  XiangZhan
//
//  Created by yiliu on 16/5/30.
//  Copyright © 2016年 tuweia. All rights reserved.
//

#import "SkipSetViewController.h"
#import "SkipSetTableViewCell.h"
#import "NSString+addition.h"
#import "UIView+addition.h"
#import "XZIcomoonDefine.h"
#import "SVStatusHUD.h"
@interface SkipSetViewController ()<UITableViewDelegate,UITableViewDataSource>
@property (strong, nonatomic) NSArray *contentAry;
@property (strong, nonatomic) NSArray *picAry;
@end

@implementation SkipSetViewController

- (void)viewDidLoad {
    [super viewDidLoad];
//    self.picAry = @[icon_iosBrowser,icon_copyLink,Icon_share,Icon_refresh,Icon_close];
//    self.contentAry = @[@"Safari打开",@"复制链接",@"分享",@"刷新",@"取消"];
    
    self.picAry = @[icon_iosBrowser,icon_copyLink,Icon_refresh,Icon_close];
    self.contentAry = @[@"Safari打开",@"复制链接",@"刷新",@"取消"];
    self.view.backgroundColor = [UIColor clearColor];
    self.bgViewBtn = [UIButton buttonWithType:UIButtonTypeCustom];
    self.bgViewBtn.frame = CGRectMake(0, [UIScreen mainScreen].bounds.size.height, [UIScreen mainScreen].bounds.size.width, [UIScreen mainScreen].bounds.size.height);
    [self.bgViewBtn addTarget:self action:@selector(bgViewBtnClick:) forControlEvents:UIControlEventTouchUpInside];
    self.bgViewBtn.backgroundColor = [UIColor clearColor];
    [self.view addSubview:self.bgViewBtn];
    
    self.shadowView = [[UIView alloc] init];
    self.shadowView.frame = CGRectMake(0, [UIScreen mainScreen].bounds.size.height - self.contentAry.count * 48, [UIScreen mainScreen].bounds.size.width, self.contentAry.count * 48);
    [[self.shadowView layer] setShadowOpacity:0.15];
    [[self.shadowView layer] setShadowColor:[UIColor blackColor].CGColor];
    [self.bgViewBtn addSubview:self.shadowView];
    
    self.tableView = [[UITableView alloc] init];
    self.tableView.frame = CGRectMake(0, 0, [UIScreen mainScreen].bounds.size.width, self.contentAry.count * 48);
    self.tableView.backgroundColor = [UIColor whiteColor];
    self.tableView.delegate = self;
    self.tableView.dataSource = self;
    [self.tableView registerClass:[SkipSetTableViewCell class] forCellReuseIdentifier:[SkipSetTableViewCell cellIdentifier]];
    [self.shadowView addSubview:self.tableView];

}

- (void)bgViewBtnClick:(UIButton *)sender {
    
}

- (void)showInCurrentVC {
    UIWindow *keyWindow = [[UIApplication sharedApplication] keyWindow];
    if (!keyWindow) {
        keyWindow = [[[UIApplication sharedApplication] windows] firstObject];
    }
    
    [keyWindow addSubview:self.view];
    [UIView animateWithDuration:0.3 animations:^{
        self.bgViewBtn.frame = CGRectMake(0, 0, [UIScreen mainScreen].bounds.size.width, [UIScreen mainScreen].bounds.size.height);
        self.view.backgroundColor = [UIColor colorWithWhite:1 alpha:0.8];
        self.tableView.backgroundColor = [UIColor whiteColor];
    } completion:^(BOOL finished) {
    }];
}

- (void)dismissInCurrentVC {
    [UIView animateWithDuration:0.3 animations:^{
        self.view.backgroundColor = [UIColor clearColor];
        self.tableView.backgroundColor = [UIColor clearColor];
        self.bgViewBtn.frame = CGRectMake(0, [UIScreen mainScreen].bounds.size.height, [UIScreen mainScreen].bounds.size.width, [UIScreen mainScreen].bounds.size.height);
    } completion:^(BOOL finished) {
        [self.view removeFromSuperview];
    }];
}

#pragma mark - UITableViewDelegate -

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView{
    
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section{
    return self.contentAry.count;
}

- (CGFloat)tableView:(UITableView *)tableView heightForHeaderInSection:(NSInteger)section {
    return 0.1;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    return 48.0f;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    SkipSetTableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:[SkipSetTableViewCell cellIdentifier]];
    cell.selectionStyle = UITableViewCellSelectionStyleNone;
    self.tableView.separatorStyle = UITableViewCellSeparatorStyleNone;
    cell.picLab.frame = CGRectMake(14, 16, 16, 16);
    cell.contentLab.frame = CGRectMake(64, 13, 300, 22);
    if(indexPath.row == self.picAry.count - 1) {
        [cell.picLab setTitleImageWith:14.0 andColor:[UIColor color000000] andText:self.picAry[indexPath.row]];
    } else {
        [cell.picLab setTitleImageWith:16.0 andColor:[UIColor color000000] andText:self.picAry[indexPath.row]];
    }
    
    cell.contentLab.text = self.contentAry[indexPath.row];
    cell.contentLab.font = [UIFont systemFontOfSize:16.0];
    cell.contentLab.textColor = [UIColor color333333];
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    
    switch (indexPath.row) {
        case 0:
            [[UIApplication sharedApplication] openURL:[NSURL URLWithString:self.linkStr]];
            break;
        case 1:
            [NSString copyLink:self.linkStr];
            [SVStatusHUD showWithMessage:@"复制链接成功"];
            break;
//        case 2:
//            [[NSNotificationCenter defaultCenter] postNotificationName:@"showShareView" object:nil];
//            break;
        case 2:
            [[NSNotificationCenter defaultCenter] postNotificationName:@"refreshSkipH5VC" object:nil];
            break;
        case 3:
            break;
        default:
            break;
    }
    
    [self dismissInCurrentVC];
}

- (void)copyLink:(NSString *)linkStr
{
    UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
    pasteboard.string = linkStr;
    [SVStatusHUD showWithMessage:@"复制链接成功"];
    
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
