import fs from 'fs';
import dotenv from 'dotenv'; // Load environment variables
import { cropVideo } from './Helpers/VideoProcessing.js';  // Import the cropVideo function
import { startUploadSession } from './Helpers/upload.js';

// Load environment variables
dotenv.config();

// Ensure the output directory exists
const ensureOutputDirExists = (outputDir: string) => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
};

// Function to handle the upload process with metadata
const runUploadProcess = async (mediaType: 'VIDEO' | 'IMAGE', config: any, retryCount = 0): Promise<void> => {
  console.log(`Starting upload process for ${mediaType} with VideoNumber:`, config.mediaName);

  try {
    // Crop the video before uploading
    await cropVideo(
      config.inputVideo,
      config.outputDir,
      config.beepAudio,
      config.mediaName,
      config.videoDuration,
      config.videoQuantity,
      config.episode
    );

    // Upload process
    const coverUrl = "";
    const thumbOffset = "";
    await startUploadSession(
      config.accessToken,
      config.folderName,
      config.mediaName,
      mediaType,
      config.caption,
      config.hashtags,
      coverUrl,
      thumbOffset,
      config.location
    );

    console.log('Upload completed successfully');

    // Increment media name for the next upload
    config.mediaName++;
  } catch (error) {
    console.error(`Error during ${mediaType} upload process:`, error);

    // Retry logic
    if (retryCount < 3) {
      console.log(`Retrying upload for ${mediaType}... Attempt ${retryCount + 1}`);
      await new Promise(resolve => setTimeout(resolve, 5000));  // Wait for 5 seconds before retrying
      await runUploadProcess(mediaType, config, retryCount + 1);  // Retry with incremented retry count
    } else {
      console.error(`Max retries reached for ${mediaType}. Waiting for the next cron job.`);
    }
  }
};

// Function to start the bot and handle video uploads
const startBot = async (config: any): Promise<void> => {
  console.log('Starting bot for video upload...');
  ensureOutputDirExists(config.outputDir); // Ensure the output directory exists
  await runUploadProcess('VIDEO', config); // Start upload process with config
};

// You can manage cron jobs within the update_bot function, so remove the scheduling logic here
// Example: Scheduled jobs are handled in the update_bot function

// Export startBot if needed elsewhere
export { startBot };
