const path = require('path');
const fs = require('fs-extra');
const { S3 } = require("@aws-sdk/client-s3");
const mimeTypes = require('mime-types');
const glob = require('glob').sync;
const { outputRoot } = require('./utils');
const awsClientConfig = require('./aws-client.config');

const s3 = new S3(awsClientConfig);

const isLambda = () => Boolean(process.env.IS_LAMBDA);

const trimLeadingSlash = filePath => (filePath.charAt(0) === path.sep ? filePath.slice(1) : filePath);

const saveToS3 = (outputPath, content) => s3.putObject({
    Bucket: 'mminkwebsite',
    Body: content,
    ContentType: mimeTypes.lookup(outputPath) || 'text/plain',
    Key: trimLeadingSlash(outputPath),
    ACL: 'public-read',
});

const saveToFileSystem = async (outputPath, content) => {
    const fullPath = path.join(outputRoot, outputPath);
    await fs.ensureFile(fullPath);
    await fs.writeFile(fullPath, content);
};

const copyFileToS3 = async (inputPath, outputPath) => {
    if (!fs.existsSync(inputPath) || !fs.lstatSync(inputPath).isFile()) return Promise.resolve();

    const content = await fs.readFile(inputPath);
    await saveToS3(outputPath, content);
}

const copyDirToS3 = async (inputPath, outputPath) => {
    const filePaths = glob(path.join(inputPath, '**', '*'));
    await Promise.all(filePaths.map(filePath => copyFileToS3(filePath, path.join(outputPath, filePath.replace(inputPath, '')))));
};

const copyToFileSystem = async (inputPath, outputPath, { recursive = false } = {}) => {
    if (recursive && fs.existsSync(outputPath) && fs.lstatSync(outputPath).isDirectory()) {
        await fs.emptyDir(outputPath);
    }
    fs.copySync(inputPath, path.join(outputRoot, outputPath), { recursive });
};

module.exports = {
    saveFile: (outputPath, content) => {
        if (isLambda()) return saveToS3(outputPath, content);

        return saveToFileSystem(outputPath, content);
    },
    copyDir: (inputPath, outputPath) => {
        if (isLambda()) return copyDirToS3(inputPath, outputPath);

        return copyToFileSystem(inputPath, outputPath, { recursive: true });
    },
    copyFile: (inputPath, outputPath) => {
        if (isLambda()) return copyFileToS3(inputPath, outputPath);

        return copyToFileSystem(inputPath, outputPath);
    },
};
