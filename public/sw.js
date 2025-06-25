// Service Worker for Ghibli Watch Guide
// Version 1.0.0

const CACHE_NAME = 'ghibli-guide-v1';
const STATIC_CACHE = 'ghibli-static-v1';
const DYNAMIC_CACHE = 'ghibli-dynamic-v1';
const IMAGE_CACHE = 'ghibli-images-v1';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/images/logo.svg',
  '/images/og-default.jpg'
];

// 需要缓存的API路径
const API_CACHE_PATTERNS = [
  /^\/api\/movies/,
  /^\/api\/characters/,
  /^\/api\/search/,
  /^\/api\/recommendations/
];

// 图片缓存模式
const IMAGE_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  /image\.tmdb\.org/
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// 获取事件 - 处理网络请求
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 只处理同源请求
  if (url.origin !== location.origin) {
    // 处理外部图片资源
    if (IMAGE_PATTERNS.some(pattern => pattern.test(request.url))) {
      event.respondWith(handleImageRequest(request));
    }
    return;
  }

  // 根据请求类型选择缓存策略
  if (request.method === 'GET') {
    if (isStaticAsset(request)) {
      event.respondWith(handleStaticAsset(request));
    } else if (isAPIRequest(request)) {
      event.respondWith(handleAPIRequest(request));
    } else if (isImageRequest(request)) {
      event.respondWith(handleImageRequest(request));
    } else {
      event.respondWith(handlePageRequest(request));
    }
  }
});

// 判断是否为静态资源
function isStaticAsset(request) {
  return request.url.includes('/_next/static/') ||
         request.url.includes('/images/') ||
         request.url.includes('/icons/') ||
         request.url.includes('/manifest.json');
}

// 判断是否为API请求
function isAPIRequest(request) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(request.url));
}

// 判断是否为图片请求
function isImageRequest(request) {
  return IMAGE_PATTERNS.some(pattern => pattern.test(request.url));
}

// 处理静态资源 - Cache First策略
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Static asset fetch failed', error);
    return new Response('Static asset not available', { status: 503 });
  }
}

// 处理API请求 - Network First策略
async function handleAPIRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (networkError) {
      console.log('Service Worker: Network failed, trying cache');
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
      
      throw networkError;
    }
  } catch (error) {
    console.error('Service Worker: API request failed', error);
    return new Response(JSON.stringify({ 
      error: 'API not available', 
      offline: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 处理图片请求 - Cache First策略
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // 只缓存成功的图片响应
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Image fetch failed', error);
    // 返回占位图片
    return new Response(
      '<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">图片加载失败</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// 处理页面请求 - Network First策略
async function handlePageRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (networkError) {
      console.log('Service Worker: Network failed, trying cache');
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // 返回离线页面
      const offlineResponse = await cache.match('/offline');
      if (offlineResponse) {
        return offlineResponse;
      }
      
      throw networkError;
    }
  } catch (error) {
    console.error('Service Worker: Page request failed', error);
    return new Response('Page not available offline', { status: 503 });
  }
}

// 后台同步事件
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// 执行后台同步
async function doBackgroundSync() {
  try {
    // 同步离线时的用户行为数据
    const cache = await caches.open(DYNAMIC_CACHE);
    const offlineActions = await getOfflineActions();
    
    for (const action of offlineActions) {
      try {
        await fetch(action.url, action.options);
        await removeOfflineAction(action.id);
      } catch (error) {
        console.error('Background sync failed for action:', action, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// 获取离线操作（从IndexedDB或localStorage）
async function getOfflineActions() {
  // 这里应该从IndexedDB获取离线操作
  // 简化实现，返回空数组
  return [];
}

// 移除已同步的离线操作
async function removeOfflineAction(actionId) {
  // 这里应该从IndexedDB移除已同步的操作
  console.log('Removing offline action:', actionId);
}

// 推送通知事件
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/images/icon-192x192.png',
      badge: '/images/badge-72x72.png',
      data: data.data,
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// 通知点击事件
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action) {
    // 处理操作按钮点击
    handleNotificationAction(event.action, event.notification.data);
  } else {
    // 处理通知本身的点击
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// 处理通知操作
function handleNotificationAction(action, data) {
  switch (action) {
    case 'view':
      clients.openWindow(data?.url || '/');
      break;
    case 'dismiss':
      // 不做任何操作，通知已关闭
      break;
    default:
      console.log('Unknown notification action:', action);
  }
}
