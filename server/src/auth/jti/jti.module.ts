import { Module } from '@nestjs/common';
import { JtiService } from './jti.service';

@Module({
  providers: [JtiService],
  exports: [JtiService], // Export so other modules can use it
})
export class JtiModule {}