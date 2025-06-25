'use client';

import { useState, useEffect } from 'react';
import { Tag, TagCategory } from '@/app/types';
import { TAG_CATEGORIES } from '@/data/tag-categories';
import TagBadge from '@/app/components/ui/TagBadge';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';

export default function TagManagementPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsByCategory, setTagsByCategory] = useState<Record<string, Tag[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    nameJa: '',
    nameZh: '',
    description: '',
    color: '#6B7280',
    category: TagCategory.THEME
  });

  // 获取标签数据
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tags?withCount=true&limit=200');
      const data = await response.json();
      
      if (data.tags) {
        setTags(data.tags);
        
        // 按分类分组
        const grouped = data.tags.reduce((acc: Record<string, Tag[]>, tag: Tag) => {
          const category = tag.category || 'other';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(tag);
          return acc;
        }, {});
        
        setTagsByCategory(grouped);
      }
    } catch (error) {
      setError('Failed to fetch tags');
      console.error('Failed to fetch tags:', error);
    } finally {
      setLoading(false);
    }
  };

  // 筛选标签
  const filteredTags = tags.filter(tag => {
    const matchesSearch = searchQuery === '' || 
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.nameJa?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.nameZh?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || tag.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // 创建标签
  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchTags();
        setShowCreateForm(false);
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create tag');
      }
    } catch (error) {
      setError('Failed to create tag');
      console.error('Failed to create tag:', error);
    }
  };

  // 更新标签
  const handleUpdateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTag) return;

    try {
      const response = await fetch(`/api/tags/${editingTag.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchTags();
        setEditingTag(null);
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update tag');
      }
    } catch (error) {
      setError('Failed to update tag');
      console.error('Failed to update tag:', error);
    }
  };

  // 删除标签
  const handleDeleteTag = async (tag: Tag) => {
    if (!confirm(`确定要删除标签 "${tag.nameZh || tag.name}" 吗？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tags/${tag.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTags();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete tag');
      }
    } catch (error) {
      setError('Failed to delete tag');
      console.error('Failed to delete tag:', error);
    }
  };

  // 批量创建预设标签
  const handleCreatePresetTags = async () => {
    if (!confirm('确定要创建所有预设标签吗？已存在的标签将被跳过。')) {
      return;
    }

    try {
      const response = await fetch('/api/tags/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usePresets: true }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`批量创建完成：创建 ${result.summary.created} 个，跳过 ${result.summary.skipped} 个`);
        await fetchTags();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create preset tags');
      }
    } catch (error) {
      setError('Failed to create preset tags');
      console.error('Failed to create preset tags:', error);
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      nameJa: '',
      nameZh: '',
      description: '',
      color: '#6B7280',
      category: TagCategory.THEME
    });
  };

  // 开始编辑标签
  const startEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      nameJa: tag.nameJa || '',
      nameZh: tag.nameZh || '',
      description: tag.description || '',
      color: tag.color || '#6B7280',
      category: (tag.category as TagCategory) || TagCategory.THEME
    });
    setShowCreateForm(true);
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingTag(null);
    setShowCreateForm(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="加载标签中..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          标签管理
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          管理电影标签，创建和编辑标签分类
        </p>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            关闭
          </button>
        </div>
      )}

      {/* 操作栏 */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* 搜索框 */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="搜索标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* 分类筛选 */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">所有分类</option>
            {TAG_CATEGORIES.map((category) => (
              <option key={category.key} value={category.key}>
                {category.icon} {category.nameZh}
              </option>
            ))}
          </select>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            创建标签
          </button>
          <button
            onClick={handleCreatePresetTags}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            创建预设标签
          </button>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">{tags.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">总标签数</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600">{Object.keys(tagsByCategory).length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">分类数</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600">{filteredTags.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">筛选结果</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-orange-600">
            {tags.reduce((sum, tag) => sum + (tag.count || 0), 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">总关联数</div>
        </div>
      </div>

      {/* 创建/编辑表单 */}
      {showCreateForm && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {editingTag ? '编辑标签' : '创建新标签'}
          </h2>
          <form onSubmit={editingTag ? handleUpdateTag : handleCreateTag} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  中文名称 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nameZh}
                  onChange={(e) => setFormData({ ...formData, nameZh: e.target.value, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  日文名称
                </label>
                <input
                  type="text"
                  value={formData.nameJa}
                  onChange={(e) => setFormData({ ...formData, nameJa: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  分类 *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as TagCategory })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  {TAG_CATEGORIES.map((category) => (
                    <option key={category.key} value={category.key}>
                      {category.icon} {category.nameZh}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  颜色
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingTag ? '更新标签' : '创建标签'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 标签列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          标签列表 ({filteredTags.length})
        </h2>
        
        {filteredTags.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchQuery || selectedCategory ? '未找到匹配的标签' : '暂无标签'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <TagBadge tag={tag} showCount />
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {tag.description}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startEditTag(tag)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteTag(tag)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
