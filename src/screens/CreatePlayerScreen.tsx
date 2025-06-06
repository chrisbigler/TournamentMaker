import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  ActionSheetIOS,
  Platform,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Gender, Player } from '../types';
import DatabaseService from '../services/DatabaseService';
import ImageService from '../services/ImageService';
import ProfilePicture from '../components/ProfilePicture';
import { useTheme } from '../theme';
import type { Theme } from '../theme';
import { Button, Card, TextInput as CustomTextInput } from '../components';

type CreatePlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreatePlayer'>;
type CreatePlayerScreenRouteProp = RouteProp<RootStackParamList, 'CreatePlayer'>;

interface Props {
  navigation: CreatePlayerScreenNavigationProp;
  route: CreatePlayerScreenRouteProp;
}

const CreatePlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { player } = route.params || {};
  const isEditing = !!player;

  const [name, setName] = useState(player?.name || '');
  const [nickname, setNickname] = useState(player?.nickname || '');
  const [gender, setGender] = useState<Gender>(player?.gender || Gender.MALE);
  const [profilePicture, setProfilePicture] = useState<string | undefined>(player?.profilePicture);
  const [saving, setSaving] = useState(false);

  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Player' : 'Add Player',
    });
  }, [navigation, isEditing]);

  const showImagePicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleTakePhoto();
          } else if (buttonIndex === 2) {
            handlePickImage();
          }
        }
      );
    } else {
      // For Android, show an Alert dialog
      Alert.alert(
        'Select Photo',
        'Choose how you want to add a profile picture',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: handleTakePhoto },
          { text: 'Choose from Library', onPress: handlePickImage },
        ]
      );
    }
  };

  const handleTakePhoto = async () => {
    try {
      const imageUri = await ImageService.takePhoto();
      if (imageUri) {
        setProfilePicture(imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please check camera permissions.');
      console.error('Failed to take photo:', error);
    }
  };

  const handlePickImage = async () => {
    try {
      const imageUri = await ImageService.pickImage();
      if (imageUri) {
        setProfilePicture(imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please check media library permissions.');
      console.error('Failed to pick image:', error);
    }
  };

  const handleRemoveProfilePicture = () => {
    Alert.alert(
      'Remove Profile Picture',
      'Are you sure you want to remove the profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setProfilePicture(undefined),
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Player name is required');
      return;
    }

    try {
      setSaving(true);

      let finalProfilePicture = profilePicture;

      // If we have a new profile picture (not from the database), save it
      if (profilePicture && !profilePicture.includes('profile_pictures/')) {
        const playerId = isEditing && player ? player.id : Date.now().toString() + Math.random().toString(36).substr(2, 9);
        
        // Delete old profile picture if editing and had one
        if (isEditing && player?.profilePicture) {
          await ImageService.deleteProfilePicture(player.profilePicture);
        }
        
        finalProfilePicture = await ImageService.saveProfilePicture(profilePicture, playerId);
      }

      if (isEditing && player) {
        // Update existing player
        await DatabaseService.updatePlayer(player.id, {
          name: name.trim(),
          nickname: nickname.trim() || undefined,
          gender,
          wins: player.wins,
          losses: player.losses,
          profilePicture: finalProfilePicture,
        });
      } else {
        // Create new player
        await DatabaseService.createPlayer({
          name: name.trim(),
          nickname: nickname.trim() || undefined,
          gender,
          wins: 0,
          losses: 0,
          profilePicture: finalProfilePicture,
        });
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save player');
      console.error('Failed to save player:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!isEditing || !player) return;

    Alert.alert(
      'Delete Player',
      `Are you sure you want to delete ${player.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete profile picture if exists
              if (player.profilePicture) {
                await ImageService.deleteProfilePicture(player.profilePicture);
              }
              await DatabaseService.deletePlayer(player.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete player');
              console.error('Failed to delete player:', error);
            }
          },
        },
      ]
    );
  };

  const genderOptions = [
    { label: 'Male', value: Gender.MALE },
    { label: 'Female', value: Gender.FEMALE },
  ];

  const screenWidth = Dimensions.get('window').width;
  const isTablet = screenWidth > 600;
  const profileSize = isTablet ? 'extra-large' : 'large';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={isTablet ? styles.contentTablet : styles.content}>
        <Card variant="outlined" padding={isTablet ? "2xl" : "lg"} style={isTablet ? styles.formTablet : styles.form}>
          {/* Profile Picture Section */}
          <View style={isTablet ? styles.inputGroupTablet : styles.inputGroup}>
            <Text style={isTablet ? styles.labelTablet : styles.label}>Profile Picture</Text>
            <View style={isTablet ? styles.profilePictureContainerTablet : styles.profilePictureContainer}>
              <TouchableOpacity
                style={styles.profilePictureButton}
                onPress={showImagePicker}>
                <ProfilePicture
                  profilePicture={profilePicture}
                  name={name || 'Player'}
                  size={profileSize}
                  showBorder={true}
                />
              </TouchableOpacity>
              <View style={isTablet ? styles.profilePictureActionsTablet : styles.profilePictureActions}>
                <Button
                  title={profilePicture ? 'Change Photo' : 'Add Photo'}
                  onPress={showImagePicker}
                  variant="secondary"
                  size={isTablet ? "md" : "sm"}
                />
                {profilePicture && (
                  <Button
                    title="Remove"
                    onPress={handleRemoveProfilePicture}
                    variant="outline"
                    size={isTablet ? "md" : "sm"}
                  />
                )}
              </View>
            </View>
          </View>

          <View style={isTablet ? styles.inputGroupTablet : styles.inputGroup}>
            <CustomTextInput
              label="Name *"
              value={name}
              onChangeText={setName}
              placeholder="Enter player name"
              autoCapitalize="words"
              autoCorrect={false}
              containerStyle={isTablet ? styles.inputContainerTablet : undefined}
            />
          </View>

          <View style={isTablet ? styles.inputGroupTablet : styles.inputGroup}>
            <CustomTextInput
              label="Nickname (Optional)"
              value={nickname}
              onChangeText={setNickname}
              placeholder="Enter nickname"
              autoCapitalize="words"
              autoCorrect={false}
              containerStyle={isTablet ? styles.inputContainerTablet : undefined}
            />
          </View>

          <View style={isTablet ? styles.inputGroupTablet : styles.inputGroup}>
            <Text style={isTablet ? styles.labelTablet : styles.label}>Gender</Text>
            <View style={isTablet ? styles.genderContainerTablet : styles.genderContainer}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    isTablet ? styles.genderOptionTablet : styles.genderOption,
                    gender === option.value && (isTablet ? styles.genderOptionSelectedTablet : styles.genderOptionSelected),
                  ]}
                  onPress={() => setGender(option.value)}>
                  <Text
                    style={[
                      isTablet ? styles.genderOptionTextTablet : styles.genderOptionText,
                      gender === option.value && (isTablet ? styles.genderOptionTextSelectedTablet : styles.genderOptionTextSelected),
                    ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {isEditing && player && (
            <View style={isTablet ? styles.statsContainerTablet : styles.statsContainer}>
              <Text style={isTablet ? styles.labelTablet : styles.label}>Current Stats</Text>
              <View style={isTablet ? styles.statsRowTablet : styles.statsRow}>
                <View style={isTablet ? styles.statItemTablet : styles.statItem}>
                  <Text style={isTablet ? styles.statValueTablet : styles.statValue}>{player.wins}</Text>
                  <Text style={isTablet ? styles.statLabelTablet : styles.statLabel}>Wins</Text>
                </View>
                <View style={isTablet ? styles.statItemTablet : styles.statItem}>
                  <Text style={isTablet ? styles.statValueTablet : styles.statValue}>{player.losses}</Text>
                  <Text style={isTablet ? styles.statLabelTablet : styles.statLabel}>Losses</Text>
                </View>
                <View style={isTablet ? styles.statItemTablet : styles.statItem}>
                  <Text style={isTablet ? styles.statValueTablet : styles.statValue}>
                    {player.wins + player.losses > 0
                      ? `${Math.round((player.wins / (player.wins + player.losses)) * 100)}%`
                      : '0%'}
                  </Text>
                  <Text style={isTablet ? styles.statLabelTablet : styles.statLabel}>Win Rate</Text>
                </View>
              </View>
            </View>
          )}
        </Card>
      </ScrollView>

      <View style={isTablet ? styles.buttonContainerTablet : styles.buttonContainer}>
        <Button
          title={saving ? 'Saving...' : isEditing ? 'Update Player' : 'Add Player'}
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          size={isTablet ? "lg" : "md"}
        />

        {isEditing && (
          <Button
            title="Delete Player"
            onPress={handleDelete}
            variant="outline"
            size={isTablet ? "lg" : "md"}
            style={styles.deleteButton}
            textStyle={styles.deleteButtonText}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.coolGray,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: theme.spacing.lg,
    },
    contentTablet: {
      padding: theme.spacing.xl,
      alignItems: 'center',
    },
    form: {
      flex: 1,
    },
    formTablet: {
      maxWidth: 600,
      width: '100%',
    },
    inputGroup: {
      marginBottom: theme.spacing.xl,
    },
    inputGroupTablet: {
      marginBottom: theme.spacing['2xl'],
    },
    inputContainerTablet: {
      marginBottom: 0,
    },
    label: {
      ...theme.textStyles.label,
      color: theme.colors.text.richBlack,
      marginBottom: theme.spacing.sm,
    },
    labelTablet: {
      ...theme.textStyles.h4,
      color: theme.colors.text.richBlack,
      marginBottom: theme.spacing.md,
    },
    genderContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    genderContainerTablet: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
    },
    genderOption: {
      flex: 1,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.light.border,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      backgroundColor: theme.colors.background.pureWhite,
    },
    genderOptionTablet: {
      flex: 1,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.light.border,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      backgroundColor: theme.colors.background.pureWhite,
    },
    genderOptionSelected: {
      backgroundColor: theme.colors.selection.primary,
      borderColor: theme.colors.selection.primary,
    },
    genderOptionSelectedTablet: {
      backgroundColor: theme.colors.selection.primary,
      borderColor: theme.colors.selection.primary,
    },
    genderOptionText: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.text.richBlack,
      fontWeight: '500',
    },
    genderOptionTextTablet: {
      ...theme.textStyles.body,
      color: theme.colors.text.richBlack,
      fontWeight: '500',
    },
    genderOptionTextSelected: {
      color: theme.colors.background.pureWhite,
    },
    genderOptionTextSelectedTablet: {
      color: theme.colors.background.pureWhite,
    },
    statsContainer: {
      marginTop: theme.spacing.xl,
      paddingTop: theme.spacing.xl,
      borderTopWidth: 1,
      borderTopColor: theme.colors.light.border,
    },
    statsContainerTablet: {
      marginTop: theme.spacing['2xl'],
      paddingTop: theme.spacing['2xl'],
      borderTopWidth: 1,
      borderTopColor: theme.colors.light.border,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statsRowTablet: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statItemTablet: {
      alignItems: 'center',
    },
    statValue: {
      ...theme.textStyles.h3,
      color: theme.colors.text.richBlack,
      marginBottom: theme.spacing.xs,
    },
    statValueTablet: {
      ...theme.textStyles.h2,
      color: theme.colors.text.richBlack,
      marginBottom: theme.spacing.sm,
    },
    statLabel: {
      ...theme.textStyles.caption,
      color: theme.colors.text.darkGray,
    },
    statLabelTablet: {
      ...theme.textStyles.bodySmall,
      color: theme.colors.text.darkGray,
    },
    buttonContainer: {
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    buttonContainerTablet: {
      padding: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    deleteButton: {
      borderColor: theme.colors.accent.errorRed,
    },
    deleteButtonText: {
      color: theme.colors.accent.errorRed,
    },
    profilePictureContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    profilePictureContainerTablet: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    profilePictureButton: {
      padding: theme.spacing.sm,
    },
    profilePictureActions: {
      flexDirection: 'column',
      marginLeft: theme.spacing.xl,
      gap: theme.spacing.sm,
    },
    profilePictureActionsTablet: {
      flexDirection: 'row',
      marginLeft: theme.spacing['2xl'],
      gap: theme.spacing.md,
    },
  });

export default CreatePlayerScreen; 