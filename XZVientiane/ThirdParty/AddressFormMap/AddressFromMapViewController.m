//
//  AddressFromMapViewController.m
//  Dynasty.dajiujiao
//
//  Created by uxiu.me on 2018/7/10.
//  Copyright © 2018年 HangZhouFaDaiGuoJiMaoYi Co. Ltd. All rights reserved.
//

#import "AddressFromMapViewController.h"
#import "LocationCell.h"
#import "AdressHistoryCell.h"
#import "HeadeView.h"
#import "JFCityViewController.h"
#import "JFLocation.h"
#import "EVNCustomSearchBar.h"
#import "Header.h"
#import "Helper.h"
#import "SearchTableView.h"
#import <AMapFoundationKit/AMapFoundationKit.h>
// 恢复高德SDK导入 - 使用CocoaPods版本
#import <AMapSearchKit/AMapSearchKit.h>
#import <AMapLocationKit/AMapLocationKit.h>
// 需要导入CoreLocation
#import <CoreLocation/CoreLocation.h>

@interface AddressFromMapViewController ()<UITableViewDataSource,UITableViewDelegate,JFCityViewControllerDelegate,AMapSearchDelegate,SearchTableViewDelegate,EVNCustomSearchBarDelegate>

@property (nonatomic, assign) BOOL isStatusBarContentBlack;
@property (nonatomic, strong) EVNCustomSearchBar *searchBar;
@property (nonatomic, strong) UITableView *tableView;
@property (nonatomic, strong) UIView *HeaderView;
@property (nonatomic, strong) UIButton *HeaderLocationView;
@property (nonatomic, strong) UILabel *locationButton;
@property (nonatomic, strong) UIImageView *locationView;
@property (nonatomic, assign) CGRect tableViewFrame;
// 恢复搜索相关属性
@property (nonatomic, strong) AMapSearchAPI *search;
@property (nonatomic, strong) NSMutableArray *pois;
@property (nonatomic, strong) NSMutableArray *searchPois;

@property (nonatomic, strong) AMapPOI *selectedPOI;
@property (nonatomic, strong) SearchTableView *searchView;
@property (nonatomic,assign)BOOL isSearch;
@property (strong, nonatomic)AMapLocationManager *locationManager;
@property (copy, nonatomic)NSString *limitCity;

@end

@implementation AddressFromMapViewController

#pragma mark -
#pragma mark - ⚙ 数据初始化
- (NSMutableArray *)searchPois {
    if (_searchPois == nil) {
        _searchPois = [NSMutableArray arrayWithCapacity:0];
    }
    return _searchPois;
}
- (void)initDataSource {
    self.pois = [NSMutableArray array];
    
}
- (UIView *)HeaderView {
    if (_HeaderView == nil) {
        _HeaderView = [[UIView alloc]initWithFrame:CGRectMake(0, 0, UIScreen.mainScreen.bounds.size.width, 50)];
        _HeaderView.backgroundColor = [UIColor whiteColor];
    }
    return _HeaderView;
}
- (UIButton *)HeaderLocationView {
    if (_HeaderLocationView == nil) {
        _HeaderLocationView = [[UIButton alloc]initWithFrame:CGRectMake(0, 0, 80, 50)];
    }
    return _HeaderLocationView;
}
#pragma mark - ♻️ Lifecycle
- (void)viewDidLoad {
    [super viewDidLoad];
    [self initDataSource];//!<初始化一些数据
    self.navigationItem.title = @"获取定位";
    self.view.backgroundColor = [UIColor whiteColor];
    [self setupUI];
    AMapPOIAroundSearchRequest *request = [[AMapPOIAroundSearchRequest alloc] init];
    request.location            = [AMapGeoPoint locationWithLatitude:[[KCURRENTCITYINFODEFAULTS objectForKey:@"currentLat"] doubleValue] longitude:[[KCURRENTCITYINFODEFAULTS objectForKey:@"currentLng"] doubleValue]];
    /* 0按照距离排序. 1.综合排序*/
    request.sortrule            = 0;
    request.radius = 3000;
    // requireExtension属性在新版本SDK中已移除，扩展信息默认包含
    [self.search AMapPOIAroundSearch:request];
    self.locationButton = [[UILabel alloc]init];
    self.locationButton.frame = CGRectMake(10, 10, 45, 36);
    self.locationButton.textAlignment = NSTextAlignmentCenter;
    NSString *locationCity = [[NSUserDefaults standardUserDefaults] objectForKey:@"SelectCity"];
    self.limitCity = locationCity;
    self.locationButton.text = [locationCity length] ? locationCity: @"请选择";
    self.locationButton.font = [UIFont systemFontOfSize:14];
    self.locationButton.lineBreakMode = NSLineBreakByTruncatingTail;
    self.locationView = [[UIImageView alloc]initWithImage:[UIImage imageNamed:@"down"]];
    self.locationView.frame = CGRectMake(55, 20, 18, 18);
    [self.HeaderLocationView addSubview:self.locationButton];
    [self.HeaderLocationView addSubview:self.locationView];
    [self.HeaderLocationView addTarget:self action:@selector(jumpToSelectLocation:) forControlEvents:(UIControlEventTouchUpInside)];
    UIBarButtonItem *backButtonItem = [[UIBarButtonItem alloc] initWithImage:[UIImage imageNamed:@"backTonormal"] style:(UIBarButtonItemStylePlain) target:self action:@selector(navLeftBarButtonEvent:)];
    [self.navigationItem setLeftBarButtonItem:backButtonItem];
}
- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
}

- (UIStatusBarStyle)preferredStatusBarStyle {
    if (!self.isStatusBarContentBlack) {
        return UIStatusBarStyleDefault;
    }
    return UIStatusBarStyleLightContent;
}
- (void)navLeftBarButtonEvent:(UIButton *)button {
    if (self.isSearch) {
        self.isSearch = NO;
        self.searchBar.placeholder = @"请输搜索关键字";
        self.searchBar.text = @"";
        [self deleteSearchView];
    } else {
        [self.navigationController popViewControllerAnimated:YES];
    }
}
#pragma mark: getter method EVNCustomSearchBar
- (EVNCustomSearchBar *)searchBar
{
    if (!_searchBar)
    {
        _searchBar = [[EVNCustomSearchBar alloc] initWithFrame:CGRectMake(70, 0, kEVNScreenWidth - 70, 50)];
        _searchBar.backgroundColor = [UIColor clearColor]; // 清空searchBar的背景色
        _searchBar.iconImage = [Helper imagesNamedFromCustomBundle:@"EVNCustomSearchBar.png"];
        _searchBar.iconAlign = EVNCustomSearchBarIconAlignCenter;
        [_searchBar setPlaceholder:@"请输搜索关键字"];  // 搜索框的占位符
        _searchBar.placeholderColor = TextGrayColor;
        _searchBar.delegate = self; // 设置代理
        [_searchBar sizeToFit];
    }
    return _searchBar;
}

#pragma mark: EVNCustomSearchBar delegate method
- (BOOL)searchBarShouldBeginEditing:(EVNCustomSearchBar *)searchBar
{
    NSLog(@"class: %@ function:%s", NSStringFromClass([self class]), __func__);
    [self beginSearch];
    return YES;
}

- (void)searchBarTextDidBeginEditing:(EVNCustomSearchBar *)searchBar
{
    NSLog(@"class: %@ function:%s", NSStringFromClass([self class]), __func__);
}

- (BOOL)searchBarShouldEndEditing:(EVNCustomSearchBar *)searchBar
{
    NSLog(@"class: %@ function:%s", NSStringFromClass([self class]), __func__);
    return YES;
}

- (void)searchBarTextDidEndEditing:(EVNCustomSearchBar *)searchBar
{
    NSLog(@"class: %@ function:%s", NSStringFromClass([self class]), __func__);
    if ([searchBar.text isEqualToString:@""]) {
        [self deleteSearchView];
    }
}

- (void)searchBar:(EVNCustomSearchBar *)searchBar textDidChange:(NSString *)searchText
{
    NSLog(@"class: %@ function:%s", NSStringFromClass([self class]), __func__);
    [self searchTipsWithKey:searchBar.text];
    
    if (searchBar.isFirstResponder && searchBar.text.length > 0)
    {
        searchBar.placeholder = searchBar.text;
    }
    else {
        searchBar.placeholder = @"请输搜索关键字";
        
    }
}

- (BOOL)searchBar:(EVNCustomSearchBar *)searchBar shouldChangeTextInRange:(NSRange)range replacementText:(NSString *)text
{
    NSLog(@"class: %@ function:%s", NSStringFromClass([self class]), __func__);
    return YES;
}

- (void)searchBarSearchButtonClicked:(EVNCustomSearchBar *)searchBar
{
    NSLog(@"class: %@ function:%s", NSStringFromClass([self class]), __func__);
    AMapPOIKeywordsSearchRequest *request = [[AMapPOIKeywordsSearchRequest alloc] init];
    request.keywords         = searchBar.text;
    request.city             = self.limitCity;
    // requireExtension属性在新版本SDK中已移除，扩展信息默认包含
    [self.search AMapPOIKeywordsSearch:request];
}

- (void)searchBarCancelButtonClicked:(EVNCustomSearchBar *)searchBar
{
    searchBar.placeholder = @"请输搜索关键字";
    searchBar.text = @"";
    self.isSearch = NO;
    NSLog(@"class: %@ function:%s", NSStringFromClass([self class]), __func__);
    [self deleteSearchView];
}

- (void)touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
    [self.searchBar resignFirstResponder];
    
}

/* 输入提示 搜索.*/
- (void)searchTipsWithKey:(NSString *)key
{
    if (key.length == 0)
    {
        return;
    }
    AMapInputTipsSearchRequest *tips = [[AMapInputTipsSearchRequest alloc] init];
    tips.keywords = key;
    tips.city     =  self.limitCity;
    tips.cityLimit = YES; //是否限制城市
    [self.search AMapInputTipsSearch:tips];
}

- (UITableView *)tableView {
    if (!_tableView) {
        //iPhone X需要调整
        _tableView = [[UITableView alloc] initWithFrame:CGRectMake(0, CGRectGetMaxY(self.HeaderView.frame), UIScreen.mainScreen.bounds.size.width, UIScreen.mainScreen.bounds.size.height - 120) style:(UITableViewStylePlain)];
        _tableView.delegate = self;
        _tableView.dataSource = self;
        _tableView.tableFooterView = [UIView new];
        _tableView.backgroundColor = [UIColor colorWithRed:245 / 255.0 green:245 / 255.0 blue:245 / 255.0 alpha:1];//#F5F5F5
        _tableView.keyboardDismissMode = UIScrollViewKeyboardDismissModeOnDrag;
        [_tableView registerClass:[LocationCell class] forCellReuseIdentifier:@"LocationCell"];
        [_tableView registerClass:[AdressHistoryCell class] forCellReuseIdentifier:@"AdressHistoryCell"];

        
    }
    return _tableView;
}
- (SearchTableView *)searchView {
    if (!_searchView) {
        CGRect frame = [UIScreen mainScreen].bounds;
        _searchView = [[SearchTableView alloc] initWithFrame:CGRectMake(0, CGRectGetMaxY(self.HeaderView.frame), frame.size.width, frame.size.height  - CGRectGetMaxY(self.HeaderView.frame) - 64)];
        _searchView.backgroundColor = [UIColor colorWithWhite:0.f alpha:0.5];
        _searchView.delegate = self;
    }
    return _searchView;
}
#pragma mark -------SearchTableViewDelegate
- (void)searchResultsSelect:(CLLocationCoordinate2D )coordinate adressName:(NSString *)cityName formattedAddress:(NSString *)formattedAddress{
    self.selectedEvent( CLLocationCoordinate2DMake(coordinate.latitude, coordinate.longitude), cityName,formattedAddress);
    [self.navigationController popViewControllerAnimated:YES];
    
}
- (void)touchViewToExit {
    [self endSearch];
}
- (void)beginSearch {
    self.isSearch = YES;
    [self.view addSubview:self.searchView];
}

- (void)endSearch {
    self.isSearch = NO;
    [self deleteSearchView];
}
/// 移除搜索界面
- (void)deleteSearchView {
    [self.searchBar resignFirstResponder];
    [_searchView removeFromSuperview];
    _searchView = nil;
}
- (AMapSearchAPI *)search {
    if (!_search) {
        _search = [[AMapSearchAPI alloc] init];
        _search.delegate = self;
    }
    return _search;
}


#pragma mark - 🔨 CustomMethod
- (void)setupUI {
    [self.view addSubview:self.HeaderView];
    [self.HeaderView addSubview:self.searchBar];
    [self.HeaderView addSubview:self.HeaderLocationView];
    [self.view addSubview:self.tableView];
}


#pragma mark - Table view data source
- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    return self.addressList.count ? 3 : 2;
}
- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    if (section == 0) {
        return 1;
    }
    else {
        if (self.addressList.count) {
            if (section == 1) {
                return  self.addressList.count;
            }
            else {
                return self.pois.count;

            }
        }
        else {
            return self.pois.count;
        }
    }
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    if (self.addressList.count && indexPath.section == 1) {
        return 60;
    }
    return 50;
}
- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    if (indexPath.section == 0) {
        LocationCell *cell = [tableView dequeueReusableCellWithIdentifier:@"LocationCell"];
        if (!cell) {
            cell = [[LocationCell alloc] initWithStyle:(UITableViewCellStyleSubtitle) reuseIdentifier:@"LocationCell"];
        }
        cell.title = [[NSUserDefaults standardUserDefaults] objectForKey:@"currentCity"];
        [cell.locationButton addTarget:self action:@selector(reLoacation:) forControlEvents:(UIControlEventTouchUpInside)];
        [cell.reButton addTarget:self action:@selector(reLoacation:) forControlEvents:(UIControlEventTouchUpInside)];
        
        return cell;
    }
    else if (indexPath.section == 1) {
        if (self.addressList.count) {
            AdressHistoryCell *cell = [tableView dequeueReusableCellWithIdentifier:@"AdressHistoryCell"];
            if (!cell) {
                cell = [[AdressHistoryCell alloc] initWithStyle:(UITableViewCellStyleDefault) reuseIdentifier:@"AdressHistoryCell"];
            }
            NSDictionary *dic = self.addressList[indexPath.row];
            [cell setModel:dic];
            return cell;
        }
        else {
            UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"UITableViewCell"];
            if (!cell) {
                cell = [[UITableViewCell alloc] initWithStyle:(UITableViewCellStyleDefault) reuseIdentifier:@"UITableViewCell"];
            }
            cell.textLabel.font = [UIFont systemFontOfSize:16];
            if (self.pois.count > 0) {
                AMapPOI *poi = self.pois[indexPath.row];
                cell.textLabel.text = poi.name;
            }
            return cell;
        }
    }
    else {
        UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"UITableViewCell"];
        if (!cell) {
            cell = [[UITableViewCell alloc] initWithStyle:(UITableViewCellStyleDefault) reuseIdentifier:@"UITableViewCell"];
        }
        cell.textLabel.font = [UIFont systemFontOfSize:16];
        if (self.pois.count > 0) {
            AMapPOI *poi = self.pois[indexPath.row];
            cell.textLabel.text = poi.name;
        }
        return cell;
    }
    
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
    if (indexPath.section == 1) {
        if (self.addressList.count && self.selectedEvent) {
            NSDictionary *dic = self.addressList[indexPath.row];
            self.selectedEvent( CLLocationCoordinate2DMake([[dic objectForKey:@"lat"] doubleValue], [[dic objectForKey:@"lng"] doubleValue]), [dic objectForKey:@"address"],[dic objectForKey:@"addressInfo"]);
            [KCURRENTCITYINFODEFAULTS setObject:self.limitCity forKey:@"SelectCity"];
            [KCURRENTCITYINFODEFAULTS synchronize];
        }
        else {
            AMapPOI *poi = self.pois[indexPath.row];
            self.selectedPOI = poi;
            if (self.selectedPOI && self.selectedEvent) {
                self.selectedEvent( CLLocationCoordinate2DMake(self.selectedPOI.location.latitude, self.selectedPOI.location.longitude), self.selectedPOI.name,self.selectedPOI.address);
                [KCURRENTCITYINFODEFAULTS setObject:self.limitCity forKey:@"SelectCity"];
                [KCURRENTCITYINFODEFAULTS synchronize];
        }
        }
    }
    if (indexPath.section == 2) {
        AMapPOI *poi = self.pois[indexPath.row];
        self.selectedPOI = poi;
        if (self.selectedPOI && self.selectedEvent) {
            self.selectedEvent( CLLocationCoordinate2DMake(self.selectedPOI.location.latitude, self.selectedPOI.location.longitude), self.selectedPOI.name,self.selectedPOI.address);
            [KCURRENTCITYINFODEFAULTS setObject:self.limitCity forKey:@"SelectCity"];
            [KCURRENTCITYINFODEFAULTS synchronize];
        }
    }
    [self.navigationController popViewControllerAnimated:YES];
}
- (CGFloat)tableView:(UITableView *)tableView heightForHeaderInSection:(NSInteger)section {
    if (section == 1 || section == 2) {
        return 44;
    }
    return 0;
}
- (nullable UIView *)tableView:(UITableView *)tableView viewForHeaderInSection:(NSInteger)section {
    if (section == 1) {
        HeadeView *view = [[HeadeView alloc]init];
        if (self.addressList.count) {
            view.image.image = [UIImage imageNamed:@"location"];
            view.label.text = @"我的收货地址";
        }
        else {
            view.image.image = [UIImage imageNamed:@"reLocation"];
            view.label.text = @"附近地址";
        }
        view.backgroundColor = [UIColor whiteColor];
        return view;
    }
    else if (section == 2) {
        HeadeView *view = [[HeadeView alloc]init];
        view.image.image = [UIImage imageNamed:@"reLocation"];
        view.backgroundColor = [UIColor whiteColor];
        return view;
    }
    else {
        return nil;
    }
}
/* 输入提示回调. */
- (void)onInputTipsSearchDone:(AMapInputTipsSearchRequest *)request response:(AMapInputTipsSearchResponse *)response
{
    if (response.count == 0)
    {
        return;
    }
    [self.searchView PoisWithSaerchArray: [self forinTipsArray:response.tips]];
    
}

-(void)onPOISearchDone:(AMapPOISearchBaseRequest *)request response:(AMapPOISearchResponse *)response {
    if (!self.isSearch) {
        [self.pois removeAllObjects];
        for (AMapPOI *poi in response.pois) {
            //DLog(@"输出🍀 %@ %@ %@",poi.province,poi.city,poi.district);
            [self.pois addObject:poi];
        }
        [self.tableView reloadData];
    }
    else {
        [self.searchPois removeAllObjects];
        for (AMapPOI *poi in response.pois) {
            //DLog(@"输出🍀 %@ %@ %@",poi.province,poi.city,poi.district);
            [self.searchPois addObject:poi];
        }
        [self.searchView PoisWithSaerchArray:self.searchPois];
    }
    
}
- (NSMutableArray *)forinTipsArray:(NSArray *)array {
    NSMutableArray *mutableArray = [NSMutableArray arrayWithCapacity:0];
    for (AMapTip *tip in array) {
        if (tip.location == nil) {
            continue;
        }
        else {
            [mutableArray addObject:tip];
        }
    }
    return mutableArray;
}
- (void)AMapSearchRequest:(id)request didFailWithError:(NSError *)error {
    NSLog(@"输出🍀 %@",error);
}

+ (UIImage *)imageWithColor:(UIColor *)color {
    return [self imageWithColor:color size:CGSizeMake(1, 1)];
}

+ (UIImage *)imageWithColor:(UIColor *)color size:(CGSize)size {
    if (!color || size.width <= 0 || size.height <= 0) return nil;
    CGRect rect = CGRectMake(0.0f, 0.0f, size.width, size.height);
    UIGraphicsBeginImageContextWithOptions(rect.size, NO, 0);
    CGContextRef context = UIGraphicsGetCurrentContext();
    CGContextSetFillColorWithColor(context, color.CGColor);
    CGContextFillRect(context, rect);
    UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return image;
}
- (void)jumpToSelectLocation:(UIButton *)sender {
    JFCityViewController *cityViewController = [[JFCityViewController alloc] init];
    cityViewController.delegate = self;
    cityViewController.title = @"选择城市";
    cityViewController.locationTitle = self.limitCity.length ? self.limitCity : @"暂无定位";
    UINavigationController *navigationController = [[UINavigationController alloc] initWithRootViewController:cityViewController];
    navigationController.modalPresentationStyle = UIModalPresentationFullScreen;
    [self presentViewController:navigationController animated:YES completion:nil];
}
- (void)cityName:(NSString *)name cityCode:(NSString *)code {
    self.limitCity = name;
    self.locationButton.text = name;
    //poi关键字搜索
    AMapPOIKeywordsSearchRequest *request = [[AMapPOIKeywordsSearchRequest alloc] init];
    request.keywords         = name;
    request.city             =  name;
    request.cityLimit = YES;
    // requireExtension属性在新版本SDK中已移除，扩展信息默认包含
    [self.search AMapPOIKeywordsSearch:request];
    
}
//重新定位
- (void)reLoacation:(UIButton *)sender {
    NSIndexPath *indexpath = [self.tableView indexPathForCell:(LocationCell *)sender.superview];
    LocationCell *cell = [self.tableView cellForRowAtIndexPath:indexpath];
    cell.locationLabel.text = @"正在定位...";
    // 带逆地理信息的一次定位（返回坐标和地址信息）
    self.locationManager = [[AMapLocationManager alloc] init];
    // 带逆地理信息的一次定位（返回坐标和地址信息）
    [self.locationManager setDesiredAccuracy:kCLLocationAccuracyHundredMeters];
    //   定位超时时间，最低2s，此处设置为2s
    self.locationManager.locationTimeout =2;
    //   逆地理请求超时时间，最低2s，此处设置为2s
    self.locationManager.reGeocodeTimeout = 2;
    [self.locationManager requestLocationWithReGeocode:YES completionBlock:^(CLLocation *location, AMapLocationReGeocode *regeocode, NSError *error) {
        if (error)
        {

            NSLog(@"locError:{%ld - %@};", (long)error.code, error.localizedDescription);
            
            if (error.code == AMapLocationErrorLocateFailed)
            {
                return;
            }
        }
        NSLog(@"location:%@", location);
        
        if (regeocode)
        {
            NSLog(@"reGeocode:%@", regeocode);
        }
        CLLocationCoordinate2D coordinate = location.coordinate;
        NSUserDefaults *Defaults = [NSUserDefaults standardUserDefaults];
        if (coordinate.latitude == 0 && coordinate.longitude == 0) {
            [Defaults setObject:@(0) forKey:@"currentLat"];
            [Defaults setObject:@(0) forKey:@"currentLng"];
            [Defaults setObject:@"请选择" forKey:@"currentCity"];
            [Defaults setObject:@"请选择" forKey:@"currentAddress"];
            return;
        }
        [Defaults setObject:@(coordinate.latitude) forKey:@"currentLat"];
        [Defaults setObject:@(coordinate.longitude) forKey:@"currentLng"];
        // 安全处理regeocode为nil的情况
        NSString *cityName = (regeocode && regeocode.POIName.length > 0) ? regeocode.POIName : @"请选择";
        NSString *addressName = (regeocode && regeocode.formattedAddress.length > 0) ? regeocode.formattedAddress : @"请选择";
        [Defaults setObject:cityName forKey:@"currentCity"];
        [Defaults setObject:cityName forKey:@"currentAddress"];

        [Defaults setObject:regeocode.city forKey:@"SelectCity"];
        [Defaults synchronize];
        cell.locationLabel.text = cityName.length > 0 ? cityName : @"重新定位";
        self.selectedEvent( CLLocationCoordinate2DMake(coordinate.latitude, coordinate.longitude), cityName, addressName );
        [self.navigationController popViewControllerAnimated:YES];
    }];
}
@end
