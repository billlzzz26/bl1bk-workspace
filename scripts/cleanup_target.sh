#!/bin/bash

# สคริปต์ลบ target (Rust build) พร้อมระบบยืนยันตัวต่อตัว

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/remove_target.config.json"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ ไม่พบไฟล์คอนฟิก: $CONFIG_FILE"
    echo "💡 กรุณารัน ./find_dev_dirs.sh ก่อนเพื่อสร้างไฟล์คอนฟิก"
    exit 1
fi

# อ่านพาธจาก JSON
paths=$(grep -o '"/storage/[^"]*target"' "$CONFIG_FILE" | sed 's/"//g')

if [ -z "$paths" ]; then
    echo "⚠️ ไม่พบรายการพาธ target ในไฟล์คอนฟิก"
    exit 0
fi

echo "🧹 เริ่มต้นระบบตรวจสอบขยะ Rust target..."
echo "---------------------------------------"

count=0
for path in $paths; do
    if [ -d "$path" ]; then
        # สกัดชื่อโปรเจกต์ออกมา
        project_name=$(echo "$path" | rev | cut -d'/' -f2- | rev)
        
        echo -n "❓ ต้องการลบ build artifacts (target) ใน: [$project_name] ใช่หรือไม่? (y/n): "
        read -r answer
        
        if [[ "$answer" =~ ^[Yy]$ ]]; then
            echo "📂 กำลังลบ: $path"
            rm -rf "$path"
            if [ $? -eq 0 ]; then
                echo "✅ ลบสำเร็จ"
                ((count++))
            else
                echo "❌ ลบไม่สำเร็จ"
            fi
        else
            echo "⏭️ ข้ามรายการนี้"
        fi
    else
        echo "ℹ️ ไม่พบไดเรกทอรี: $path"
    fi
    echo "---"
done

echo "---------------------------------------"
echo "✨ การจัดการเสร็จสิ้น! ลบไปทั้งหมด $count รายการ"
