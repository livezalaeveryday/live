package com.livezala.app

import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "LivezalaApp"

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    hideSystemBars()
  }

  override fun invokeDefaultOnBackPressed() {
    // คำสั่งเจ้าของ 2026-11-04 16:41:
    // กดย้อนกลับ/ปัดย้อน ห้ามทำให้ออกจากแอปในทุกกรณี แม้แต่อยู่ที่หน้าแรกสุดของ stack
    // (อยู่หน้าแรกแล้วย้อนอีกก็ให้อยู่หน้าเดิม ไม่ปิดแอป)
    // การออกจากแอปมีทางเดียวคือผู้ใช้ยกหน้าจอ multitask (recent apps) แล้วปัดปิดแอปเอง
    // ไม่เรียก super.invokeDefaultOnBackPressed() หรือ finish() เด็ดขาด
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    // คำสั่งเจ้าของ: ซ่อนแถบสถานะด้านบน (immersive full screen) และซ่อนซ้ำเมื่อ focus กลับมา
    if (hasFocus) {
      hideSystemBars()
    }
  }

  private fun hideSystemBars() {
    val windowInsetsController = WindowCompat.getInsetsController(window, window.decorView)
    windowInsetsController.systemBarsBehavior =
        WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    windowInsetsController.hide(WindowInsetsCompat.Type.statusBars())

    @Suppress("DEPRECATION")
    window.decorView.systemUiVisibility = (
        View.SYSTEM_UI_FLAG_FULLSCREEN
        or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
    )
  }

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}

