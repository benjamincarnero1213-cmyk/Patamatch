import * as api from '../api.js?v=3';;

function buildStoryCard(story, index) {
  return `
    <article class="group bg-surface-container-lowest rounded-[1rem] overflow-hidden story-card-shadow border border-surface-variant transition-all hover:-translate-y-1" style="animation: fadeIn 0.5s ease-out both; animation-delay: ${index * 0.15}s;">
      <div class="h-64 overflow-hidden relative">
        <img alt="${story.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${story.image_url || 'https://via.placeholder.com/400x300'}"/>
        <div class="absolute top-4 right-4 bg-secondary-container/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px] text-on-secondary-container" style="font-variation-settings: 'FILL' 1;">favorite</span>
          <span class="text-label-sm text-on-secondary-container">Final Feliz</span>
        </div>
      </div>
      <div class="p-6 flex flex-col h-[calc(100%-16rem)]">
        <h3 class="font-headline-md text-on-surface mb-3">${story.title}</h3>
        <p class="text-on-surface-variant mb-6 line-clamp-3 flex-grow">${story.body}</p>
        <div class="flex justify-between items-center mt-auto">
          <p class="text-label-sm text-tertiary">Por: ${story.author_name}</p>
          <a class="inline-flex items-center gap-2 text-primary font-label-lg hover:underline transition-all cursor-pointer">
            Leer Más
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </a>
        </div>
      </div>
    </article>`;
}

export function render() {
  return `
<main class="max-w-7xl mx-auto px-6 pt-28">
  <!-- Hero Section -->
  <header class="relative overflow-hidden rounded-[2rem] mb-16 bg-surface-container-low min-h-[400px] flex items-center">
    <div class="absolute inset-0 z-0">
      <img alt="Hero background" class="w-full h-full object-cover opacity-20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2W7ujoP2O-zOaBoIUPG7TZH7iwwqb5-4VsmlAsp3W1xXUMJctdif45EiKMtvf1OSXeBpv0rU1tfcrGIs8kVh0UV8gZODot8GKiflQYZyONXW8KPn1dr1PKVJdzMWJnb4UqXVahdNyM8mCClMKcdkeKosGpCtujLciI-Bbr5D501vlTnup68I_bzj5KQvNtUP1C8o8jGHSfeiocSvrFtJfo8PT7Dg6m6Xvmuw88HN4xrCx1dthHkhjy3sweIWv0nY08a7V9ID0HCjX"/>
    </div>
    <div class="relative z-10 px-8 md:px-16 max-w-2xl">
      <span class="inline-block bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full text-label-sm mb-6">Latido de la Comunidad</span>
      <h1 class="font-headline-xl text-on-surface mb-6 leading-tight">Cada Mascota Merece una Segunda Oportunidad</h1>
      <p class="text-body-lg text-on-surface-variant mb-8">Descubre los viajes inspiradores de animales que encontraron sus familias permanentes y las personas cuyas vidas cambiaron para siempre.</p>
      <div class="flex gap-4">
        <button class="bg-primary text-on-primary px-8 py-3 rounded-lg font-label-lg shadow-lg active:scale-95 transition-transform" onclick="document.getElementById('stories-grid').scrollIntoView({behavior: 'smooth'})">Ver Historias</button>
      </div>
    </div>
  </header>

  <!-- Stories Grid -->
  <section class="mb-20">
    <div class="flex justify-between items-end mb-10">
      <div>
        <h2 class="font-headline-lg text-on-surface mb-2">Casos de Éxito</h2>
        <p class="text-on-surface-variant">Relatos reales de resiliencia, amor y nuevos comienzos.</p>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter" id="stories-grid">
      <div class="col-span-full text-center py-10 text-on-surface-variant border border-dashed rounded-xl border-outline-variant">Cargando historias...</div>
    </div>
    
    <div class="text-center mt-12">
      <button id="load-more-stories" class="hidden px-8 py-3 rounded-lg border-2 border-primary text-primary font-label-lg hover:bg-primary hover:text-on-primary transition-all active:scale-95">Cargar Más Historias</button>
    </div>
  </section>

  <!-- Share Your Story -->
  <section class="bg-surface-container rounded-[2rem] p-8 md:p-16 mb-20 relative overflow-hidden">
    <div class="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none hidden lg:block">
      <span class="material-symbols-outlined text-[300px] text-primary rotate-12">pets</span>
    </div>
    <div class="relative z-10 max-w-2xl">
      <h2 class="font-headline-lg text-on-surface mb-4">Comparte tu Historia</h2>
      <p class="text-body-lg text-on-surface-variant mb-8">¿Encontraste a tu mejor amigo a través de PataMatch? Tu viaje podría inspirar a otros a abrir sus corazones y hogares.</p>
      
      <form id="story-form" class="space-y-6">
        <div class="grid grid-cols-1 gap-6">
          <div class="space-y-2">
            <label class="font-label-lg block text-on-surface-variant">Título de tu Historia</label>
            <input id="story-title" class="w-full bg-surface-container-low border-outline rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Ej: La Aventura de Max" type="text" required/>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="font-label-lg block text-on-surface-variant">Nombre de la Mascota</label>
            <input id="story-pet" class="w-full bg-surface-container-low border-outline rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Ej: Bella" type="text" required/>
          </div>
          <div class="space-y-2">
            <label class="font-label-lg block text-on-surface-variant">URL de Imagen</label>
            <input id="story-img" class="w-full bg-surface-container-low border-outline rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="https://..." type="url" required/>
          </div>
        </div>
        <div class="space-y-2">
          <label class="font-label-lg block text-on-surface-variant">Cuéntanos tu historia</label>
          <textarea id="story-body" class="w-full bg-surface-container-low border-outline rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="¿Cómo se conocieron? ¿Qué ha cambiado desde que llegó a casa?" rows="4" required></textarea>
        </div>
        <div class="flex flex-col md:flex-row gap-4 items-center">
          <button class="w-full md:w-auto bg-primary text-on-primary px-10 py-3 rounded-lg font-label-lg shadow-md active:scale-95 transition-transform" type="submit">Enviar Historia</button>
        </div>
      </form>

    </div>
  </section>
</main>
<style>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>`;
}

export async function init() {
  const grid = document.getElementById('stories-grid');
  const loadBtn = document.getElementById('load-more-stories');
  
  let currentOffset = 0;
  const limit = 6;
  let allStories = [];

  async function loadStories() {
    try {
      const res = await api.getStories(limit, currentOffset);
      if (res.success) {
        const stories = res.data;
        if (currentOffset === 0) {
          grid.innerHTML = '';
        }

        if (stories.length === 0 && currentOffset === 0) {
          grid.innerHTML = '<div class="col-span-full text-center py-10 text-on-surface-variant border border-dashed rounded-xl border-outline-variant">Aún no hay historias publicadas.</div>';
          loadBtn.classList.add('hidden');
        } else {
          const newHtml = stories.map((s, i) => buildStoryCard(s, i)).join('');
          grid.insertAdjacentHTML('beforeend', newHtml);
          
          if (stories.length < limit) {
            loadBtn.classList.add('hidden');
          } else {
            loadBtn.classList.remove('hidden');
          }
        }
      }
    } catch (err) {
      if (currentOffset === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-10 text-error">Error al cargar historias.</div>';
      }
    }
  }

  loadBtn?.addEventListener('click', () => {
    currentOffset += limit;
    loadStories();
  });

  // Initial load
  loadStories();

  // Story Form Submission
  const form = document.getElementById('story-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!api.isLoggedIn()) {
      window.PataMatch.toast('Debes iniciar sesión para compartir tu historia', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Enviando...';

    const user = api.getUser();

    const data = {
      title: document.getElementById('story-title').value,
      pet_name: document.getElementById('story-pet').value,
      image_url: document.getElementById('story-img').value,
      body: document.getElementById('story-body').value,
      author_name: user?.name || 'Anónimo'
    };

    try {
      const res = await api.submitStory(data);
      if (res.success) {
        window.PataMatch.toast('¡Historia enviada! Será revisada y publicada pronto.', 'success');
        form.reset();
      }
    } catch (err) {
      window.PataMatch.toast(err.message || 'Error al enviar historia', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Enviar Historia';
    }
  });
}
