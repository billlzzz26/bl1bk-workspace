#!/bin/bash

# สคริปต์ค้นหาโฟลเดอร์พัฒนา (.git, node_modules, target)
# และอัปเดตไฟล์คอนฟิกสำหรับการลบ

# ทำงานในไดเรกทอรีเดียวกับสคริปต์
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEARCH_ROOT="/storage/emulated/0"
NODE_CONFIG="$SCRIPT_DIR/remove_node.config.json"
TARGET_CONFIG="$SCRIPT_DIR/remove_target.config.json"

echo "🔍 เริ่มต้นการค้นหาโฟลเดอร์พัฒนาใน $SEARCH_ROOT..."
echo "------------------------------------------------"

# ค้นหา node_modules
echo "📦 กำลังค้นหา node_modules..."
node_paths=$(find "$SEARCH_ROOT" -name "node_modules" -type d -prune 2>/dev/null)
echo "$node_paths" | sed 's|^|  - |'

# ค้นหา target (Rust)
echo "🦀 กำลังค้นหา target (Rust build)..."
target_paths=$(find "$SEARCH_ROOT" -name "target" -type d -prune 2>/dev/null)
echo "$target_paths" | sed 's|^|  - |'

# ค้นหา .git
echo "🌿 กำลังค้นหา .git (Repository)..."
git_paths=$(find "$SEARCH_ROOT" -name ".git" -type d -prune 2>/dev/null)
echo "$git_paths" | sed 's|^|  - |'

# ฟังก์ชันสร้าง JSON แบบง่าย
create_json() {
    local file=$1
    local paths=$2
    echo "{" > "$file"
    echo "  \"paths\": [" >> "$file"
    local first=true
    for p in $paths; do
        if [ "$first" = true ]; then
            echo "    \"$p\"" >> "$file"
            first=false
        else
            echo "    ,\"$p\"" >> "$file"
        fi
    done
    echo "  ]" >> "$file"
    echo "}" >> "$file"
}

# อัปเดตไฟล์คอนฟิก
create_json "$NODE_CONFIG" "$node_paths"
create_json "$TARGET_CONFIG" "$target_paths"

echo "------------------------------------------------"
echo "✨ ค้นหาเสร็จสิ้น! อัปเดตไฟล์คอนฟิกเรียบร้อยแล้ว"
echo "✅ $NODE_CONFIG"
echo "✅ $TARGET_CONFIG"
