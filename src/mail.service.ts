import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidV4 } from 'uuid';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('gmailAppAccount'),
        pass: this.configService.get<string>('gmailAppPassword'),
      },
    });
  }

  async sendPasswordResetLink(to: string) {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 2);
    const token = `${uuidV4()}@${expiryDate.getTime()}`;

    const url = this.configService.get<string>('frontendUrl');
    const resetLink = `${url}/auth/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: 'Ecommerce Service <noreply.ecommerce@gmail.com>',
      replyTo: 'noreply.ecommerce@gmail.com',
      to,
      subject: 'Ecommerce Reset Password',
      html: `<p><a href=${resetLink}>Click Here</a> To Reset Your Password</p>`,
    });

    return token;
  }

  async sendVerifyLink(to: string) {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 2);
    const token = `${uuidV4()}@${expiryDate.getTime()}`;

    const url = this.configService.get<string>('frontendUrl');
    const verifyLink = `${url}/auth/verify?token=${token}`;

    await this.transporter.sendMail({
      from: 'Ecommerce Service <noreply.ecommerce@gmail.com>',
      replyTo: 'noreply.ecommerce@gmail.com',
      to,
      subject: 'Ecommerce user verification',
      html: `<p><a href=${verifyLink}>Click Here</a> To Verify Your Email</p>`,
    });

    return token;
  }
}
