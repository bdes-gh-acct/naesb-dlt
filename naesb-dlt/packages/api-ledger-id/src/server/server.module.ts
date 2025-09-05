import { Module } from '@nestjs/common';
import { ServerService } from './server.service';
import { ServerController } from './server.controller';
import { HttpModule } from '@shared/server-utils';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [
    HttpModule.register({
      retries: 5,
    }),
  ],
  controllers: [ServerController],
  providers: [ServerService, UserService],
})
export class ServerModule {}
