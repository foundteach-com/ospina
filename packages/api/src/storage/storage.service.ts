import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private uploadDir: string;
  private publicBaseUrl: string;

  constructor(private configService: ConfigService) {
    // En Railway se monta el volumen en /app/uploads
    // En local usamos ./uploads relativo al proceso
    this.uploadDir =
      this.configService.get<string>('UPLOAD_DIR') ||
      path.join(process.cwd(), 'uploads');

    this.publicBaseUrl =
      this.configService.get<string>('PUBLIC_API_URL') ||
      `http://localhost:${this.configService.get<string>('PORT') || 4000}`;

    // Asegurarse de que el directorio base exista
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<string> {
    try {
      const folderPath = path.join(this.uploadDir, folder);

      // Crear subcarpeta si no existe
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const fileExt = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 10000)}${fileExt}`;
      const filePath = path.join(folderPath, fileName);

      // Escribir el buffer al disco
      fs.writeFileSync(filePath, file.buffer);

      // Retornar la URL pública
      const publicUrl = `${this.publicBaseUrl}/uploads/${folder}/${fileName}`;
      return publicUrl;
    } catch (error) {
      console.error('Error saving file to disk:', error);
      throw new InternalServerErrorException('No se pudo guardar el archivo');
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extraer la ruta relativa de la URL
      const urlPath = fileUrl.replace(/^https?:\/\/[^/]+\/uploads\//, '');
      const filePath = path.join(this.uploadDir, urlPath);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
}
