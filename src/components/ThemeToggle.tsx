import React from 'react';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, useThemeMode } from '../theme';

const ThemeToggle: React.FC = () => {
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();
  const icon = mode === 'dark' ? 'light-mode' : 'dark-mode';
  const color = mode === 'dark' ? theme.colors.text.white : theme.colors.text.richBlack;

  return (
    <TouchableOpacity onPress={toggleMode} style={{ marginRight: theme.spacing.md }}>
      <MaterialIcons name={icon} size={24} color={color} />
    </TouchableOpacity>
  );
};

export default ThemeToggle;
