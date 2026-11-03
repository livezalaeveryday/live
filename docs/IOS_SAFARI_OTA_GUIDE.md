# คู่มือระบบติดตั้ง iOS ผ่าน Safari (Safari OTA Distribution Guide)
**Project:** `live` (Member App)  
**Bundle ID:** `com.livezala.app`  
**Distribution Channel:** Over-The-Air (OTA) via Mobile Safari

---

## 1. หลักการทำงานของ Safari OTA (Apple Wireless App Distribution)

Apple ได้ออกแบบโปรโตคอล `itms-services` มาตั้งแต่ iOS 4 เพื่อให้องค์กรและนักพัฒนาสามารถส่งมอบแอปไปยังเครื่อง iPhone/iPad ได้โดยตรงผ่านเว็บบราวเซอร์ Safari โดยไม่ต้องผ่าน App Store หรือ TestFlight

### สถาปัตยกรรมการส่งมอบ:
```
[ ผู้ใช้เปิด Safari บน iPhone ]
              │
              ▼
   กดลิงก์ itms-services://?action=download-manifest&url=https://livezala.com/ios/manifest.plist
              │
              ▼
[ iOS อ่านไฟล์ manifest.plist ผ่าน HTTPS ]
              │
              ├── ดึง URL ของไฟล์ .ipa
              ├── ตรวจสอบ Bundle ID: com.livezala.app
              └── ตรวจสอบ Version & Title
              │
              ▼
[ หน้าต่างยืนยันระบบ iOS แสดงขึ้นมา ]
"livezala.com ต้องการติดตั้ง 'live'" -> [ ติดตั้ง ] [ ยกเลิก ]
              │
              ▼
[ ผู้ใช้กด "ติดตั้ง" ]
              │
              ▼
iOS ดาวน์โหลดไฟล์ live-app-release.ipa ในพื้นหลังและวางไอคอนบนหน้าโฮมทันที
```

---

## 2. โครงสร้างไฟล์บนเซิร์ฟเวอร์ (Hosting Structure)

ในการเปิดใช้งานระบบ Safari OTA ฝั่งเซิร์ฟเวอร์ (เช่น Nginx, Cloudflare R2, หรือ S3) ต้องมีไฟล์ที่เข้าถึงได้ผ่าน HTTPS ดังนี้:

| ไฟล์ | หน้าที่ | ตัวอย่าง URL |
| :--- | :--- | :--- |
| `index.html` | หน้า Landing Page สำหรับกดติดตั้ง + อธิบายวิธี Trust | `https://livezala.com/ios/index.html` |
| `manifest.plist` | ไฟล์ XML กำกับข้อมูลแอป (Property List) | `https://livezala.com/ios/manifest.plist` |
| `live-app-release.ipa` | ไฟล์ไบนารีแอป iOS | `https://livezala.com/ios/live-app-release.ipa` |
| `icon-57x57.png` | ไอคอนแสดงขณะดาวน์โหลด | `https://livezala.com/ios/icon-57x57.png` |
| `icon-512x512.png` | ไอคอนความละเอียดสูง | `https://livezala.com/ios/icon-512x512.png` |

> ⚠️ **ข้อบังคับของ Apple:** ทั้งไฟล์ `manifest.plist` และไฟล์ `.ipa` **ต้องอยู่ภายใต้โปรโตคอล HTTPS พร้อมใบรับรอง SSL ที่ถูกต้อง** (ห้ามใช้ HTTP หรือ Self-signed SSL ที่ไม่ได้ติดตั้ง Root CA)

---

## 3. รูปแบบโค้ดใน manifest.plist

```xml
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
                    <string>https://livezala.com/ios/live-app-release.ipa</string>
                </dict>
                <dict>
                    <key>kind</key>
                    <string>display-image</string>
                    <key>needs-shine</key>
                    <false/>
                    <key>url</key>
                    <string>https://livezala.com/ios/icon-57x57.png</string>
                </dict>
                <dict>
                    <key>kind</key>
                    <string>full-size-image</string>
                    <key>needs-shine</key>
                    <false/>
                    <key>url</key>
                    <string>https://livezala.com/ios/icon-512x512.png</string>
                </dict>
            </array>
            <key>metadata</key>
            <dict>
                <key>bundle-identifier</key>
                <string>com.livezala.app</string>
                <key>bundle-version</key>
                <string>1.0.0</string>
                <key>kind</key>
                <string>software</string>
                <key>title</key>
                <string>live</string>
            </dict>
        </dict>
    </array>
</dict>
</plist>
```

---

## 4. เงื่อนไขการลงนามโค้ด (Code Signing Requirements)

เพื่อให้ iOS ยอมรับและติดตั้งไฟล์ `.ipa` ลงบนเครื่องจริง:
1. **แบบ Enterprise (แนะนำสำหรับบริษัท):**
   - ใช้บัญชี Apple Developer Enterprise Program ($299/ปี)
   - สร้าง In-House Provisioning Profile
   - ข้อดี: สามารถลงบน iPhone ทุกเครื่องได้ไม่จำกัดจำนวน โดยไม่ต้องลงทะเบียน UDID ของเครื่อง
2. **แบบ Ad-Hoc:**
   - ใช้บัญชี Apple Developer Program มาตรฐาน ($99/ปี)
   - ลงทะเบียน UDID ของเครื่องผู้ใช้/ผู้ทดสอบใน Apple Developer Portal (ได้สูงสุด 100 เครื่องต่อปี)
   - ส่งออกด้วย Ad-Hoc Provisioning Profile
3. **แบบ Unsigned / Sideloading (ระหว่างรอบัญชี Apple Developer):**
   - ไฟล์ Unsigned IPA ที่ได้จาก GitHub Actions สามารถนำไปเซ็นและติดตั้งด้วยโปรแกรม Sideload เช่น:
     - Sideloadly (Windows/macOS)
     - AltStore (Windows/macOS)
     - Scarlet / TrollStore

---

## 5. วิธีการให้ผู้ใช้งานเปิดแอปบน iPhone (First-Time User Trust)

เมื่อติดตั้งผ่าน Safari แล้ว ผู้ใช้งานจะเห็นไอคอนแอปบนหน้า Home Screen แต่เมื่อแตะครั้งแรก iOS จะขึ้นกล่องข้อความเตือนความปลอดภัยว่า **"Untrusted Enterprise Developer"** หรือ **"นักพัฒนาองค์กรที่ไม่น่าเชื่อถือ"**

### ขั้นตอนแก้ปัญหา (ทำเพียงครั้งแรกครั้งเดียว):
1. เปิดแอป **การตั้งค่า (Settings)** บน iPhone
2. แตะที่ **ทั่วไป (General)**
3. เลื่อนลงมาแตะที่ **การจัดการ VPN และอุปกรณ์ (VPN & Device Management)**
4. ในส่วน **แอประดับองค์กร (Enterprise App)** หรือ **ผู้พัฒนา (Developer App)** จะเห็นชื่อโปรไฟล์องค์กร
5. แตะชื่อโปรไฟล์ แล้วกดปุ่ม **"เชื่อถือ..." (Trust...)** และกดยืนยัน
6. กลับมาที่หน้าจอโฮม แตะเปิดแอป **live** ใช้งานได้ทันที!
