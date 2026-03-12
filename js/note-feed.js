/* =============================================
   和日月 - Note RSS フィード連携
   記事3件表示 + noteへのリンク
   ============================================= */

(function() {
    'use strict';

    const NOTE_RSS_URL = 'https://note.com/wabitsuki_seitai/rss';
    const NOTE_PROFILE_URL = 'https://note.com/wabitsuki_seitai';
    const CORS_PROXY = 'https://corsproxy.io/?url=';
    const DISPLAY_COUNT = 3;

    function parseThumbnailsFromRssXml(xmlText) {
        var map = {};
        if (!xmlText || xmlText.indexOf('<item>') === -1) return map;
        var itemRegex = /<item>([\s\S]*?)<\/item>/g;
        var match;
        while ((match = itemRegex.exec(xmlText)) !== null) {
            var block = match[1];
            var linkMatch = block.match(/<link>([^<]+)<\/link>/);
            var thumbMatch = block.match(/<media:thumbnail>([^<]+)<\/media:thumbnail>/);
            if (linkMatch && thumbMatch) {
                map[linkMatch[1].trim()] = thumbMatch[1].trim();
            }
        }
        return map;
    }

    function fetchThumbnailsFromLocal() {
        return fetch('/data/note-thumbnails.json')
            .then(function(res) { return res.ok ? res.json() : {}; })
            .catch(function() { return {}; });
    }

    function fetchRawRssForThumbnails() {
        return fetch(CORS_PROXY + encodeURIComponent(NOTE_RSS_URL))
            .then(function(res) { return res.text(); })
            .then(parseThumbnailsFromRssXml)
            .catch(function() { return {}; });
    }

    function fetchThumbnailMap() {
        return fetchThumbnailsFromLocal().then(function(local) {
            if (Object.keys(local).length > 0) return local;
            return fetchRawRssForThumbnails();
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function getExcerpt(html, maxLength) {
        if (!html) return '';
        const text = html.replace(/<[^>]+>/g, '').trim();
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    function extractFirstImageFromHtml(html) {
        if (!html) return '';
        var match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
        return match ? match[1].trim() : '';
    }

    function fetchNoteFeed(retryCount) {
        retryCount = retryCount || 0;
        var maxRetries = 3;
        var retryDelay = 3000;

        var apiUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(NOTE_RSS_URL);

        return fetch(apiUrl)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.status === 'error' && data.message && data.message.indexOf('being processed') !== -1) {
                    if (retryCount < maxRetries) {
                        var container = document.getElementById('blogNoteList');
                        if (container) {
                            container.innerHTML = '<div class="blog-note-loading">読み込み中...（' + (retryCount + 1) + '回目再試行）</div>';
                        }
                        return new Promise(function(resolve) {
                            setTimeout(function() {
                                fetchNoteFeed(retryCount + 1).then(resolve);
                            }, retryDelay);
                        });
                    }
                }
                return data;
            });
    }

    function renderNoteCards(data, container, thumbnailMap) {
        container.innerHTML = '';
        thumbnailMap = thumbnailMap || {};
        if (data.status !== 'ok' || !data.items || data.items.length === 0) {
            container.innerHTML = '<p class="blog-note-empty">記事の読み込みに失敗しました。<a href="' + NOTE_PROFILE_URL + '" target="_blank" rel="noopener">noteのコラムを読む</a></p>';
            return;
        }

        var items = data.items.slice(0, DISPLAY_COUNT);
        items.forEach(function(item) {
            var thumb = item.thumbnail || thumbnailMap[item.link] || extractFirstImageFromHtml(item.description || '') || '';
            var excerpt = getExcerpt(item.description, 80);
            var card = document.createElement('article');
            card.className = 'blog-card fade-in';

            var imageHtml = thumb
                ? '<img src="' + escapeHtml(thumb) + '" alt="" loading="lazy">'
                : '<div class="blog-card-image-placeholder"><i class="fas fa-file-alt"></i></div>';

            card.innerHTML =
                '<a href="' + escapeHtml(item.link) + '" target="_blank" rel="noopener" class="blog-card-link">' +
                    '<div class="blog-card-image">' + imageHtml + '</div>' +
                    '<div class="blog-card-content">' +
                        '<span class="blog-card-date">' + escapeHtml(formatDate(item.pubDate)) + '</span>' +
                        '<h3 class="blog-card-title">' + escapeHtml(item.title) + '</h3>' +
                        '<p class="blog-card-excerpt">' + escapeHtml(excerpt) + '</p>' +
                        '<span class="blog-card-readmore">続きを読む <i class="fas fa-external-link-alt"></i></span>' +
                    '</div>' +
                '</a>';
            container.appendChild(card);
            card.classList.add('is-visible');
        });
    }

    function initNoteFeed() {
        var container = document.getElementById('blogNoteList');
        if (!container) return;

        Promise.all([fetchNoteFeed(), fetchThumbnailMap()])
            .then(function(results) {
                var data = results[0];
                var thumbnailMap = results[1];
                renderNoteCards(data, container, thumbnailMap);
            })
            .catch(function() {
                container.innerHTML = '<p class="blog-note-empty">記事の読み込みに失敗しました。<a href="' + NOTE_PROFILE_URL + '" target="_blank" rel="noopener">noteのコラムを読む</a></p>';
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNoteFeed);
    } else {
        initNoteFeed();
    }
})();
