// CTSS Math Remedial — shared site behaviour
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Exam mark tracker (saved on this device) ---------- */
  document.querySelectorAll('.tracker').forEach(function (tracker) {
    var input   = tracker.querySelector('input[type="number"]');
    var barFill = tracker.querySelector('.bar-fill');
    var note    = tracker.querySelector('.save-note');
    var max     = parseInt(input.getAttribute('max'), 10) || 50;
    var key     = 'ctss-mark-' + tracker.getAttribute('data-key');

    var saved = window.localStorage ? localStorage.getItem(key) : null;
    if (saved !== null) {
      input.value = saved;
      barFill.style.width = Math.min(100, (saved / max) * 100) + '%';
    }

    var timer;
    input.addEventListener('input', function () {
      var val = Math.max(0, Math.min(max, Number(input.value) || 0));
      barFill.style.width = (val / max) * 100 + '%';
      if (window.localStorage) {
        localStorage.setItem(key, val);
      }
      if (note) {
        note.classList.add('show');
        clearTimeout(timer);
        timer = setTimeout(function () { note.classList.remove('show'); }, 1600);
      }
    });
  });

  /* ---------- Notes page: filter by topic ---------- */
  var tabs = document.querySelectorAll('.topic-tabs button');
  var items = document.querySelectorAll('.note-item');
  if (tabs.length && items.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var topic = tab.getAttribute('data-topic');
        items.forEach(function (item) {
          var show = topic === 'all' || item.getAttribute('data-topic') === topic;
          item.style.display = show ? 'flex' : 'none';
        });
      });
    });
  }

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- Teacher upload area (GitHub Pages friendly) ---------- */
  var teacherToggle = document.getElementById('teacher-toggle');
  var teacherAdmin = document.getElementById('teacher-admin');
  var teacherPdf = document.getElementById('teacher-pdf');
  var teacherTopic = document.getElementById('teacher-topic');
  var teacherTitle = document.getElementById('teacher-title');
  var teacherNotes = document.getElementById('teacher-notes');
  var teacherPassword = document.getElementById('teacher-password');
  var teacherTarget = document.getElementById('teacher-target');
  var teacherSave = document.getElementById('save-teacher-item');
  var teacherItemsContainer = document.getElementById('teacher-items');
  var TEACHER_STORAGE_KEY = 'ctss-gr10-teacher-items';

  function getTeacherItems() {
    try {
      return JSON.parse(window.localStorage.getItem(TEACHER_STORAGE_KEY) || '[]');
    } catch (error) {
      return [];
    }
  }

  function saveTeacherItems(items) {
    if (window.localStorage) {
      localStorage.setItem(TEACHER_STORAGE_KEY, JSON.stringify(items));
    }
  }

  function normalizeTopicKey(topic) {
    var text = (topic || '').toLowerCase();
    if (/(number|financial|percentage|ratio|interest|loan)/.test(text)) return 'number';
    if (/(algebra|equation|function|polynomial|quadratic|linear)/.test(text)) return 'algebra';
    if (/(geometry|triangle|trigon|angle|circle|shape)/.test(text)) return 'geometry';
    if (/(stats|statistics|probab|probability|data|median|mode)/.test(text)) return 'stats';
    if (/(calc|differ|integr|rate|derivative|area)/.test(text)) return 'calculus';
    if (/(vector|complex|argand)/.test(text)) return 'vectors';
    return 'algebra';
  }

  function renderTeacherNotesOnPage() {
    var notesList = document.querySelector('.notes-list');
    if (!notesList) return;

    var items = getTeacherItems().filter(function (item) {
      return item.target === 'notes';
    });

    items.forEach(function (item) {
      var note = document.createElement('div');
      note.className = 'note-item';
      note.setAttribute('data-topic', normalizeTopicKey(item.topic));

      var badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = (item.title || 'N').slice(0, 2).toUpperCase();

      var content = document.createElement('div');

      var title = document.createElement('h4');
      title.textContent = item.title || 'Teacher note';

      var text = document.createElement('p');
      text.textContent = item.notes || 'Teacher-added study support.';

      var meta = document.createElement('span');
      meta.className = 'note-meta';
      meta.textContent = 'Teacher upload • ' + (item.topic || 'General topic');

      content.appendChild(title);
      content.appendChild(text);
      content.appendChild(meta);

      if (item.fileData) {
        var linkWrap = document.createElement('p');
        var link = document.createElement('a');
        link.href = item.fileData;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'Open PDF';
        link.style.display = 'inline-block';
        link.style.marginTop = '8px';
        link.style.fontWeight = '700';
        linkWrap.appendChild(link);
        content.appendChild(linkWrap);
      }

      note.appendChild(badge);
      note.appendChild(content);
      notesList.prepend(note);
    });
  }

  function renderTeacherExamCardsOnPage() {
    var sites = document.getElementById('sites');
    if (!sites) return;

    var items = getTeacherItems().filter(function (item) {
      return item.target === 'gr10';
    });

    items.forEach(function (item) {
      var card = document.createElement('div');
      card.className = 'exam-card';

      var year = document.createElement('div');
      year.className = 'exam-year';
      year.innerHTML = '<b>' + (item.title || 'Teacher Upload') + '</b><span class="tag">1 upload</span>';

      var body = document.createElement('div');
      body.className = 'exam-body';

      var links = document.createElement('div');
      links.className = 'paper-links';

      if (item.fileData) {
        var a = document.createElement('a');
        a.href = item.fileData;
        a.target = '_blank';
        a.rel = 'noopener';
        a.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16"/></svg>Download exam paper';
        links.appendChild(a);
      }

      var noteText = document.createElement('p');
      noteText.textContent = item.notes || 'Teacher-added revision support.';

      body.appendChild(links);
      body.appendChild(noteText);

      card.appendChild(year);
      card.appendChild(body);
      sites.appendChild(card);
    });
  }

  function renderTeacherItems() {
    if (!teacherItemsContainer) return;

    var items = getTeacherItems();
    teacherItemsContainer.innerHTML = '';

    if (!items.length) {
      teacherItemsContainer.innerHTML = '<p class="teacher-empty">No teacher uploads yet.</p>';
      return;
    }

    items.forEach(function (item, index) {
      var wrap = document.createElement('div');
      wrap.className = 'teacher-item';

      var heading = document.createElement('h4');
      heading.textContent = item.title || 'Teacher upload';

      var topic = document.createElement('p');
      topic.textContent = 'Topic: ' + (item.topic || 'General');

      var notes = document.createElement('p');
      notes.textContent = item.notes || 'No notes added yet.';

      var actions = document.createElement('div');
      actions.className = 'teacher-item-actions';

      if (item.fileData) {
        var openLink = document.createElement('a');
        openLink.href = item.fileData;
        openLink.target = '_blank';
        openLink.rel = 'noopener';
        openLink.textContent = 'Open PDF';
        actions.appendChild(openLink);
      }

      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', function () {
        var nextItems = getTeacherItems();
        nextItems.splice(index, 1);
        saveTeacherItems(nextItems);
        renderTeacherItems();
      });
      actions.appendChild(removeBtn);

      wrap.appendChild(heading);
      wrap.appendChild(topic);
      wrap.appendChild(notes);
      wrap.appendChild(actions);
      teacherItemsContainer.appendChild(wrap);
    });
  }

  if (teacherToggle && teacherAdmin) {
    teacherToggle.addEventListener('click', function () {
      var password = teacherPassword && teacherPassword.value ? teacherPassword.value : window.prompt('Enter teacher password to open the upload area');
      if (!password) {
        return;
      }

      if (password === 'ctss-teacher') {
        teacherAdmin.hidden = false;
        teacherToggle.textContent = 'Teacher area unlocked';
        teacherPassword.value = password;
        renderTeacherItems();
      } else {
        window.alert('Incorrect password.');
      }
    });
  }

  renderTeacherNotesOnPage();
  renderTeacherExamCardsOnPage();

  if (teacherSave) {
    teacherSave.addEventListener('click', function () {
      if (!teacherTopic || !teacherTitle || !teacherNotes || !teacherPassword) return;

      var password = teacherPassword.value.trim();
      if (!password) {
        window.alert('Please enter the teacher password.');
        return;
      }

      if (password !== 'ctss-teacher') {
        window.alert('Incorrect password.');
        return;
      }

      if (!teacherTopic.value.trim() || !teacherTitle.value.trim() || !teacherNotes.value.trim()) {
        window.alert('Please complete the title, topic, and notes fields.');
        return;
      }

      var selectedFile = teacherPdf && teacherPdf.files && teacherPdf.files[0] ? teacherPdf.files[0] : null;

      var nextEntry = {
        title: teacherTitle.value.trim(),
        topic: teacherTopic.value.trim(),
        notes: teacherNotes.value.trim(),
        target: teacherTarget && teacherTarget.value ? teacherTarget.value : 'gr10',
        fileName: selectedFile ? selectedFile.name : '',
        fileData: ''
      };

      if (selectedFile) {
        var reader = new FileReader();
        reader.onload = function () {
          nextEntry.fileData = reader.result;
          var items = getTeacherItems();
          items.unshift(nextEntry);
          saveTeacherItems(items);
          renderTeacherItems();
          teacherPdf.value = '';
          teacherTopic.value = '';
          teacherTitle.value = '';
          teacherNotes.value = '';
        };
        reader.readAsDataURL(selectedFile);
      } else {
        var items = getTeacherItems();
        items.unshift(nextEntry);
        saveTeacherItems(items);
        renderTeacherItems();
        teacherTopic.value = '';
        teacherTitle.value = '';
        teacherNotes.value = '';
      }
    });
  }

  /* ---------- Homepage photo rotator ---------- */
  var rotators = document.querySelectorAll('[data-rotator]');
  rotators.forEach(function (rotator) {
    var slides = rotator.querySelectorAll('.slide-image');
    if (slides.length < 2) return;

    var interval = parseInt(rotator.getAttribute('data-interval'), 10) || 5000;
    var activeIndex = 0;

    var showSlide = function (index) {
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
    };

    showSlide(activeIndex);
    setInterval(function () {
      activeIndex = (activeIndex + 1) % slides.length;
      showSlide(activeIndex);
    }, interval);
  });
});
