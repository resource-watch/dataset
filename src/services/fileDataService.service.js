const { default: logger } = require('logger');
const fs = require('fs');
const s3 = require('@auth0/s3');
const firstline = require('firstline');

const { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;

const S3Client = s3.createClient({
    maxAsyncS3: 20, // this is the default
    s3RetryCount: 3, // this is the default
    s3RetryDelay: 1000, // this is the default
    multipartUploadThreshold: 20971520, // this is the default (20 MB)
    multipartUploadSize: 15728640, // this is the default (15 MB)
    s3Options: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
        region: 'us-east-1'
    }
});

class FileDataService {

    static async uploadFileToS3(filePath, fileName) {
        logger.info('[SERVICE] Uploading to S3');
        const key = `temp/${fileName}`;
        const params = {
            localFile: filePath,
            s3Params: {
                Bucket: 'wri-api-backups',
                Key: key,
                ACL: 'public-read'
            }
        };
        const uploader = S3Client.uploadFile(params);
        await new Promise((resolve, reject) => {
            uploader.on('end', (data) => resolve(data));
            uploader.on('error', (err) => reject(err));
        });
        const s3file = s3.getPublicUrlHttp(params.s3Params.Bucket, params.s3Params.Key);
        return s3file;
    }

    static async copyFile(fileName) {
        logger.info('[SERVICE] Copying to S3');
        const name = fileName.split('/')[1];

        const params = {
            Bucket: 'wri-api-backups',
            CopySource: `wri-api-backups/temp/${name}`,
            Key: `raw/${name}`,
            ACL: 'public-read'
        };
        const stream = S3Client.moveObject(params);
        await new Promise((resolve, reject) => {
            stream.on('error', (err) => {
                reject(err);
            });
            stream.on('end', (data) => {
                resolve(data);
            });
        });
        const s3file = s3.getPublicUrlHttp(params.Bucket, params.Key);
        return s3file;
    }

    static removeFromTempDirectory(filePath) {
        try {
            fs.unlink(filePath);
            FileDataService.cleanTempDirectory();
            return true;
        } catch (err) {
            return false;
        }
    }

    static cleanTempDirectory() {
        // read tmp dir
        fs.readdir('/tmp/', (_, files) => {
            // iterate over them
            files.forEach((file) => {
                // upload_* (raw dataset)
                if (file.indexOf('upload_') >= 0) {
                    // stats
                    fs.stat(`/tmp/${file}`, (__, stats) => {
                        // modified time + 24 > Date now
                        if (Date.now() - 24 * 3600 > Date.parse(stats.mtime)) {
                            fs.unlink(`/tmp/${file}`);
                        }
                    });
                }
            });
        });
    }

    static async getFields(filePath, provider) {
        logger.debug('Obtaining fields');
        let fields = null;
        try {
            switch (provider) {

                case 'csv': {
                    const line = await firstline(filePath);
                    if (line) {
                        fields = line.split(',');
                    }
                    break;
                }
                case 'tsv': {
                    const line = await firstline(filePath);
                    if (line) {
                        fields = line.split('\t');
                    }
                    break;
                }

                default:
                    break;

            }
        } catch (err) {
            logger.error(err);
        } finally {
            // do not wait for it
            FileDataService.removeFromTempDirectory(filePath);
        }
        return fields;

    }

}

module.exports = FileDataService;
