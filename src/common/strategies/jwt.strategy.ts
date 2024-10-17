import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest } from 'fastify';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: (req: FastifyRequest) => req.headers.authorization,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('accessTokenSecretKey'),
    });
  }

  async validate(payload: any) {
    return { id: +payload.id, role: payload.role, verified: payload.verified };
  }
}
