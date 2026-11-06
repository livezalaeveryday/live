export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceThb: number;
  isPopular?: boolean;
  description: string;
  badge?: string;
}

export interface PromptPayOrder {
  orderId: string;
  packageId: string;
  packageName: string;
  amountThb: number;
  credits: number;
  ref1: string;
  ref2: string;
  expiresInSeconds: number;
  createdAt: number;
  status: 'pending' | 'paid' | 'expired';
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'pkg_starter',
    name: 'Starter Pack',
    credits: 100,
    priceThb: 99,
    description: 'เหมาะสำหรับเริ่มต้นใช้งานระบบตัวละคร AI',
    badge: 'เริ่มต้น',
  },
  {
    id: 'pkg_popular',
    name: 'Popular Pack',
    credits: 300,
    priceThb: 279,
    isPopular: true,
    description: 'แพ็กเกจยอดนิยม คุ้มค่าสำหรับสร้างเนื้อหาต่อเนื่อง',
    badge: 'ยอดนิยม 🔥',
  },
  {
    id: 'pkg_pro',
    name: 'Pro Creator',
    credits: 500,
    priceThb: 449,
    description: 'สำหรับครีเอเตอร์และสตูดิโอ ประหยัดกว่า 10%',
    badge: 'สุดคุ้ม ✨',
  },
  {
    id: 'pkg_ultimate',
    name: 'Ultimate Studio',
    credits: 1000,
    priceThb: 799,
    description: 'แพ็กเกจใหญ่สุดคุ้ม สำหรับงานโมเดลและวิดีโอตัวละคร',
    badge: 'VIP ⭐',
  },
];

/**
 * สร้างข้อมูลคำสั่งซื้อ PromptPay QR แบบ Dynamic
 */
export function createPromptPayOrder(pkg: CreditPackage): PromptPayOrder {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderId = `LZ-PP-${timestamp.toString().slice(-8)}-${randomSuffix}`;
  const ref1 = `087${randomSuffix}4321`;
  const ref2 = `${pkg.credits}${timestamp.toString().slice(-4)}`;

  return {
    orderId,
    packageId: pkg.id,
    packageName: pkg.name,
    amountThb: pkg.priceThb,
    credits: pkg.credits,
    ref1,
    ref2,
    expiresInSeconds: 900, // 15 นาที
    createdAt: timestamp,
    status: 'pending',
  };
}
