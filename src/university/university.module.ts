import { Module } from '@nestjs/common';
import { UniversityController } from './university.controller';
import { UniversityService } from './university.service';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [UniversityController],
  providers: [UniversityService],
  imports: [CommonModule, AuthModule]
})
export class UniversityModule {

}
