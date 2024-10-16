import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PaymentService } from './payment.service';
import { VerifiedUserGuard } from '../common/guards/verified-user.guard';
import { FastifyRequest } from 'fastify';
import { CreatePaymentDto } from './dto/create-payment.dto';

@UseGuards(AuthGuard('jwt'), VerifiedUserGuard)
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Patch()
  async add(
    @Req() req: FastifyRequest,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentService.add(req['user'].id, createPaymentDto);
  }
}
