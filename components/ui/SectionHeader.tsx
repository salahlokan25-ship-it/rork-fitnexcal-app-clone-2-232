import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '@/hooks/theme';

type Props = ViewProps & {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export default function SectionHeader({ title, subtitle, action, style, ...rest }: Props) {
  const { theme } = useTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={[styles.container, style]} {...rest}>
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const makeStyles = (Theme: any) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      marginBottom: 12,
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    texts: { flex: 1 },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: Theme.colors.text,
      letterSpacing: -0.3,
    },
    subtitle: {
      marginTop: 4,
      fontSize: 13,
      color: Theme.colors.textMuted,
    },
    action: { marginLeft: 12 },
  });
