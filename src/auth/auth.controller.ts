import { Controller,Post ,Get,UseGuards, Res,ParseIntPipe} from '@nestjs/common';
import { Param, Req } from '@nestjs/common/decorators';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { Logger } from '@nestjs/common/services';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { StudentService } from 'src/student/student.service';
import { User } from 'src/typeorm/entities/User';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';


@Controller('auth')
export class AuthController {
    logger =new Logger();
    constructor(
        private authService:AuthService,
        private studentservice:StudentService 
    ){}
    @Post('login')
    @UseGuards(AuthGuard('local'))
    async login(@CurrentUser() user:User,
    @Res({passthrough:true}) response:Response){ 
        const token=this.authService.getTokenForUser(user);
        response.cookie('jwt',token);
        return "success";
    }

    //authenticated student read all
    @Get('/READ')
    async fetchStudents(
    @Req() request:Request){
        try{
            console.log("entered");
            const cookie=request.cookies['jwt'];
            const data=await this.authService.getData(cookie);                              
            if(!data){
                throw new UnauthorizedException()
            }

            return await this.studentservice.fetchAllStudents();
        }
        catch(e){
            console.log('helleo')
            throw new UnauthorizedException();
        }
    }

    //authenticated read students by id
    @Get('/READ/:id')
    async fetchStudent(
    @Req() request:Request,@Param('id', ParseIntPipe) id: number,){
        try{
            console.log("entered");
            const cookie=request.cookies['jwt'];
            const data=await this.authService.getData(cookie);                              
            if(!data){
                throw new UnauthorizedException()
            }

            return await this.studentservice.fetchStudents(id);
        }
        catch(e){
            console.log('helleo')
            throw new UnauthorizedException();
        }
    }

    @Post('logout')
    async logout(@Res({passthrough:true}) response:Response){
        response.clearCookie('jwt');

        return {
            message:"logout"
        }
    }
}
