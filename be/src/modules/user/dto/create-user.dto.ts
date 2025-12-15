import { IsOptional, MaxLength } from "class-validator";
import { 
    BIO_MAX_LENGTH, 
    IMAGE_MAX_LENGTH, 
    passwordMaxLength, 
    passwordMinLength, 
    USERNAME_MAX_LENGTH, 
    USERNAME_MIN_LENGTH
} from "src/common/constants/user.constant";
import {
    EmailRequired, 
    LengthDistance, 
    StringOptional, 
    StringRequired 
} from "src/common/decorators/validate.decorator";

export class CreateUserDto {

    @StringRequired('Name')
    @MaxLength(20, { message: 'Name must be at most 20 characters long' })
    name: string;

    @StringRequired('Username')
    @LengthDistance(USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH, 'Username')
    username: string;

    @EmailRequired('Email')
    email: string;
  
    @StringRequired('Password')
    @LengthDistance(passwordMinLength, passwordMaxLength, 'Password')
    password: string;

    @StringOptional('Bio')
    @MaxLength(BIO_MAX_LENGTH, {
        message: `Bio must be at most ${BIO_MAX_LENGTH} characters long`,
    })
    bio?: string;

    @StringOptional('Image')
    @MaxLength(IMAGE_MAX_LENGTH, {
        message: `Image must be at most ${IMAGE_MAX_LENGTH} characters long`,
    })
    image?: string;

    @IsOptional()
    role?: 'USER' | 'ADMIN';
}