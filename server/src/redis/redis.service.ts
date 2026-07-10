import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnApplicationShutdown {
  // This is the raw Redis client – you can call any Redis command on it
  public readonly client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL,
    });
    this.client.on('error', (err) => console.error('Redis error:', err));
    this.client.connect();
  }

  async onApplicationShutdown(signal?: string) {
    await this.client.quit();
  }
}
