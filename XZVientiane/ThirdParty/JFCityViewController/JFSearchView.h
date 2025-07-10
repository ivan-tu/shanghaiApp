//
//  JFSearchView.h
//  JFFootball
//
//  Created by 崔逢举 on 2016/11/24.
//  Copyright © 2016年 崔逢举. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "JFModel.h"

@protocol JFSearchViewDelegate <NSObject>

- (void)searchResults:(JFCityModel *)dic;
- (void)touchViewToExit;
@end

@interface JFSearchView : UIView

/** 搜索结果*/
@property (nonatomic, strong) NSMutableArray *resultMutableArray;
@property (nonatomic, weak) id<JFSearchViewDelegate> delegate;
@end
