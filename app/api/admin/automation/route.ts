import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMovieDetails } from '@/lib/tmdb';

// 自动化内容更新系统
export async function POST(request: NextRequest) {
  try {
    const { action, movieId, options = {} } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'auto_generate_characters':
        result = await autoGenerateCharacters(movieId, options);
        break;
      case 'auto_generate_crew':
        result = await autoGenerateCrew(movieId, options);
        break;
      case 'auto_generate_review_template':
        result = await autoGenerateReviewTemplate(movieId, options);
        break;
      case 'auto_update_movie_metadata':
        result = await autoUpdateMovieMetadata(movieId, options);
        break;
      case 'auto_generate_tags':
        result = await autoGenerateTags(movieId, options);
        break;
      case 'batch_content_update':
        result = await batchContentUpdate(options);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.error('Error in automation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 自动生成角色信息
async function autoGenerateCharacters(movieId: string, options: any) {
  try {
    // 获取电影信息
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      select: { tmdbId: true, titleEn: true }
    });

    if (!movie) {
      throw new Error('Movie not found');
    }

    // 从TMDB获取电影详情（包含演员信息）
    const details = await getMovieDetails(movie.tmdbId);
    const cast = details.credits?.cast || [];

    const createdCharacters = [];

    for (const actor of cast.slice(0, options.maxCharacters || 10)) {
      // 跳过没有角色名称的演员
      if (!actor.character) continue;

      // 检查角色是否已存在
      const existingCharacter = await prisma.character.findFirst({
        where: {
          name: actor.character,
          movieCharacters: {
            some: {
              movieId: movieId
            }
          }
        }
      });

      if (!existingCharacter) {
        // 创建新角色
        const character = await prisma.character.create({
          data: {
            name: actor.character,
            description: `Character from ${movie.titleEn}`,
            imageUrl: actor.profile_path ? `https://image.tmdb.org/t/p/w500${actor.profile_path}` : null,
            isMainCharacter: (actor.order || 999) < 5 // 前5个角色视为主角
          }
        });

        // 创建电影角色关联
        await prisma.movieCharacter.create({
          data: {
            movieId: movieId,
            characterId: character.id,
            voiceActor: actor.name,
            importance: 100 - (actor.order || 0) // 重要程度基于出场顺序
          }
        });

        createdCharacters.push(character);
      }
    }

    return {
      message: `Created ${createdCharacters.length} characters`,
      characters: createdCharacters
    };

  } catch (error) {
    console.error('Error auto-generating characters:', error);
    throw error;
  }
}

// 自动生成制作人员信息
async function autoGenerateCrew(movieId: string, options: any) {
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      select: { tmdbId: true, titleEn: true }
    });

    if (!movie) {
      throw new Error('Movie not found');
    }

    const details = await getMovieDetails(movie.tmdbId);
    const crew = details.credits?.crew || [];

    const createdCrew = [];

    // 重要职位列表
    const importantJobs = ['Director', 'Producer', 'Writer', 'Music', 'Art Director'];

    for (const member of crew.filter(c => c.job && importantJobs.includes(c.job))) {
      // 跳过没有名称的制作人员
      if (!member.name) continue;

      // 检查制作人员是否已存在
      let crewMember = await prisma.crewMember.findFirst({
        where: { name: member.name }
      });

      if (!crewMember) {
        // 创建新制作人员
        crewMember = await prisma.crewMember.create({
          data: {
            name: member.name,
            biography: `${member.job} for ${movie.titleEn}`,
            imageUrl: member.profile_path ? `https://image.tmdb.org/t/p/w500${member.profile_path}` : null
          }
        });
      }

      // 检查电影制作人员关联是否已存在
      const existingMovieCrew = await prisma.movieCrew.findFirst({
        where: {
          movieId: movieId,
          crewMemberId: crewMember.id,
          role: member.job as any
        }
      });

      if (!existingMovieCrew) {
        await prisma.movieCrew.create({
          data: {
            movieId: movieId,
            crewMemberId: crewMember.id,
            role: member.job as any,
            department: member.department
          }
        });

        createdCrew.push(crewMember);
      }
    }

    return {
      message: `Created ${createdCrew.length} crew members`,
      crew: createdCrew
    };

  } catch (error) {
    console.error('Error auto-generating crew:', error);
    throw error;
  }
}

// 自动生成评论模板
async function autoGenerateReviewTemplate(movieId: string, options: any) {
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      include: {
        movieCharacters: {
          include: { character: true }
        },
        movieCrew: {
          include: { crewMember: true }
        }
      }
    });

    if (!movie) {
      throw new Error('Movie not found');
    }

    // 获取TMDB详细信息
    const details = await getMovieDetails(movie.tmdbId);

    // 生成评论模板
    const reviewTemplate = generateReviewTemplate(movie, details);

    // 创建评论草稿
    const review = await prisma.movieReview.create({
      data: {
        movieId: movieId,
        title: `${movie.titleEn} - 深度解析`,
        content: reviewTemplate,
        author: 'AI Assistant',
        reviewType: 'ANALYSIS',
        language: 'zh',
        isPublished: false
      }
    });

    return {
      message: 'Review template generated',
      review: review
    };

  } catch (error) {
    console.error('Error generating review template:', error);
    throw error;
  }
}

// 自动更新电影元数据
async function autoUpdateMovieMetadata(movieId: string, options: any) {
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    });

    if (!movie) {
      throw new Error('Movie not found');
    }

    // 从TMDB获取最新信息
    const details = await getMovieDetails(movie.tmdbId);

    // 更新电影信息
    const updatedMovie = await prisma.movie.update({
      where: { id: movieId },
      data: {
        synopsis: details.overview || movie.synopsis,
        voteAverage: details.vote_average || movie.voteAverage,
        posterUrl: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : movie.posterUrl,
        backdropUrl: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : movie.backdropUrl,
        duration: details.runtime || movie.duration
      }
    });

    return {
      message: 'Movie metadata updated',
      movie: updatedMovie
    };

  } catch (error) {
    console.error('Error updating movie metadata:', error);
    throw error;
  }
}

// 自动生成标签
async function autoGenerateTags(movieId: string, options: any) {
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    });

    if (!movie) {
      throw new Error('Movie not found');
    }

    const details = await getMovieDetails(movie.tmdbId);
    const createdTags = [];

    // 基于类型生成标签
    if (details.genres) {
      for (const genre of details.genres) {
        let tag = await prisma.tag.findUnique({
          where: { name: genre.name }
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: genre.name,
              description: `${genre.name} genre`,
              category: 'genre',
              color: getGenreColor(genre.name)
            }
          });
        }

        // 创建电影标签关联
        const existingMovieTag = await prisma.movieTag.findUnique({
          where: {
            movieId_tagId: {
              movieId: movieId,
              tagId: tag.id
            }
          }
        });

        if (!existingMovieTag) {
          await prisma.movieTag.create({
            data: {
              movieId: movieId,
              tagId: tag.id
            }
          });

          createdTags.push(tag);
        }
      }
    }

    return {
      message: `Created ${createdTags.length} tags`,
      tags: createdTags
    };

  } catch (error) {
    console.error('Error auto-generating tags:', error);
    throw error;
  }
}

// 批量内容更新
async function batchContentUpdate(options: any) {
  try {
    const { movieIds, actions } = options;
    const results = [];

    for (const movieId of movieIds) {
      const movieResults = [];

      for (const action of actions) {
        try {
          let result;
          switch (action) {
            case 'characters':
              result = await autoGenerateCharacters(movieId, {});
              break;
            case 'crew':
              result = await autoGenerateCrew(movieId, {});
              break;
            case 'metadata':
              result = await autoUpdateMovieMetadata(movieId, {});
              break;
            case 'tags':
              result = await autoGenerateTags(movieId, {});
              break;
          }
          movieResults.push({ action, success: true, result });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          movieResults.push({ action, success: false, error: errorMessage });
        }
      }

      results.push({ movieId, results: movieResults });
    }

    return {
      message: `Batch update completed for ${movieIds.length} movies`,
      results: results
    };

  } catch (error) {
    console.error('Error in batch content update:', error);
    throw error;
  }
}

// 辅助函数：生成评论模板
function generateReviewTemplate(movie: any, details: any): string {
  const director = movie.movieCrew?.find((crew: any) => crew.role === 'DIRECTOR')?.crewMember?.name || '宫崎骏';
  const mainCharacters = movie.movieCharacters?.filter((mc: any) => mc.character.isMainCharacter).slice(0, 3) || [];

  return `# ${movie.titleEn} - 深度解析

## 概述
《${movie.titleEn}》（${movie.titleJa}）是由${director}执导的一部吉卜力工作室动画电影。${details.overview || '这部电影以其独特的艺术风格和深刻的主题而闻名。'}

## 故事情节
[请在此处添加详细的故事情节分析]

## 角色分析
${mainCharacters.map((mc: any) => `### ${mc.character.name}
${mc.character.description || '请添加角色分析'}
`).join('\n')}

## 艺术风格
[请分析电影的视觉艺术风格]

## 主题思想
[请分析电影的深层主题和寓意]

## 音乐配乐
[请分析电影的音乐和配乐]

## 总结
[请添加总结性评价]

---
*本文为AI生成的模板，请根据实际内容进行修改和完善。*`;
}

// 辅助函数：获取类型颜色
function getGenreColor(genreName: string): string {
  const colorMap: { [key: string]: string } = {
    'Animation': '#FF6B6B',
    'Family': '#4ECDC4',
    'Fantasy': '#45B7D1',
    'Adventure': '#96CEB4',
    'Drama': '#FFEAA7',
    'Romance': '#FD79A8'
  };
  return colorMap[genreName] || '#74B9FF';
}
