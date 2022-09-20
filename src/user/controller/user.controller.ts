import { Controller, Post, Body, Get, Param, Delete, Put, UseGuards, Query, UseInterceptors,  UploadedFile, Request , Res} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Pagination } from 'nestjs-typeorm-paginate';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { hasRoles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { User, UserRole } from '../models/user.interface';
import { UserService } from '../service/user.service';
import {v4 as uuidv4} from 'uuid';
import path = require('path');
import { join } from 'path';
import { diskStorage} from 'multer';

export const storage = {
    storage: diskStorage({
        destination: './uploads/profileimages',
        filename: (req, file, cb) => {
            const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
            const extension: string = path.parse(file.originalname).ext;
            console.log("Hi");
            cb(null, `${filename}${extension}`)
        }
    })

}


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
    index(  
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('username') username : string):Observable<Pagination<User>>{
        limit= limit>100?100:limit;
        if(username===null || username ===undefined){
            return this.userservice.paginate({page: Number(page), limit: Number(limit) ,route: 'http://localhost:3000/users'})
        }
        else {
            return this.userservice.paginateFilterByUsername(
                {page: Number(page), limit: Number(limit) ,route: 'http://localhost:3000/users'},
                {username}
            )
        }
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

    @UseGuards(JwtAuthGuard)
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', storage))
    uploadFile(@UploadedFile() file, @Request() req): Observable<Object>{
        console.log("Hi")
        console.log(file);
        const user: User= req.user.user;
        return this.userservice.updateOne(user.id, {profileImage: file.filename}).pipe(
            tap((user: User) => console.log(user)),
            map((user: User)=>({profileImage: user.profileImage}))
        )
    }

    @Get('profile-image/:imagename')
    findProfileImage(@Param('imagename') imagename, @Res() res): Observable<Object> {
        return of(res.sendFile(join(process.cwd(), 'uploads/profileimages/' + imagename)));
    }
}

