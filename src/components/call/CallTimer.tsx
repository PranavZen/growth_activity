import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

const pad = (n: number) => String(n).padStart(2, '0');

const CallTimer: React.FC<{ startedAt?: Date }> = ({ startedAt }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const display = h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;

  return <Text style={styles.timer}>{display}</Text>;
};

const styles = StyleSheet.create({
  timer: { ...TYPOGRAPHY.subtitle, color: COLORS.textSecondary, letterSpacing: 1.5 },
});

export default CallTimer;
