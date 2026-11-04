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
    paddingTop: 16,
    paddingBottom: 12,
    minHeight: 72,
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
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#161616',
    borderWidth: 1.5,
    borderColor: '#4A3512',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoL: {
    color: '#F5F5F5',
    fontWeight: '800',
    fontSize: 18,
    fontFamily: 'monospace',
  },
  logoDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.logoOrange, // สีส้ม #FF8A3D เฉพาะจุดในโลโก้เท่านั้น
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
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  rightButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  rightButtonText: {
    color: colors.black,
    fontWeight: '700',
    fontSize: 13,
  },
});
