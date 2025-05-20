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
import { ExportService } from './export/export.service';
import { ExportModule } from './export/export.module';
import { EmailModule } from './email/email.module';
import { MessagesModule } from './messages/messages.module';
import { StorageModule } from './storage/storage.module';

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
    ScheduleModule.forRoot(),
    ExportModule,
    EmailModule,
    MessagesModule,
    StorageModule
  ],
  controllers: [AppController],
  providers: [AppService, ExportService],
})
export class AppModule { }
