import { Module } from '@nestjs/common';
import { AppDbModule } from 'src/db';
import { UserOrganizationController } from './userOrganization.controller';
import { UserOrganizationService } from './userOrganization.service';

@Module({
  imports: [AppDbModule],
  controllers: [UserOrganizationController],
  providers: [UserOrganizationService],
  exports: [UserOrganizationService],
})
export class UserOrganizationModule {}