import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AccommodationModule } from './accommodation/accommodation.module';
import { UniversityModule } from './university/university.module';
import { UniversityController } from './university/university.controller';
import { EvenementModule } from './evenement/evenement.module';
import { BackupModule } from './backup/backup.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    AuthModule,
    UserModule,
    CommonModule,
    AccommodationModule,
    UniversityModule,
    // EventModule,
    EvenementModule,
    BackupModule,
    ScheduleModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
