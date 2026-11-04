# คู่มือการติดตั้งและวิธี Build ซ้ำได้ (Reproducible Build Guide)
**Project Name:** `live` (Member App)  
**Package Name / Application ID:** `com.livezala.app`  
**Platform:** Android & iOS (React Native 0.88.1, TypeScript 100%)

---

## 1. กลยุทธ์การปล่อยแอปตามคำสั่งเจ้าของ (Phased Release Strategy)

1. **เฟส 1 (สร้างฐานผู้ใช้จริง & กระจายตรง):**
   - **Android:** ผ่าน Google Play Store (Internal / Closed Testing -> Production) จากไฟล์ `app-release.aab`
   - **iOS:** ติดตั้งโดยตรงผ่าน **Safari บน iPhone (Over-The-Air: Safari OTA)** จากไฟล์ `.ipa` ที่คอมไพล์ด้วย **GitHub Actions (macOS Runner)** ไม่รอคิวตรวจของ Apple App Store เพื่อเก็บฐานผู้ใช้งานได้ทันที
2. **เฟส 2 (ขึ้น App Store ทางการของ Apple):**
   - ดำเนินการยื่นตรวจขึ้น Apple App Store เมื่อฐานผู้ใช้และระบบตัวละครมีความเสถียร โดยไม่ต้องแก้โค้ดแกนกลาง

---

## 2. ข้อควรระวังพิเศษบนระบบ Windows (Windows Long Path & ENAMETOOLONG Prevention)

Windows มีข้อจำกัด `MAX_PATH` (260 ตัวอักษร) ตามค่าเริ่มต้น ซึ่งมักทำให้เกิดข้อผิดพลาด `ENAMETOOLONG` ในระหว่างการสร้าง Intermediate files หรือ Caching ของ Gradle และ Node.js
- **แนวทางแก้ไขที่ใช้จริง:** 
  - ติดตั้งและวางตัวโปรเจกต์ไว้ที่ Path สั้น: `F:\livezala-app`
  - ทำ Directory Junction (`mklink /J`) เชื่อมไปยัง Workspace หลักของโครงการ:
    ```powershell
    New-Item -ItemType Junction -Path "F:\PaperClip\data\instances\default\projects\86f22ae7-2a66-4927-93f0-1692998afb8f\2cb844a3-ca4c-4b41-b614-6544a219fd8e\_default\livezala-app" -Target "F:\livezala-app"
    ```
  - ให้รันคำสั่ง build หรือ compile ภายใต้ Path สั้น `F:\livezala-app` เสมอ

---

## 3. สิ่งที่ต้องติดตั้งล่วงหน้า (Prerequisites)

1. **Node.js & npm:**
   - Node.js >= 20.x หรือ >= 22.11.0 (ตรวจด้วย `node -v`)
   - npm >= 10.x หรือ 11.0.0
2. **Java Development Kit (JDK) [สำหรับ Android]:**
   - แนะนำ OpenJDK 17/21 หรือ JetBrains Runtime (JBR 25) จาก Android Studio
   - ตำแหน่งบนเครื่อง Windows: `C:\Program Files\Android\Android Studio\jbr`
3. **Android SDK [สำหรับ Android]:**
   - ตำแหน่ง SDK: `C:\Users\araws\AppData\Local\Android\Sdk`
   - Platform: `android-37.0` (Android 15+)
   - Build Tools: `36.0.0`
4. **Xcode & CocoaPods [สำหรับ iOS]:**
   - macOS Runner บน GitHub Actions (ติดตั้งเครื่องมือ xcodebuild, pod ให้อัตโนมัติ)

---

## 4. ขั้นตอนการตั้งค่า Environment Variables (Android Terminal)

```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "C:\Users\araws\AppData\Local\Android\Sdk"
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"
```

---

## 5. การตรวจสอบความถูกต้องของโค้ด (Lint & Type Check)

```powershell
cd "F:\livezala-app"
npm install
npx tsc --noEmit
```
*ผลลัพธ์ที่ถูกต้อง: ผ่านโดยไม่มี error 100%*

---

## 6. คำสั่ง Build ฝั่ง Android แยกตาม 2 Build Flavors (คำสั่งเจ้าของ 2026-11-04)

โครงการรองรับการแยกเป็น 2 Build Flavor จากโค้ดชุดเดียวกันด้วย Flag:

### 6.1 Flavor `direct`: Build ไฟล์ APK สำหรับแจกผ่าน livezala.com/mobileapp (สไตล์ AIS/Lazada)
- **คุณสมบัติ:** ไม่ผูกกฎ Google Play มีระบบสั่งซื้อเครดิตและสร้าง PromptPay QR Code ไดนามิก พร้อมปุ่มเปิดแอปธนาคาร (App-to-App: K PLUS, SCB EASY, Krungthai NEXT ฯลฯ) หรือบันทึกภาพ QR เพื่อสแกน และระบบยืนยันยอดเงินผ่าน Webhook อัตโนมัติ
- **คำสั่ง Build One-Liner:**
  ```powershell
  cd "F:\livezala-app"
  npm run build:direct-apk
  ```
  *(หรือ `node scripts/set-flavor.js direct` แล้วรัน `cd android; .\gradlew.bat :app:assembleRelease`)*
- **ตำแหน่งไฟล์ผลลัพธ์ (APK Output):**  
  `F:\livezala-app\android\app\build\outputs\apk\release\app-release.apk`
- **การนำไปใช้งาน:** ผู้ประสานงาน (พี่ใหญ่ - Muse) นำไปวางบนศูนย์รวมดาวน์โหลด https://livezala.com/mobileapp

### 6.2 Flavor `play`: Build ไฟล์ AAB สำหรับขึ้น Google Play Console (Closed Testing 12 บัญชี)
- **คุณสมบัติ:** ห้ามมีโฟลว์สั่งซื้อ/จุดชำระเงินดิจิทัลในแอปเด็ดขาด (ป้องกันการถูกปฏิเสธจาก Google Play และ Apple) โดยใช้โมเดล "ปุ่มบอกข้อมูลข้อเท็จจริง" (Informational Button Only: `ช่องทางการซื้อ: เว็บไซต์ livezala.com` ชี้ไปที่หน้าพอร์ทัลสมาชิกหลัก https://livezala.com)
- **คำสั่ง Build One-Liner:**
  ```powershell
  cd "F:\livezala-app"
  npm run build:play-bundle
  ```
  *(หรือ `node scripts/set-flavor.js play` แล้วรัน `cd android; .\gradlew.bat :app:bundleRelease`)*
- **ตำแหน่งไฟล์ผลลัพธ์ (AAB Output):**  
  `F:\livezala-app\android\app\build\outputs\bundle\release\app-release.aab`
- **การนำไปใช้งาน:** ส่งมอบให้พี่ใหญ่ (Muse) และฝ่าย QA (FSD-32) สำหรับ Closed Testing 12 บัญชี 14 วัน

---

## 7. ระบบ Build ฝั่ง iOS ผ่าน GitHub Actions (CI/CD)

เนื่องจากนักพัฒนาและเซิร์ฟเวอร์หลักทำงานบนสภาพแวดล้อม Windows โครงการจึงใช้ **GitHub Actions macOS Runner (`macos-14`)** เป็นแกนหลักในการคอมไพล์ฝั่ง iOS:

- **ไฟล์ Workflow:** `.github/workflows/ios-build.yml`
- **การทำงานของ Workflow:**
  1. ดึงโค้ดขึ้น macOS Runner
  2. ตั้งค่า Node.js และรัน `npm ci`
  3. แคชและติดตั้ง CocoaPods (`pod install` ในโฟลเดอร์ `ios/`)
  4. หากมี Apple Signing Secrets (`APPLE_CERTIFICATE_BASE64`, `PROVISIONING_PROFILE_BASE64`) จะทำการเซ็นแอปแบบ Ad-Hoc หรือ Enterprise อัตโนมัติ
  5. หากยังไม่มี Secrets จะทำการ Archive และแพ็กเกจเป็น Unsigned IPA ให้ดาวน์โหลดไปทดสอบผ่านเครื่องมือ Sideload (AltStore, Sideloadly, TrollStore)
  6. สร้างไฟล์ `manifest.plist` และหน้าเว็บ `index.html` สำหรับติดตั้งผ่าน Safari OTA โดยอัตโนมัติ
  7. อัปโหลดเป็น GitHub Actions Artifacts พร้อมใช้งานทันที

---

## 8. ระบบติดตั้งแบบ Over-The-Air (Safari OTA) ฝั่ง iOS

### 8.1 โปรโตคอลการติดตั้งบน Safari
iOS รองรับการดาวน์โหลดและติดตั้งแอปจากเว็บไซต์โดยไม่ต้องผ่าน App Store ผ่านโปรโตคอล `itms-services`:
```html
<a href="itms-services://?action=download-manifest&url=https://livezala.com/mobileapp/manifest.plist">
  📲 ติดตั้งแอป live บน iPhone
</a>
```

### 8.2 โครงสร้างไฟล์สำหรับ Safari OTA
1. **`live-app-release.ipa`:** ไฟล์แอปที่เซ็นด้วย Enterprise Certificate หรือ Ad-Hoc Profile
2. **`manifest.plist`:** ไฟล์ XML อธิบายข้อมูลแอป Bundle ID (`com.livezala.app`), Version (`1.0.0`), App Title (`live`)
3. **`index.html`:** หน้า Landing Page ตรวจจับ Safari บน iPhone พร้อมคู่มือ 3 ขั้นตอนในการกด Trust Certificate

### 8.3 การตั้งค่าบน iPhone เมื่อติดตั้งครั้งแรก
1. เปิดหน้าเว็บใน **Safari บน iPhone** แล้วกดปุ่มติดตั้ง
2. เมื่อดาวน์โหลดเสร็จและกดเปิดแอปครั้งแรก ให้ไปที่:  
   **การตั้งค่า > ทั่วไป > การจัดการ VPN และอุปกรณ์**  
   *(Settings > General > VPN & Device Management)*
3. เลือกชื่อผู้พัฒนา / องค์กร แล้วกด **"เชื่อถือ" (Trust)** ก็จะเข้าใช้งานได้ทันที

---

## 9. กฎความปลอดภัยและการส่งตรวจ (Release Governance)

- **ห้ามเผยแพร่หรือส่งตรวจเข้า Play Store หรือ App Store โดยไม่มีคำสั่งเจ้าของ**
- ไฟล์ AAB จัดเตรียมไว้สำหรับการทดสอบภายใน (Internal Testing) และการทดสอบแบบปิด 12 บัญชี 14 วัน (FSD-32)
- ฝั่ง iOS เริ่มต้นด้วยระบบ Safari OTA ตามคำสั่งเจ้าของเพื่อเก็บฐานผู้ใช้จริงก่อน
