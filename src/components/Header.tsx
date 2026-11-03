import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme/colors';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightActionText?: string;
  onRightAction?: () => void;
  showLogo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  rightActionText,
  onRightAction,
  showLogo = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {showLogo && (
          <View style={styles.logoBadge}>
            <Text style={styles.logoL}>L</Text>
            <View style={styles.logoDot} />
          </View>
        )}
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      {rightActionText && onRightAction && (
        <TouchableOpacity style={styles.rightButton} onPress={onRightAction} activeOpacity={0.8}>
          <Text style={styles.rightButtonText}>{rightActionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoL: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
    fontFamily: 'monospace',
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: 6,
    right: 6,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 11,
  },
  rightButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  rightButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
});
