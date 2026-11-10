/* All interactions use classic JavaScript. No imports, fetch requests, or server are required. */
(function () {
  'use strict';

  var menuButton = document.querySelector('.menu-toggle');
  var menu = document.getElementById('mobile-menu');
  function setMenu(open, returnFocus) {
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('menu-is-open', open);
    if (returnFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', function () {
    var open = menuButton.getAttribute('aria-expanded') !== 'true';
    setMenu(open);
    if (open) menu.querySelector('a').focus();
  });
  menu.addEventListener('click', function (event) {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (event) {
    if (menu.hidden) return;
    if (event.key === 'Escape') { setMenu(false, true); return; }
    if (event.key !== 'Tab') return;
    var nodes = [menuButton].concat(Array.prototype.slice.call(menu.querySelectorAll('a')));
    var first = nodes[0];
    var last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1023 && !menu.hidden) setMenu(false);
  });

  var video = document.getElementById('workshop-video');
  var videoButton = document.getElementById('play-film');
  var videoStatus = document.getElementById('video-status');
  videoButton.addEventListener('click', function () {
    if (!video.paused) { video.pause(); return; }
    var playing = video.play();
    if (playing && playing.catch) playing.catch(function () {
      videoStatus.textContent = 'Нажмите кнопку воспроизведения на самом видео. Можно также открыть файл MP4 из папки assets/video.';
    });
  });
  video.addEventListener('play', function () {
    videoButton.firstChild.nodeValue = 'Поставить на паузу';
    videoStatus.textContent = '';
  });
  video.addEventListener('pause', function () { videoButton.firstChild.nodeValue = 'Смотреть видео'; });
  video.addEventListener('ended', function () { videoButton.firstChild.nodeValue = 'Смотреть ещё раз'; });
  video.addEventListener('error', function () {
    videoStatus.textContent = 'Не удалось загрузить видео. Откройте assets/video/workshop.mp4 из распакованной папки.';
  });

  var form = document.getElementById('figure-form');
  var occasion = document.getElementById('occasion');
  var wishes = document.getElementById('wishes');
  var output = document.getElementById('request-output');
  var requestText = document.getElementById('request-text');
  var copyStatus = document.getElementById('copy-status');
  var previewImage = document.getElementById('builder-image');
  var upload = document.getElementById('photo-upload');
  var photoError = document.getElementById('photo-error');
  var previewList = document.getElementById('photo-previews');
  var photos = [];

  function selected(name) { return form.querySelector('input[name="' + name + '"]:checked').value; }
  function makeRequest() {
    var lines = [
      'Здравствуйте! Хочу бесплатный макет фигурки по фото.',
      '',
      'Персонажи: ' + selected('characters'),
      'Стиль: ' + selected('style'),
      'Повод: ' + occasion.value,
      'Формат: творческий набор с фигуркой 15 см и материалами для росписи.'
    ];
    if (wishes.value.trim()) lines.push('Пожелания: ' + wishes.value.trim());
    lines.push('', 'Подскажите, пожалуйста, стоимость и срок изготовления.');
    if (photos.length) lines.push('Фотографии прикреплю к сообщению отдельно (' + photos.length + ' шт.).');
    else lines.push('Фотографии отправлю следующим сообщением.');
    return lines.join('\n');
  }
  function updateBuilder() {
    var character = selected('characters');
    var style = selected('style');
    document.getElementById('summary-characters').textContent = character;
    document.getElementById('summary-style').textContent = style;
    document.getElementById('summary-occasion').textContent = occasion.value;
    var src = 'assets/images/photo-4.webp';
    var alt = 'Пример мультяшной фигурки до росписи; ваша фигурка будет создана по фото';
    if (style === 'Ближе к реальности') {
      src = 'assets/images/photo-5.webp';
      alt = 'Пример фигурок в реалистичных пропорциях; ваша композиция согласуется индивидуально';
    } else if (style === 'Свой вариант') {
      src = 'assets/images/photo-9.webp';
      alt = 'Пример индивидуального образа; свой вариант опишите в пожеланиях';
    } else if (character === 'Пара' || character === 'Семья') {
      src = 'assets/images/photo-2.webp';
      alt = 'Пример композиции с двумя мультяшными персонажами до росписи';
    }
    if (!previewImage.src.endsWith(src)) previewImage.src = src;
    previewImage.alt = alt;
    if (!output.hidden) { requestText.value = makeRequest(); copyStatus.textContent = ''; }
  }
  form.addEventListener('change', updateBuilder);
  wishes.addEventListener('input', updateBuilder);
  document.querySelectorAll('[data-pick-style]').forEach(function (link) {
    link.addEventListener('click', function () {
      var choice = form.querySelector('input[name="style"][value="' + link.dataset.pickStyle + '"]');
      if (choice) { choice.checked = true; updateBuilder(); }
    });
  });

  function renderPhotos() {
    while (previewList.firstChild) previewList.removeChild(previewList.firstChild);
    photos.forEach(function (entry, index) {
      var item = document.createElement('div');
      var image = document.createElement('img');
      image.src = entry.url;
      image.alt = 'Ваше фото: ' + entry.file.name;
      image.addEventListener('error', function () {
        photoError.textContent = 'Не удалось открыть «' + entry.file.name + '». Сохраните фото в JPG, PNG или WebP.';
        upload.setAttribute('aria-invalid', 'true');
      });
      var remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Убрать фото';
      remove.setAttribute('aria-label', 'Убрать фото ' + entry.file.name);
      remove.addEventListener('click', function () {
        URL.revokeObjectURL(photos[index].url);
        photos.splice(index, 1);
        photoError.textContent = '';
        upload.removeAttribute('aria-invalid');
        renderPhotos();
        updateBuilder();
        upload.focus();
      });
      item.appendChild(image); item.appendChild(remove); previewList.appendChild(item);
    });
  }
  upload.addEventListener('change', function () {
    photos.forEach(function (entry) { URL.revokeObjectURL(entry.url); });
    photos = [];
    var files = Array.prototype.slice.call(upload.files || []);
    var errors = [];
    if (files.length > 3) errors.push('Можно добавить до 3 фотографий. Остальные файлы не добавлены.');
    files.slice(0, 3).forEach(function (file) {
      if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
        errors.push('Фото «' + file.name + '»: нужен формат JPG, PNG или WebP.');
      } else if (file.size > 10 * 1024 * 1024) {
        errors.push('Фото «' + file.name + '» больше 10 МБ. Уменьшите файл.');
      } else {
        photos.push({ file: file, url: URL.createObjectURL(file) });
      }
    });
    photoError.textContent = errors.join(' ');
    if (errors.length) upload.setAttribute('aria-invalid', 'true');
    else upload.removeAttribute('aria-invalid');
    renderPhotos(); updateBuilder();
    upload.value = '';
  });
  window.addEventListener('pagehide', function (event) {
    if (!event.persisted) photos.forEach(function (entry) { URL.revokeObjectURL(entry.url); });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    requestText.value = makeRequest();
    output.hidden = false;
    copyStatus.textContent = '';
    document.getElementById('request-heading').focus({ preventScroll: true });
    output.scrollIntoView({ behavior: 'auto', block: 'start' });
  });

  function selectForCopy() {
    requestText.focus();
    requestText.select();
    requestText.setSelectionRange(0, requestText.value.length);
    var copied = false;
    try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
    copyStatus.textContent = copied ? 'Текст скопирован. Откройте Direct и отправьте заявку вместе с фото.' : 'Текст выделен. Скопируйте его через меню браузера или сочетанием Ctrl+C / ⌘C.';
  }
  document.getElementById('copy-request').addEventListener('click', function () {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(requestText.value).then(function () {
        copyStatus.textContent = 'Текст скопирован. Откройте Direct и отправьте заявку вместе с фото.';
      }).catch(selectForCopy);
    } else selectForCopy();
  });
  updateBuilder();

  // Manual reviews only: no timed switching and no invented ratings.
  var slider = document.getElementById('review-slider');
  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-review]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-review-goto]'));
  var current = 0;
  function showReview(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.hidden = i !== current;
      slide.setAttribute('aria-label', 'Отзыв ' + (i + 1) + ' из ' + slides.length);
    });
    dots.forEach(function (dot, i) { dot.setAttribute('aria-pressed', String(i === current)); });
    document.getElementById('review-count').textContent = (current + 1) + ' / ' + slides.length;
  }
  document.querySelector('.reviews__controls').hidden = false;
  document.querySelector('.review-dots').hidden = false;
  document.getElementById('review-prev').addEventListener('click', function () { showReview(current - 1); });
  document.getElementById('review-next').addEventListener('click', function () { showReview(current + 1); });
  dots.forEach(function (dot) { dot.addEventListener('click', function () { showReview(Number(dot.dataset.reviewGoto)); }); });
  slider.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showReview(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showReview(current + 1); }
  });
  var touchStart = null;
  slider.addEventListener('touchstart', function (event) {
    if (event.touches.length === 1) touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  slider.addEventListener('touchend', function (event) {
    if (!touchStart || !event.changedTouches.length) return;
    var dx = event.changedTouches[0].clientX - touchStart.x;
    var dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) showReview(current + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });
  showReview(0);
})();
