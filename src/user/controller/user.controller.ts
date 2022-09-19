import { Controller, Post, Body, Get, Param, Delete, Put, UseGuards, Query } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { off } from 'process';
import { catchError, map, Observable, of } from 'rxjs';
import { hasRoles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { User, UserRole } from '../models/user.interface';
import { UserService } from '../service/user.service';

@Controller('users')
export class UserController {
    constructor(private userservice: UserService){}
    
    @Post()
    create(@Body()user: User): Observable<User | Object>{
        return this.userservice.create(user).pipe(
            map((user:User)=>user),
            catchError(err=>of({error:err.message}))
        )
 
    }

    @Post('login')
    login(@Body() user: User):Observable<Object>{
        return this.userservice.login(user).pipe(
            map((jwt: string)=>{
                return {access_token: jwt};
            })
        )
    }

    @Get(':id')
    findOne(@Param('id')id:string):Observable<User>{
        return this.userservice.findOne(Number(id));
    }

    @Get()
    index(  @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,):Observable<Pagination<User>>{
        limit= limit>100?100:limit;
        return this.userservice.paginate({page: Number(page), limit: Number(limit) ,route: 'http://localhost:3000/users'});
    }
    @Get()
    findAll():Observable<User[]>{
        return this.userservice.findAll();
    }

    @Delete(':id')
    deleteOne(@Param('id')id:string):Observable<User>{
        return this.userservice.deleteOne(Number(id));
    }

    @Put(':id')
    updateOne(@Param('id') id:string, @Body() user:User): Observable<any>{
        return this.userservice.updateOne(Number(id),user)

    }

    @hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put(':id/role')
    updateRoleOfUser(@Param('id') id: string, @Body() user: User): Observable<User>{
        return this.userservice.updateRoleOfUser(Number(id),user);
    }
}
