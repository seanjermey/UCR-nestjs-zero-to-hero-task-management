import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  /**
   *
   */
  private logger = new Logger('AuthService');

  /**
   *
   * @param userRepository
   * @param jwtService
   */
  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  /**
   *
   * @param authCredentialsDto
   */
  async register(authCredentialsDto: AuthCredentialsDto): Promise<User> {
    return await this.userRepository.register(authCredentialsDto);
  }

  /**
   *
   * @param authCredentialsDto
   */
  async login(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const authenticated = await this.userRepository.validatePassword(
      authCredentialsDto,
    );

    if (!authenticated) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      username: authCredentialsDto.username,
    };
    const accessToken = await this.jwtService.sign(payload);

    this.logger.debug(`Generated JWT Token ${JSON.stringify(payload)}`);

    return {
      accessToken,
    };
  }
}
