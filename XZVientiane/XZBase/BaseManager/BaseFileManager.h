//
//  BaseFileManager.h
//  XiangZhanBase
//
//  Created by CFJ on 16/4/27.
//  Copyright © 2016年 TuWeiA. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface BaseFileManager : NSObject
/**
 *  获得app文档目录
 *
 *  @return 目录地址
 */
+ (NSString *)appDocPath;

/**
 *  获得app的lib目录
 *
 *  @return lib目录地址
 */
+ (NSString *)appLibPath;

/**
 *  获得app文档目录
 *
 *  @return 目录地址
 */
+ (NSString *)appCachePath;

/**
 *  获得app临时文件夹目录
 *  用于存放临时文件，保存应用程序再次启动过程中不需要的信息
 *
 *  @return 目录地址
 */
+ (NSString *)appTmpPath;

/**
 *  h5下载路径
 *
 *  @return 目录地址
 */
+ (NSString *)appH5ManifesPath;

/**
 h5本地路径
 
 @return 工程本地路径
 */
+ (NSString *)appH5LocailManifesPath;
/**
 *  h5 appsources下载路径
 *
 *  @return 目录地址
 */
+ (NSString *)appH5AppSourcesPath;
/**
 是否存在文件路径
 
 @param aPath 需要验证的文件路径
 @return 是否存在  存在返回YES 不存在返回NO
 */
+ (BOOL)isFileExsit:(NSString *)aPath;
@end
