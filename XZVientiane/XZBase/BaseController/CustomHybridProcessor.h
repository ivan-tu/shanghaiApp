#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface CustomHybridProcessor : NSObject

/**
 * @param urlStr 原始的页面URL (即 self.pinUrl)
 * @param templateDic 页面需要的动态数据 (即 self.templateDic)
 * @param componentJsAndCs 页面组件的JS和CSS内容 (即 self.ComponentJsAndCs)
 * @param componentDic 页面组件的数据字典 (即 self.ComponentDic)
 * @param success 成功回调，返回处理结果
 */
+ (void)custom_LocialPathByUrlStr:(NSString *)urlStr
                      templateDic:(nullable NSDictionary *)templateDic
                 componentJsAndCs:(nullable NSDictionary *)componentJsAndCs
                   componentDic:(nullable NSDictionary *)componentDic
                        success:(void (^)(NSString * _Nonnull filePath, NSString * _Nonnull templateStr, NSString * _Nonnull title, BOOL isFileExsit))success;
/**
 * @param success 成功回调，返回Tabbar的配置项
 */
+ (void)custom_reloadTabbarInterfaceSuccess:(void (^)(NSArray * _Nullable items, NSString * _Nullable activeColor, NSString * _Nullable bgColor))success;
/**
 * @param functionName 要调用的JS函数名
 * @param data 要传递给JS的数据
 * @return 包含函数名和数据的字典
 */
+ (NSDictionary *)custom_objcCallJsWithFn:(NSString *)functionName data:(nullable id)data;

/**
 * @return 请求RequestURL字符串
 */
+ (NSString *)custom_getRequestLinkUrl:(NSString *)apiUrl;

/**
 * @return 请求LoginURL字符串
 */
+ (NSString *)custom_getloginLinkUrl;
@end

NS_ASSUME_NONNULL_END
