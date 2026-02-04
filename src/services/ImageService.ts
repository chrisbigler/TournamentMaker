import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

class ImageService {
  private profilePicturesDir = `${FileSystem.documentDirectory}profile_pictures/`;

  async initService(): Promise<void> {
    try {
      // Create profile pictures directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(this.profilePicturesDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.profilePicturesDir, { intermediates: true });
      }
    } catch (error) {
      console.error('Failed to initialize ImageService:', error);
      throw error;
    }
  }

  async pickImage(): Promise<string | null> {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access media library is required');
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      return asset.uri;
    } catch (error) {
      console.error('Failed to pick image:', error);
      throw error;
    }
  }

  async takePhoto(): Promise<string | null> {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access camera is required');
      }

      // Take photo
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      return asset.uri;
    } catch (error) {
      console.error('Failed to take photo:', error);
      throw error;
    }
  }

  async saveProfilePicture(imageUri: string, playerId: string): Promise<string> {
    try {
      await this.initService();
      
      const fileExtension = imageUri.split('.').pop() || 'jpg';
      const fileName = `${playerId}.${fileExtension}`;
      const destinationPath = `${this.profilePicturesDir}${fileName}`;

      // Copy the image to our app's directory
      await FileSystem.copyAsync({
        from: imageUri,
        to: destinationPath,
      });

      return destinationPath;
    } catch (error) {
      console.error('Failed to save profile picture:', error);
      throw error;
    }
  }

  async deleteProfilePicture(filePath: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(filePath);
      }
    } catch (error) {
      console.error('Failed to delete profile picture:', error);
      // Don't throw error for deletion failures
    }
  }

  async getProfilePictureUri(playerId: string): Promise<string | null> {
    try {
      await this.initService();
      
      // Check for common image formats
      const extensions = ['jpg', 'jpeg', 'png', 'webp'];
      
      for (const ext of extensions) {
        const filePath = `${this.profilePicturesDir}${playerId}.${ext}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.exists) {
          return filePath;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get profile picture URI:', error);
      return null;
    }
  }
}

export default new ImageService(); 