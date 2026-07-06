import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as path from 'path';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private endpoint: string;

  constructor(private configService: ConfigService) {
    this.endpoint = this.configService.get<string>('DO_SPACES_ENDPOINT') || 'https://ospina-assets.sfo3.digitaloceanspaces.com';
    this.bucketName = this.configService.get<string>('DO_SPACES_BUCKET') || 'ospina-assets';
    const region = 'sfo3';

    this.s3Client = new S3Client({
      endpoint: 'https://sfo3.digitaloceanspaces.com', // Base DO API endpoint
      forcePathStyle: false, 
      region: region,
      credentials: {
        accessKeyId: this.configService.get<string>('DO_SPACES_KEY') || '',
        secretAccessKey: this.configService.get<string>('DO_SPACES_SECRET') || '',
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<string> {
    try {
      const fileExt = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 10000)}${fileExt}`;
      const objectKey = `${folder}/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      });

      await this.s3Client.send(command);

      // Retornar la URL pública (usando el endpoint origin que nos dio el usuario)
      return `${this.endpoint}/${objectKey}`;
    } catch (error) {
      console.error('Error uploading file to Digital Ocean Spaces:', error);
      throw new InternalServerErrorException('No se pudo subir el archivo a la nube');
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      if (!fileUrl) return;

      const urlPrefix = `${this.endpoint}/`;
      let objectKey = fileUrl;

      if (fileUrl.startsWith(urlPrefix)) {
        objectKey = fileUrl.substring(urlPrefix.length);
      } else {
        try {
          const urlObj = new URL(fileUrl);
          objectKey = urlObj.pathname.substring(1);
        } catch {
           // Fallback en caso de URL malformada
           objectKey = fileUrl;
        }
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from Digital Ocean Spaces:', error);
    }
  }
}
