import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { RoleGuard } from 'src/common/guards/role.guard';
import { AdminController } from './controllers/admin.controller';

@Module({
     imports: [
          UsersModule
     ],
     controllers: [AdminController],
     providers: [JwtStrategy, RoleGuard]
})
export class AdminModule {}
