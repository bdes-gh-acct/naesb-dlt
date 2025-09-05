import { Module } from '@nestjs/common';
import { AppDbModule } from 'src/db';
import { UserOrganizationModule } from 'src/userOrganization/userOrganization.module';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

@Module({
  imports: [AppDbModule, UserOrganizationModule],
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class OrganizationModule {}
