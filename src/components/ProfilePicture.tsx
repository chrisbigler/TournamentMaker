import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../theme';
import type { Theme } from '../theme';

interface ProfilePictureProps {
  profilePicture?: string;
  name: string;
  size?: number | 'small' | 'medium' | 'large' | 'extra-large';
  style?: any;
  showBorder?: boolean;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  profilePicture,
  name,
  size = 'medium',
  style,
  showBorder = false,
}) => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const screenWidth = Dimensions.get('window').width;
  
  const getSizeValue = (sizeInput: number | string): number => {
    if (typeof sizeInput === 'number') return sizeInput;
    
    // Responsive sizing based on screen width
    const baseSize = screenWidth > 400 ? 1 : 0.9; // Scale down on smaller screens
    
    switch (sizeInput) {
      case 'small':
        return Math.round(40 * baseSize);
      case 'medium':
        return Math.round(60 * baseSize);
      case 'large':
        return Math.round(80 * baseSize);
      case 'extra-large':
        return Math.round(120 * baseSize);
      default:
        return Math.round(60 * baseSize);
    }
  };

  const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const sizeValue = getSizeValue(size);
  const fontSize = Math.max(sizeValue * 0.35, 12); // Ensure minimum readable font size
  
  const containerStyle = {
    width: sizeValue,
    height: sizeValue,
    borderRadius: sizeValue / 2,
    borderWidth: showBorder ? 2 : 0,
    borderColor: showBorder ? theme.colors.background.pureWhite : 'transparent',
  };

  if (profilePicture) {
    return (
      <View style={[styles.container, containerStyle, style]}>
        <Image
          source={{ uri: profilePicture }}
          style={[styles.image, { borderRadius: sizeValue / 2 }]}
          resizeMode="cover"
        />
        {showBorder && <View style={[styles.borderOverlay, containerStyle]} />}
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.placeholder, containerStyle, style]}>
      <Text style={[styles.initials, { fontSize }]}>
        {getInitials(name)}
      </Text>
      {showBorder && <View style={[styles.borderOverlay, containerStyle]} />}
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.card,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: theme.colors.legacy.slateGray,
  },
  initials: {
    color: theme.colors.background.pureWhite,
    fontWeight: theme.textStyles.button.fontWeight,
    textAlign: 'center',
  },
  borderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: theme.colors.background.pureWhite,
    backgroundColor: 'transparent',
  },
  });

export default ProfilePicture; 