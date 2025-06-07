import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { SignupDto } from './dtos/signup.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDocument } from './schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { ResetTokenDocument } from './schemas/reset-token.schema';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { Role } from './enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    @InjectModel('RefreshToken')
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
    @InjectModel('ResetToken')
    private readonly resetTokenModel: Model<ResetTokenDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async getUsers() {
    return await this.userModel
      .find()
      .select('-password')
      .sort({ createdAt: -1 });
  }

  async findById(id: string) {
    return await this.userModel.findById(id).select('-password');
  }

  async findByRole(role: string) {
    return await this.userModel.find({ role }).select('-password');
  }

  async signup(signupDto: SignupDto) {
    const { name, email, password, role } = signupDto;
    const emailExists = await this.userModel.findOne({ email });

    if (emailExists) {
      throw new BadRequestException('Email already exists');
    }

    // const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({
      name,
      email,
      password,
      role,
    });

    return user;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPasswordValid = password === user.password;

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateJwtToken(user._id, user.role);
  }

  async changePassword(changePasswordDto: any, userId: any) {
    const { oldPassword, newPassword } = changePasswordDto;
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = newHashedPassword;
    await user.save();
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email });

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getHours() + 1);

    if (user) {
      const resetToken = nanoid(64);
      await this.resetTokenModel.create({
        userId: user._id,
        token: resetToken,
        expiryDate,
      });
    }

    return {
      message: 'Password reset link sent to your email',
    };
  }

  async generateJwtToken(userId: any, role: Role) {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    const accessToken = this.jwtService.sign(
      { userId, role, email: user.email, name: user.name },
      { expiresIn: '30d' },
    );
    const refreshToken = uuidv4();

    await this.storeRefreshToken(userId, refreshToken, role);
    return {
      accessToken,
      refreshToken,
    };
  }

  async storeRefreshToken(userId: any, token: string, role: Role) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.refreshTokenModel.updateOne(
      { userId },
      { $set: { token, expiryDate, role } },
      { upsert: true },
    );
  }

  async revokeRefreshToken(userId: string, token: string) {
    // remove either that one token, or all tokens for this user:
    await this.refreshTokenModel.deleteOne({ userId, token });
    // or: await this.refreshTokenModel.deleteMany({ userId });
  }
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { resetToken, newPassword } = resetPasswordDto;

    const token = await this.resetTokenModel.findOneAndDelete({
      token: resetToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid Link');
    }

    const user = await this.userModel.findById(token.userId);

    if (!user) {
      throw new InternalServerErrorException('User Does not exist');
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = newHashedPassword;

    await user.save();
  }

  async refreshToken(token: string) {
    const refreshToken = await this.refreshTokenModel.findOneAndDelete({
      token,
      expiryDate: { $gte: new Date() },
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.generateJwtToken(refreshToken.userId, refreshToken.role);
  }
}
