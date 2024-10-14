import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate as validateInputData } from 'class-validator';

import { AuthService } from '../auth/auth.service';
import { LoginDto } from '../auth/dto/login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    await validateInputData(plainToClass(LoginDto, { email, password }));

    const user = await this.authService.validateUser({ email, password });
    if (!user) throw new UnauthorizedException();

    return user;
  }
}
