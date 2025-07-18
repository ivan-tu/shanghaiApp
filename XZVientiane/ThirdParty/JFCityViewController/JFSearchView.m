//
//  JFSearchView.m
//  JFFootball
//
//  Created by 崔逢举 on 2016/11/24.
//  Copyright © 2016年 崔逢举. All rights reserved.
//

#import "JFSearchView.h"
static NSString *ID = @"searchCell";

@interface JFSearchView ()<UITableViewDelegate, UITableViewDataSource>

@property (nonatomic, strong) UITableView *rootTableView;

@end

@implementation JFSearchView

- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
    }
    return self;
}

- (void)setResultMutableArray:(NSMutableArray *)resultMutableArray {
    _resultMutableArray = resultMutableArray;
    [self addSubview:self.rootTableView];
    [_rootTableView reloadData];
}

- (UITableView *)rootTableView {
    if (!_rootTableView) {
        _rootTableView = [[UITableView alloc] initWithFrame:self.bounds style:UITableViewStylePlain];
        [_rootTableView registerClass:[UITableViewCell class] forCellReuseIdentifier:ID];
        _rootTableView.delegate = self;
        _rootTableView.dataSource = self;
        _rootTableView.backgroundColor = [UIColor whiteColor];
    }
    return _rootTableView;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return [_resultMutableArray count];
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:ID forIndexPath:indexPath];
     JFCityModel *model = _resultMutableArray[indexPath.row];
    NSString *text = model.area;
    cell.textLabel.text = text;
    cell.backgroundColor = [UIColor whiteColor];
    cell.selectionStyle = UITableViewCellSelectionStyleDefault;
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    JFCityModel *model = _resultMutableArray[indexPath.row];
        if (self.delegate && [self.delegate respondsToSelector:@selector(searchResults:)]) {
            [self.delegate searchResults:model];
        }
}

- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event {
    if (self.delegate && [self.delegate respondsToSelector:@selector(touchViewToExit)]) {
        [self.delegate touchViewToExit];
    }

}
@end
