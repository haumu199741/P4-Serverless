const s3_bucket_name19 = process.env.ATTACHMENT_S3_BUCKET;


export class AttachmentUtils {
  constructor(
    private readonly bucket_name = s3_bucket_name19
  ) {}

  getAttachmentUrl(todoId: string): string {
    return "https://" + this.bucket_name + ".s3.amazoneaws.com/" + todoId;
  }

}