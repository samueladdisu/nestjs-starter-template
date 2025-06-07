import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as nodemailer from "nodemailer"

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter
  private readonly logger = new Logger(EmailService.name)

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>("smtpHost"),
      port: this.configService.get<number>("smtpPort"),
      secure: false,
      auth: {
        user: this.configService.get<string>("smtpUser"),
        pass: this.configService.get<string>("smtpPass"),
      },
    })
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"No Reply" <${this.configService.get("smtpUser")}>`,
        to,
        subject,
        html,
      })

      this.logger.log(`Email sent: ${info.messageId}`)
      return info
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`)
      throw error
    }
  }
}
