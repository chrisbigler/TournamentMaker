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
import { Button, TextInput as CustomTextInput, ScreenHeader } from '../components';

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

      if (profilePicture && !profilePicture.includes('profile_pictures/')) {
        const playerId = isEditing && player ? player.id : Date.now().toString() + Math.random().toString(36).substr(2, 9);
        
        if (isEditing && player?.profilePicture) {
          await ImageService.deleteProfilePicture(player.profilePicture);
        }
        
        finalProfilePicture = await ImageService.saveProfilePicture(profilePicture, playerId);
      }

      if (isEditing && player) {
        await DatabaseService.updatePlayer(player.id, {
          name: name.trim(),
          nickname: nickname.trim() || undefined,
          gender,
          wins: player.wins,
          losses: player.losses,
          totalWinnings: player.totalWinnings,
          profilePicture: finalProfilePicture,
        });
      } else {
        await DatabaseService.createPlayer({
          name: name.trim(),
          nickname: nickname.trim() || undefined,
          gender,
          wins: 0,
          losses: 0,
          totalWinnings: 0,
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
      {!isEditing && (
        <ScreenHeader
          variant="create"
          title="New Player"
          subtitle="Add a player to your roster"
          accentColor="#3B82F6"
        />
      )}
      {isEditing && player && (
        <ScreenHeader
          variant="detail"
          title={player.name}
          subtitle={`${player.wins}W - ${player.losses}L`}
        />
      )}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Profile Picture Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Picture</Text>
          <View style={styles.profilePictureContainer}>
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
            <View style={styles.profilePictureActions}>
              <Button
                title={profilePicture ? 'Change' : 'Add Photo'}
                onPress={showImagePicker}
                variant="secondary"
                size="sm"
              />
              {profilePicture && (
                <Button
                  title="Remove"
                  onPress={handleRemoveProfilePicture}
                  variant="ghost"
                  size="sm"
                />
              )}
            </View>
          </View>
        </View>

        {/* Name */}
        <View style={styles.section}>
          <CustomTextInput
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter player name"
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        {/* Nickname */}
        <View style={styles.section}>
          <CustomTextInput
            label="Nickname (Optional)"
            value={nickname}
            onChangeText={setNickname}
            placeholder="Enter nickname"
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        {/* Gender */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gender</Text>
          <View style={styles.genderContainer}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.genderOption,
                  gender === option.value && styles.genderOptionSelected,
                ]}
                onPress={() => setGender(option.value)}>
                <Text
                  style={[
                    styles.genderOptionText,
                    gender === option.value && styles.genderOptionTextSelected,
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats (if editing) */}
        {isEditing && player && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Current Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{player.wins}</Text>
                <Text style={styles.statLabel}>Wins</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{player.losses}</Text>
                <Text style={styles.statLabel}>Losses</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {player.wins + player.losses > 0
                    ? `${Math.round((player.wins / (player.wins + player.losses)) * 100)}%`
                    : '0%'}
                </Text>
                <Text style={styles.statLabel}>Win Rate</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title={saving ? 'Saving...' : isEditing ? 'Update Player' : 'Add Player'}
          onPress={handleSave}
          loading={saving}
          disabled={saving}
        />

        {isEditing && (
          <Button
            title="Delete Player"
            onPress={handleDelete}
            variant="outline"
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
      backgroundColor: theme.colors.background.primary,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingBottom: theme.spacing.xl,
    },
    section: {
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.subtle,
    },
    sectionTitle: {
      ...theme.textStyles.overline,
      color: theme.colors.text.tertiary,
      marginBottom: theme.spacing.md,
    },
    profilePictureContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    profilePictureButton: {
      marginRight: theme.spacing.lg,
    },
    profilePictureActions: {
      flexDirection: 'column',
      gap: theme.spacing.sm,
    },
    genderContainer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    genderOption: {
      flex: 1,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      backgroundColor: theme.colors.card,
    },
    genderOptionSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    genderOptionText: {
      ...theme.textStyles.body,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeights.medium,
    },
    genderOptionTextSelected: {
      color: '#FFFFFF',
    },
    statsSection: {
      padding: theme.spacing.lg,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      ...theme.textStyles.h3,
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    statLabel: {
      ...theme.textStyles.caption,
      color: theme.colors.text.tertiary,
    },
    buttonContainer: {
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.subtle,
    },
    deleteButton: {
      borderColor: theme.colors.semantic.error,
    },
    deleteButtonText: {
      color: theme.colors.semantic.error,
    },
  });

export default CreatePlayerScreen;
