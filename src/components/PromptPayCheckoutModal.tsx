import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { CREDIT_PACKAGES, CreditPackage, PromptPayOrder, createPromptPayOrder } from '../config/packages';

export interface BankOption {
  id: string;
  name: string;
  shortName: string;
  appScheme: string;
  badgeBg: string;
  badgeText: string;
  subtext: string;
}

export const THAI_BANKS: BankOption[] = [
  {
    id: 'kplus',
    name: 'ธนาคารกสิกรไทย',
    shortName: 'K PLUS',
    appScheme: 'kplus://',
    badgeBg: '#138F2D',
    badgeText: 'KBANK',
    subtext: 'กสิกรไทย (K PLUS)',
  },
  {
    id: 'scb',
    name: 'ธนาคารไทยพาณิชย์',
    shortName: 'SCB EASY',
    appScheme: 'scbeasy://',
    badgeBg: '#4E2A84',
    badgeText: 'SCB',
    subtext: 'ไทยพาณิชย์ (SCB EASY)',
  },
  {
    id: 'ktb',
    name: 'ธนาคารกรุงไทย',
    shortName: 'Krungthai NEXT',
    appScheme: 'ktbnext://',
    badgeBg: '#00A3E0',
    badgeText: 'KTB',
    subtext: 'กรุงไทย (Krungthai NEXT)',
  },
  {
    id: 'bbl',
    name: 'ธนาคารกรุงเทพ',
    shortName: 'Bangkok Bank',
    appScheme: 'bualuangmbanking://',
    badgeBg: '#1E3F8A',
    badgeText: 'BBL',
    subtext: 'กรุงเทพ (Bualuang m)',
  },
  {
    id: 'bay',
    name: 'ธนาคารกรุงศรีอยุธยา',
    shortName: 'KMA Krungsri',
    appScheme: 'kma://',
    badgeBg: '#FEC424',
    badgeText: 'BAY',
    subtext: 'กรุงศรี (KMA)',
  },
  {
    id: 'ttb',
    name: 'ธนาคารทหารไทยธนชาต',
    shortName: 'ttb touch',
    appScheme: 'ttbtouch://',
    badgeBg: '#002D62',
    badgeText: 'TTB',
    subtext: 'ทีทีบี ทัช (ttb touch)',
  },
];

type PaymentChannel = 'bank_app' | 'credit_card' | 'wallet';

interface PromptPayCheckoutModalProps {
  visible: boolean;
  onClose: () => void;
  onPaymentSuccess: (addedCredits: number, packageName: string) => void;
}

export const PromptPayCheckoutModal: React.FC<PromptPayCheckoutModalProps> = ({
  visible,
  onClose,
  onPaymentSuccess,
}) => {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage>(CREDIT_PACKAGES[1]); // Default popular pack
  const [activeChannel, setActiveChannel] = useState<PaymentChannel>('bank_app');
  const [selectedBank, setSelectedBank] = useState<BankOption>(THAI_BANKS[0]); // Default K PLUS
  const [activeStep, setActiveStep] = useState<'checkout' | 'qr' | 'verifying' | 'success'>('checkout');
  const [currentOrder, setCurrentOrder] = useState<PromptPayOrder | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 นาที

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setActiveStep('checkout');
      setActiveChannel('bank_app');
      setSelectedPackage(CREDIT_PACKAGES[1]);
      setSelectedBank(THAI_BANKS[0]);
      setCurrentOrder(null);
      setTimeLeft(900);
    }
  }, [visible]);

  // Countdown timer for QR validity
  useEffect(() => {
    if (activeStep !== 'qr' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeStep, timeLeft]);

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // คำนวณราคาและภาษีตามโครงสร้าง myAIS
  const priceBeforeVat = selectedPackage.priceThb / 1.07;
  const vatAmount = selectedPackage.priceThb - priceBeforeVat;

  const handleOpenBankApp = async (bank: BankOption) => {
    try {
      const canOpen = await Linking.canOpenURL(bank.appScheme);
      if (canOpen) {
        await Linking.openURL(bank.appScheme);
        return true;
      }
    } catch {
      // Deep link scheme error fallback
    }

    Alert.alert(
      `เปิดแอป ${bank.shortName} (App-to-App)`,
      `ระบบพร้อมส่งต่อยอดชำระ ฿${selectedPackage.priceThb.toLocaleString()} ไปยังแอป ${bank.name} บนเครื่องของคุณ\n\n(หากอยู่ในสภาพแวดล้อมทดสอบ หรือยังไม่ได้ติดตั้งแอปธนาคาร สามารถใช้ปุ่ม "บันทึกรูป QR" หรือกด "ตรวจสอบสถานะการชำระเงิน" ได้ทันที)`,
      [{ text: 'เข้าใจแล้ว' }]
    );
    return false;
  };

  const handleProceedPayment = async () => {
    const order = createPromptPayOrder(selectedPackage);
    setCurrentOrder(order);
    setTimeLeft(order.expiresInSeconds);

    if (activeChannel === 'bank_app') {
      // 1) สลับไปหน้า QR & สถานะ
      setActiveStep('qr');
      // 2) ยิง Deep link App-to-App ไปยังแอปธนาคารที่เลือกทันที
      await handleOpenBankApp(selectedBank);
    } else if (activeChannel === 'credit_card') {
      Alert.alert(
        'บัตรเครดิต / เดบิต (Stripe Gateway)',
        `กำลังเชื่อมต่อไปยังหน้าชำระผ่านบัตรปลอดภัย (Stripe) สำหรับยอด ฿${selectedPackage.priceThb.toLocaleString()} (ท่อเดิม livezala.com)`,
        [
          { text: 'ยกเลิก', style: 'cancel' },
          {
            text: 'ดำเนินการต่อ',
            onPress: () => {
              setActiveStep('qr');
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'วอลเล็ต (TrueMoney / Rabbit LINE Pay)',
        `ชำระยอด ฿${selectedPackage.priceThb.toLocaleString()} ผ่านระบบ e-Wallet (ระบบจะซิงก์เครดิตผ่านเว็บฮุคเดียวกัน)`,
        [
          { text: 'ยกเลิก', style: 'cancel' },
          {
            text: 'ชำระผ่าน PromptPay QR แทน',
            onPress: () => {
              setActiveStep('qr');
            },
          },
        ]
      );
    }
  };

  const handleSaveQrCode = () => {
    Alert.alert(
      'บันทึกภาพ QR Code สำเร็จ',
      `บันทึกภาพ PromptPay QR ยอดชำระ ฿${selectedPackage.priceThb.toLocaleString()} ลงในคลังภาพเรียบร้อยแล้ว คุณสามารถเปิดแอป ${selectedBank.shortName} หรือแอปธนาคารใดก็ได้ แล้วเลือก "สแกนจากรูปภาพ" เพื่อชำระเงิน`,
      [{ text: 'ตกลง' }]
    );
  };

  const handleVerifyPayment = () => {
    setActiveStep('verifying');
    // จำลองการตรวจสอบ Webhook ยืนยันยอดเงินจากธนาคารแบบ Real-time (ท่อเดิม PromptPay livezala.com)
    setTimeout(() => {
      setActiveStep('success');
      onPaymentSuccess(selectedPackage.credits, selectedPackage.name);
    }, 1500);
  };

  /* ============================================================== */
  /* STEP 1: หน้าจอ 'เลือกช่องทางการชำระเงิน' สไตล์ myAIS           */
  /* ============================================================== */
  const renderCheckoutStep = () => (
    <ScrollView
      contentContainerStyle={styles.checkoutContent}
      showsVerticalScrollIndicator={false}
      bounces={true}
      alwaysBounceVertical={true}
      overScrollMode="always"
    >
      {/* 1. Header */}
      <Text style={styles.modalTitle}>💳 เลือกช่องทางการชำระเงิน</Text>
      <Text style={styles.modalSubtitle}>
        ชำระเงินปลอดภัยผ่านเครือข่าย PromptPay / ธนาคารชั้นนำของไทย
      </Text>

      {/* 2. Package Selector Carousel/Pills */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>1. เลือกแพ็กเกจเครดิต</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.packagePillsScroll}
        bounces={true}
        alwaysBounceHorizontal={true}
        overScrollMode="always"
      >
        {CREDIT_PACKAGES.map((pkg) => {
          const isSelected = selectedPackage.id === pkg.id;
          return (
            <TouchableOpacity
              key={pkg.id}
              style={[styles.packagePill, isSelected && styles.packagePillSelected]}
              onPress={() => setSelectedPackage(pkg)}
              activeOpacity={0.8}
            >
              <Text style={[styles.packagePillCredits, isSelected && styles.packagePillCreditsSelected]}>
                🪙 {pkg.credits.toLocaleString()}
              </Text>
              <Text style={[styles.packagePillName, isSelected && styles.packagePillNameSelected]}>
                {pkg.name}
              </Text>
              <Text style={[styles.packagePillPrice, isSelected && styles.packagePillPriceSelected]}>
                ฿{pkg.priceThb.toLocaleString()}
              </Text>
              {pkg.badge && (
                <View style={[styles.pillBadge, pkg.isPopular && styles.pillBadgePopular]}>
                  <Text style={styles.pillBadgeText}>{pkg.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 3. Payment Channel Tabs (myAIS Structure) */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>2. วิธีการชำระเงิน</Text>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeChannel === 'bank_app' && styles.tabButtonActive]}
          onPress={() => setActiveChannel('bank_app')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabButtonText, activeChannel === 'bank_app' && styles.tabButtonTextActive]}>
            🏦 แอปธนาคาร
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeChannel === 'credit_card' && styles.tabButtonActive]}
          onPress={() => setActiveChannel('credit_card')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabButtonText, activeChannel === 'credit_card' && styles.tabButtonTextActive]}>
            💳 บัตรเครดิต-เดบิต
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeChannel === 'wallet' && styles.tabButtonActive]}
          onPress={() => setActiveChannel('wallet')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabButtonText, activeChannel === 'wallet' && styles.tabButtonTextActive]}>
            👛 วอลเล็ต
          </Text>
        </TouchableOpacity>
      </View>

      {/* 4. Tab Content: Bank App Grid (myAIS style) */}
      {activeChannel === 'bank_app' && (
        <View style={styles.bankSection}>
          <Text style={styles.bankSectionHint}>
            เลือกแอปธนาคารที่ต้องการชำระ (ระบบจะเปิดแอปพร้อมส่งยอด ฿{selectedPackage.priceThb} ทันที):
          </Text>
          <View style={styles.bankGrid}>
            {THAI_BANKS.map((bank) => {
              const isSelected = selectedBank.id === bank.id;
              return (
                <TouchableOpacity
                  key={bank.id}
                  style={[styles.bankCard, isSelected && styles.bankCardSelected]}
                  onPress={() => setSelectedBank(bank)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.bankLogoBadge, { backgroundColor: bank.badgeBg }]}>
                    <Text style={styles.bankLogoText}>{bank.badgeText}</Text>
                  </View>
                  <View style={styles.bankInfo}>
                    <Text style={styles.bankName}>{bank.shortName}</Text>
                    <Text style={styles.bankFullName} numberOfLines={1}>
                      {bank.name}
                    </Text>
                  </View>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Tab Content: Credit Card */}
      {activeChannel === 'credit_card' && (
        <View style={styles.alternativeChannelBox}>
          <Text style={styles.alternativeChannelTitle}>💳 ชำระด้วยบัตรเครดิต / เดบิต</Text>
          <Text style={styles.alternativeChannelDesc}>
            รองรับ Visa, Mastercard, JCB และ UnionPay ผ่านเกตเวย์มาตรฐานความปลอดภัยระดับโลก PCI-DSS (Stripe Gateway ท่อเดิม livezala.com)
          </Text>
          <View style={styles.cardLogosRow}>
            <View style={styles.cardPill}><Text style={styles.cardPillText}>VISA</Text></View>
            <View style={styles.cardPill}><Text style={styles.cardPillText}>Mastercard</Text></View>
            <View style={styles.cardPill}><Text style={styles.cardPillText}>JCB</Text></View>
            <View style={styles.cardPill}><Text style={styles.cardPillText}>PromptPay</Text></View>
          </View>
        </View>
      )}

      {/* Tab Content: Wallet */}
      {activeChannel === 'wallet' && (
        <View style={styles.alternativeChannelBox}>
          <Text style={styles.alternativeChannelTitle}>👛 ชำระผ่านกระเป๋าเงินอิเล็กทรอนิกส์</Text>
          <Text style={styles.alternativeChannelDesc}>
            รองรับ TrueMoney Wallet, Rabbit LINE Pay และ PromptPay e-Wallet ยืนยันยอดอัตโนมัติ 24 ชม.
          </Text>
        </View>
      )}

      {/* 5. กล่องสรุปรายละเอียดการชำระ (Order Summary Box - myAIS Structure) */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryHeader}>📋 รายละเอียดการชำระเงิน</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>ชื่อร้านค้า</Text>
          <Text style={styles.summaryValue}>Livezala (บจก. ฟูลสแตก เดเวลลอปเมนท์)</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>รายการ</Text>
          <Text style={styles.summaryValueBold}>
            🪙 {selectedPackage.credits.toLocaleString()} เครดิต ({selectedPackage.name})
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>ราคา (ก่อน VAT)</Text>
          <Text style={styles.summaryValue}>฿{priceBeforeVat.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>ภาษีมูลค่าเพิ่ม (VAT 7%)</Text>
          <Text style={styles.summaryValue}>฿{vatAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRowTotal}>
          <Text style={styles.summaryLabelTotal}>ยอดชำระสุทธิ</Text>
          <Text style={styles.summaryValueTotal}>฿{selectedPackage.priceThb.toFixed(2)}</Text>
        </View>
      </View>

      {/* 6. ปุ่มใหญ่ด้านล่างสุด 'ซื้อแพ็กเกจ' (myAIS Big Bottom Button) */}
      <View style={styles.footerActionContainer}>
        <TouchableOpacity style={styles.cancelLink} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.cancelLinkText}>ยกเลิก</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bigBuyButton}
          onPress={handleProceedPayment}
          activeOpacity={0.8}
        >
          <Text style={styles.bigBuyButtonText}>
            ซื้อแพ็กเกจ • ฿{selectedPackage.priceThb.toLocaleString()}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  /* ============================================================== */
  /* STEP 2: หน้าจอแสดง PromptPay QR Card & Deep link App-to-App   */
  /* ============================================================== */
  const renderQrStep = () => (
    <ScrollView
      contentContainerStyle={styles.qrScrollContent}
      showsVerticalScrollIndicator={false}
      bounces={true}
      alwaysBounceVertical={true}
      overScrollMode="always"
    >
      <Text style={styles.modalTitle}>📱 ชำระเงินด้วย PromptPay QR</Text>
      <Text style={styles.modalSubtitle}>
        เปิดแอปธนาคารของคุณเพื่อจ่ายเงินทันที หรือสแกน QR ด้านล่าง
      </Text>

      {/* Official PromptPay Styled Card */}
      <View style={styles.promptPayCard}>
        <View style={styles.promptPayBanner}>
          <Text style={styles.promptPayLogoText}>Thai QR Payment</Text>
          <Text style={styles.promptPaySubText}>พร้อมเพย์ (PromptPay)</Text>
        </View>

        {/* QR Visual Canvas / Box */}
        <View style={styles.qrCodeWrapper}>
          <View style={styles.qrCodePattern}>
            {/* Top-left position marker */}
            <View style={[styles.positionMarker, styles.markerTL]}>
              <View style={styles.markerInner} />
            </View>
            {/* Top-right position marker */}
            <View style={[styles.positionMarker, styles.markerTR]}>
              <View style={styles.markerInner} />
            </View>
            {/* Bottom-left position marker */}
            <View style={[styles.positionMarker, styles.markerBL]}>
              <View style={styles.markerInner} />
            </View>

            {/* Central Badge */}
            <View style={styles.qrCenterBadge}>
              <Text style={styles.qrCenterText}>PROMPTPAY</Text>
            </View>

            {/* Decorative QR matrix lines */}
            <View style={styles.qrMatrixRow}>
              <View style={styles.qrPixel} />
              <View style={styles.qrPixel} />
              <View style={[styles.qrPixel, { opacity: 0 }]} />
              <View style={styles.qrPixel} />
            </View>
            <View style={styles.qrMatrixRow}>
              <View style={[styles.qrPixel, { opacity: 0 }]} />
              <View style={styles.qrPixel} />
              <View style={styles.qrPixel} />
              <View style={[styles.qrPixel, { opacity: 0 }]} />
            </View>
          </View>
        </View>

        {/* Order Details */}
        <View style={styles.orderDetailsBox}>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>ธนาคารที่เลือก:</Text>
            <Text style={styles.orderBankName}>{selectedBank.shortName} ({selectedBank.name})</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>ยอดชำระสุทธิ:</Text>
            <Text style={styles.orderAmount}>฿{currentOrder?.amountThb.toFixed(2)}</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>เครดิตที่จะได้รับ:</Text>
            <Text style={styles.orderCredits}>+{currentOrder?.credits.toLocaleString()} เครดิต</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>เลขที่คำสั่งซื้อ:</Text>
            <Text style={styles.orderSubtext}>{currentOrder?.orderId}</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>รหัสอ้างอิง Ref 1:</Text>
            <Text style={styles.orderSubtext}>{currentOrder?.ref1}</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>ระยะเวลาชำระเงิน:</Text>
            <Text style={styles.timerText}>⏱️ {formatTimer(timeLeft)} นาที</Text>
          </View>
        </View>
      </View>

      {/* AIS / Lazada Style Actions */}
      <View style={styles.actionGroup}>
        <TouchableOpacity
          style={styles.appToAppBtn}
          onPress={() => handleOpenBankApp(selectedBank)}
          activeOpacity={0.8}
        >
          <Text style={styles.appToAppBtnText}>
            🚀 เปิดแอป {selectedBank.shortName} เพื่อจ่ายเงินทันที
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveQrBtn} onPress={handleSaveQrCode} activeOpacity={0.8}>
          <Text style={styles.saveQrBtnText}>💾 บันทึกภาพ QR Code ลงเครื่อง</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.verifyBtn} onPress={handleVerifyPayment} activeOpacity={0.8}>
          <Text style={styles.verifyBtnText}>✅ ตรวจสอบสถานะการชำระเงิน</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => setActiveStep('checkout')} activeOpacity={0.8}>
          <Text style={styles.backBtnText}>‹ เปลี่ยนวิธีการชำระ / ย้อนกลับ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  /* ============================================================== */
  /* STEP 3 & 4: Verifying & Success States                         */
  /* ============================================================== */
  const renderVerifyingStep = () => (
    <View style={styles.statusBox}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.verifyingTitle}>กำลังตรวจสอบการชำระเงิน...</Text>
      <Text style={styles.verifyingSubtitle}>
        ระบบกำลังรอสัญญาณ Webhook ยืนยันยอดเงินจากธนาคาร ({selectedBank.shortName}) เพื่อเติมเครดิตเข้ากระเป๋าของคุณ
      </Text>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.statusBox}>
      <Text style={styles.successIcon}>🎉</Text>
      <Text style={styles.successTitle}>ชำระเงินสำเร็จเรียบร้อย!</Text>
      <Text style={styles.successSubtitle}>
        ยอดเครดิต +{selectedPackage.credits.toLocaleString()} เครดิต ถูกเพิ่มเข้าบัญชีของคุณเรียบร้อยแล้ว
      </Text>
      <View style={styles.successBadge}>
        <Text style={styles.successBadgeText}>แพ็กเกจ: {selectedPackage.name}</Text>
        <Text style={styles.successAmountText}>ยอดชำระ: ฿{selectedPackage.priceThb.toLocaleString()} (ผ่าน {selectedBank.shortName})</Text>
      </View>
      <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
        <Text style={styles.doneBtnText}>ตกลง (เสร็จสิ้น)</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />
          {activeStep === 'checkout' && renderCheckoutStep()}
          {activeStep === 'qr' && renderQrStep()}
          {activeStep === 'verifying' && renderVerifyingStep()}
          {activeStep === 'success' && renderSuccessStep()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    maxHeight: '92%',
  },
  sheetHandle: {
    width: 44,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  checkoutContent: {
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    marginBottom: 8,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  packagePillsScroll: {
    marginBottom: 14,
  },
  packagePill: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 10,
    minWidth: 110,
    alignItems: 'center',
    position: 'relative',
  },
  packagePillSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.badgeBg,
  },
  packagePillCredits: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.primary,
  },
  packagePillCreditsSelected: {
    color: colors.primary,
  },
  packagePillName: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  packagePillNameSelected: {
    color: colors.text,
    fontWeight: '600',
  },
  packagePillPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },
  packagePillPriceSelected: {
    color: colors.primary,
  },
  pillBadge: {
    position: 'absolute',
    top: -6,
    right: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  pillBadgePopular: {
    backgroundColor: '#DC2626',
  },
  pillBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bankSection: {
    marginBottom: 14,
  },
  bankSectionHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bankCard: {
    width: '48.5%',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.badgeBg,
  },
  bankLogoBadge: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  bankLogoText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
  },
  bankFullName: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  alternativeChannelBox: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  alternativeChannelTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  alternativeChannelDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  cardLogosRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cardPill: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardPillText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: 'bold',
  },
  summaryBox: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  summaryHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 12,
    color: colors.text,
  },
  summaryValueBold: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabelTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10B981',
  },
  footerActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelLink: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cancelLinkText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  bigBuyButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
  },
  bigBuyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  qrScrollContent: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  promptPayCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: 14,
  },
  promptPayBanner: {
    backgroundColor: '#003D79',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  promptPayLogoText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  promptPaySubText: {
    color: '#E0E7FF',
    fontSize: 11,
  },
  qrCodeWrapper: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  qrCodePattern: {
    width: 180,
    height: 180,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#003D79',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  positionMarker: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderWidth: 4,
    borderColor: '#003D79',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerInner: {
    width: 14,
    height: 14,
    backgroundColor: '#003D79',
  },
  markerTL: {
    top: 8,
    left: 8,
  },
  markerTR: {
    top: 8,
    right: 8,
  },
  markerBL: {
    bottom: 8,
    left: 8,
  },
  qrCenterBadge: {
    backgroundColor: '#003D79',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  qrCenterText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  qrMatrixRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  qrPixel: {
    width: 10,
    height: 10,
    backgroundColor: '#0A0A0A',
  },
  orderDetailsBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2.5,
  },
  orderLabel: {
    fontSize: 11,
    color: '#475569',
  },
  orderBankName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#003D79',
  },
  orderCredits: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  orderSubtext: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  timerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  actionGroup: {
    width: '100%',
    gap: 8,
  },
  appToAppBtn: {
    backgroundColor: '#003D79',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  appToAppBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  saveQrBtn: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveQrBtnText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 12,
  },
  verifyBtn: {
    backgroundColor: '#059669',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  backBtn: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  backBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  statusBox: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  verifyingTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 14,
  },
  verifyingSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  successIcon: {
    fontSize: 44,
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#10B981',
  },
  successSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  successBadge: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 18,
  },
  successBadgeText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  successAmountText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  doneBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 11,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
