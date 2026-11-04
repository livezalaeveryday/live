export type BuildFlavor = 'direct' | 'play';

export interface FlavorConfig {
  flavor: BuildFlavor;
  name: string;
  badge: string;
  channel: string;
  allowsInAppPurchase: boolean;
  showsInformationalSteeringButton: boolean;
  purchaseModel: 'in_app_promptpay' | 'web_informational_only';
  distributionTarget: 'direct_apk' | 'google_play_or_app_store';
  description: string;
}

export const FLAVOR_CONFIGS: Record<BuildFlavor, FlavorConfig> = {
  direct: {
    flavor: 'direct',
    name: 'Livezala Direct (Official APK)',
    badge: 'DIRECT (เว็บตรง)',
    channel: 'livezala.com/mobileapp',
    allowsInAppPurchase: true,
    showsInformationalSteeringButton: false,
    purchaseModel: 'in_app_promptpay',
    distributionTarget: 'direct_apk',
    description: 'แอปแจกตรงผ่านเว็บทางการ ไม่ผูกกฎ Google Play รองรับระบบสั่งซื้อเครดิตและสร้าง PromptPay QR เด้งเปิดแอปธนาคาร',
  },
  play: {
    flavor: 'play',
    name: 'Livezala Play (Google Play Store)',
    badge: 'PLAY (สโตร์)',
    channel: 'Google Play Store / Closed Testing',
    allowsInAppPurchase: false,
    showsInformationalSteeringButton: true,
    purchaseModel: 'web_informational_only',
    distributionTarget: 'google_play_or_app_store',
    description: 'สำหรับ Google Play Console และ Closed Testing ปฏิบัติตามกฎ Anti-Steering ไม่มีโฟลว์สั่งซื้อ/จ่ายเงินในแอป',
  },
};

/**
 * DEFAULT_FLAVOR: ค่าเริ่มต้นของ Build Flavor
 * - 'direct': สำหรับ Release APK แจกตรงผ่านหน้าเว็บ livezala.com/mobileapp (FSD-35)
 * - 'play': สำหรับ Release AAB ส่งตรวจ Google Play Console และ Closed Testing (FSD-29)
 */
export const DEFAULT_FLAVOR: BuildFlavor = 'direct';
