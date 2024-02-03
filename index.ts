import sharp from "sharp";
import fs from "fs";
import readline from "readline/promises";
import createLogger from "progress-estimator";

// Constants
const CHANNELS = 3;
const logger = createLogger();

// Create interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Creates an image from a buffer and outputs it to outputPath
function createImage(buffer: Buffer, outputPath: string) {
    const size = Math.floor(Math.sqrt(Math.floor(buffer.byteLength / CHANNELS)));
    const maxBufferLength = size * size * CHANNELS;
    const bufferData = Buffer.from([...buffer].slice(0, maxBufferLength));

    const file = fs.createWriteStream(outputPath + ".png");

    const promise = sharp(bufferData, {raw : {width: size, height: size, channels: CHANNELS}}).toFormat("png").toFile(outputPath + ".png");
    return promise;
}

// Main program
async function main() {
    let canGenerateImage = true;

    // Ask user for image path and output path
    const imagePath = await rl.question("Enter the path to the image: ");
    
    // Check if the image exists
    const imageExists = await fs.promises.exists(imagePath);
    if (!imageExists) {
        console.log("The image does not exist.");
        return;
    }

    const outputPath = await rl.question("Enter the path to the output: ");
    const outputExists = await fs.promises.exists(outputPath)
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
        const getBuffer = await logger(fs.promises.readFile(imagePath), "Reading image");

        try {
            await logger(createImage(getBuffer, outputPath), "Creating image");
        } catch (err) {
            console.error(err);
        } finally {
            console.log("Done.\n");
        }
    }
}

function looper() {
    main().then(looper);
}

looper();