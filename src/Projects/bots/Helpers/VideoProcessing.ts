import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

// Define types for function parameters
type CropVideoParams = {
  inputVideo: string;
  outputDir: string;
  beepAudio: string;
  videoNumber: number;
  videoDuration: number;
  episode: number;
};

// Function to crop video into segments
export const cropVideo = async (
  inputVideo: string,
  outputDir: string,
  beepAudio: string,
  videoNumber: number,
  videoDuration: number,
  // videoQuantity: number,
  episode: number,
): Promise<void> => {
  const startTime = videoNumber * videoDuration;

  console.log("startTime",startTime);
  
  // Get the total duration of the input video
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputVideo, (err, metadata) => {
      if (err) {
        console.error('Error getting video metadata:', err);
        reject(err);
        return;
      }

      const durationInSeconds = metadata.format.duration;
      
      // Ensure the crop does not exceed video length
      if (durationInSeconds && startTime > durationInSeconds) {
        console.error('Total crop time exceeds video duration.');
        reject('Total crop time exceeds video duration.');
        return;
      }      

      // Create an array of promises for each segment
      const cropPromises: Promise<void>[] = [];
      for (let i = 0; i < 1; i++) {
        cropPromises.push(
          createSegment(i, startTime, inputVideo, outputDir, beepAudio, videoNumber, videoDuration, episode)
        );
      }

      // Wait for all segments to finish processing
      Promise.all(cropPromises)
        .then(() => {
          console.log('All video segments have been created.');
          resolve();
        })
        .catch((err) => {
          console.error('Error during video cropping:', err);
          reject(err);
        });
    });
  });
};

// Function to create a video segment
const createSegment = (
  i: number,
  startTime: number,
  inputVideo: string,
  outputDir: string,
  beepAudio: string,
  videoNumber: number,
  videoDuration: number,
  episode: number
): Promise<void> => {
  const segmentEndTime = Math.min(+startTime + +videoDuration);
  const outputFilename = path.join(outputDir, `${videoNumber}.mp4`);
  const previousFilename = path.join(outputDir, `${videoNumber - 1}.mp4`);

  console.log(startTime,"startTime");
  console.log("segmentEndTime",segmentEndTime);
  
  const text = `Ep ${episode} Part ${videoNumber}`;

  return new Promise((resolve, reject) => {
    ffmpeg(inputVideo)
      .inputOptions(['-ss', startTime.toString(), '-to', segmentEndTime.toString()])
      .input(beepAudio) // Add the beep audio input
      .videoCodec('libx265') // H.265 codec for better compression
      .audioCodec('aac')
      .audioChannels(2)
      .audioFrequency(48000)
      .outputOptions([
        '-movflags', 'faststart',
        '-pix_fmt', 'yuv420p',
        '-r', '30',
        `-vf`, `drawtext=text='${text}':fontcolor=white:fontsize=80:box=1:boxcolor=black@0.5:x=(w-text_w)/2:y=50`,
        '-b:v', '1500k', // Lower video bitrate for smaller size
        '-maxrate', '1500k', // Lower maxrate to match bitrate
        '-bufsize', '3000k', // Adjust buffer size accordingly
        '-b:a', '64k', // Lower audio bitrate
      ])
      .complexFilter([ // Filter to mix video and audio
        '[0:a][1:a]amix=inputs=2:duration=shortest'
      ])
      .on('end', () => {
        console.log(`Segment ${videoNumber} created: ${outputFilename}`);

        // Check if the previous video exists and delete it
        if (fs.existsSync(previousFilename)) {
          fs.unlink(previousFilename, (err) => {
            if (err) {
              console.error(`Error deleting file ${previousFilename}:`, err);
            } else {
              console.log(`Deleted previous video: ${previousFilename}`);
            }
          });
        }

        resolve();
      })
      .on('error', (err: any) => {
        console.error(`Error creating segment ${videoNumber + i}:`, err);
        reject(err);
      })
      .save(outputFilename);
  });
};
