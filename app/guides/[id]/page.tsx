import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { GuideDetail } from '@/app/components/guides/GuideDetail';
import { WatchGuide } from '@/app/types';

interface GuidePageProps {
  params: { id: string };
}

// 获取观影指南数据
async function getGuide(id: string): Promise<WatchGuide | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/guides/${id}`, {
      cache: 'no-store', // 确保获取最新数据
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('获取观影指南失败');
    }

    return await response.json();
  } catch (error) {
    console.error('获取观影指南失败:', error);
    return null;
  }
}

// 生成页面元数据
export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const guide = await getGuide(params.id);

  if (!guide) {
    return {
      title: '观影指南不存在 - 吉卜力观影指南',
      description: '您访问的观影指南不存在或已被删除。',
    };
  }

  const guideTypeLabels = {
    'CHRONOLOGICAL': '时间线指南',
    'BEGINNER': '新手入门',
    'THEMATIC': '主题分类',
    'FAMILY': '家庭观影',
    'ADVANCED': '进阶指南',
    'SEASONAL': '季节推荐'
  };

  return {
    title: `${guide.title} - 吉卜力观影指南`,
    description: guide.description,
    keywords: `吉卜力, 观影指南, 宫崎骏, 电影推荐, ${guideTypeLabels[guide.guideType as keyof typeof guideTypeLabels]}`,
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: 'article',
      publishedTime: guide.createdAt.toString(),
      modifiedTime: guide.updatedAt.toString(),
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const guide = await getGuide(params.id);

  if (!guide) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 面包屑导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              首页
            </Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/guides" className="text-gray-500 hover:text-gray-700">
              观影指南
            </Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">{guide.title}</span>
          </nav>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GuideDetail guide={guide} />
      </div>

      {/* 返回按钮 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="text-center">
          <Link
            href="/guides"
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回观影指南列表
          </Link>
        </div>
      </div>

      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": guide.title,
            "description": guide.description,
            "author": {
              "@type": "Organization",
              "name": "吉卜力观影指南"
            },
            "publisher": {
              "@type": "Organization",
              "name": "吉卜力观影指南"
            },
            "datePublished": guide.createdAt,
            "dateModified": guide.updatedAt,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/guides/${guide.id}`
            },
            "about": {
              "@type": "Thing",
              "name": "Studio Ghibli Movies",
              "description": "吉卜力工作室电影观影指南"
            }
          })
        }}
      />
    </div>
  );
}
