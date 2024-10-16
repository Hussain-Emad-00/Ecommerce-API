import { BadRequestException, Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';

import { PrismaService } from '../prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async add(userId: any, { productId, quantity }: CreatePaymentDto) {
    const product: Product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (quantity > product.quantity) throw new BadRequestException();

    await this.prisma.user.update({
      where: { id: userId },
      data: { totalSpent: { increment: quantity * product.price } },
    });

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        quantity: { decrement: quantity },
        sold: { increment: quantity },
      },
    });
  }
}
