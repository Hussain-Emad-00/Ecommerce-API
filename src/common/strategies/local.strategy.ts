import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate as validateInputData } from 'class-validator';

import { AuthService } from '../../core/auth/auth.service';
import { LoginDto } from '../../core/auth/dto/login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    await validateInputData(plainToClass(LoginDto, { email, password }));

    return await this.authService.validateUser({ email, password });
  }
}
