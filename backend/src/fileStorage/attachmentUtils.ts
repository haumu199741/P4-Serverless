import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { CreateSignedURLRequest } from '../requests/CreateSignedURLRequest';


const XAWS = AWSXRay.captureAWS(AWS)

export class TodosStorage {
    constructor(
        private readonly s3Bucket = new XAWS.S3({ signatureVersion: 'v3'})
    ) {}


    getPresignedUploadURL(createSignedUrlRequest: CreateSignedURLRequest) {
      const get= this.s3Bucket.getSignedUrl('putObject', createSignedUrlRequest);
        return get;
    }
}
