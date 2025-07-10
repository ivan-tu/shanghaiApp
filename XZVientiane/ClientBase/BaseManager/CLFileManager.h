//
//  CLFileManager.h
//  XiangZhanClient
//
//  Created by yiliu on 16/5/16.
//  Copyright © 2016年 TuWeiA. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <AssetsLibrary/ALAssetsLibrary.h>

typedef void(^FileManagerBlock)(NSString *path);

@interface CLFileManager : NSObject

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
 *  h5下载路径(最新信息)
 *
 *  @return 目录地址
 */
+ (NSString *)appH5ManifesNewPath;

/**
 *  h5 appsources下载路径
 *
 *  @return 目录地址
 */
+ (NSString *)appH5AppSourcesPath;

/**
 *  判断文件是否存在
 *
 *  @param aPath 地址
 *
 *  @return BOOL
 */
+ (BOOL)isFileExsit:(NSString *)aPath;

/**
 *  判断bundle是否存在
 *
 *  @param aBundleName bundle名称
 *
 *  @return BOOL
 */
+ (BOOL)isBundleExsit:(NSString *)aBundleName;


/**
 *  删除file
 */
+ (void)deleteFileInpathAry:(NSArray *)pathAry;

/**系统第一次启动，复制h5到沙盒删除file
 */
+ (void)copyH5ToDocument;
@end

