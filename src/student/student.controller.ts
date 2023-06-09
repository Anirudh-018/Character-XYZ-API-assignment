//imports for the required modules from the installed packages
import { Post, Get, Controller, Body, Param, ParseIntPipe, Patch, Delete, HttpException, HttpStatus, Res ,Query,UseGuards} from '@nestjs/common';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { StudentService } from './student.service';
import { Response } from 'express';
import { mergeSortScore, mergeSortRegId } from './student.helperSort';
import { Parent } from 'src/typeorm/entities/Parent';
import { AgeFilter } from './dto/list.students';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/typeorm/entities/User';
import { AuthGuard } from '@nestjs/passport';

//definition for the controller class
@Controller('student')
export class StudentController {
    constructor(private studentService: StudentService) { }
    //post request for the creation of a record in database
    //res is a response object which is used to send the api response
    //endpoint is CREATE
    @Post('CREATE')
    //the dto's used here are specyfing the input and the return type of the response and request
    createStudent(@Body() createStudent,
        @Res() res: Response,) {
        if (Object.keys(createStudent).length > 0) {
            const stud = this.studentService.createStudent(createStudent);
            const status = HttpStatus.CREATED + " Created";
            res.send({ status, stud })
        }
        else {
            res.status(400).send(HttpStatus.BAD_REQUEST + " Bad request")
        }
    }
    //This is the get method to retrieve student's data by id
    //Endpoint is READ/id where id is the student's id no
    @Get('/READ/:id')
    //the dto's used here are specyfing the input and the return type of the response and request
    //the parse int pipeline is used to validate the input id and converts the numeric string into integer
    async fetchStudents(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: Response
    ) {
        const students = await this.studentService.fetchStudents(id);
        if (students) {
            const type = { contentType: 'application/json' }
            const status = HttpStatus.OK + " found";
            res.send({ status, type, students })
        }
        else {
            throw new HttpException("empty", HttpStatus.BAD_REQUEST);
        }
    }

    //The get here is used to fetch all student data in an unsorted way
    //Endpoint is READ
    //the dto's used here in the service call is used to specyfing the eturn type of the response and request
    @Get('READ')
    async fetchAllStudents(@Res() res: Response) {
        const allStudents = await this.studentService.fetchAllStudents();
        if (allStudents) {
            const type = { contentType: 'application/json' }
            const status = HttpStatus.OK + " OK";
            res.send({ status, type, allStudents })
        }
    }
    
    //used to update the records in database and to view the updated result
    //Endpoint is UPDATE/id where id is the id of the student
    //the dto's used here are specyfing the input and the return type of the response and request
    @Patch('/UPDATE/:id')
    async updateStudentById(@Param('id', ParseIntPipe) id: number,
        @Body() updateStudentDto: UpdateStudentDto, @Res() res: Response ){
        const type = { contentType: 'application/json' }
        const stud = await this.studentService.updateStudent(id, updateStudentDto);
        const status = HttpStatus.OK + " OK"
        res.send({ status, type, stud });
        return stud;
    }

    //This request method is used to delete the record permanently based on its id
    //Endpoint is DELETE/id where id is the id of the student
    //The return type is just a text
    @Delete('/DELETE/:id')
    async deleteStudentById(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
        const deleteResponse = await this.studentService.deleteStudent(id)
        if (deleteResponse) {
            const status = HttpStatus.NO_CONTENT + " no content";
            res.send({ status, deleteResponse })
        }
        else {
            res.send(HttpStatus.NOT_FOUND + " not found");
        }
    }

    //This request method is used to fetch the record sorted in the order of weighted score in descending order of score
    //weighted score = 0.7*gpa + 0.3* attendance
    //Endpoint is weighted_score
    @Get("Weighted_score")
    async fetchAllWeightedScore(@Res() res: Response) {
        const sortedStudents = mergeSortScore(await this.studentService.fetchAllStudents());
        const type = { contentType: 'application/json' }
        const status = HttpStatus.OK + " found";
        res.send({ status, type, sortedStudents })

    }

    //This request method is used to fetch the record sorted in the order of weighted score
    //weighted score = 0.7*gpa + 0.3* attendance
    //Endpoint is registration_date
    @Get('registration_date')
    async fetchAllRegistrationId(@Res() res: Response) {
        const sortedStudents = mergeSortRegId(await this.studentService.fetchAllStudents());
        const type = { contentType: 'application/json' }
        const status = HttpStatus.OK + " found";
        res.send({ status, type, sortedStudents })
    }

    @Post()
    @UseGuards(AuthGuard('jwtGate'))
    async create(@Body() input:CreateStudentDto,
    @CurrentUser() user:User){
        return await this.studentService.createStudents(input,user);
    }
}
