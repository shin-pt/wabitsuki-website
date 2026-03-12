/* =============================================
   和日月 - Note RSS フィード連携
   記事3件表示 + noteへのリンク
   ============================================= */

(function() {
    'use strict';

    const NOTE_RSS_URL = 'https://note.com/wabitsuki_seitai/rss';
    const NOTE_PROFILE_URL = 'https://note.com/wabitsuki_seitai';
    const DISPLAY_COUNT = 3;

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

    function initNoteFeed() {
        const container = document.getElementById('blogNoteList');
        if (!container) return;

        const apiUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(NOTE_RSS_URL);

        fetch(apiUrl)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                container.innerHTML = '';
                if (data.status !== 'ok' || !data.items || data.items.length === 0) {
                    container.innerHTML = '<p class="blog-note-empty">記事の読み込みに失敗しました。<a href="' + NOTE_PROFILE_URL + '" target="_blank" rel="noopener">noteのコラムを読む</a></p>';
                    return;
                }

                var items = data.items.slice(0, DISPLAY_COUNT);
                items.forEach(function(item) {
                    var thumb = item.thumbnail || '';
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
                });
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
