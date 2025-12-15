import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetCommentsQueryDto } from './dto/get-comments-query.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { CommentResponseDto } from './dto/comment-response.dto';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtGuard)
  @Serialize(CommentResponseDto)
  @Post(':slug/comment')
  async createComment(
    @Param('slug') slug: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req,
  ) {
    const user = req.user;
    const comment = await this.commentService.createComment(
      slug,
      createCommentDto,
      user,
    );

    return {
      message: 'Tạo bình luận thành công',
      data: comment,
    };
  }

  @UseGuards(JwtGuard)
  @Serialize(CommentResponseDto)
  @Post(':commentId/replies')
  async createReply(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req,
  ) {
    const user = req.user;
    const reply = await this.commentService.createReply(
      commentId,
      createCommentDto,
      user,
    );

    return {
      message: 'Tạo phản hồi thành công',
      data: reply,
    };
  }

  @Serialize(CommentResponseDto)
  @Get(':slug/comment')
  async getCommentsByArticle(
    @Param('slug') slug: string,
    @Query() query: GetCommentsQueryDto,
  ) {
    const result = await this.commentService.getCommentsByArticle(slug, query);

    return {
      message: 'Lấy bình luận thành công',
      data: result,
    };
  }

  @Serialize(CommentResponseDto)
  @Get(':commentId/replies')
  async getReplies(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Query() query: GetCommentsQueryDto,
  ) {
    const result = await this.commentService.getReplies(commentId, query);

    return {
      message: 'Lấy phản hồi thành công',
      data: result,
    };
  }

  @UseGuards(JwtGuard)
  @Serialize(CommentResponseDto)
  @Patch(':commentId')
  async updateComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req,
  ) {
    const user = req.user;
    const comment = await this.commentService.updateComment(
      commentId,
      updateCommentDto,
      user,
    );

    return {
      message: 'Cập nhật bình luận thành công',
      data: comment,
    };
  }

  @UseGuards(JwtGuard)
  @Delete(':commentId')
  async deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req,
  ) {
    const user = req.user;
    await this.commentService.deleteComment(commentId, user);

    return {
      message: 'Xóa bình luận thành công',
    };
  }
}
