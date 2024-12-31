import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { DeleteObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

import { S3Service } from "@/common/aws/s3-service/s3-service";

import { ALLOWED_MIME_TYPES } from "./file-uploads.constants";

@Injectable()
export class FileUploadsService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {}

  async getPresignedUrl(file: Express.Multer.File) {
    file.originalname = `${randomUUID()}-${new Date().getTime()}-${file.originalname}`;
    const { originalname, mimetype } = file;
    if (ALLOWED_MIME_TYPES.indexOf(mimetype) === -1) {
      throw new HttpException("Invalid file type", HttpStatus.BAD_REQUEST);
    }
    const signedUrl = await this.s3Service.getPresignedUrl(originalname, mimetype);
    return signedUrl;
  }

  async uploadToS3(url: string, file: Express.Multer.File) {
    const response = await fetch(url, {
      method: "PUT",
      body: file.buffer,
      headers: {
        "Content-Type": file.mimetype,
      },
    });
    return response;
  }

  async deleteFromS3(key: string) {
    try {
      const deleteParams = {
        Bucket: await this.configService.get("AWS_S3_BUCKET_NAME"),
        Key: key,
      };
      const command = new DeleteObjectCommand(deleteParams);
      const response = await this.s3Client.send(command);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`S3 Deletion Error: ${errorMessage}`);
    }
  }

  async getDownloadUrl(fileKey: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.configService.get("AWS_S3_BUCKET_NAME"),
        Key: fileKey,
        ResponseContentDisposition: `attachment; filename="${fileKey.split("/").pop()}"`,
      });
      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
      return signedUrl.replace("localstack", "localhost");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Download URL ERROR: ${errorMessage}`);
    }
  }
}
