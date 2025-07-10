//
//  SystemDefine.h
//  TuiYa
//
//  Created by CFJ on 15/6/28.
//  Copyright (c) 2015年 tuweia. All rights reserved.
//

#ifndef __TuiYa__SystemDefine__
#define __TuiYa__SystemDefine__

#define IcomoonFont(a)   [UIFont fontWithName:@"icomoon" size:a]

//判断系统版本的宏
#define IS_IOS7 (([[[UIDevice currentDevice] systemVersion] floatValue] < 8.0)? (YES):(NO))
#define IS_IOS8 (([[[UIDevice currentDevice] systemVersion] floatValue] >= 8.0)? (YES):(NO))
#define SYSTEM_VERSION_GREATER_THAN_OR_EQUAL_TO(v)  ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] != NSOrderedAscending)

//屏幕宽高
#define SCREEN_WIDTH  [UIScreen mainScreen].bounds.size.width
#define SCREEN_HEIGHT  [UIScreen mainScreen].bounds.size.height

//自定义导航高度
#define NavigationBar_Height 64

#ifndef __OPTIMIZE__
#define NSLog(...) NSLog(__VA_ARGS__)
#else
#define NSLog(...) {}
#endif
#define fUserDefaults [NSUserDefaults standardUserDefaults]

#endif
