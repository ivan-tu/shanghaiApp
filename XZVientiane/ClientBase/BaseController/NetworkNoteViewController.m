//
//  NetworkNoteViewController.m
//  XiangZhanClient
//
//  Created by yiliu on 16/10/13.
//  Copyright © 2016年 TuWeiA. All rights reserved.
//

#import "NetworkNoteViewController.h"

@interface NetworkNoteViewController ()

@end

@implementation NetworkNoteViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    UIButton *noteBt = [UIButton buttonWithType:UIButtonTypeCustom];
    [noteBt setAdjustsImageWhenDisabled:NO];
    noteBt.frame = CGRectMake(0, 0, [UIScreen mainScreen].bounds.size.width, [UIScreen mainScreen].bounds.size.height);
    [noteBt setImage:[UIImage imageNamed:@"network_1242_2208"] forState:UIControlStateNormal];
    [noteBt setImage:[UIImage imageNamed:@"network_1242_2208"] forState:UIControlStateHighlighted];
    [noteBt addTarget:self action:@selector(noteBtClick) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:noteBt];
}

- (void)noteBtClick {
    [[NSNotificationCenter defaultCenter] postNotificationName:@"RerequestData" object:nil];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end
