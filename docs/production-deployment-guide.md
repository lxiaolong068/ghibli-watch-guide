# 生产环境部署指南

## 🎯 演示结果总结

刚才的演示脚本成功展示了第三阶段内容充实的效果：

### ✅ 演示结果统计
- **角色档案**: 新增 26 个角色
- **电影评论**: 新增 3 篇专业评论
- **观影指南**: 新增 4 个不同类型指南
- **幕后故事**: 新增 4 篇制作花絮
- **总计**: 37 个新内容项目

### 📊 覆盖范围
- **电影覆盖**: 8 部主要吉卜力电影
- **角色类型**: 主角和重要配角
- **内容类型**: 多样化的高质量内容
- **语言支持**: 中英日三语信息

## 🚀 生产环境执行方案

### 方案一：Vercel 环境执行（推荐）

由于项目部署在 Vercel 上，最安全的方式是在 Vercel 环境中执行：

#### 1. 通过 Vercel CLI 执行
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录到 Vercel
vercel login

# 在 Vercel 环境中执行种子脚本
vercel env pull .env.local
pnpm tsx scripts/safe-seed-content.ts
```

#### 2. 通过 API 端点执行
创建一个受保护的 API 端点来执行种子脚本：

```typescript
// app/api/admin/seed-content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { safeSeedContent } from '@/scripts/safe-seed-content';

export async function POST(request: NextRequest) {
  // 验证管理员权限
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await safeSeedContent();
    return NextResponse.json({ success: true, message: '内容添加成功' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

然后通过 HTTP 请求执行：
```bash
curl -X POST https://your-domain.com/api/admin/seed-content \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"
```

### 方案二：本地连接生产数据库

如果有生产数据库的直接访问权限：

#### 1. 配置环境变量
```bash
# 创建 .env.production 文件
DATABASE_URL="your_production_database_url"
TMDB_API_KEY="your_tmdb_api_key"
```

#### 2. 执行安全种子脚本
```bash
# 使用生产环境变量
NODE_ENV=production pnpm tsx scripts/safe-seed-content.ts
```

### 方案三：分步骤执行

为了最大化安全性，可以分步骤执行：

#### 1. 只添加角色档案
```bash
pnpm tsx scripts/seed-characters.ts
```

#### 2. 只添加电影评论
```bash
pnpm tsx scripts/seed-reviews.ts
```

#### 3. 只添加观影指南
```bash
pnpm tsx scripts/seed-watch-guides.ts
```

#### 4. 只添加幕后故事
```bash
pnpm tsx scripts/seed-behind-scenes.ts
```

## 🛡️ 安全保障措施

### 1. 数据备份
执行前务必备份数据库：
```sql
-- PostgreSQL 备份
pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql

-- 或使用 Vercel Postgres 的备份功能
```

### 2. 只读模式测试
先在只读模式下测试脚本：
```bash
# 设置只读模式环境变量
READONLY_MODE=true pnpm tsx scripts/safe-seed-content.ts
```

### 3. 分批执行
不要一次性执行所有内容，建议分批进行：
- 第一批：角色档案
- 第二批：电影评论
- 第三批：观影指南
- 第四批：幕后故事

### 4. 监控和回滚
- 执行过程中监控数据库性能
- 准备回滚计划
- 记录所有变更日志

## 📋 执行前检查清单

### 环境检查
- [ ] 确认数据库连接正常
- [ ] 验证环境变量配置
- [ ] 检查磁盘空间充足
- [ ] 确认备份已完成

### 权限检查
- [ ] 确认有数据库写入权限
- [ ] 验证 API 密钥有效
- [ ] 检查网络连接稳定

### 数据检查
- [ ] 确认现有电影数据完整
- [ ] 验证 TMDB ID 映射正确
- [ ] 检查数据格式兼容性

## 🔄 执行后验证

### 1. 数据完整性检查
```sql
-- 检查新增数据
SELECT COUNT(*) FROM "Character";
SELECT COUNT(*) FROM "MovieReview";
SELECT COUNT(*) FROM "WatchGuide";
SELECT COUNT(*) FROM "MediaContent";

-- 检查关联关系
SELECT COUNT(*) FROM "MovieCharacter";
SELECT COUNT(*) FROM "WatchGuideMovie";
```

### 2. 功能测试
- 访问角色页面，确认显示正常
- 查看电影评论，验证内容完整
- 测试观影指南功能
- 检查幕后故事显示

### 3. 性能测试
- 检查页面加载速度
- 验证数据库查询性能
- 测试搜索功能响应时间

## 🚨 应急处理

### 如果执行失败
1. 立即停止脚本执行
2. 检查错误日志
3. 评估数据影响范围
4. 必要时从备份恢复

### 如果数据异常
1. 使用备份数据对比
2. 手动修正异常数据
3. 重新运行特定部分脚本

### 如果性能下降
1. 检查数据库索引
2. 优化查询语句
3. 考虑数据分页加载

## 📞 技术支持

### 联系方式
- **开发团队**: 技术问题和脚本调试
- **数据库管理员**: 数据库相关问题
- **运维团队**: 部署和环境问题

### 文档参考
- [第三阶段执行指南](phase-3-content-seeding.md)
- [完成报告](phase-3-completion-report.md)
- [安全种子脚本](../scripts/safe-seed-content.ts)

---

## 🎯 推荐执行方案

基于当前情况，我推荐使用 **方案一：Vercel 环境执行**，因为：

1. **安全性最高**：在 Vercel 环境中执行，有完整的权限控制
2. **环境一致**：与生产环境完全一致
3. **易于监控**：可以通过 Vercel 控制台监控执行过程
4. **便于回滚**：如有问题可以快速回滚

请根据您的具体情况选择最适合的执行方案。如需协助，请随时联系开发团队。
