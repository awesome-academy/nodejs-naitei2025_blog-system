import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  Put,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { FindManyArticlesQueryDto } from './dto/find-many-articles-query.dto';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import {
  ArticleDetailDto,
  ArticleListItemDto,
} from './dto/article-response.dto';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @UseGuards(JwtGuard)
  @Serialize(ArticleDetailDto)
  @Post()
  async create(@Body() createArticleDto: CreateArticleDto, @Req() req) {
    const authorId = req.user.id as number;

    const article = await this.articleService.create(
      authorId,
      createArticleDto,
    );

    return { message: 'Article created successfully', data: article };
  }

  @Get()
  @Serialize(ArticleListItemDto)
  async findMany(@Query() findManyArticlesQueryDto: FindManyArticlesQueryDto) {
    const articles = await this.articleService.findMany(
      findManyArticlesQueryDto,
    );

    if (!articles.articlesCount) {
      return {
        message: 'No articles found',
        data: { items: [], articlesCount: 0 },
      };
    }

    return {
      message: 'Articles retrieved successfully',
      data: articles,
    };
  }

  @UseGuards(JwtGuard)
  @Serialize(ArticleListItemDto)
  @Get('feed')
  async getFeed(@Req() req, @Query() query: FindManyArticlesQueryDto) {
    const userId = req.user.id as number;
    const feed = await this.articleService.getFeed(userId, query);
    return { message: 'Feed retrieved successfully', data: feed };
  }

  @Get(':slug')
  @Serialize(ArticleDetailDto)
  async findBySlug(@Param('slug') slug: string) {
    const article = await this.articleService.findBySlug(slug);

    return { message: 'Article found successfully', data: article };
  }

  @Get('author/:username')
  @Serialize(ArticleListItemDto)
  async findByAuthor(@Param('username') username: string) {
    const articles = await this.articleService.findByAuthor(username);
    return {
      message: 'Articles by author retrieved successfully',
      data: articles,
    };
  }

  @UseGuards(JwtGuard)
  @Serialize(ArticleDetailDto)
  @Put(':slug')
  async update(
    @Param('slug') slug: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    const article = await this.articleService.update(slug, updateArticleDto);
    return { message: 'Article updated successfully', data: article };
  }

  @UseGuards(JwtGuard)
  @Put(':slug/approve')
  async approveArticle(@Param('slug') slug: string) {
    const article = await this.articleService.approveArticle(slug);
    return { message: `Article ${article.title} approved successfully` };
  }

  @UseGuards(JwtGuard)
  @Put(':slug/reject')
  async rejectArticle(@Param('slug') slug: string) {
    const article = await this.articleService.rejectArticle(slug);
    return { message: `Article ${article.title} rejected successfully` };
  }

  @UseGuards(JwtGuard)
  @Delete(':slug')
  async remove(@Param('slug') slug: string, @Req() req) {
    const authorId = req.user.id as number;
    await this.articleService.remove(slug, authorId);
    return { message: 'Article deleted successfully' };
  }

  @UseGuards(JwtGuard)
  @Serialize(ArticleDetailDto)
  @Post(':slug/favorite')
  async favorite(@Param('slug') slug: string, @Req() req) {
    const currentUserId = req.user.id as number;
    const article = await this.articleService.favorite(slug, currentUserId);
    return { message: 'Article favorited successfully', data: article };
  }

  @UseGuards(JwtGuard)
  @Serialize(ArticleDetailDto)
  @Delete(':slug/favorite')
  async unfavorite(@Param('slug') slug: string, @Req() req) {
    const currentUserId = req.user.id as number;
    const article = await this.articleService.unfavorite(slug, currentUserId);
    return { message: 'Article unfavorited successfully', data: article };
  }
}
