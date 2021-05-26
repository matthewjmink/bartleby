const { AWS_REGION, AWS_IAM_ACCESS_KEY, AWS_IAM_SECRET } = process.env;

module.exports = {
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_IAM_ACCESS_KEY,
        secretAccessKey: AWS_IAM_SECRET,
    }
};
