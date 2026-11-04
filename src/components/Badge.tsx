import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'official' | 'gold' | 'muted' | 'danger' | 'success';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'muted' }) => {
  const getStyles = () => {
    switch (variant) {
      case 'official':
      case 'gold':
      case 'primary':
        // สีทองเว็บหลัก: พื้นทองเข้ม #221A08 ขอบทองเข้ม #4A3512 ตัวอักษรทอง #E9A13B
        return { bg: colors.badgeBg, text: colors.badgeText, border: colors.badgeBorder };
      case 'danger':
        return { bg: colors.dangerMuted, text: colors.danger, border: colors.danger };
      case 'success':
        return { bg: colors.successMuted, text: colors.success, border: colors.success };
      default:
        return { bg: colors.surfaceElevated, text: colors.textSecondary, border: colors.border };
    }
  };

  const styleConfig = getStyles();

  return (
    <View style={[styles.badge, { backgroundColor: styleConfig.bg, borderColor: styleConfig.border }]}>
      <Text style={[styles.text, { color: styleConfig.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
