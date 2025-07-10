//
//  JFCityViewController.m
//  JFFootball
//
//  Created by 崔逢举 on 2016/11/21.
//  Copyright © 2016年 崔逢举. All rights reserved.
//

#import "JFCityViewController.h"
#import "JFCityTableViewCell.h"
#import "JFAreaDataManager.h"
#import "JFLocation.h"
#import "JFSearchView.h"
#import "JFModel.h"
#import "JFCityHeaderView.h"
#import "UIColor+addition.h"
#import "SCIndexViewConfiguration.h"
#import "UITableView+SCIndexView.h"
#define kCurrentCityInfoDefaults [NSUserDefaults standardUserDefaults]
static inline BOOL isIPhoneXSeries() {
    BOOL iPhoneXSeries = NO;
    if (UIDevice.currentDevice.userInterfaceIdiom != UIUserInterfaceIdiomPhone) {
        return iPhoneXSeries;
    }
    
    if (@available(iOS 11.0, *)) {
        UIWindow *mainWindow = [[[UIApplication sharedApplication] delegate] window];
        if (mainWindow.safeAreaInsets.bottom > 0.0) {
            iPhoneXSeries = YES;
        }
    }
    
    return iPhoneXSeries;
}
@interface JFCityViewController ()
<UITableViewDelegate,
UITableViewDataSource,
JFSearchViewDelegate,
JFCityHeaderViewDelegate>

{
    NSInteger        _HeaderSectionTotal;           //头section的个数
    CGFloat          _cellHeight;                   //添加的(显示区县名称)cell的高度
}

@property (nonatomic, strong) UITableView *rootTableView;
@property (nonatomic, strong) JFCityTableViewCell *cell;
@property (nonatomic, strong) JFAreaDataManager *manager;
@property (nonatomic, strong) JFSearchView *searchView;
@property (nonatomic, strong) JFCityHeaderView *headerView;

/** 热门城市*/
@property (nonatomic, strong) NSMutableArray *hotCityArray;
/** 字母索引*/
@property (nonatomic, strong) NSMutableArray *characterMutableArray;

/**
 存城市索引分组模型的数组
 */
@property (nonatomic, strong) NSMutableArray *ModelMutableArray;


@end

@implementation JFCityViewController
- (NSMutableArray *)ModelMutableArray {
    if (_ModelMutableArray == nil) {
        _ModelMutableArray = [NSMutableArray arrayWithCapacity:0];
    }
    return _ModelMutableArray;
}
- (NSMutableArray *)hotCityArray {
    if (_hotCityArray == nil) {
        _hotCityArray = [NSMutableArray arrayWithCapacity:0];
    }
    return _hotCityArray;
}
- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationController.navigationBar.translucent = NO;
    self.manager = [JFAreaDataManager shareInstance];
    [self parmJsonTomodel];
    _HeaderSectionTotal = 2;
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(chooseCityWithName:) name:JFCityTableViewCellDidChangeCityNotification object:nil];
    [self.view addSubview:self.headerView];
    
    [self.view addSubview:self.rootTableView];
    
    [self backBarButtonItem];
    dispatch_async(dispatch_get_global_queue(0, 0), ^{
        dispatch_sync(dispatch_get_main_queue(), ^{
            self.rootTableView.sc_indexViewDataSource = self.characterMutableArray;
        });
    });
}

- (void)backBarButtonItem {
    UIButton *leftButton = [[UIButton alloc] initWithFrame:CGRectMake(0, 0, 50, 30)];
    [leftButton addTarget:self action:@selector(backrootTableViewController) forControlEvents:UIControlEventTouchUpInside];
    [leftButton setTitle:@"取消" forState:UIControlStateNormal];
    [leftButton setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithCustomView:leftButton];
}

/// 选择城市时调用通知函数（前提是点击cell的section < 3）
- (void)chooseCityWithName:(NSNotification *)info {
    NSDictionary *cityDic = info.userInfo;
    if ([cityDic objectForKey:@"cityLocation"]) {
        [[NSNotificationCenter defaultCenter] postNotificationName:@"cityLocation" object:
         @{@"currentLat":[KCURRENTCITYINFODEFAULTS objectForKey:@"currentLat"] ?: @"0",
           @"currentLng":[KCURRENTCITYINFODEFAULTS objectForKey:@"currentLng"] ?: @"0"
           }];
    }
    else {
        NSString*  cityName = [cityDic valueForKey:@"cityTitle"];
        NSString*  cityCode = [cityDic valueForKey:@"cityCode"];
        if (self.delegate && [self.delegate respondsToSelector:@selector(cityName:cityCode:)]) {
            [self.delegate cityName:cityName cityCode:cityCode];
        }
    }
    
    //销毁通知
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    [self dismissViewControllerAnimated:YES completion:nil];
}



- (JFCityHeaderView *)headerView {
    if (!_headerView) {
        _headerView = [[JFCityHeaderView alloc] initWithFrame:CGRectMake(0, 0, self.view.bounds.size.width, 50)];
        _headerView.delegate = self;
        _headerView.backgroundColor = [UIColor colorWithHexString:@"E5E5E5"];
    }
    return _headerView;
}
- (JFSearchView *)searchView {
    if (!_searchView) {
        CGRect frame = [UIScreen mainScreen].bounds;
        NSInteger height = isIPhoneXSeries() ? 138 : 114;
        _searchView = [[JFSearchView alloc] initWithFrame:CGRectMake(0, 50, frame.size.width, frame.size.height  - height)];
        _searchView.backgroundColor = [UIColor colorWithRed:155 / 255.0 green:155 / 255.0 blue:155 / 255.0 alpha:0.5];
        _searchView.delegate = self;
    }
    return _searchView;
}

/// 移除搜索界面
- (void)deleteSearchView {
    [_searchView removeFromSuperview];
    _searchView = nil;
}


- (NSMutableArray *)characterMutableArray {
    if (!_characterMutableArray) {
        _characterMutableArray = [NSMutableArray arrayWithObjects:@"定", @"热", nil];
    }
    return _characterMutableArray;
}

- (void)backrootTableViewController {
    [self dismissViewControllerAnimated:YES completion:nil];
}

- (UITableView *)rootTableView {
    if (!_rootTableView) {
        _rootTableView = [[UITableView alloc] initWithFrame:CGRectMake(0,CGRectGetMaxY(self.headerView.frame), ScreenWidth, SCREEN_HEIGHT - (isIPhoneXSeries() ? 138 : 114)) style:UITableViewStylePlain];
        _rootTableView.delegate = self;
        _rootTableView.dataSource = self;
        _rootTableView.sectionIndexColor = [UIColor colorWithHexString:@"#7BBD28"];//设置默认时索引值颜色
        [_rootTableView registerClass:[JFCityTableViewCell class] forCellReuseIdentifier:@"cityCell"];
        [_rootTableView registerClass:[UITableViewCell class] forCellReuseIdentifier:@"cityNameCell"];
        SCIndexViewConfiguration *configuration = [SCIndexViewConfiguration configurationWithIndexViewStyle:SCIndexViewStyleDefault];
        _rootTableView.sc_indexViewConfiguration = configuration;
    }
    return _rootTableView;
}

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    return _characterMutableArray.count;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    if (section > 1) {
        JFModel *model = self.ModelMutableArray[section - 2];
        return model.list.count;
    }
    else {
        return 1;
    }
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    if (indexPath.section < _HeaderSectionTotal) {
        self.cell = [tableView dequeueReusableCellWithIdentifier:@"cityCell" forIndexPath:indexPath];
        if (indexPath.section == _HeaderSectionTotal - 2) {
            _cell.cityNameArray = @[self.locationTitle];
        }
        if (indexPath.section == _HeaderSectionTotal - 1) {
            _cell.cityNameArray = self.hotCityArray;
        }
        return _cell;
    }
    else {
        JFModel *model = self.ModelMutableArray[indexPath.section - 2];
        UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"cityNameCell" forIndexPath:indexPath];
        NSDictionary *dic = model.list[indexPath.row];
        JFCityModel *cityModel = [[JFCityModel alloc]initWithDictionary:dic];
        cell.textLabel.text = cityModel.area;
        cell.textLabel.textColor = [UIColor grayColor];
        cell.textLabel.font = [UIFont systemFontOfSize:14];
        return cell;
    }
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    return indexPath.section == (_HeaderSectionTotal - 1) ? 250 : 44;
}

- (CGFloat)tableView:(UITableView *)tableView heightForHeaderInSection:(NSInteger)section {
    return 40;
}

- (NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section {
    switch (section) {
            case 0:
            return @"当前定位";
            break;
            case 1:
            return @"热门城市";
            break;
        default:
            return _characterMutableArray[section];
            break;
    }
}

//设置右侧索引的标题，这里返回的是一个数组哦！
//- (NSArray *)sectionIndexTitlesForTableView:(UITableView *)tableView {
//    return _characterMutableArray;
//}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    JFModel *model = self.ModelMutableArray[indexPath.section - 2];
    NSDictionary *dic = model.list[indexPath.row];
    JFCityModel *cityModel = [[JFCityModel alloc]initWithDictionary:dic];
    if (self.delegate && [self.delegate respondsToSelector:@selector(cityName:cityCode:)]) {
        [self.delegate cityName:cityModel.area cityCode:cityModel.code];
    }
    [self dismissViewControllerAnimated:YES completion:nil];
}


#pragma mark - JFHeaderViewDelegate
- (void)beginSearch {
    [self.view addSubview:self.searchView];
}

- (void)endSearch {
    [self deleteSearchView];
}

- (void)searchResult:(NSString *)result {
    [_manager searchCityData:result result:^(NSMutableArray *result) {
        if ([result count] > 0) {
            self->_searchView.resultMutableArray = result;
        }
    }];
}

#pragma mark - JFSearchViewDelegate
- (void)touchViewToExit {
    [self.headerView cancelSearch];
}
- (void)searchResults:(JFCityModel *)dic {
    if (self.delegate && [self.delegate respondsToSelector:@selector(cityName:cityCode:)]) {
        [self.delegate cityName:dic.area cityCode:dic.code];
    }
    [self dismissViewControllerAnimated:YES completion:nil];
}



#pragma mark - JFLocationDelegate

- (void)locating {
    NSLog(@"定位中。。。");
}

//定位成功
//- (void)currentLocation:(NSDictionary *)locationDictionary {
//    NSString *city = [locationDictionary valueForKey:@"City"];
//    [kCurrentCityInfoDefaults setObject:city forKey:@"locationCity"];
//    [_rootTableView reloadData];
//}



/// 拒绝定位
- (void)refuseToUsePositioningSystem:(NSString *)message {
    NSLog(@"%@",message);
}

/// 定位失败
- (void)locateFailure:(NSString *)message {
    NSLog(@"%@",message);
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)dealloc {
    NSLog(@"JFCityViewController dealloc");
}

#pragma mark   --------   崔逢举自定义方法
- (void)parmJsonTomodel {
    NSData *JSONData = [NSData dataWithContentsOfFile:[[NSBundle mainBundle] pathForResource:@"cityList" ofType:@"json"]];
    NSDictionary *data = [NSJSONSerialization JSONObjectWithData:JSONData options:NSJSONReadingAllowFragments error:nil];
    NSArray *cityArray = [data objectForKey:@"data"];
    NSArray *hotCityArray = [data objectForKey:@"hotlist"];
    [self.manager.cityArray removeAllObjects];
    for (NSDictionary *dict in hotCityArray) {
        JFCityModel *citymodel = [[JFCityModel alloc]initWithDictionary:dict];
        [self.hotCityArray addObject:citymodel];
        [self.manager.cityArray addObject:citymodel];
    }
    for (NSDictionary *cityArrayDic in cityArray) {
        JFModel *model = [[JFModel alloc]initWithDictionary:cityArrayDic];
        [self.characterMutableArray addObject:model.index];
        [self.ModelMutableArray addObject:model];
        for (NSDictionary *dict in [cityArrayDic objectForKey:@"list"]) {
            JFCityModel *citymodel = [[JFCityModel alloc]initWithDictionary:dict];
            [self.manager.cityArray addObject:citymodel];
        }
    }
    
}
@end
