import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Linking, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

interface ProfileScreenProps {
  onOpenWordFilters: () => void;
  onOpenBlockedList: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onOpenWordFilters,
  onOpenBlockedList,
}) => {
  const { user, signOut } = useAuth();
  const { wordFilters, blockedEntities } = useApp();

  const handleOpenWebAccount = () => {
    // คำสั่งเจ้าของ (2026-11-04): ปุ่มบอกข้อมูลเปิดไปหน้าจัดการบัญชีสมาชิกบนเว็บ livezala.com (ไม่ใช่หน้าซื้อ/billing)
    Linking.openURL('https://livezala.com');
  };

  const handleOpenDeleteAccount = () => {
    Linking.openURL('https://livezala.com/delete-account');
  };

  const handleSignOut = () => {
    Alert.alert('ออกจากระบบ', 'คุณต้องการออกจากระบบใช่หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ออกจากระบบ', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="โปรไฟล์และการตั้งค่า" subtitle="จัดการบัญชีสมาชิกและความปลอดภัย" showLogo />

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Card */}
        <View style={styles.userCard}>
          <Image
            source={{ uri: user?.avatarUrl || 'https://livezala.com/media/avatar/default' }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'สมาชิก Livezala'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'บัญชี Google'}</Text>
            <Text style={styles.statusBadge}>🟢 เชื่อมต่อระบบสมาชิก Livezala แล้ว</Text>
          </View>
        </View>

        {/* User Credits & Membership Card (Permanent Rule: 100% Free App, No Point of Sale, No Steering) */}
        <View style={styles.creditCard}>
          <View style={styles.creditHeader}>
            <Text style={styles.creditTitle}>🪙 ยอดเครดิตคงเหลือ</Text>
            <Text style={styles.creditAmount}>{user?.credits.toLocaleString() || '0'} เครดิต</Text>
          </View>
          <View style={styles.membershipRow}>
            <Text style={styles.membershipLabel}>สถานะสมาชิก:</Text>
            <Text style={styles.membershipValue}>สมาชิก Livezala (Active)</Text>
          </View>
          <Text style={styles.creditNote}>
            จัดการบัญชีของคุณที่ livezala.com
          </Text>
          <TouchableOpacity style={styles.webInfoButton} onPress={handleOpenWebAccount} activeOpacity={0.8}>
            <Text style={styles.webInfoButtonText}>ช่องทางการซื้อ: เว็บไซต์ livezala.com</Text>
          </TouchableOpacity>
        </View>

        {/* Safety & Content Settings Group */}
        <Text style={styles.groupHeader}>ความปลอดภัยและเนื้อหา (Safety & Moderation)</Text>

        <TouchableOpacity style={styles.menuRow} onPress={onOpenWordFilters} activeOpacity={0.8}>
          <View style={styles.menuLeft}>
            <Text style={styles.menuIcon}>🛡️</Text>
            <View>
              <Text style={styles.menuTitle}>ตัวกรองคำส่วนตัว (Personal Word Filter)</Text>
              <Text style={styles.menuSubtitle}>
                กรองคำที่คุณไม่ต้องการเห็นในฟีด ({wordFilters.length} คำที่ตั้งไว้)
              </Text>
            </View>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuRow} onPress={onOpenBlockedList} activeOpacity={0.8}>
          <View style={styles.menuLeft}>
            <Text style={styles.menuIcon}>🚫</Text>
            <View>
              <Text style={styles.menuTitle}>รายการที่ถูกบล็อก (Blocked Entities)</Text>
              <Text style={styles.menuSubtitle}>
                จัดการตัวละครและผู้ใช้ที่คุณบล็อกไว้ ({blockedEntities.length} รายการ)
              </Text>
            </View>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        {/* Legal & Policy Group */}
        <Text style={styles.groupHeader}>กฎหมายและความเป็นส่วนตัว (Legal & Compliance)</Text>

        <TouchableOpacity style={styles.menuRow} onPress={handleOpenDeleteAccount} activeOpacity={0.8}>
          <View style={styles.menuLeft}>
            <Text style={styles.menuIcon}>🗑️</Text>
            <View>
              <Text style={styles.menuTitle}>คำขอลบบัญชีและข้อมูล (Delete Account)</Text>
              <Text style={styles.menuSubtitle}>ลิงก์ตามคำประกาศความปลอดภัยข้อมูล Google Play</Text>
            </View>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        {/* Sign Out Button */}
        <View style={styles.signOutBox}>
          <Button title="ออกจากระบบ" variant="outline" onPress={handleSignOut} />
          <Text style={styles.versionNote}>live Member App · com.livezala.app · v1.0.0 (Build 1)</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 14,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  creditCard: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  creditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  creditTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  creditAmount: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  membershipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  membershipLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  membershipValue: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '700',
  },
  creditNote: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8,
    marginTop: 4,
  },
  webInfoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  webInfoButtonText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  groupHeader: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIcon: {
    fontSize: 22,
  },
  menuTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  menuSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  menuArrow: {
    color: colors.textMuted,
    fontSize: 20,
    fontWeight: '700',
  },
  signOutBox: {
    marginTop: 24,
    gap: 12,
  },
  versionNote: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
});
