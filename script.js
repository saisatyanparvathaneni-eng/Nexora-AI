(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toast = $('#toast');
  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  function openDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    document.body.classList.add('modal-open');
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    document.body.classList.remove('modal-open');
  }

  $$('[data-close-dialog]').forEach((button) => {
    button.addEventListener('click', () => closeDialog(button.closest('dialog')));
  });
  $$('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeDialog(dialog);
    });
    dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
  });

  // Header, mobile navigation, theme persistence, and back-to-top.
  const header = $('[data-header]');
  const menuToggle = $('.menu-toggle');
  const primaryNav = $('#primary-navigation');
  const themeToggle = $('.theme-toggle');
  const savedTheme = localStorage.getItem('nexora-theme');

  function setTheme(light) {
    document.body.classList.toggle('light-theme', light);
    themeToggle.setAttribute('aria-pressed', String(light));
    themeToggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    localStorage.setItem('nexora-theme', light ? 'light' : 'dark');
  }
  setTheme(savedTheme === 'light');
  themeToggle.addEventListener('click', () => setTheme(!document.body.classList.contains('light-theme')));

  function closeMenu() {
    primaryNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    $('.menu-toggle .sr-only').textContent = 'Open menu';
  }
  menuToggle.addEventListener('click', () => {
    const open = primaryNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    $('.menu-toggle .sr-only').textContent = open ? 'Close menu' : 'Open menu';
  });
  $$('#primary-navigation a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 15);
    $('#backToTop').classList.toggle('show', window.scrollY > 520);
  }, { passive: true });
  $('#backToTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));

  // Scroll reveal and active navigation.
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else revealItems.forEach((item) => item.classList.add('visible'));

  const navLinks = $$('#primary-navigation a');
  const navSections = navLinks.map((link) => $(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    navSections.forEach((section) => sectionObserver.observe(section));
  }

  // Product search and filtering.
  let activeFilter = 'all';
  const productCards = $$('.product-card');
  const productSearch = $('#productSearch');
  const productEmpty = $('#productEmpty');
  function filterProducts() {
    const query = productSearch.value.trim().toLowerCase();
    let shown = 0;
    productCards.forEach((card) => {
      const matchesFilter = activeFilter === 'all' || card.dataset.category === activeFilter;
      const matchesQuery = !query || card.dataset.search.includes(query);
      const visible = matchesFilter && matchesQuery;
      card.hidden = !visible;
      if (visible) shown += 1;
    });
    productEmpty.hidden = shown !== 0;
  }
  productSearch.addEventListener('input', filterProducts);
  $$('.filter-button').forEach((button) => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    $$('.filter-button').forEach((item) => item.classList.toggle('active', item === button));
    filterProducts();
  }));

  // Product detail dialog.
  const productDetails = {
    chat: { category: 'CONVERSATIONAL AI / DEMO CONCEPT', title: 'Nexora Chat', description: 'An intelligent assistant concept for answering questions, explaining topics, brainstorming ideas, and supporting everyday productivity.', features: ['Conversational interface', 'Suggested questions', 'Chat history demonstration', 'Copy-response interaction', 'Clear conversation control'], boundary: 'This interface does not call a real language model. The playground below uses deterministic browser logic so the boundary stays clear.' },
    vision: { category: 'COMPUTER VISION / DEMO CONCEPT', title: 'VisionIQ', description: 'A visual exploration concept for previewing a local image, reading its basic file details, and presenting what a future analysis panel could look like.', features: ['Image upload preview', 'Drag-and-drop-ready zone', 'Image details display', 'Example analysis results', 'Local-only handling'], boundary: 'No image leaves this browser. The page does not run a vision model or claim to identify objects in your image.' },
    code: { category: 'DEVELOPER PRODUCTIVITY / DEMO CONCEPT', title: 'CodePilot AI', description: 'A concept for helping developers understand code, generate examples, and identify potential programming issues through a calm explanation layer.', features: ['Code input editor concept', 'Language selector', 'Example code snippets', 'Copy-code button', 'Demonstration analysis output'], boundary: 'The sample code is displayed and copied as text only. It is not executed or securely analyzed by a backend.' },
    data: { category: 'DATA INTELLIGENCE / DEMO CONCEPT', title: 'DataMind', description: 'A concept for converting a small structured dataset into understandable summaries and visual insights for a broader audience.', features: ['Sample dataset', 'Basic data summaries', 'Interactive chart direction', 'Example insights', 'Sample-data disclosure'], boundary: 'The full DataMind service is not connected here. Any numbers are illustrative demo data, not a business report.' },
    content: { category: 'GENERATIVE AI / DEMO CONCEPT', title: 'ContentCraft AI', description: 'A writing-assistant concept for moving from a blank page to ideas, outlines, and draft content with a deliberate tone.', features: ['Prompt suggestions', 'Content-type selector', 'Tone selector', 'Copy and clear buttons', 'Sample output'], boundary: 'No production generative model is connected. A real integration would require protected credentials, moderation, and data-handling consent.' },
    flow: { category: 'INTELLIGENT AUTOMATION / DEMO CONCEPT', title: 'AutoFlow AI', description: 'A concept for making repetitive work observable through configurable steps, status signals, and clear permission boundaries.', features: ['Workflow cards', 'Step-by-step preview', 'Run-demo button', 'Success/error notifications', 'Explanation of each step'], boundary: 'This page does not access external tools or execute workflows. The product concept is a visual explanation of how an agent might be designed.' }
  };
  const productDialog = $('#productDialog');
  $$('.product-learn').forEach((button) => button.addEventListener('click', () => {
    const product = productDetails[button.dataset.product];
    $('#productDialogCategory').textContent = product.category;
    $('#productDialogTitle').textContent = product.title;
    $('#productDialogDescription').textContent = product.description;
    $('#productDialogBoundary').textContent = product.boundary;
    const features = $('#productDialogFeatures');
    features.replaceChildren(...product.features.map((feature) => { const li = document.createElement('li'); li.textContent = feature; return li; }));
    openDialog(productDialog);
  }));

  // Playground text assistant.
  const textInput = $('#textInput');
  const textResult = $('#textResult');
  const textAction = $('#textAction');
  function setDemoLoading(result, label) {
    result.innerHTML = `<span class="result-label">${label} / WORKING</span><p>Running local demonstration logic…</p>`;
  }
  function runTextDemo() {
    const value = textInput.value.trim();
    if (!value) { textInput.focus(); showToast('Enter a sentence before running the text demo.'); return; }
    setDemoLoading(textResult, 'OUTPUT');
    window.setTimeout(() => {
      const words = value.split(/\s+/);
      let output;
      if (textAction.value === 'summarize') output = `${words.slice(0, 12).join(' ')}${words.length > 12 ? '…' : ''} (simulated summary)`;
      if (textAction.value === 'professional') output = `A polished version: “${value.replace(/[.!?]?$/, '.')}” (simulated rewrite)`;
      if (textAction.value === 'simple') output = `In simple terms: ${value}. (simulated explanation)`;
      if (textAction.value === 'ideas') output = `Three directions to explore: 1) Map the core problem. 2) Test a small workflow. 3) Ask who benefits and who could be affected. (simulated ideas)`;
      textResult.innerHTML = `<span class="result-label">OUTPUT / SIMULATED</span><p>${escapeHTML(output)}</p>`;
    }, reducedMotion ? 0 : 480);
  }
  $('#runTextDemo').addEventListener('click', runTextDemo);
  $('#resetText').addEventListener('click', () => { textInput.value = ''; textResult.innerHTML = '<span class="result-label">OUTPUT / WAITING</span><p>Enter a thought to see a deterministic local transformation.</p>'; });

  // Transparent sentiment demonstration.
  const positiveWords = ['love', 'great', 'good', 'helpful', 'clear', 'happy', 'useful', 'excellent', 'easy', 'enjoy'];
  const negativeWords = ['hate', 'bad', 'difficult', 'wrong', 'confusing', 'sad', 'slow', 'broken', 'poor', 'problem'];
  $('#runSentiment').addEventListener('click', () => {
    const value = $('#sentimentInput').value.trim().toLowerCase();
    if (!value) { $('#sentimentInput').focus(); showToast('Enter a sentence before analyzing sentiment.'); return; }
    const pos = positiveWords.filter((word) => value.includes(word)).length;
    const neg = negativeWords.filter((word) => value.includes(word)).length;
    const sentiment = pos > neg ? ['Positive', '↑', 'The local keyword signal leans positive.'] : neg > pos ? ['Negative', '↓', 'The local keyword signal leans negative.'] : ['Neutral', '→', 'No strong local keyword signal was found.'];
    const result = $('#sentimentResult');
    result.querySelector('.sentiment-icon').textContent = sentiment[1];
    result.querySelector('.result-label').textContent = 'SIGNAL / RULE-BASED';
    result.querySelector('strong').textContent = sentiment[0];
    result.querySelector('small').textContent = sentiment[2];
  });
  $('#resetSentiment').addEventListener('click', () => { $('#sentimentInput').value = ''; $('#sentimentResult').innerHTML = '<span class="sentiment-icon">?</span><div><span class="result-label">SIGNAL / WAITING</span><strong>Waiting for input</strong><small>Positive, neutral, or negative keywords are counted locally.</small></div>'; });

  // Recommendations.
  const recommendations = {
    education: ['Start with learning support', 'Explore personalized practice, content organization, and accessible explanations.', ['Learning paths', 'Study assistants', 'Practice loops']],
    business: ['Map a repeatable workflow', 'Look for document, support, and reporting tasks where human review can remain visible.', ['Triage flows', 'Document tools', 'Review queues']],
    programming: ['Build a small code explainer', 'Practice parsing input, describing logic, and showing limitations before attempting automation.', ['Code reading', 'Test hints', 'Docs search']],
    creativity: ['Use AI as a starting point', 'Try idea expansion, mood exploration, and rough drafts while keeping authorship and judgment with people.', ['Idea sparks', 'Draft loops', 'Style studies']],
    productivity: ['Reduce the repetitive', 'Begin with a workflow that saves context-switching time and has an easy human approval step.', ['Summaries', 'Task routing', 'Checklists']]
  };
  function updateRecommendation() {
    const item = recommendations[$('#interestSelect').value];
    $('#recommendationResult').innerHTML = `<span class="result-label">RECOMMENDATIONS / LOCAL</span><h4>${item[0]}</h4><p>${item[1]}</p><div class="recommendation-tags">${item[2].map((tag) => `<span>${tag}</span>`).join('')}</div>`;
  }
  $('#interestSelect').addEventListener('change', updateRecommendation);
  $('#resetRecommendation').addEventListener('click', () => { $('#interestSelect').value = 'education'; updateRecommendation(); });

  // Local image preview.
  $('#imageUpload').addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Please choose an image file.'); return; }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      $('#imagePreview img').src = reader.result;
      $('#imageName').textContent = file.name;
      $('#imageMeta').textContent = `${formatBytes(file.size)} · ${file.type.replace('image/', '').toUpperCase()}`;
      $('#imagePreview').hidden = false;
      $('.upload-zone').hidden = true;
    });
    reader.readAsDataURL(file);
  });
  $('#clearImage').addEventListener('click', () => { $('#imageUpload').value = ''; $('#imagePreview').hidden = true; $('.upload-zone').hidden = false; });

  // Code sample and copy button.
  const codeSamples = {
    javascript: 'function explain(value) {\n  return `A clearer next step: ${value}`;\n}',
    python: 'def explain(value):\n    return f"A clearer next step: {value}"',
    css: '.signal {\n  color: var(--cyan);\n  transition: opacity 180ms ease;\n}'
  };
  $('#languageSelect').addEventListener('change', (event) => {
    $('#codeSnippet').textContent = codeSamples[event.target.value];
    $('#codeAnalysis').textContent = `Demo analysis: this ${event.target.value} sample is shown as text; it is not executed by the page.`;
  });
  $('#copyCode').addEventListener('click', async () => {
    const value = $('#codeSnippet').textContent;
    try { await navigator.clipboard.writeText(value); showToast('Code sample copied to your clipboard.'); }
    catch { showToast('Copy is unavailable here; select the code manually.'); }
  });

  // DataMind and AutoFlow product concept demos.
  const dataInsights = [
    ['Focus time is trending upward.', 'Average: 23 hours · Change: +11 hours'],
    ['Task completion follows focus.', 'Average: 17.5 tasks · Change: +11 tasks'],
    ['Week 04 is the strongest signal.', '29 focus hours · 23 completed tasks']
  ];
  let dataInsightIndex = 0;
  $('#refreshDataInsight').addEventListener('click', () => {
    dataInsightIndex = (dataInsightIndex + 1) % dataInsights.length;
    const insight = dataInsights[dataInsightIndex];
    $('#dataSummary').innerHTML = `<span class="result-label">INSIGHT / SAMPLE ${String(dataInsightIndex + 1).padStart(2, '0')}</span><strong>${insight[0]}</strong><small>${insight[1]}</small>`;
  });
  $('#runFlowDemo').addEventListener('click', () => {
    const button = $('#runFlowDemo');
    const steps = $$('.flow-step', $('#flowSteps'));
    const status = $('#flowStatus');
    button.disabled = true;
    steps.forEach((step) => step.classList.remove('active'));
    status.innerHTML = '<span class="result-label">STATUS / WORKING</span><strong>Checking workflow context…</strong>';
    let current = 0;
    const advance = () => {
      if (current > 0) steps[current - 1].classList.remove('active');
      if (current < steps.length) {
        steps[current].classList.add('active');
        status.querySelector('strong').textContent = ['Capturing a request…', 'Checking scope and permissions…', 'Preparing a reviewable draft…'][current];
        current += 1;
        window.setTimeout(advance, reducedMotion ? 0 : 520);
      } else {
        status.innerHTML = '<span class="result-label">STATUS / SIMULATED SUCCESS</span><strong>Draft prepared for human review. No external action was taken.</strong>';
        button.disabled = false;
      }
    };
    window.setTimeout(advance, reducedMotion ? 0 : 280);
  });

  // Technology progressive disclosure.
  $$('.tech-row').forEach((button) => {
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
    const detail = $(`[data-detail="${button.dataset.tech}"]`);
    const isOpen = detail.classList.toggle('open');
    button.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) $$('.tech-detail.open').filter((item) => item !== detail).forEach((item) => { item.classList.remove('open'); const previous = $(`[data-tech="${item.dataset.detail}"]`); previous?.setAttribute('aria-expanded', 'false'); });
    });
  });

  // Animated illustrative counters.
  const counters = $$('.counter');
  function setCounter(counter) { counter.textContent = String(counter.dataset.target).padStart(2, '0'); }
  if (reducedMotion || !('IntersectionObserver' in window)) counters.forEach(setCounter);
  else {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const counter = entry.target;
        const target = Number(counter.dataset.target);
        const duration = 700;
        const start = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          counter.textContent = String(Math.round(progress * target)).padStart(2, '0');
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        observer.unobserve(counter);
      });
    }, { threshold: .7 });
    counters.forEach((counter) => counterObserver.observe(counter));
  }

  // Insight article modal.
  const articles = {
    'ai-guide': { meta: 'FOUNDATIONS / 06 MIN', title: "Understanding artificial intelligence: a beginner's guide.", body: '<p>Artificial intelligence is best understood as a family of approaches for building systems that can perceive patterns, make predictions, generate content, or choose actions.</p><h3>Start with the task, not the hype.</h3><p>A useful question is: what decision or repetitive step should become clearer or faster? The answer shapes the data, interface, evaluation, and human oversight the system needs.</p><p>In this demo, every feature is intentionally local and deterministic. That makes the boundary visible while still showing how an AI product can be explained.</p>' },
    'ml-deep': { meta: 'COMPARE / 05 MIN', title: 'Machine learning vs. deep learning.', body: '<p>Machine learning describes systems that learn patterns from data. Deep learning is a family of machine-learning methods built from many layers of adjustable mathematical operations.</p><h3>The difference is representation.</h3><p>Traditional approaches may rely more on human-designed features. Deep learning can learn richer representations directly from large datasets, but it usually asks for more data, compute, and careful evaluation.</p>' },
    responsible: { meta: 'TRUST / 07 MIN', title: 'Responsible AI: privacy, bias, and trust.', body: '<p>Responsible AI is not a final checkbox. It is a design practice that asks who benefits, who might be harmed, what data is used, and how people can challenge an outcome.</p><h3>Make the system explainable enough to govern.</h3><p>Transparency, fairness, privacy, security, accountability, and human oversight turn abstract values into concrete product decisions.</p>' },
    projects: { meta: 'PRACTICE / 04 MIN', title: 'Practical AI projects for engineering students.', body: '<p>A strong student project does not need a giant model. Try a small dataset explorer, a transparent sentiment demo, an accessible recommendation interface, or a workflow map with a clear human approval step.</p><h3>Document the boundary.</h3><p>Explain what your project does, what it simulates, what it cannot know, and what you would need to connect a real service safely.</p>' }
  };
  $$('.article-open').forEach((button) => button.addEventListener('click', () => {
    const article = articles[button.dataset.article];
    $('#articleDialogMeta').textContent = article.meta;
    $('#articleDialogTitle').textContent = article.title;
    $('#articleDialogBody').innerHTML = article.body;
    openDialog($('#articleDialog'));
  }));

  // Contact form validation and local-only success.
  const contactForm = $('#contactForm');
  const requiredFields = ['fullName', 'email', 'inquiry', 'subject', 'message', 'consent'];
  function setError(id, message) { const field = $(`#${id}`); const wrapper = field.closest('.field') || field.closest('.consent-field'); const error = $(`#${id}Error`); wrapper?.classList.toggle('invalid', Boolean(message)); if (error) error.textContent = message || ''; }
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let valid = true;
    requiredFields.forEach((id) => setError(id, ''));
    const name = $('#fullName').value.trim();
    const email = $('#email').value.trim();
    const inquiry = $('#inquiry').value;
    const subject = $('#subject').value.trim();
    const message = $('#message').value.trim();
    if (!name) { setError('fullName', 'Please enter your name.'); valid = false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('email', 'Enter a valid email address.'); valid = false; }
    if (!inquiry) { setError('inquiry', 'Choose an inquiry type.'); valid = false; }
    if (!subject) { setError('subject', 'Add a short subject.'); valid = false; }
    if (!message || message.length < 12) { setError('message', 'Please write at least 12 characters.'); valid = false; }
    if (!$('#consent').checked) { setError('consent', 'Consent is required for the demo submission.'); valid = false; }
    if (!valid) { $('.field-error:not(:empty)', contactForm)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' }); showToast('Please review the highlighted fields.'); return; }
    const submit = $('button[type="submit"]', contactForm);
    submit.disabled = true;
    submit.innerHTML = 'Preparing local demo…';
    window.setTimeout(() => {
      contactForm.reset();
      submit.disabled = false;
      submit.innerHTML = 'Send demo inquiry <span aria-hidden="true">↗</span>';
      $('#formStatus').className = 'form-status success';
      $('#formStatus').textContent = 'Demo submission complete. Nothing was sent or stored; this message only demonstrates the form flow.';
      showToast('Demo inquiry accepted locally.');
    }, reducedMotion ? 0 : 650);
  });

  // FAQ accordion: one item open at a time.
  $$('.faq-item button').forEach((button) => button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const shouldOpen = button.getAttribute('aria-expanded') !== 'true';
    $$('.faq-item').forEach((other) => { other.classList.remove('open'); $('button', other).setAttribute('aria-expanded', 'false'); });
    if (shouldOpen) { item.classList.add('open'); button.setAttribute('aria-expanded', 'true'); }
  }));

  // Demonstration legal notes.
  const legalContent = {
    privacy: ['Privacy policy', '<p>This educational prototype does not send contact messages to a server. Theme preference is stored in your browser localStorage. Uploaded images and playground text are held only in memory while the page is open.</p><p>A production service would need a reviewed privacy notice, retention policy, access controls, and clear consent for every external model or storage provider.</p>'],
    terms: ['Terms of use', '<p>Nexora AI is a fictional demonstration project intended for learning and review. The sample products, team, figures, articles, and outputs are not commercial claims or professional advice.</p><p>Do not use the simulated outputs for medical, legal, financial, safety-critical, or other consequential decisions. A real service would need appropriate terms, security controls, and human review.</p>']
  };
  $$('[data-legal]').forEach((button) => button.addEventListener('click', () => {
    const content = legalContent[button.dataset.legal];
    $('#legalDialogTitle').textContent = content[0];
    $('#legalDialogBody').innerHTML = content[1];
    openDialog($('#legalDialog'));
  }));

  function escapeHTML(value) { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }
  function formatBytes(bytes) { if (!bytes) return '0 B'; const units = ['B', 'KB', 'MB']; const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1); return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`; }
})();
