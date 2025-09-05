import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { vaultLoginReqDto } from './dtos/vault.dto';
// TODO: Fix login to not need the loginDto and use the jwt instead
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('getUserCert')
  getUserCert(@Body() loginDto: vaultLoginReqDto) {
    return this.userService.getCertificate(loginDto);
  }

  @Post('tidyVault')
  tidyVault(@Body() loginDto: vaultLoginReqDto) {
    return this.userService.tidyVault(loginDto);
  }

  @Post('getPrivateKey')
  getPrivateKey(@Body() loginDto: vaultLoginReqDto) {
    return this.userService.getPkForCert(loginDto);
  }
}
