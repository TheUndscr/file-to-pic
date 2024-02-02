import sharp from "sharp";
import fs from "fs/promises";
import readline from "readline/promises";
import createLogger from "progress-estimator"

// Constants
const CHANNELS = 3;
const logger = createLogger();

// Create interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Creates an image from a buffer and outputs it to outputPath
async function createImage(buffer: Buffer, outputPath: string) {
    const size = Math.floor(Math.sqrt(Math.floor(buffer.byteLength / CHANNELS)));
    const maxBufferLength = size * size * CHANNELS;
    buffer = Buffer.from([...buffer].slice(0, maxBufferLength));

    const imageBuffer = await logger(sharp(buffer, { raw: { width: size, height: size, channels: CHANNELS } }).toFormat("jpeg").toBuffer(), "Creating image");
    
    return fs.writeFile(outputPath + ".jpeg", imageBuffer);
}

// Main program
async function main() {
    let canGenerateImage = true;

    // Ask user for image path and output path
    const imagePath = await rl.question("Enter the path to the image: ");
    
    // Check if the image exists
    const imageExists = await fs.exists(imagePath);
    if (!imageExists) {
        console.log("The image does not exist.");
        return await main();
    }


    const outputPath = await rl.question("Enter the path to the output: ");
    const outputExists = await fs.exists(outputPath)
    if (outputPath === imagePath) {
        console.log("The output path cannot be the same as the input path.");
        canGenerateImage = false;
    } else if (outputPath === "") {
        console.log("The output path cannot be empty.");
        canGenerateImage = false;
    } else if (outputExists) {
        console.log("The output path already exists as a file.");
        canGenerateImage = false;
    }

    if (canGenerateImage) {
        // Get buffer from image
        const getBuffer = await logger(fs.readFile(imagePath), "Reading image");

        try {
            await logger(createImage(getBuffer, outputPath), "Writing to path");
            console.log("Image created successfully.");
        } catch (err) {
            console.error(err);
        }
    }

    return await main();
}

main();