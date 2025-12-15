import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from './entities/article.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { TagEntity } from '../tag/entities/tag.entity';
import { TagService } from '../tag/tag.service';
import { FindManyArticlesQueryDto } from './dto/find-many-articles-query.dto';
import readingTime from 'reading-time';
import { ArticleStatus } from 'src/common/class/enum/article.enum';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    private readonly userService: UserService,
    private readonly tagService: TagService,
    // private readonly commentSerivice: CommentService,
  ) {}

  async validateTitle(title: string) {
    const article = await this.articleRepository.findOne({
      where: { title },
    });

    if (article) {
      throw new ConflictException('Create article failed', {
        description: 'Title already in use',
      });
    }
  }

  async createTag(name: string) {
    let tag = await this.tagService.findByName(name);

    if (!tag) {
      tag = await this.tagService.create({ name });
    }
    return tag;
  }

  async create(authorId: number, createArticleDto: CreateArticleDto) {
    const { title, tagList, ...rest } = createArticleDto;

    await this.validateTitle(title);

    const slug = title.toLowerCase().trim().replace(/\s+/g, '-');

    let tags: TagEntity[] = [];
    if (tagList) {
      tags = await Promise.all(
        tagList.map(async (tagName) => this.createTag(tagName)),
      );
    }

    const author = await this.userService.findById(authorId);
    const reading_time = Math.ceil(readingTime(rest.body).minutes);

    const newArticle = this.articleRepository.create({
      slug,
      title,
      author,
      reading_time,
      ...(tags.length > 0 && { tagList: tags }),
      ...rest,
    });

    await this.articleRepository.save(newArticle);

    return newArticle;
  }

  async findMany(findManyArticlesQueryDto: FindManyArticlesQueryDto) {
    const { tag, author, favorited, limit, offset } = findManyArticlesQueryDto;

    const query = this.articleRepository.createQueryBuilder('article');
    if (tag) {
      query.innerJoinAndSelect('article.tagList', 'tag', 'tag.name = :tag', {
        tag,
      });
    } else {
      query.leftJoinAndSelect('article.tagList', 'tag');
    }
    if (author) {
      query.innerJoinAndSelect(
        'article.author',
        'author',
        'author.username = :author',
        {
          author,
        },
      );
    } else {
      query.leftJoinAndSelect('article.author', 'author');
    }
    if (favorited) {
      query.innerJoin(
        'article.favoritedBy',
        'user',
        'user.username = :favorited',
        {
          favorited,
        },
      );
    }
    query.skip(offset).take(limit).where('article.deletedAt IS NULL');

    const [articles, count] = await query.getManyAndCount();
    return { items: articles, articlesCount: count };
  }

  async findBySlug(slug: string) {
    const article = await this.articleRepository.findOne({
      where: { slug, deletedAt: undefined },
      relations: { author: true, favoritedBy: true, tagList: true },
    });

    if (!article) {
      throw new ConflictException('Get article failed', {
        description: 'Article not found',
      });
    }
    return article;
  }

  async findByAuthor(username: string) {
    return await this.articleRepository.find({
      where: { author: { username: username }, deletedAt: undefined },
      relations: { author: true, tagList: true },
    });
  }

  async getFeed(userId: number, query: FindManyArticlesQueryDto) {
    const { limit, offset } = query;

    const followingUsers = await this.userService.getFollowing(userId);

    // Nếu không follow ai thì trả về rỗng luôn, đỡ tốn công query DB lần 2
    if (followingUsers.length === 0) {
      return { items: [], articlesCount: 0 };
    }

    const followingIds = followingUsers.map((user) => user.id);

    const [articles, count] = await this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.tagList', 'tagList') // Nên load thêm tag nếu cần hiển thị
      .where('article.deletedAt IS NULL')
      .andWhere('author.id IN (:...ids)', { ids: followingIds }) // Chuyển điều kiện xuống WHERE
      .andWhere('article.status = :status', { status: ArticleStatus.PUBLISHED })
      .orderBy('article.created_at', 'DESC') // Feed thường cần bài mới nhất
      .take(limit)
      .skip(offset)
      .getManyAndCount(); // Lấy cả data và tổng số record

    return { items: articles, articlesCount: count };
  }

  async validateUpdate(
    updateArticleDto: UpdateArticleDto,
    article: ArticleEntity,
  ) {
    const updateArticleKeys = Object.keys(updateArticleDto);
    let isChanged = false;
    for (const key of updateArticleKeys) {
      if (key === 'tagList') {
        const currentTags =
          article.tagList?.map((tag) => tag.name).sort() || [];
        const updatedTags = updateArticleDto.tagList?.slice().sort() || [];
        if (
          currentTags.length !== updatedTags.length ||
          !currentTags.every((tag, idx) => tag === updatedTags[idx])
        ) {
          isChanged = true;
          break;
        }
      } else {
        if (article[key] !== updateArticleDto[key]) {
          isChanged = true;
          break;
        }
      }
    }
    if (!isChanged) {
      throw new ConflictException('Update article failed', {
        description: 'No changes detected',
      });
    }
  }

  async update(slug: string, updateArticleDto: UpdateArticleDto) {
    const article = await this.findBySlug(slug);
    await this.validateUpdate(updateArticleDto, article);

    const { title, tagList, body, ...rest } = updateArticleDto;

    if (title && title !== article.title) {
      await this.validateTitle(title);
      article.slug = title.toLowerCase().trim().replace(/\s+/g, '-');
      article.title = title;
    }

    if (body && body !== article.body) {
      article.body = body;
      article.reading_time = Math.ceil(readingTime(body).minutes);
    }

    if (tagList) {
      const tags = await Promise.all(
        tagList.map(async (tagName) => this.createTag(tagName)),
      );
      article.tagList = tags;
    }

    Object.assign(article, rest);

    const updatedArticle = await this.articleRepository.save(article);
    return updatedArticle;
  }

  async remove(slug: string, authorId: number) {
    const article = await this.articleRepository.findOne({
      where: { slug },
      relations: { author: true },
    });
    if (!article) {
      throw new ConflictException('Delete article failed', {
        description: 'Article not found',
      });
    }

    if (article.author.id !== authorId) {
      throw new ForbiddenException('Delete article failed', {
        description: 'You are not the author of this article',
      });
    }

    return await this.articleRepository.softRemove(article);
  }

  async favorite(slug: string, currentUserId: number) {
    const article = await this.findBySlug(slug);
    const currentUser = await this.userService.findById(currentUserId);

    if (article.favoritedBy.some((user) => user.id === currentUser.id)) {
      throw new ConflictException('Favorite failed', {
        description: 'You have already favorited this article',
      });
    }

    article.favoritedBy = [...article.favoritedBy, currentUser];
    const updatedArticle = await this.articleRepository.save(article);
    return updatedArticle;
  }

  async unfavorite(slug: string, currentUserId: number) {
    const article = await this.findBySlug(slug);
    const currentUser = await this.userService.findById(currentUserId);

    if (!article.favoritedBy.some((user) => user.id === currentUser.id)) {
      throw new ConflictException('Unfavorite failed', {
        description: 'You have not favorited this article',
      });
    }

    article.favoritedBy = article.favoritedBy.filter(
      (user) => user.id !== currentUser.id,
    );
    const updatedArticle = await this.articleRepository.save(article);
    return updatedArticle;
  }

  async approveArticle(slug: string) {
    const article = await this.findBySlug(slug);
    article.status = ArticleStatus.PUBLISHED;
    article.published_at = new Date();
    return await this.articleRepository.save(article);
  }

  async rejectArticle(slug: string) {
    const article = await this.findBySlug(slug);
    article.status = ArticleStatus.REJECTED;
    return await this.articleRepository.save(article);
  }
}
