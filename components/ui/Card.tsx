import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/theme';

type Props = ViewProps & {
  padded?: boolean;
  elevated?: boolean;
  radius?: number;
};

export default function Card({ style, children, padded = true, elevated = false, radius, ...rest }: Props) {
  const { theme } = useTheme();
  const styles = React.useMemo(() => makeStyles(theme, radius, elevated), [theme, radius, elevated]);
  return (
    <View style={[styles.card, padded && styles.padded, style]} {...rest}>
      {children}
    </View>
  );
}

const makeStyles = (Theme: any, radius?: number, elevated?: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: Theme.colors.surface,
      borderWidth: 1,
      borderColor: Theme.colors.border,
      borderRadius: radius ?? Theme.radii.lg,
      ...(elevated
        ? {
            shadowColor: Theme.shadow.soft.shadowColor,
            shadowOffset: Theme.shadow.soft.shadowOffset,
            shadowOpacity: Theme.shadow.soft.shadowOpacity,
            shadowRadius: Theme.shadow.soft.shadowRadius,
            elevation: Theme.shadow.soft.elevation,
          }
        : null),
    },
    padded: {
      padding: Theme.spacing.lg,
    },
  });
