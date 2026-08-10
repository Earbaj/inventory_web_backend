import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'keeper_pos_super_secret_jwt_key_2026',
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.userModel.findById(payload.sub).select('-passwordHash');
    if (!user) {
      throw new UnauthorizedException('User account no longer exists');
    }
    return {
      uid: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
    };
  }
}
