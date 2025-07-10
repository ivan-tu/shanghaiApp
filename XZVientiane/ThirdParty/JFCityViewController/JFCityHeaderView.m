//
//  JFCityHeaderView.m
//  JFFootball
//
//  Created by 崔逢举 on 2016/11/21.
//  Copyright © 2016年 崔逢举. All rights reserved.
//

#import "JFCityHeaderView.h"

#import "Masonry.h"

#define JFRGBAColor(r, g, b, a) [UIColor colorWithRed:(r)/255.0 green:(r)/255.0 blue:(r)/255.0 alpha:a]

@interface JFCityHeaderView ()<UISearchBarDelegate>

@property (nonatomic, strong) UISearchBar *searchBar;

@end

@implementation JFCityHeaderView

- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
        [self addSearchBar];
    }
    return self;
}

//搜索框
- (UISearchBar *)searchBar{
    if (_searchBar == nil) {
        _searchBar = [[UISearchBar alloc]init];
        _searchBar.placeholder = @"请输入搜索内容";
        _searchBar.backgroundImage = [[UIImage alloc] init];
        _searchBar.delegate = self;
        _searchBar.showsCancelButton = NO;
            if ([[[UIDevice currentDevice]systemVersion] floatValue] >= 13.0) {
           //取出textfield
           _searchBar.searchTextField.borderStyle = UITextBorderStyleNone;
           //        searchField.background = [UIImage imageNamed:@"ic_top"];
            _searchBar.searchTextField.backgroundColor = [UIColor whiteColor];
            _searchBar.searchTextField.layer.cornerRadius = 6;
            _searchBar.searchTextField.layer.masksToBounds = YES;
            }
            else{
                //取出textfield
                UITextField *searchField=[_searchBar valueForKey:@"_searchField"];
                
                //        searchField.backgroundColor = [UIColor grayColor];
                //        searchField.backgroundColor = [UIColor colorWithPatternImage:[UIImage imageWithContentsOfFile:@"ic_map_topbar_search"]];
                //        searchField.background = [UIImage imageNamed:@"ic_map_topbar_search"];
                //改变searcher的textcolor
                searchField.borderStyle = UITextBorderStyleNone;
                //        searchField.background = [UIImage imageNamed:@"ic_top"];
                searchField.backgroundColor = [UIColor whiteColor];
                searchField.layer.cornerRadius = 6;
                searchField.layer.masksToBounds = YES;
            }

        //        searchField.leftViewMode=UITextFieldViewModeNever;
        //        searchField.textColor=[UIColor whiteColor];
        //改变placeholder的颜色
        //        [searchField setValue:[UIColor whiteColor]forKeyPath:@"_placeholderLabel.textColor"];
    }
    return _searchBar;
}
- (void)addSearchBar {
    [self addSubview:self.searchBar];
    [self.searchBar mas_makeConstraints:^(MASConstraintMaker *make) {
        make.width.offset(self.bounds.size.width);
        make.height.offset(50);
        make.top.equalTo(self.mas_top).offset(0);
    }];
}

#pragma mark --- UISearchBarDelegate
//// searchBar开始编辑时调用
- (void)searchBarTextDidBeginEditing:(UISearchBar *)searchBar {
    searchBar.showsCancelButton = YES;
    if (self.delegate && [self.delegate respondsToSelector:@selector(beginSearch)]) {
        [self.delegate beginSearch];
    }
}

// searchBar文本改变时即调用
- (void)searchBar:(UISearchBar *)searchBar textDidChange:(NSString *)searchText {
    if (searchBar.text.length > 0) {
        if (self.delegate && [self.delegate respondsToSelector:@selector(searchResult:)]) {
            [self.delegate searchResult:searchText];
        }
        
    }
}
// 点击键盘搜索按钮时调用
- (void)searchBarSearchButtonClicked:(UISearchBar *)searchBar {
    if (self.delegate && [self.delegate respondsToSelector:@selector(searchResult:)]) {
        [self.delegate searchResult:searchBar.text];
    }
    NSLog(@"点击搜索按钮编辑的结果是%@",searchBar.text);
}

//  点击searchBar取消按钮时调用
- (void)searchBarCancelButtonClicked:(UISearchBar *)searchBar {
    [self cancelSearch];
}

//  取消搜索
- (void)cancelSearch {
    [self.searchBar resignFirstResponder];
    _searchBar.showsCancelButton = NO;
    _searchBar.text = nil;
    if (self.delegate && [self.delegate respondsToSelector:@selector(endSearch)]) {
        [self.delegate endSearch];
    }
    
}

@end
