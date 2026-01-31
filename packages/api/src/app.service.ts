import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    return {
      status: 'ok',
      message: 'Ospina API is running flawlessly 🚀',
      timestamp: new Date().toISOString(),
    };
  }
}
