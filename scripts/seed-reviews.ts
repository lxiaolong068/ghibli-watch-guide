#!/usr/bin/env tsx
/**
 * 电影评论种子脚本
 * 为吉卜力电影添加专业评论内容
 */

import { PrismaClient } from '../prisma/generated/client';
import { GHIBLI_REVIEWS } from '../data/ghibli-reviews';

const prisma = new PrismaClient();

async function seedReviews() {
  console.log('📝 开始添加电影评论数据...');

  try {
    let totalReviewsCreated = 0;

    for (const review of GHIBLI_REVIEWS) {
      console.log(`\n📽️ 处理评论: ${review.title}`);

      // 查找数据库中的电影记录
      const dbMovie = await prisma.movie.findUnique({
        where: { tmdbId: review.movieTmdbId }
      });

      if (!dbMovie) {
        console.log(`⚠️ 电影 TMDB ID: ${review.movieTmdbId} 在数据库中不存在，跳过评论`);
        continue;
      }

      console.log(`✅ 找到电影记录: ${dbMovie.titleZh || dbMovie.titleEn}`);

      try {
        // 检查评论是否已存在
        const existingReview = await prisma.movieReview.findFirst({
          where: {
            movieId: dbMovie.id,
            title: review.title
          }
        });

        if (existingReview) {
          console.log(`  ℹ️ 评论已存在，更新内容`);
          await prisma.movieReview.update({
            where: { id: existingReview.id },
            data: {
              content: review.content,
              rating: review.rating,
              author: review.author,
              reviewType: review.reviewType,
              tags: review.tags,
              publishedAt: review.publishedAt,
              language: review.language,
              isPublished: true
            }
          });
        } else {
          console.log(`  ✨ 创建新评论`);
          await prisma.movieReview.create({
            data: {
              movieId: dbMovie.id,
              title: review.title,
              content: review.content,
              rating: review.rating,
              author: review.author,
              reviewType: review.reviewType,
              tags: review.tags,
              publishedAt: review.publishedAt,
              language: review.language,
              isPublished: true
            }
          });
          totalReviewsCreated++;
        }

        console.log(`  ✅ 评论处理完成`);

      } catch (error) {
        console.error(`  ❌ 处理评论时出错:`, error);
      }
    }

    console.log('\n🎉 电影评论数据添加完成!');
    console.log(`📊 统计信息:`);
    console.log(`  - 新创建评论: ${totalReviewsCreated}`);

    // 显示最终统计
    const totalReviews = await prisma.movieReview.count();
    const publishedReviews = await prisma.movieReview.count({
      where: { isPublished: true }
    });
    
    console.log(`\n📈 数据库总计:`);
    console.log(`  - 总评论数: ${totalReviews}`);
    console.log(`  - 已发布评论数: ${publishedReviews}`);

    // 显示每部电影的评论数量
    const movieReviewCounts = await prisma.movie.findMany({
      select: {
        titleZh: true,
        titleEn: true,
        _count: {
          select: {
            reviews: {
              where: { isPublished: true }
            }
          }
        }
      },
      where: {
        reviews: {
          some: {
            isPublished: true
          }
        }
      }
    });

    console.log(`\n📚 各电影评论统计:`);
    movieReviewCounts.forEach(movie => {
      console.log(`  - ${movie.titleZh || movie.titleEn}: ${movie._count.reviews} 篇评论`);
    });

  } catch (error) {
    console.error('❌ 评论种子脚本执行失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  seedReviews()
    .then(() => {
      console.log('✅ 评论种子脚本执行成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 评论种子脚本执行失败:', error);
      process.exit(1);
    });
}

export { seedReviews };
