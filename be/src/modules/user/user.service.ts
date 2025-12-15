import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PASSWORD_SALT_ROUNDS } from 'src/common/constants/user.constant';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return (await bcrypt.hash(password, PASSWORD_SALT_ROUNDS)) as string;
  }

  async checkExistUser(email?: string, username?: string) {
    const user = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });
    return user;
  }

  async checkPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }

  async create(createUserDto: CreateUserDto) {
    const { email, username } = createUserDto;

    const existedUser = await this.checkExistUser(email, username);

    if (existedUser) {
      if (existedUser.email === email) {
        throw new ConflictException('Create user failed', {
          description: 'Email already in use',
        });
      }
      if (existedUser.username === username) {
        throw new ConflictException('Create user failed', {
          description: 'Username already in use',
        });
      }
    }

    const hashedPassword = await this.hashPassword(createUserDto.password);
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    await this.userRepository.save(newUser);

    return {
      message: 'User created successfully',
      data: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      },
    };
  }

  async findById(id: number): Promise<UserEntity> {
    if (isNaN(id)) {
      throw new BadRequestException('Invalid user ID', {
        description: 'User ID must be a number',
      });
    }

    const result = await this.userRepository.findOne({
      where: { id },
      relations: ['following', 'followers', 'favoritedArticles', 'articles'],
    });
    if (!result) {
      throw new NotFoundException('User not found', {
        description: `No user found with ID ${id}`,
      });
    }

    return result;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'username', 'password'],
    });
  }

  async findByUsername(username: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['following', 'followers'],
    });

    if (!user) {
      throw new NotFoundException('User not found', {
        description: `No user found with username ${username}`,
      });
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let newToken: string | undefined;

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExist = await this.checkExistUser(
        updateUserDto.email,
        undefined,
      );

      if (emailExist) {
        throw new ConflictException('Update failed', {
          description: 'Email already in use',
        });
      } else {
        newToken = await this.jwtService.signAsync({
          id,
          email: updateUserDto.email,
        });
      }
    }

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const usernameExist = await this.checkExistUser(
        undefined,
        updateUserDto.username,
      );
      if (usernameExist) {
        throw new ConflictException('Update failed', {
          description: 'Username already in use',
        });
      }
    }

    // Cập nhật các field
    Object.assign(user, updateUserDto);

    if (updateUserDto.password) {
      user.password = await this.hashPassword(updateUserDto.password);
    }

    // PHẢI SAVE để lưu vào database
    const updatedUser = await this.userRepository.save(user);
    return {
      ...updatedUser,
      ...(newToken && { token: newToken }),
    };
  }

  async getProfile(username: string, currentUserId?: number) {
    const user = await this.findByUsername(username);
    let isFollowing = false;
    if (currentUserId) {
      isFollowing = user.followers.some(
        (follower) => follower.id === currentUserId,
      );
    }

    const result = plainToInstance(UserEntity, {
      ...user,
      isFollowing,
    });

    return result;
  }

  async validateFollow(userId: number, targetUserUsername: string) {
    const user = await this.findById(userId);
    if (user.username === targetUserUsername) {
      throw new BadRequestException('You cannot follow or unfollow yourself');
    }
    return user;
  }

  async follow(userId: number, targetUserUsername: string) {
    const user = await this.validateFollow(userId, targetUserUsername);

    if (user.username === targetUserUsername) {
      throw new ConflictException('Follow failed', {
        description: 'You cannot follow yourself',
      });
    }

    const targetUser = await this.findByUsername(targetUserUsername);
    if (targetUser.followers.some((follower) => follower.id === user.id)) {
      throw new ConflictException('Follow failed', {
        description: 'You are already following this user',
      });
    }

    user.following.push(targetUser);
    await this.userRepository.save(user);
    const result = {
      ...targetUser,
      isFollowing: true,
    };
    return result;
  }

  async unfollowUser(userId: number, targetUserUsername: string) {
    const user = await this.validateFollow(userId, targetUserUsername);

    const targetUser = await this.findByUsername(targetUserUsername);
    if (!targetUser.followers.some((follower) => follower.id === user.id)) {
      throw new ConflictException('Unfollow failed', {
        description: 'You are not following this user',
      });
    }

    user.following = user.following.filter(
      (following) => following.id !== targetUser.id,
    );
    await this.userRepository.save(user);
    const result = {
      ...targetUser,
      isFollowing: false,
    };
    return result;
  }

  async getFollowing(userId: number) {
    const user = await this.findById(userId);
    return user.following;
  }

  async listUsers(options: {
    page?: number;
    limit?: number;
    username?: string;
    email?: string;
  }) {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (options.username) {
      queryBuilder.andWhere('user.username LIKE :username', {
        username: `%${options.username}%`,
      });
    }
    if (options.email) {
      queryBuilder.andWhere('user.email LIKE :email', {
        email: `%${options.email}%`,
      });
    }

    // Tối ưu: Đếm số lượng relation bằng subquery trong 1 lần gọi DB
    queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.id', 'ASC');

    const [users, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      items: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async countUsers() {
    const total = await this.userRepository.count();
    return { total };
  }
}
