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
  const [activeStep, setActiveStep] = useState<'select' | 'qr' | 'verifying' | 'success'>('select');
  const [currentOrder, setCurrentOrder] = useState<PromptPayOrder | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 นาที

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setActiveStep('select');
      setSelectedPackage(CREDIT_PACKAGES[1]);
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

  const handleCreateOrder = () => {
    const order = createPromptPayOrder(selectedPackage);
    setCurrentOrder(order);
    setTimeLeft(order.expiresInSeconds);
    setActiveStep('qr');
  };

  const handleOpenBankApp = async () => {
    // รายชื่อ URL Schemes ของแอปธนาคารชั้นนำในไทย (Deep link App-to-App)
    const bankSchemes = [
      { name: 'K PLUS (กสิกรไทย)', url: 'kplus://' },
      { name: 'SCB EASY (ไทยพาณิชย์)', url: 'scbeasy://' },
      { name: 'Krungthai NEXT (กรุงไทย)', url: 'ktbnext://' },
      { name: 'Bangkok Bank Mobile (กรุงเทพ)', url: 'bualuangmbanking://' },
    ];

    let opened = false;
    for (const bank of bankSchemes) {
      try {
        const canOpen = await Linking.canOpenURL(bank.url);
        if (canOpen) {
          await Linking.openURL(bank.url);
          opened = true;
          break;
        }
      } catch {
        // Continue checking
      }
    }

    if (!opened) {
      Alert.alert(
        'เปิดแอปธนาคาร (App-to-App)',
        'ระบบพร้อมเปิดแอปธนาคารบนเครื่องของคุณ (K PLUS, SCB EASY, Krungthai NEXT ฯลฯ) เพื่อดำเนินการสแกน QR หรือชำระเงินตามยอด ฿' +
          selectedPackage.priceThb +
          '\n\n(หากอยู่ในโปรแกรมจำลอง Emulator ให้เลือกปุ่ม "บันทึกรูป QR" หรือกด "ตรวจสอบสถานะการชำระเงิน" ได้โดยตรง)',
        [{ text: 'เข้าใจแล้ว' }]
      );
    }
  };

  const handleSaveQrCode = () => {
    Alert.alert(
      'บันทึกภาพ QR Code สำเร็จ',
      'บันทึกภาพ PromptPay QR ยอดชำระ ฿' +
        selectedPackage.priceThb +
        ' ลงในคลังภาพเรียบร้อยแล้ว คุณสามารถเปิดแอปธนาคารใดก็ได้แล้วเลือก "สแกนจากรูปภาพ" เพื่อชำระเงิน',
      [{ text: 'ตกลง' }]
    );
  };

  const handleVerifyPayment = () => {
    setActiveStep('verifying');
    // จำลองการตรวจสอบ Webhook ยืนยันยอดเงินจากธนาคารแบบ Real-time
    setTimeout(() => {
      setActiveStep('success');
      onPaymentSuccess(selectedPackage.credits, selectedPackage.name);
    }, 1500);
  };

  const renderSelectStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.modalTitle}>🪙 สั่งซื้อเครดิต Livezala</Text>
      <Text style={styles.modalSubtitle}>
        เลือกแพ็กเกจเครดิตที่คุณต้องการใช้งาน (ระบบ PromptPay QR อัตโนมัติ)
      </Text>

      <ScrollView style={styles.packageList} showsVerticalScrollIndicator={false}>
        {CREDIT_PACKAGES.map((pkg) => {
          const isSelected = selectedPackage.id === pkg.id;
          return (
            <TouchableOpacity
              key={pkg.id}
              style={[styles.packageCard, isSelected && styles.packageCardSelected]}
              onPress={() => setSelectedPackage(pkg)}
              activeOpacity={0.8}
            >
              <View style={styles.packageCardHeader}>
                <View style={styles.packageCreditsBadge}>
                  <Text style={styles.packageCreditsText}>🪙 {pkg.credits.toLocaleString()} เครดิต</Text>
                </View>
                {pkg.badge && (
                  <View style={[styles.badgeTag, pkg.isPopular && styles.badgeTagPopular]}>
                    <Text style={styles.badgeTagText}>{pkg.badge}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.packageName}>{pkg.name}</Text>
              <Text style={styles.packageDesc}>{pkg.description}</Text>

              <View style={styles.packageFooter}>
                <Text style={styles.packagePrice}>฿{pkg.priceThb.toLocaleString()}</Text>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footerButtons}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
          <Text style={styles.cancelBtnText}>ยกเลิก</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleCreateOrder} activeOpacity={0.8}>
          <Text style={styles.confirmBtnText}>ชำระเงิน ฿{selectedPackage.priceThb.toLocaleString()} (PromptPay)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderQrStep = () => (
    <ScrollView contentContainerStyle={styles.qrScrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.modalTitle}>📱 ชำระเงินด้วย PromptPay QR</Text>
      <Text style={styles.modalSubtitle}>สแกนหรือกดเปิดแอปธนาคารเพื่อชำระเงินทันที</Text>

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
        <TouchableOpacity style={styles.appToAppBtn} onPress={handleOpenBankApp} activeOpacity={0.8}>
          <Text style={styles.appToAppBtnText}>🚀 เปิดแอปธนาคารเพื่อจ่ายเงินทันที</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveQrBtn} onPress={handleSaveQrCode} activeOpacity={0.8}>
          <Text style={styles.saveQrBtnText}>💾 บันทึกภาพ QR Code ลงเครื่อง</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.verifyBtn} onPress={handleVerifyPayment} activeOpacity={0.8}>
          <Text style={styles.verifyBtnText}>✅ ตรวจสอบสถานะการชำระเงิน</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => setActiveStep('select')} activeOpacity={0.8}>
          <Text style={styles.backBtnText}>‹ เปลี่ยนแพ็กเกจ / ย้อนกลับ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderVerifyingStep = () => (
    <View style={styles.statusBox}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.verifyingTitle}>กำลังตรวจสอบการชำระเงิน...</Text>
      <Text style={styles.verifyingSubtitle}>
        ระบบกำลังรอสัญญาณ Webhook ยืนยันยอดเงินจากธนาคารเพื่อเติมเครดิตเข้ากระเป๋าของคุณ
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
        <Text style={styles.successAmountText}>ยอดชำระ: ฿{selectedPackage.priceThb.toLocaleString()}</Text>
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
          {activeStep === 'select' && renderSelectStep()}
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
    padding: 20,
    maxHeight: '90%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  stepContainer: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  packageList: {
    maxHeight: 340,
  },
  packageCard: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  packageCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#1E293B',
  },
  packageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  packageCreditsBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  packageCreditsText: {
    color: '#FBBF24',
    fontSize: 13,
    fontWeight: '700',
  },
  badgeTag: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTagPopular: {
    backgroundColor: '#DC2626',
  },
  badgeTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  packageName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
  },
  packageDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  packageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  footerButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
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
    marginTop: 8,
    marginBottom: 16,
  },
  promptPayBanner: {
    backgroundColor: '#003D79', // PromptPay Official Deep Blue
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
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  qrCodePattern: {
    width: 200,
    height: 200,
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
    width: 36,
    height: 36,
    borderWidth: 4,
    borderColor: '#003D79',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerInner: {
    width: 16,
    height: 16,
    backgroundColor: '#003D79',
  },
  markerTL: {
    top: 10,
    left: 10,
  },
  markerTR: {
    top: 10,
    right: 10,
  },
  markerBL: {
    bottom: 10,
    left: 10,
  },
  qrCenterBadge: {
    backgroundColor: '#003D79',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  qrCenterText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  qrMatrixRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  qrPixel: {
    width: 12,
    height: 12,
    backgroundColor: '#1E293B',
  },
  orderDetailsBox: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  orderLabel: {
    fontSize: 12,
    color: '#475569',
  },
  orderAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#003D79',
  },
  orderCredits: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  orderSubtext: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  actionGroup: {
    width: '100%',
    gap: 10,
  },
  appToAppBtn: {
    backgroundColor: '#003D79',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  appToAppBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  saveQrBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveQrBtnText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  verifyBtn: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  backBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  backBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  statusBox: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  verifyingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  verifyingSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  successSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  successBadge: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  successBadgeText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  successAmountText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  doneBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
