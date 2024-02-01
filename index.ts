import sharp from "sharp";
import fs from "fs/promises";
import readline from "readline/promises";

// Create interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function createImage(buffer: Buffer, outputPath: string) {
    //const length = Math.floor(buffer.length/2);

    const bufferTest = Buffer.from([
        255, 0, 0,  // Red pixel
        0, 255, 0,  // Green pixel
        0, 0, 255,  // Blue pixel
        255, 255, 0,  // Yellow pixel
        0, 255, 255,  // Cyan pixel
        255, 0, 255,  // Magenta pixel
        255, 255, 255,  // White pixel
        0, 0, 0,  // Black pixel
        127, 127, 127,  // Gray pixel
    ]);

    const size = Math.floor(Math.sqrt(buffer.length / 3));
    console.log(buffer.length, size);

    const imageBuffer = await sharp(buffer, { raw: { width: size, height: size, channels: 3 } })
        .grayscale()
        .toBuffer();
    
    return fs.writeFile(outputPath + ".jpg", imageBuffer);
}

// Main program
async function main() {
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
        return await main();
    } else if (outputPath === "") {
        console.log("The output path cannot be empty.");
        return await main();
    } else if (outputExists) {
        console.log("The output path already exists.");
        return await main();
    }
    const getBuffer = await fs.readFile(imagePath);

    createImage(getBuffer, outputPath).then(() => {
        console.log(`Image has been created at ${outputPath}.`);
    }).catch((err) => {
        console.log("An error occurred: ", err);
    });
}

main();