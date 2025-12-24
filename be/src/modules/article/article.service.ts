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
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    private readonly userService: UserService,
    private readonly tagService: TagService,
    private readonly notificationService: NotificationService,
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

  async findMany(
    findManyArticlesQueryDto: FindManyArticlesQueryDto,
    id: number | undefined,
  ) {
    const { tag, author, favorited, limit, offset } = findManyArticlesQueryDto;

    const query = this.articleRepository.createQueryBuilder('article');

    // 1. Logic kiểm tra User hiện tại có favorite bài viết không
    if (id) {
      // Map kết quả đếm (0 hoặc 1) vào thuộc tính ảo 'isFavoritedCount'
      query.loadRelationCountAndMap(
        'article.isFavoritedCount',
        'article.favoritedBy',
        'currentUserFavorite',
        (qb) => qb.andWhere('currentUserFavorite.id = :userId', { userId: id }),
      );
    }

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

    // Thêm order by để danh sách mới nhất lên đầu (thường là mặc định mong muốn)
    query.orderBy('article.created_at', 'DESC');

    query.skip(offset).take(limit).where('article.deletedAt IS NULL');

    const [articles, count] = await query.getManyAndCount();

    // 2. Map kết quả từ số đếm sang boolean
    const items = articles.map((article) => {
      // Lấy giá trị từ thuộc tính ảo đã map ở trên
      const isFavorited = (article as any).isFavoritedCount > 0;

      // Xóa thuộc tính tạm để object sạch sẽ (tùy chọn)
      delete (article as any).isFavoritedCount;

      // Trả về object kèm thuộc tính favorited: boolean
      return { ...article, favorited: isFavorited };
    });

    return { items: items, articlesCount: count };
  }

  async findBySlug(slug: string, currentUserId?: number) {
    // Thêm tham số currentUserId
    const query = this.articleRepository.createQueryBuilder('article');

    query.where('article.slug = :slug', { slug });
    query.andWhere('article.deletedAt IS NULL');

    // Join các bảng cần thiết
    query.leftJoinAndSelect('article.author', 'author');
    query.leftJoinAndSelect('article.tagList', 'tagList');
    query.leftJoinAndSelect('article.comments', 'comments');
    query.leftJoinAndSelect('comments.author', 'commentAuthor'); // Load thêm author của comment
    query.leftJoinAndSelect('comments.parentComment', 'parentComment');

    // TỐI ƯU: Chỉ đếm xem user hiện tại có trong danh sách like không
    if (currentUserId) {
      query.loadRelationCountAndMap(
        'article.isFavoritedCount',
        'article.favoritedBy',
        'currentUserFavorite',
        (qb) =>
          qb.andWhere('currentUserFavorite.id = :userId', {
            userId: currentUserId,
          }),
      );
    }

    const article = await query.getOne();

    if (!article) {
      throw new ConflictException('Get article failed', {
        description: 'Article not found',
      });
    }

    // Map kết quả đếm sang boolean
    const isFavorited = (article as any).isFavoritedCount > 0;

    // Gán vào object trả về và xóa biến tạm
    const result = { ...article, favorited: isFavorited };
    delete (result as any).isFavoritedCount;

    return result;
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
    // 1. Dùng findOne thay vì findBySlug để load quan hệ favoritedBy
    const article = await this.articleRepository.findOne({
      where: { slug },
      relations: { favoritedBy: true, author: true }, // Load author để bắn thông báo
    });

    if (!article) {
      throw new ConflictException('Favorite failed', {
        description: 'Article not found',
      });
    }

    const currentUser = await this.userService.findById(currentUserId);

    // 2. Kiểm tra trùng lặp
    if (article.favoritedBy.some((user) => user.id === currentUser.id)) {
      throw new ConflictException('Favorite failed', {
        description: 'You have already favorited this article',
      });
    }

    // 3. Cập nhật
    article.favoritedBy.push(currentUser);
    await this.articleRepository.save(article);

    // 4. Tạo Notification
    if (article.author.id !== currentUserId) {
      await this.notificationService.createFavoriteNotification(
        currentUser,
        article,
      );
    }

    // 5. Trả về dữ liệu chuẩn format (gọi lại findBySlug để có field 'favorited': true)
    return this.findBySlug(slug, currentUserId);
  }

  async unfavorite(slug: string, currentUserId: number) {
    // 1. Dùng findOne để load quan hệ favoritedBy
    const article = await this.articleRepository.findOne({
      where: { slug },
      relations: { favoritedBy: true },
    });

    if (!article) {
      throw new ConflictException('Unfavorite failed', {
        description: 'Article not found',
      });
    }

    const currentUser = await this.userService.findById(currentUserId);

    // 2. Kiểm tra tồn tại
    const isFavorited = article.favoritedBy.some((user) => user.id === currentUser.id);
    if (!isFavorited) {
      throw new ConflictException('Unfavorite failed', {
        description: 'You have not favorited this article',
      });
    }

    // 3. Lọc bỏ user khỏi danh sách
    article.favoritedBy = article.favoritedBy.filter(
      (user) => user.id !== currentUser.id,
    );
    const updatedArticle = await this.articleRepository.save(article);
    return updatedArticle;
  }

  async approveArticle(slug: string) {
    const article = await this.findBySlug(slug);
    if (article.status !== ArticleStatus.PENDING) {
      throw new ConflictException('Approve article failed', {
        description: 'Only pending articles can be approved',
      });
    }
    article.status = ArticleStatus.PUBLISHED;
    article.published_at = new Date();
    const savedArticle = await this.articleRepository.save(article);

    // Tạo Notifications cho người theo dõi khi bài viết được duyệt
    await this.notificationService.createNewArticleNotifications(savedArticle);

    return savedArticle;
  }

  async rejectArticle(slug: string) {
    const article = await this.findBySlug(slug);
    if (article.status !== ArticleStatus.PENDING) {
      throw new ConflictException('Reject article failed', {
        description: 'Only pending articles can be rejected',
      });
    }
    article.status = ArticleStatus.REJECTED;
    return await this.articleRepository.save(article);
  }
}
