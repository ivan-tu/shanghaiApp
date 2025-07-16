#!/bin/bash

# 简化构建脚本 - 在局应用
echo "🏢 在局应用 - 简化构建工具"
echo "=============================="
echo ""

# 设置变量
PROJECT_NAME="XZVientiane"
SCHEME="XZVientiane"
WORKSPACE="XZVientiane.xcworkspace"

echo "📱 应用信息："
echo "   名称: 在局"
echo "   Bundle ID: cc.tuiya.hi3"
echo "   版本: 1.0.1"
echo ""

echo "🔧 这个脚本将会："
echo "1. 在Xcode中构建Archive"
echo "2. 自动打开Organizer窗口"
echo "3. 您可以在Organizer中手动分发应用"
echo ""

read -p "是否继续？(y/n): " continue_build

if [[ ! $continue_build =~ ^[Yy]$ ]]; then
    echo "操作已取消"
    exit 0
fi

# 检查workspace文件
if [ ! -d "$WORKSPACE" ]; then
    echo "❌ 错误: 未找到 $WORKSPACE"
    exit 1
fi

echo ""
echo "🚀 开始构建Archive..."

# 清理之前的构建
echo "🧹 清理之前的构建..."
xcodebuild clean -workspace "$WORKSPACE" -scheme "$SCHEME" -configuration Release

# 构建Archive（不导出，让用户在Xcode中处理）
echo "📦 构建Archive..."
xcodebuild archive \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration Release \
    -archivePath "./build/${PROJECT_NAME}_$(date +%Y%m%d_%H%M%S).xcarchive" \
    -allowProvisioningUpdates

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Archive构建成功!"
    echo ""
    echo "🎯 接下来的步骤："
    echo "1. 正在打开Xcode Organizer..."
    echo "2. 在Organizer中选择刚创建的Archive"
    echo "3. 点击 'Distribute App'"
    echo "4. 选择分发方式："
    echo "   - App Store Connect (用于TestFlight)"
    echo "   - Ad Hoc (用于直接分发)"
    echo "   - Development (用于开发测试)"
    echo ""
    
    # 打开Xcode Organizer
    open -a Xcode
    sleep 2
    osascript -e 'tell application "Xcode" to activate'
    osascript -e 'tell application "System Events" to keystroke "9" using {command down, shift down}'
    
    echo "📋 Organizer已打开，请按照上述步骤继续操作"
    
else
    echo ""
    echo "❌ Archive构建失败"
    echo ""
    echo "🔧 可能的解决方案："
    echo "1. 在Xcode中打开项目，检查证书配置"
    echo "2. 确保Apple ID已登录：Xcode > Preferences > Accounts"
    echo "3. 检查Bundle ID和Team配置是否正确"
    echo "4. 尝试在Xcode中手动Archive：Product > Archive"
fi

echo ""
echo "📚 如需更多帮助，请查看 测试版本分发指南.md" 