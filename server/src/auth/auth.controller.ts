import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  /**
   *
   * @param authService
   */
  constructor(private authService: AuthService) {}

  /**
   *
   * @param authCredentialsDto
   */
  @Post('/signup')
  register(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<User> {
    return this.authService.register(authCredentialsDto);
  }

  /**
   *
   * @param authCredentialsDto
   */
  @Post('/signin')
  login(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.login(authCredentialsDto);
  }
}
