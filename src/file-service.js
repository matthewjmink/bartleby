const path = require('path');
const fs = require('fs-extra');
const { outputRoot } = require('./utils');

const isLambda = () => Boolean(process.env.IS_LAMBDA);

// TODO: Hook into S3 here
const saveToS3 = (outputPath, content) => Promise.resolve(console.log('saving to s3', { outputPath }));

const saveToFileSystem = async (outputPath, content) => {
    const fullPath = path.join(outputRoot, outputPath);
    await fs.ensureFile(fullPath);
    await fs.writeFile(fullPath, content);
};

// TODO: Hook into S3 here
const copyToS3 = (inputPath, outputPath) => Promise.resolve(console.log('copying to s3', { inputPath, outputPath }));

const copyToFileSystem = async (inputPath, outputPath, { recursive = false } = {}) => {
    if (recursive && fs.existsSync(outputPath) && fs.lstatSync(outputPath).isDirectory()) {
        await fs.emptyDir(outputPath);
    }
    fs.copySync(inputPath, path.join(outputRoot, outputPath), { recursive });
};

module.exports = {
    saveFile: (...args) => {
        if (isLambda()) return saveToS3(...args);

        return saveToFileSystem(...args);
    },
    copyDir: (inputPath, outputPath) => {
        if (isLambda()) return copyToS3(inputPath, outputPath);

        return copyToFileSystem(inputPath, outputPath, { recursive: true });
    },
    copyFile: (inputPath, outputPath) => {
        if (isLambda()) return copyToS3(inputPath, outputPath);

        return copyToFileSystem(inputPath, outputPath);
    },
};
