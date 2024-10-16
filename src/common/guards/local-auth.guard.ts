import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FastifyReply, FastifyRequest } from 'fastify';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { LoginDto } from '../../core/auth/dto/login.dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const response = context.switchToHttp().getResponse<FastifyReply>();

    const body = plainToInstance(LoginDto, request.body);

    const errors = await validate(body);

    const errorMessages = errors.flatMap(({ constraints }) =>
      Object.values(constraints),
    );

    if (errorMessages.length > 0) {
      response
        .status(HttpStatus.BAD_REQUEST)
        .send({
          message: errorMessages[0],
          error: 'Bad Request',
          statusCode: 400,
        })
        .send();
      return false;
    }

    return super.canActivate(context) as boolean | Promise<boolean>;
  }
}
