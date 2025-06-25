import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { WatchGuide } from '@/app/types';
import { GuideType } from '../../../prisma/generated/client';
import { GuideMovieCard } from './GuideMovieCard';

interface GuideDetailProps {
  guide: WatchGuide;
}

const guideTypeLabels: Record<GuideType, string> = {
  [GuideType.CHRONOLOGICAL]: '时间线指南',
  [GuideType.BEGINNER]: '新手入门',
  [GuideType.THEMATIC]: '主题分类',
  [GuideType.FAMILY]: '家庭观影',
  [GuideType.ADVANCED]: '进阶指南',
  [GuideType.SEASONAL]: '季节推荐'
};

const guideTypeColors: Record<GuideType, string> = {
  [GuideType.CHRONOLOGICAL]: 'bg-blue-100 text-blue-800',
  [GuideType.BEGINNER]: 'bg-green-100 text-green-800',
  [GuideType.THEMATIC]: 'bg-purple-100 text-purple-800',
  [GuideType.FAMILY]: 'bg-pink-100 text-pink-800',
  [GuideType.ADVANCED]: 'bg-orange-100 text-orange-800',
  [GuideType.SEASONAL]: 'bg-teal-100 text-teal-800'
};

export function GuideDetail({ guide }: GuideDetailProps) {
  // 获取Markdown内容
  const getMarkdownContent = (content: string | object): string => {
    return typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 头部信息 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${guideTypeColors[guide.guideType as GuideType]}`}>
                {guideTypeLabels[guide.guideType as GuideType]}
              </span>
              <span className="text-sm text-gray-500">
                {guide.movies.length} 部电影
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {guide.title}
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              {guide.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <span>创建时间: {new Date(guide.createdAt).toLocaleDateString('zh-CN')}</span>
          <span className="mx-2">•</span>
          <span>最后更新: {new Date(guide.updatedAt).toLocaleDateString('zh-CN')}</span>
        </div>
      </div>

      {/* 推荐电影列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">推荐观影顺序</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guide.movies.map((guideMovie, index) => (
            <GuideMovieCard
              key={index}
              guideMovie={guideMovie}
              showOrder={true}
              compact={false}
            />
          ))}
        </div>
      </div>

      {/* 详细内容 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">详细指南</h2>
        <div className="prose prose-lg prose-gray max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8 first:mt-0">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6 first:mt-0">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-700">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-gray-800">{children}</em>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 text-gray-700 italic">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                  {children}
                </pre>
              ),
            }}
          >
            {getMarkdownContent(guide.content)}
          </ReactMarkdown>
        </div>
      </div>

      {/* 相关指南 */}
      {guide.relatedGuides && guide.relatedGuides.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">相关指南</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guide.relatedGuides.map((relatedGuide) => (
              <Link
                key={relatedGuide.id}
                href={`/guides/${relatedGuide.id}`}
                className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {relatedGuide.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {relatedGuide.description}
                </p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${guideTypeColors[relatedGuide.guideType as GuideType]}`}>
                  {guideTypeLabels[relatedGuide.guideType as GuideType]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
