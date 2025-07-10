//
//  TYCutImageViewController.m
//  CropImage
//

#define  WIDTH  [UIScreen mainScreen].bounds.size.width
#define  HEIGHT [UIScreen mainScreen].bounds.size.height
#import "TYCutImageViewController.h"
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
@interface TYCutImageViewController ()<UIScrollViewDelegate>
{
    UIScrollView*ScrollView;
    UIImageView *imageView;
    
    UIEdgeInsets imageInset;//缩进
    CGSize   imageSize;//图片大小
    CGSize   imageViewSize;//控件大小
    CGSize   MakeViewSize;//截图框的大小
    CGFloat  imageBL;//原图与现控件大小比例
}
@end

@implementation TYCutImageViewController

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:YES];
    self.navigationController.navigationBar.hidden=YES;
}

- (void)viewWillDisappear:(BOOL)animated{
    self.navigationController.navigationBar.hidden=NO;
    [super viewDidDisappear:YES];
}
- (void)viewDidLoad {
    [super viewDidLoad];
    
    self.view.backgroundColor=[UIColor blackColor];
    self.automaticallyAdjustsScrollViewInsets=NO;
    imageSize =self.cutImage.size;
    MakeViewSize =CGSizeMake(WIDTH, WIDTH*self.proportion);
    ScrollView=[[UIScrollView alloc]initWithFrame:self.view.bounds];
    ScrollView.backgroundColor=[UIColor clearColor];
    ScrollView.showsHorizontalScrollIndicator=NO;
    ScrollView.showsVerticalScrollIndicator=NO;
    ScrollView.delegate=self;
    [self.view addSubview:ScrollView];
    
    CGFloat  picBL=imageSize.width/imageSize.height;
    
    if (self.proportion==1) {
        if (picBL<1) {//竖拍
            imageBL=MakeViewSize.width/imageSize.width;
        }else{//横拍
            imageBL=MakeViewSize.height/imageSize.height;
        }
    }else{
        float wbl=MakeViewSize.width/imageSize.width;
        float hbl=MakeViewSize.height/imageSize.height;
        if (wbl>hbl) {
            imageBL=wbl;
        }else{
            imageBL=hbl;
        }
    }
    
    float kuan=imageSize.width*imageBL;
    float gao=imageSize.height*imageBL;
    imageViewSize=CGSizeMake(kuan, gao);
    
    
    imageView=[[UIImageView alloc]initWithFrame:CGRectMake(0, 0,kuan,gao)];
    imageView.image=[self scaleToSize:self.cutImage size:self.cutImage.size];
    imageView.contentMode=UIViewContentModeScaleAspectFill;
    [ScrollView addSubview:imageView];
    
    
    float left=(WIDTH-MakeViewSize.width)/2;
    float right=(WIDTH-MakeViewSize.width)/2;
    float top=(HEIGHT-MakeViewSize.height)/2;
    float bottom=(HEIGHT-MakeViewSize.height)/2;
    imageInset=UIEdgeInsetsMake(top, left, bottom, right);
    
    float x=(WIDTH-kuan)/2;
    float y=(HEIGHT-gao)/2;
    CGPoint point=CGPointMake(-x, -y);
    
    
    
    [ScrollView setMinimumZoomScale:1];
    [ScrollView setMaximumZoomScale:4];
    [ScrollView setZoomScale:1.01 animated:YES];
    //    [ScrollView zoomToRect:self.view.bounds animated:YES];
    [ScrollView setContentInset:imageInset];
    ScrollView.contentOffset=point;
    
    [[self maskView] setFrame:self.view.bounds];
    [[self maskView] setShowRect:CGSizeMake(WIDTH-2, WIDTH*self.proportion-2)];
    
    [self createCutImage];
}

- (UIView *)viewForZoomingInScrollView:(UIScrollView *)scrollView {
    return imageView;
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (TYCutImageMaskView *)maskView {
    if (MaskView == nil) {
        MaskView = [[TYCutImageMaskView alloc] init];
        [MaskView setBackgroundColor:[UIColor clearColor]];
        [MaskView setUserInteractionEnabled:NO];
        [self.view addSubview:MaskView];
        [self.view bringSubviewToFront:MaskView];
    }
    return MaskView;
}

- (void)createCutImage {
    UIView*view=[[UIView alloc]initWithFrame:CGRectMake(0,HEIGHT-(isIPhoneXSeries() ? 94:60) , WIDTH, 60)];
    view.backgroundColor=[UIColor whiteColor];
    view.alpha=0.1;
    [self.view addSubview:view];
    for (int i=0; i<2; i++) {
        UIButton*button=[UIButton buttonWithType:UIButtonTypeCustom];
        [view addSubview:button];
        button.backgroundColor=[UIColor clearColor];
        [button setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
        [self.view addSubview:button];
        button.titleLabel.font=[UIFont systemFontOfSize:17];
        button.tag=i;
        [button addTarget:self action:@selector(selectimage:) forControlEvents:UIControlEventTouchUpInside];
        if (i==0) {
            [button setTitle:@"取消" forState:UIControlStateNormal];
            button.frame=CGRectMake(0, HEIGHT-(isIPhoneXSeries() ? 94:60), 60, 60);
        }else{
            [button setTitle:@"选取" forState:UIControlStateNormal];
            button.frame=CGRectMake(WIDTH-60, HEIGHT-(isIPhoneXSeries() ? 94:60), 60, 60);
        }
    }
}

- (void)selectimage:(UIButton*)sender {
    switch (sender.tag) {
        case 0:
        {
            [self dismissViewControllerAnimated:YES completion:nil];
        }
            break;
        case 1:
        {
            sender.enabled=NO;
            if (self.comeplete) {
                self.comeplete([self cropImage]);
                [self dismissViewControllerAnimated:YES completion:nil];
            }
        }
            break;
        default:
            break;
    }
}

- (UIImage *)cropImage {
    
    CGFloat zoomScale = ScrollView.zoomScale;
    
    float offsetX = ScrollView.contentOffset.x;
    float offsetY = ScrollView.contentOffset.y;
    float aX = offsetX>=0 ? offsetX+imageInset.left : (imageInset.left - ABS(offsetX));
    float aY = offsetY>=0 ? offsetY+imageInset.top : (imageInset.top - ABS(offsetY));
    
    aX = aX /imageBL/ zoomScale;
    aY = aY /imageBL/ zoomScale;
    
    CGFloat aWidth =MakeViewSize.width/imageBL/zoomScale;
    CGFloat aHeight =MakeViewSize.height/imageBL/zoomScale;
    
    CGRect cutRect=CGRectMake(aX, aY, aWidth, aHeight);
    UIImage* image =[self CutImage:[self scaleToSize:self.cutImage size:imageSize] Rect:cutRect];
    
    return image;
}

- (UIImage *)CutImage:(UIImage*)img Rect:(CGRect)rect {
    CGImageRef imageRef = CGImageCreateWithImageInRect(img.CGImage, rect);
    UIImage *image = [UIImage imageWithCGImage:imageRef];
    CGImageRelease(imageRef);
    return image;
}

-(UIImage*)scaleToSize:(UIImage*)img size:(CGSize)size
{
    // 创建一个bitmap的context
    // 并把它设置成为当前正在使用的context
    UIGraphicsBeginImageContext(size);
    // 绘制改变大小的图片
    [img drawInRect:CGRectMake(0, 0, size.width, size.height)];
    // 从当前context中创建一个改变大小后的图片
    UIImage* scaledImage = UIGraphicsGetImageFromCurrentImageContext();
    // 使当前的context出堆栈
    UIGraphicsEndImageContext();
    // 返回新的改变大小后的图片
    return scaledImage;
}
/*
 #pragma mark - Navigation
 
 // In a storyboard-based application, you will often want to do a little preparation before navigation
 - (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
 // Get the new view controller using [segue destinationViewController].
 // Pass the selected object to the new view controller.
 }
 */

@end


#pragma KISnipImageMaskView

#define kMaskViewBorderWidth 2.0f
#define BorderColor [UIColor colorWithRed:150/255.0f green:150/255.0f blue:150/255.0f alpha:0.8f]
@implementation TYCutImageMaskView

- (void)setShowRect:(CGSize)size {
    
    CGFloat x = (CGRectGetWidth(self.bounds) - size.width) / 2;
    CGFloat y = (CGRectGetHeight(self.bounds) - size.height) / 2;
    ShowRect = CGRectMake(x, y, size.width, size.height);
    [self setNeedsDisplay];
}

- (CGSize)ShowRect {
    return ShowRect.size;
}

- (void)drawRect:(CGRect)rect {
    [super drawRect:rect];
    CGContextRef ctx = UIGraphicsGetCurrentContext();
    CGContextSetRGBFillColor(ctx, 0, 0, 0, 0.6);
    CGContextFillRect(ctx, self.bounds);
    
    CGContextSetStrokeColorWithColor(ctx, BorderColor.CGColor);
    CGContextStrokeRectWithWidth(ctx, ShowRect, kMaskViewBorderWidth);
    
    CGContextClearRect(ctx, ShowRect);
}
@end



