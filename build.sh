#!/bin/bash

# 在局应用构建脚本
echo "🏢 在局应用 - 测试版本构建工具"
echo "=================================="
echo ""

# 显示应用信息
echo "📱 应用信息："
echo "   名称: 在局"
echo "   Bundle ID: cc.tuiya.hi3"
echo "   版本: 1.0.1"
echo "   构建号: 202507081517"
echo ""

# 显示选项
echo "请选择构建方式："
echo "1. 简化构建（推荐）- 通过Xcode GUI分发"
echo "2. TestFlight 自动构建"
echo "3. Ad-hoc 自动构建"
echo "4. 查看构建指南"
echo "5. 查看证书配置指南"
echo "6. 退出"
echo ""

read -p "请输入选项 (1-6): " choice

case $choice in
    1)
        echo ""
        echo "🛠  选择了简化构建"
        echo "这将创建Archive并打开Xcode Organizer，您可以手动选择分发方式"
        ./build_simple.sh
        ;;
    2)
        echo ""
        echo "🚀 选择了 TestFlight 自动构建"
        echo "注意：需要正确配置Apple开发者证书"
        echo ""
        read -p "确认已配置好证书? (y/n): " cert_ready
        
        if [[ $cert_ready =~ ^[Yy]$ ]]; then
            ./build_testflight.sh
        else
            echo "请先配置证书，或使用简化构建方式"
        fi
        ;;
    3)
        echo ""
        echo "🌐 选择了 Ad-hoc 自动构建"
        echo ""
        echo "⚠️  注意: Ad-hoc 分发需要老板设备的UDID"
        echo "如果还没有获取UDID，请让老板访问: https://get.udid.io/"
        echo ""
        read -p "是否已经获取UDID并配置了证书? (y/n): " udid_ready
        
        if [[ $udid_ready =~ ^[Yy]$ ]]; then
            echo "开始构建..."
            ./build_adhoc.sh
        else
            echo ""
            echo "📋 请先完成以下步骤："
            echo "1. 获取老板设备UDID: https://get.udid.io/"
            echo "2. 在Apple开发者中心添加设备"
            echo "3. 重新生成Ad-hoc Provisioning Profile"
            echo "4. 重新运行此脚本"
        fi
        ;;
    4)
        echo ""
        echo "📖 打开构建指南..."
        if command -v open &> /dev/null; then
            open "测试版本分发指南.md"
        else
            echo "请查看 测试版本分发指南.md 文件"
        fi
        ;;
    5)
        echo ""
        echo "🔧 打开证书配置指南..."
        if command -v open &> /dev/null; then
            open "证书配置指南.md"
        else
            echo "请查看 证书配置指南.md 文件"
        fi
        ;;
    6)
        echo "👋 再见!"
        exit 0
        ;;
    *)
        echo "❌ 无效选项，请重新运行脚本"
        exit 1
        ;;
esac 