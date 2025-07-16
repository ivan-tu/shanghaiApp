#!/bin/bash

# Ad-hoc 构建脚本 - 在局应用
echo "🚀 开始构建在局应用的Ad-hoc版本..."

# 设置变量
PROJECT_NAME="XZVientiane"
SCHEME="XZVientiane"
WORKSPACE="XZVientiane.xcworkspace"
CONFIGURATION="Release"

# 检查是否有workspace文件
if [ ! -d "$WORKSPACE" ]; then
    echo "❌ 错误: 找不到 $WORKSPACE 文件"
    echo "请确保在项目根目录下运行此脚本"
    exit 1
fi

# 清理之前的构建
echo "🧹 清理之前的构建..."
xcodebuild clean -workspace "$WORKSPACE" -scheme "$SCHEME" -configuration "$CONFIGURATION"

# 构建Archive
echo "📦 开始构建Archive..."
xcodebuild archive \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration "$CONFIGURATION" \
    -archivePath "./build/${PROJECT_NAME}_adhoc.xcarchive" \
    -allowProvisioningUpdates

# 检查Archive是否成功
if [ $? -ne 0 ]; then
    echo "❌ Archive构建失败"
    exit 1
fi

echo "✅ Archive构建成功!"

# 导出IPA用于Ad-hoc分发
echo "📤 导出IPA文件用于Ad-hoc分发..."

# 创建ExportOptions.plist
cat > ExportOptions_adhoc.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>ad-hoc</string>
    <key>teamID</key>
    <string>PCRMMV2NNZ</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
    <key>thinning</key>
    <string>&lt;none&gt;</string>
</dict>
</plist>
EOF

# 导出IPA
xcodebuild -exportArchive \
    -archivePath "./build/${PROJECT_NAME}_adhoc.xcarchive" \
    -exportPath "./build/AdHoc" \
    -exportOptionsPlist ExportOptions_adhoc.plist

if [ $? -ne 0 ]; then
    echo "❌ IPA导出失败"
    exit 1
fi

echo "✅ IPA导出成功!"
echo "📁 IPA文件位置: ./build/AdHoc/${PROJECT_NAME}.ipa"

# 创建安装清单文件
echo "📝 创建安装清单文件..."

IPA_SIZE=$(stat -f%z "./build/AdHoc/${PROJECT_NAME}.ipa")
BUNDLE_VERSION=$(grep -A1 "CFBundleShortVersionString" XZVientiane/Info.plist | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')

cat > "./build/AdHoc/manifest.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>items</key>
    <array>
        <dict>
            <key>assets</key>
            <array>
                <dict>
                    <key>kind</key>
                    <string>software-package</string>
                    <key>url</key>
                    <string>https://yourserver.com/${PROJECT_NAME}.ipa</string>
                </dict>
            </array>
            <key>metadata</key>
            <dict>
                <key>bundle-identifier</key>
                <string>cc.tuiya.hi3</string>
                <key>bundle-version</key>
                <string>${BUNDLE_VERSION}</string>
                <key>kind</key>
                <string>software</string>
                <key>title</key>
                <string>在局</string>
            </dict>
        </dict>
    </array>
</dict>
</plist>
EOF

# 创建下载页面
cat > "./build/AdHoc/download.html" << EOF
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>在局 - 测试版下载</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 400px;
            width: 100%;
        }
        .app-icon {
            width: 100px;
            height: 100px;
            background: #007AFF;
            border-radius: 20px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            color: white;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .version {
            color: #666;
            font-size: 14px;
            margin-bottom: 30px;
        }
        .download-btn {
            background: #007AFF;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 10px;
            font-size: 18px;
            text-decoration: none;
            display: inline-block;
            transition: background 0.3s;
        }
        .download-btn:hover {
            background: #0056CC;
        }
        .note {
            margin-top: 20px;
            font-size: 12px;
            color: #999;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="app-icon">📱</div>
        <h1>在局</h1>
        <div class="version">测试版本 v${BUNDLE_VERSION}</div>
        <a href="itms-services://?action=download-manifest&url=https://yourserver.com/manifest.plist" class="download-btn">
            📥 安装应用
        </a>
        <div class="note">
            ⚠️ 注意事项：<br>
            1. 请使用Safari浏览器打开此链接<br>
            2. 安装前需要在"设置 > 通用 > 设备管理"中信任开发者<br>
            3. 此为测试版本，仅供内部测试使用
        </div>
    </div>
</body>
</html>
EOF

# 清理临时文件
rm -f ExportOptions_adhoc.plist

echo ""
echo "🎉 Ad-hoc构建完成！"
echo ""
echo "📋 接下来的步骤："
echo "1. 将 ./build/AdHoc/ 文件夹上传到您的服务器"
echo "2. 修改 manifest.plist 和 download.html 中的服务器地址"
echo "3. 确保老板的设备UDID已添加到Ad-hoc证书中"
echo "4. 发送下载链接给老板：https://yourserver.com/download.html"
echo ""
echo "📱 UDID获取方法："
echo "- 设备连接到电脑，打开Xcode > Window > Devices and Simulators"
echo "- 或者使用 https://get.udid.io/ 获取" 