import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    this.logger.debug(`Validating token for user: ${payload.email}`);
    
    const user = await this.authService.validateUser(payload.sub);
    
    if (!user) {
      this.logger.warn(`User not found: ${payload.sub}`);
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      this.logger.warn(`User inactive: ${payload.email}`);
      throw new UnauthorizedException('User is inactive');
    }

    // Get fresh permissions from database
    const permissions = user.roles?.flatMap(r => r.permissions?.map(p => p.name) || []) || [];
    
    this.logger.debug(`User ${user.email} has permissions: [${permissions.join(', ')}]`);

    return {
      id: user.id,
      email: user.email,
      roles: user.roles?.map(r => r.name) || [],
      permissions: permissions,
      user,
    };
  }
}
