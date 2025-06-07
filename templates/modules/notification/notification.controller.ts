import { Controller, Get, Param, Patch, UseGuards, Req } from "@nestjs/common"
import { NotificationService } from "./notification.service"

@Controller("notify")
export class NotificationController {
  constructor(private notifService: NotificationService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.notifService.findForUser(req?.user?._id)
  }

  @Patch(":id/read")
  markRead(@Param("id") id: string) {
    return this.notifService.markRead(id)
  }
}
