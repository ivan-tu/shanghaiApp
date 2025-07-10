//
//  AppDelegate.h
//  XZVientiane
//
//  Created by 崔逢举 on 2017/11/13.
//  Copyright © 2017年 崔逢举. All rights reserved.
//

#import <UIKit/UIKit.h>
@interface AppDelegate : UIResponder <UIApplicationDelegate>

@property (strong, nonatomic) UIWindow *window;

@end

#define  HelpBtnUI(NAME) \
UIButton *helpbtn = [UIButton buttonWithType:UIButtonTypeCustom]; \
helpbtn.tag = Help_##NAME; \
[helpbtn setFrame:CGRectMake(0, 0, 60, 25)]; \
[helpbtn setBackgroundImage:[UIImage imageNamed:@"help_small"] forState:UIControlStateNormal]; \
[helpbtn addTarget:[[UIApplication sharedApplication] delegate] action:@selector(clickHelp:) forControlEvents:UIControlEventTouchUpInside]; \
[helpbtn sizeToFit]; \
UIBarButtonItem *rightItem = [[UIBarButtonItem alloc] initWithCustomView:helpbtn]; \
self.navigationItem.rightBarButtonItems = @[rightItem];

#define HelpBtnConfig(helpbtn, x) \
helpbtn.tag = Help_##x; \
[helpbtn addTarget:[[UIApplication sharedApplication] delegate] action:@selector(clickHelp:) forControlEvents:UIControlEventTouchUpInside]; 
