
//
//  TYFunctionDefine.h
//  TuiYa
//
//  Created by CFJ on 15/6/14.
//  Copyright (c) 2015年 tuweia. All rights reserved.
//

#ifndef XiangZhan_XZFunctionDefine_h
#define XiangZhan_XZFunctionDefine_h

//在block外使用weak防止循环引用，在block内使用strong防止过早释放
#define WEAK_SELF __weak typeof(self)weakSelf = self
#define STRONG_SELF __strong typeof(weakSelf)self = weakSelf

//判断是不是iPad
#define ISIPAD ([[UIDevice currentDevice] userInterfaceIdiom] == UIUserInterfaceIdiomPad)

//单例
#undef	AS_SINGLETON
#define AS_SINGLETON( __class ) \
+ (__class *)sharedInstance;

#undef	DEF_SINGLETON
#define DEF_SINGLETON( __class ) \
+ (__class *)sharedInstance \
{ \
static dispatch_once_t once; \
static __class * __singleton__; \
dispatch_once(&once, ^{ __singleton__ = [[__class alloc] init]; } ); \
return __singleton__; \
}

#endif
