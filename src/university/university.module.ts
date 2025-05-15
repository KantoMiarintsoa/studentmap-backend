import { Module } from '@nestjs/common';
import { UniversityController } from './university.controller';
import { UniversityService } from './university.service';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  controllers: [UniversityController],
  providers: [UniversityService],
  imports: [CommonModule, AuthModule, EmailModule]
})
export class UniversityModule {

}
