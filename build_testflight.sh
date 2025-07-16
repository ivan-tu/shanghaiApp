#!/bin/bash

# TestFlight 构建脚本 - 在局应用
echo "🚀 开始构建在局应用的TestFlight版本..."

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
    -archivePath "./build/${PROJECT_NAME}.xcarchive" \
    -allowProvisioningUpdates

# 检查Archive是否成功
if [ $? -ne 0 ]; then
    echo "❌ Archive构建失败"
    exit 1
fi

echo "✅ Archive构建成功!"

# 导出IPA用于TestFlight
echo "📤 导出IPA文件用于TestFlight上传..."

# 创建ExportOptions.plist
cat > ExportOptions.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>PCRMMV2NNZ</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
</dict>
</plist>
EOF

# 导出IPA
xcodebuild -exportArchive \
    -archivePath "./build/${PROJECT_NAME}.xcarchive" \
    -exportPath "./build/TestFlight" \
    -exportOptionsPlist ExportOptions.plist

if [ $? -ne 0 ]; then
    echo "❌ IPA导出失败"
    exit 1
fi

echo "✅ IPA导出成功!"
echo "📁 IPA文件位置: ./build/TestFlight/${PROJECT_NAME}.ipa"

# 上传到App Store Connect
echo "☁️ 上传到App Store Connect..."
echo "您可以使用以下命令上传："
echo "xcrun altool --upload-app -f \"./build/TestFlight/${PROJECT_NAME}.ipa\" -u \"您的AppleID\" -p \"应用专用密码\""
echo ""
echo "或者手动上传："
echo "1. 打开Xcode"
echo "2. Window > Organizer"
echo "3. 选择刚才的Archive"
echo "4. 点击 'Distribute App'"
echo "5. 选择 'App Store Connect'"

# 清理临时文件
rm -f ExportOptions.plist

echo ""
echo "🎉 构建完成！接下来的步骤："
echo "1. 上传IPA到App Store Connect"
echo "2. 在App Store Connect中处理TestFlight构建"
echo "3. 添加老板为测试用户"
echo "4. 发送TestFlight邀请" 