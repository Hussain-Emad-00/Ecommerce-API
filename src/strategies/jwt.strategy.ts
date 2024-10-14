import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: (req: FastifyRequest) => req.cookies?.access_token,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('accessTokenSecretKey'),
    });
  }

  async validate(payload: any) {
    return { id: payload.id, role: payload.role };
  }
}
