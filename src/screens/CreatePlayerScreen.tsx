import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
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
import { theme } from '../theme';

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
        <View style={isTablet ? styles.formTablet : styles.form}>
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
                <TouchableOpacity
                  style={isTablet ? styles.changePhotoButtonTablet : styles.changePhotoButton}
                  onPress={showImagePicker}>
                  <Text style={isTablet ? styles.changePhotoButtonTextTablet : styles.changePhotoButtonText}>
                    {profilePicture ? 'Change Photo' : 'Add Photo'}
                  </Text>
                </TouchableOpacity>
                {profilePicture && (
                  <TouchableOpacity
                    style={isTablet ? styles.removePhotoButtonTablet : styles.removePhotoButton}
                    onPress={handleRemoveProfilePicture}>
                    <Text style={isTablet ? styles.removePhotoButtonTextTablet : styles.removePhotoButtonText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <View style={isTablet ? styles.inputGroupTablet : styles.inputGroup}>
            <Text style={isTablet ? styles.labelTablet : styles.label}>Name *</Text>
            <TextInput
              style={isTablet ? styles.inputTablet : styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter player name"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={isTablet ? styles.inputGroupTablet : styles.inputGroup}>
            <Text style={isTablet ? styles.labelTablet : styles.label}>Nickname (Optional)</Text>
            <TextInput
              style={isTablet ? styles.inputTablet : styles.input}
              value={nickname}
              onChangeText={setNickname}
              placeholder="Enter nickname"
              autoCapitalize="words"
              autoCorrect={false}
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
        </View>
      </ScrollView>

      <View style={isTablet ? styles.buttonContainerTablet : styles.buttonContainer}>
        <TouchableOpacity
          style={[isTablet ? styles.saveButtonTablet : styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}>
          <Text style={isTablet ? styles.saveButtonTextTablet : styles.saveButtonText}>
            {saving ? 'Saving...' : isEditing ? 'Update Player' : 'Add Player'}
          </Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity style={isTablet ? styles.deleteButtonTablet : styles.deleteButton} onPress={handleDelete}>
            <Text style={isTablet ? styles.deleteButtonTextTablet : styles.deleteButtonText}>Delete Player</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.coolGray,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  form: {
    backgroundColor: theme.colors.background.pureWhite,
    borderRadius: 12,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.richBlack,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: theme.colors.background.pureWhite,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: theme.colors.background.pureWhite,
  },
  genderOptionSelected: {
    backgroundColor: theme.colors.primary.electricBlue,
    borderColor: theme.colors.primary.electricBlue,
  },
  genderOptionText: {
    fontSize: 14,
    color: theme.colors.text.richBlack,
    fontWeight: '500',
  },
  genderOptionTextSelected: {
    color: theme.colors.background.pureWhite,
  },
  statsContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.light.border,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.richBlack,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.text.darkGray,
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  buttonContainerTablet: {
    padding: 20,
    gap: 16,
  },
  saveButton: {
    backgroundColor: theme.colors.accent.successGreen,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.text.lightGray,
  },
  saveButtonText: {
    color: theme.colors.background.pureWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: theme.colors.accent.errorRed,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: theme.colors.background.pureWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  profilePictureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePictureButton: {
    padding: 8,
  },
  profilePictureActions: {
    flexDirection: 'column',
    marginLeft: 20,
    gap: 8,
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.primary.electricBlue,
    borderRadius: 6,
  },
  changePhotoButtonText: {
    color: theme.colors.background.pureWhite,
    fontWeight: 'bold',
    fontSize: 14,
  },
  removePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.accent.errorRed,
    borderRadius: 6,
  },
  removePhotoButtonText: {
    color: theme.colors.background.pureWhite,
    fontWeight: 'bold',
    fontSize: 14,
  },
  profilePictureContainerTablet: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  profilePictureActionsTablet: {
    flexDirection: 'row',
    marginLeft: 24,
    gap: 12,
  },
  changePhotoButtonTablet: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.primary.electricBlue,
    borderRadius: 8,
  },
  changePhotoButtonTextTablet: {
    color: theme.colors.background.pureWhite,
    fontWeight: 'bold',
    fontSize: 16,
  },
  removePhotoButtonTablet: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.accent.errorRed,
    borderRadius: 8,
  },
  removePhotoButtonTextTablet: {
    color: theme.colors.background.pureWhite,
    fontWeight: 'bold',
    fontSize: 16,
  },
  genderContainerTablet: {
    flexDirection: 'row',
    gap: 16,
  },
  genderOptionTablet: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: theme.colors.background.pureWhite,
  },
  genderOptionSelectedTablet: {
    backgroundColor: theme.colors.primary.electricBlue,
    borderColor: theme.colors.primary.electricBlue,
  },
  genderOptionTextTablet: {
    fontSize: 16,
    color: theme.colors.text.richBlack,
    fontWeight: '500',
  },
  genderOptionTextSelectedTablet: {
    color: theme.colors.background.pureWhite,
  },
  statsContainerTablet: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.light.border,
  },
  statsRowTablet: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItemTablet: {
    alignItems: 'center',
  },
  statValueTablet: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.richBlack,
    marginBottom: 6,
  },
  statLabelTablet: {
    fontSize: 14,
    color: theme.colors.text.darkGray,
  },
  formTablet: {
    backgroundColor: theme.colors.background.pureWhite,
    borderRadius: 12,
    padding: 32,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  inputGroupTablet: {
    marginBottom: 24,
  },
  labelTablet: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.richBlack,
    marginBottom: 10,
  },
  inputTablet: {
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    backgroundColor: theme.colors.background.pureWhite,
  },
  saveButtonTablet: {
    backgroundColor: theme.colors.accent.successGreen,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonTextTablet: {
    color: theme.colors.background.pureWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButtonTablet: {
    backgroundColor: theme.colors.accent.errorRed,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonTextTablet: {
    color: theme.colors.background.pureWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },
  contentTablet: {
    padding: 24,
  },
});

export default CreatePlayerScreen; 