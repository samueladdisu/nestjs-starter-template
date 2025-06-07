// src/notifications/notifications.service.ts
import { Injectable } from "@nestjs/common"
import { Server } from "socket.io"
import { Model, Types } from "mongoose"
import { Notification, NotificationDocument } from "./notification.schema"
import { InjectModel } from "@nestjs/mongoose"

@Injectable()
export class NotificationService {
  private server: Server

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>
  ) // private authService: AuthService,
  {}

  // create and return a notification
  async create(userId: string, message: string) {
    return this.notificationModel.create({
      userId: new Types.ObjectId(userId),
      message,
    })
  }

  // async createForRole(role: string, message: string, payload: any) {
  //   // lookup all users with that role
  //   const users = await this.authService.findByRole(role);
  //   return Promise.all(
  //     users.map((u) =>
  //       this.notificationModel.create({ userId: u._id, message, payload }),
  //     ),
  //   );
  // }

  // get all notifications for a user
  async findForUser(userId: string) {
    return this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec()
  }

  // mark a notification read
  async markRead(id: string) {
    return this.notificationModel
      .findByIdAndUpdate(id, { read: true }, { new: true })
      .exec()
  }

  /** Called by the gateway once it’s initialized */
  registerServer(server: Server) {
    this.server = server
  }

  emitToRole(role: string, event: string, payload: any) {
    try {
      this.server.emit(event, payload)
    } catch (error) {
      console.log(error)
    }
  }

  emitToUser(userId: string, event: string, payload: any) {
    this.server.to(userId).emit(event, payload)
  }
}
