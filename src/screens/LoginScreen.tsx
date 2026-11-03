import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { signInWithGoogle, isLoading } = useAuth();

  const openAccountDeletionLink = () => {
    Linking.openURL('https://livezala.com/delete-account');
  };

  return (
    <View style={styles.container}>
      {/* Brand Header */}
      <View style={styles.brandBox}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoL}>L</Text>
          <View style={styles.logoDot} />
        </View>

        <Text style={styles.title}>live</Text>
        <Text style={styles.tagline}>พื้นที่โซเชียลตัวละคร AI ระดับมืออาชีพ</Text>
        <Text style={styles.subtext}>
          ขับเคลื่อนด้วยระบบสมาชิกและ DNA ตัวละครเดียวกับ Livezala.com
        </Text>
      </View>

      {/* Login Action Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>เข้าสู่ระบบเพื่อเริ่มต้น</Text>
        <Text style={styles.cardDescription}>
          ระบบรองรับการเข้าสู่ระบบด้วยบัญชี Google อย่างเดียว เพื่อความปลอดภัยและผูกบัญชีกับระบบสมาชิกเดิม
        </Text>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={signInWithGoogle}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          <View style={styles.googleIconBox}>
            <Text style={styles.googleIconText}>G</Text>
          </View>
          <Text style={styles.googleButtonText}>
            {isLoading ? 'กำลังเชื่อมต่อ...' : 'เข้าสู่ระบบด้วย Google'}
          </Text>
        </TouchableOpacity>

        <View style={styles.policyNotice}>
          <Text style={styles.policyText}>
            เมื่อเข้าสู่ระบบ แสดงว่าคุณยอมรับข้อกำหนดการให้บริการ และประกาศความปลอดภัยข้อมูลตามมาตรฐาน Google Play
          </Text>
        </View>
      </View>

      {/* Compliance Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={openAccountDeletionLink}>
          <Text style={styles.footerLink}>คำขอลบบัญชีและข้อมูล (Delete Account Policy)</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>live v1.0.0 (com.livezala.app)</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    padding: 24,
  },
  brandBox: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  logoL: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 42,
    fontFamily: 'monospace',
  },
  logoDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: 14,
    right: 14,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tagline: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 6,
  },
  subtext: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  googleButton: {
    backgroundColor: colors.white,
    height: 50,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  googleIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleIconText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  googleButtonText: {
    color: '#1F2937',
    fontWeight: '700',
    fontSize: 15,
  },
  policyNotice: {
    marginTop: 16,
  },
  policyText: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  footerLink: {
    color: colors.info,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  versionText: {
    color: colors.textMuted,
    fontSize: 11,
  },
});
