import axios from 'axios';
import path from 'path';
import { addFileToIPFS } from './Thirdweb.js';

// Type definitions for Instagram user details
interface InstagramUserDetails {
  igId: string;
  igUsername: string;
}

// Function to fetch Instagram user details
const fetchInstagramUserDetails = async (accessToken: string): Promise<InstagramUserDetails> => {
  const url = 'https://graph.instagram.com/v20.0/me';
  try {
    const response = await axios.get(url, {
      params: {
        fields: 'user_id,username',
        access_token: accessToken,
      },
    });

    const userData = response.data;
    const igId = userData.user_id;
    const igUsername = userData.username;

    console.log('Instagram User ID:', igId);
    console.log('Instagram Username:', igUsername);

    return { igId, igUsername };
  } catch (error) {
    console.error('Error fetching Instagram user details:');
    throw error;
  }
};

// Function to post media (either photo or reel)
const postInstagramMedia = async (
  igId: string,
  accessToken: string,
  mediaUrl: string,
  mediaType: 'IMAGE' | 'VIDEO',
  caption = '',
  coverUrl = '',
  thumbOffset = '',
  locationId = ''
): Promise<string> => {
  const url = `https://graph.instagram.com/v20.0/${igId}/media`;
  try {
    const response = await axios.post(url, {
      media_type: mediaType === 'VIDEO' ? "REELS" : undefined,
      video_url: mediaType === 'VIDEO' ? mediaUrl : undefined,
      image_url: mediaType === 'IMAGE' ? mediaUrl : undefined,
      caption,
      cover_url: mediaType === 'VIDEO' ? coverUrl : undefined,
      thumb_offset: mediaType === 'VIDEO' ? thumbOffset : undefined,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        access_token: accessToken,
      },
    });

    console.log(`${mediaType} created successfully:`, response.data);
    return response.data.id;
  } catch (error) {
    console.error(`Error creating ${mediaType}:`);
    throw error;
  }
};

// Function to publish media
const publishInstagramMedia = async (igId: string, creationId: string, accessToken: string) => {
  const url = `https://graph.instagram.com/v20.0/${igId}/media_publish`;
  try {
    const response = await axios.post(url, null, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        creation_id: creationId,
        access_token: accessToken,
      },
    });

    console.log('Media published successfully:', response.data);
  } catch (error) {
    console.error('Error publishing media:', error);
    throw error;
  }
};

// Function to get file path for both reels (videos) and photos (images)
const getFilePath = (folderName: string, mediaName: string, mediaType: 'VIDEO' | 'IMAGE'): string => {
  const extension = mediaType === 'VIDEO' ? '.mp4' : '.png';
  return path.join(__dirname, `../postAssets/${folderName}/${mediaName}${extension}`);
};

// Function to get file URL for media
const getFileUrl = (mediaName: string, folderName: string, mediaType: 'VIDEO' | 'IMAGE', serverUrl: string): string => {
  const extension = mediaType === 'VIDEO' ? '.mp4' : '.png';
  return `${serverUrl}/media/${folderName}/${mediaName}${extension}`;
};

// Upload session handler
const startUploadSession = async (
  accessToken: string,
  folderName: string,
  mediaName: string,
  mediaType: 'VIDEO' | 'IMAGE',
  caption = '',
  hashtags?: string[],
  coverUrl = '',
  thumbOffset = '',
  locationId = ''
) => {
  try {
    const filePath = getFilePath(folderName, mediaName, mediaType);
    console.log(filePath);

    const thirdwebFileUrl = await addFileToIPFS(filePath);

    const mediaUrl = thirdwebFileUrl;

    console.log("mediaUrl", mediaUrl);

    // Fetch Instagram user details to get igId
    const { igId } = await fetchInstagramUserDetails(accessToken);

    // Post media and get the creation ID
    const creationId = await postInstagramMedia(igId, accessToken, mediaUrl, mediaType, caption, coverUrl, thumbOffset, locationId);

    // Publish the media
    if (creationId) {
      await tryPublishInstagramMedia(igId, creationId, accessToken);
    } else {
      console.error('Failed to obtain creationId, cannot publish media.');
    }
  } catch (error) {
    console.error('Error in Instagram media workflow:', error);
    throw error;
  }
};

// Function to check media status
const checkMediaStatus = async (creationId: string, accessToken: string) => {
  let status = '';

  while (status !== 'FINISHED') {
    try {
      const response = await axios.get(`https://graph.instagram.com/${creationId}?fields=status_code&access_token=${accessToken}`);
      status = response.data.status_code;
      console.log(`Media status is ${status}`);

      if (status !== 'FINISHED') {
        // Wait 10 seconds before checking the status again
        await wait(10000);
      }

    } catch (error) {
      await wait(10000); // Optionally wait before retrying in case of error
    }
  }

  console.log('Media is FINISHED.');
};

// Function to wait for a specified amount of time
const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Function to publish Instagram media with retries
const tryPublishInstagramMedia = async (igId: string, creationId: string, accessToken: string) => {
  try {
    await checkMediaStatus(creationId, accessToken);
    await publishInstagramMedia(igId, creationId, accessToken);
    console.log('Media published successfully.');
  } catch (error) {
    console.error('Error publishing media:', error);
  }
};

// Export the startUploadSession function
export { startUploadSession };
