import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'official' | 'muted' | 'danger';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'muted' }) => {
  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return { bg: colors.primaryMuted, text: colors.primary, border: colors.primary };
      case 'official':
        return { bg: 'rgba(56, 189, 248, 0.15)', text: colors.info, border: colors.info };
      case 'danger':
        return { bg: colors.dangerMuted, text: colors.danger, border: colors.danger };
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
