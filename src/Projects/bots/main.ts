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
  console.log(`Starting upload process for ${mediaType} with VideoNumber:`, config.videoNumber);

  try {
    // Crop the video before uploading
    await cropVideo(
      config.inputVideo,
      config.outputDir,
      config.beepAudio,
      config.videoNumber,
      config.videoDuration,
      config.episode
    );

    // Upload process
    const coverUrl = "";
    const thumbOffset = "";
    await startUploadSession(
      config.accessToken,
      config.outputDir,
      config.videoNumber,
      mediaType,
      config.caption,
      config.hashtags,
      coverUrl,
      thumbOffset,
      config.location
    );

    console.log('Upload completed successfully');

    // Increment media name for the next upload
    config.videoNumber++;
  } catch (error) {
    console.error(`Error during ${mediaType} upload process:`);

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
// Function to start the bot and handle video uploads
export const startBot = async (config: any): Promise<void> => {
  ensureOutputDirExists(config.outputDir); // Ensure the output directory exists

  // Define the interval (4 hours = 4 * 60 * 60 * 1000 milliseconds)
  const fourHours = 4 * 60 * 60 * 1000;

  // Start upload process immediately
  await runUploadProcess('VIDEO', config);

  // Schedule upload process every 4 hours
  setInterval(async () => {
    console.log('Starting the scheduled upload process.');
    await runUploadProcess('VIDEO', config);
  }, fourHours);
};