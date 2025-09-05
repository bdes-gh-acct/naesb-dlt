import { Controller, Get } from '@nestjs/common';
import { ConnectionService } from './connection.service';

@Controller('connections')
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Get('/public')
  public async getPublic() {
    return this.connectionService.createPublicInvitation();
  }
}
