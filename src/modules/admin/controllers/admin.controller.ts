import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { Roles } from "src/common/decorators/role.decorator";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RoleGuard } from "src/common/guards/role.guard";
import { UsersService } from "src/modules/users/services/users.service";
import { UpdateRoleChangeDto } from "../dto/update-role.dto";


@Controller("admin/users")
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles("admin")
export class AdminController {
    
    constructor(private userService: UsersService) {}
    
    @Get("") 
    async getAllUsers () {
        return this.userService.findAll();
    }

   @Get(":id") 
    async findOne(@Param("id") id: string) {
          return this.userService.findOne(id);
    }
    
   @Patch(":id") 
   async update(@Param("id") id:string, @Body() updateRoleChangeDto: UpdateRoleChangeDto) {
        return this.userService.updateRole(id, updateRoleChangeDto)
    } 

   @Delete(":id") 
   async remove(@Param("id") id: string) {
         return this.userService.remove(id);
    } 


}