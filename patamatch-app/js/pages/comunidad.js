import * as api from '../api.js';

function buildPostCard(post) {
  // post data from API: id, author_name, category, title, body, created_at, like_count, comment_count, is_liked
  
  // Format date loosely
  const dateObj = new Date(post.created_at);
  const dateStr = isNaN(dateObj) ? post.created_at : dateObj.toLocaleDateString();

  const isLiked = post.is_liked ? 'true' : 'false';
  const likeClass = post.is_liked ? 'text-primary' : 'text-tertiary';
  const fill = post.is_liked ? '1' : '0';

  let catLabel = post.category;
  if (catLabel === 'health') catLabel = 'Salud y Nutrición';
  else if (catLabel === 'tips') catLabel = 'Consejos Generales';
  else if (catLabel === 'events') catLabel = 'Eventos Locales';
  else if (catLabel === 'search') catLabel = 'Apoyo en Búsqueda';

  return `
    <article class="bg-white rounded-xl p-md border border-surface-container-high shadow-sm hover:shadow-md transition-shadow" data-category="${post.category}">
      <div class="flex items-start justify-between mb-md">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xl">
            ${post.author_name ? post.author_name[0].toUpperCase() : '?'}
          </div>
          <div>
            <h4 class="font-label-lg text-on-surface">${post.author_name}</h4>
            <p class="text-label-sm text-tertiary">${dateStr} • <span class="text-secondary font-semibold">${catLabel}</span></p>
          </div>
        </div>
      </div>
      <h3 class="font-headline-md text-on-surface mb-sm leading-tight">${post.title}</h3>
      <p class="text-body-md text-tertiary mb-md">${post.body}</p>
      
      <div class="flex items-center gap-6 border-t border-surface-container-low pt-md">
        <button class="like-btn flex items-center gap-1.5 text-label-lg hover:text-primary transition-colors ${likeClass}" data-post-id="${post.id}" data-liked="${isLiked}">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${fill}, 'wght' 400;">thumb_up</span>
          <span class="like-count">${post.like_count || 0}</span>
        </button>
        <button class="flex items-center gap-1.5 text-label-lg text-tertiary hover:text-primary">
          <span class="material-symbols-outlined">chat_bubble_outline</span>
          <span>${post.comment_count || 0} comentarios</span>
        </button>
      </div>
    </article>`;
}

export function render() {
  return `
<main class="pt-20 flex-grow max-w-7xl w-full mx-auto px-6 py-lg">
  <section class="mb-xl text-center md:text-left">
    <h1 class="font-headline-xl text-primary mb-xs">Comunidad</h1>
    <p class="text-body-lg text-tertiary max-w-2xl">Conéctate con miles de dueños de mascotas, comparte consejos y mantente al día con los eventos locales. Este es tu espacio seguro para todo lo relacionado con huellas y bigotes.</p>
  </section>
  <div class="flex flex-col lg:flex-row gap-gutter">
    <!-- Sidebar -->
    <aside class="w-full lg:w-72 flex-shrink-0 space-y-md">
      <div class="bg-surface-container-low rounded-xl p-md">
        <h3 class="font-label-lg text-on-surface-variant mb-md px-2">CATEGORÍAS</h3>
        <nav class="space-y-1" id="community-categories">
          <a class="community-cat flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-bold cursor-pointer" data-cat="all">
            <span class="material-symbols-outlined">forum</span>
            <span>Todas las charlas</span>
          </a>
          <a class="community-cat flex items-center gap-3 px-3 py-2.5 rounded-lg text-tertiary hover:bg-surface-container-high transition-colors cursor-pointer" data-cat="tips">
            <span class="material-symbols-outlined">lightbulb</span>
            <span>Consejos Generales</span>
          </a>
          <a class="community-cat flex items-center gap-3 px-3 py-2.5 rounded-lg text-tertiary hover:bg-surface-container-high transition-colors cursor-pointer" data-cat="health">
            <span class="material-symbols-outlined">health_and_safety</span>
            <span>Salud y Nutrición</span>
          </a>
          <a class="community-cat flex items-center gap-3 px-3 py-2.5 rounded-lg text-tertiary hover:bg-surface-container-high transition-colors cursor-pointer" data-cat="events">
            <span class="material-symbols-outlined">event</span>
            <span>Eventos Locales</span>
          </a>
          <a class="community-cat flex items-center gap-3 px-3 py-2.5 rounded-lg text-tertiary hover:bg-surface-container-high transition-colors cursor-pointer" data-cat="search">
            <span class="material-symbols-outlined">support</span>
            <span>Apoyo en Búsqueda</span>
          </a>
        </nav>
      </div>
      <!-- Featured Event -->
      <div class="bg-secondary-container text-on-secondary-container rounded-xl p-md relative overflow-hidden group">
        <div class="relative z-10">
          <h4 class="font-headline-md mb-2">¡Fiesta de Patas!</h4>
          <p class="text-sm mb-4 opacity-90">Únete a nuestra reunión en Golden Gate Park este sábado.</p>
          <button class="bg-on-secondary-container text-white px-4 py-2 rounded-lg text-label-sm">Ver Evento</button>
        </div>
        <span class="material-symbols-outlined absolute -bottom-4 -right-4 text-8xl opacity-10 rotate-12 group-hover:scale-110 transition-transform">pets</span>
      </div>
    </aside>
    
    <!-- Main Feed -->
    <div class="flex-grow space-y-md">
      <div class="flex items-center justify-between mb-sm">
        <h2 class="font-headline-md text-on-surface">Charlas en Tendencia</h2>
        <div class="flex gap-2" id="feed-toggle">
          <button class="feed-toggle-btn px-3 py-1 rounded-full border border-outline text-label-sm hover:bg-surface-container-high" data-sort="recent">Reciente</button>
          <button class="feed-toggle-btn px-3 py-1 rounded-full bg-primary text-on-primary text-label-sm" data-sort="popular">Popular</button>
        </div>
      </div>
      
      <!-- Posts Container -->
      <div id="posts-container" class="space-y-md">
        <div class="text-center py-10 text-on-surface-variant">Cargando publicaciones...</div>
      </div>

      <!-- Discussion Prompt -->
      <div class="bg-surface-container-highest/50 border-2 border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center text-center">
        <div class="bg-white p-4 rounded-full shadow-sm mb-md">
          <span class="material-symbols-outlined text-4xl text-primary">add_comment</span>
        </div>
        <h3 class="font-headline-md text-on-surface mb-xs">¿Tienes alguna pregunta?</h3>
        <p class="text-tertiary mb-lg max-w-sm">Comparte tus experiencias o pide consejo a nuestra comunidad de expertos y entusiastas de las mascotas.</p>
        <button id="start-chat-btn" class="bg-primary text-on-primary px-xl py-md rounded-full font-bold text-label-lg shadow-lg active:scale-95 duration-150">Iniciar una charla</button>
      </div>
    </div>
  </div>
</main>

<!-- Mobile FAB -->
<button id="mobile-fab" class="md:hidden fixed bottom-6 right-6 bg-primary text-on-primary w-14 h-14 rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform z-40">
  <span class="material-symbols-outlined text-3xl">add</span>
</button>

<!-- Compose Modal -->
<div id="compose-modal" class="fixed inset-0 z-[90] hidden">
  <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" id="compose-backdrop"></div>
  <div class="absolute inset-0 flex items-center justify-center p-6">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative">
      <button id="close-compose" class="absolute top-4 right-4 text-tertiary hover:text-on-surface">
        <span class="material-symbols-outlined">close</span>
      </button>
      <h3 class="font-headline-md text-on-surface mb-6">Nueva Publicación</h3>
      <form id="compose-form" class="space-y-4">
        <div>
           <select id="post-category" class="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none" required>
             <option value="" disabled selected>Selecciona una categoría...</option>
             <option value="tips">Consejos Generales</option>
             <option value="health">Salud y Nutrición</option>
             <option value="events">Eventos Locales</option>
             <option value="search">Apoyo en Búsqueda</option>
           </select>
        </div>
        <input id="post-title" class="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Título de tu publicación" type="text" required/>
        <textarea id="post-body" class="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none" rows="4" placeholder="¿Qué quieres compartir?" required></textarea>
        <div class="flex justify-end gap-3">
          <button type="button" id="cancel-compose" class="px-6 py-3 rounded-lg text-tertiary font-semibold hover:bg-surface-container-high transition-colors">Cancelar</button>
          <button type="submit" class="px-6 py-3 rounded-lg bg-primary text-on-primary font-semibold shadow-md active:scale-95 transition-transform">Publicar</button>
        </div>
      </form>
    </div>
  </div>
</div>`;
}

export async function init() {
  const postsContainer = document.getElementById('posts-container');
  let currentCategory = 'all';
  let currentSort = 'popular';

  async function loadPosts() {
    try {
      const res = await api.getPosts(currentCategory, currentSort);
      if (res.success) {
        if (res.data.length === 0) {
          postsContainer.innerHTML = '<div class="text-center py-10 text-on-surface-variant border border-dashed rounded-xl border-outline-variant">No hay publicaciones en esta categoría.</div>';
        } else {
          postsContainer.innerHTML = res.data.map(p => buildPostCard(p)).join('');
          attachPostEvents();
        }
      }
    } catch (err) {
      postsContainer.innerHTML = '<div class="text-center py-10 text-error">Error al cargar publicaciones.</div>';
    }
  }

  function attachPostEvents() {
    document.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!api.isLoggedIn()) {
          window.PataMatch.toast('Debes iniciar sesión para dar like', 'error');
          return;
        }

        const postId = btn.getAttribute('data-post-id');
        try {
          const res = await api.toggleLike(postId);
          if (res.success) {
            const { is_liked, like_count } = res.data;
            btn.setAttribute('data-liked', String(is_liked));
            btn.querySelector('.like-count').textContent = like_count;
            const icon = btn.querySelector('.material-symbols-outlined');
            icon.style.fontVariationSettings = \`'FILL' \${is_liked ? 1 : 0}, 'wght' 400\`;
            
            if (is_liked) {
              btn.classList.add('text-primary');
              btn.classList.remove('text-tertiary');
            } else {
              btn.classList.remove('text-primary');
              btn.classList.add('text-tertiary');
            }
          }
        } catch (err) {
          window.PataMatch.toast('Error al actualizar like', 'error');
        }
      });
    });
  }

  // Category toggle
  document.querySelectorAll('.community-cat').forEach(cat => {
    cat.addEventListener('click', () => {
      document.querySelectorAll('.community-cat').forEach(c => {
        c.classList.remove('bg-primary/10', 'text-primary', 'font-bold');
        c.classList.add('text-tertiary');
      });
      cat.classList.add('bg-primary/10', 'text-primary', 'font-bold');
      cat.classList.remove('text-tertiary');
      
      currentCategory = cat.getAttribute('data-cat');
      loadPosts();
    });
  });

  // Feed toggle (Sort)
  document.querySelectorAll('.feed-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.feed-toggle-btn').forEach(b => {
        b.classList.remove('bg-primary', 'text-on-primary');
        b.classList.add('border', 'border-outline');
      });
      btn.classList.add('bg-primary', 'text-on-primary');
      btn.classList.remove('border', 'border-outline');
      
      currentSort = btn.getAttribute('data-sort');
      loadPosts();
    });
  });

  // Compose modal
  const modal = document.getElementById('compose-modal');
  const form = document.getElementById('compose-form');
  
  const openCompose = () => {
    if (!api.isLoggedIn()) {
      window.PataMatch.toast('Debes iniciar sesión para publicar', 'error');
      return;
    }
    modal?.classList.remove('hidden');
  };
  
  const closeCompose = () => {
    modal?.classList.add('hidden');
    form?.reset();
  };

  document.getElementById('start-chat-btn')?.addEventListener('click', openCompose);
  document.getElementById('mobile-fab')?.addEventListener('click', openCompose);
  document.getElementById('close-compose')?.addEventListener('click', closeCompose);
  document.getElementById('cancel-compose')?.addEventListener('click', closeCompose);
  document.getElementById('compose-backdrop')?.addEventListener('click', closeCompose);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Publicando...';

    const data = {
      title: document.getElementById('post-title').value,
      body: document.getElementById('post-body').value,
      category: document.getElementById('post-category').value
    };

    try {
      const res = await api.createPost(data);
      if (res.success) {
        window.PataMatch.toast('¡Publicación creada exitosamente!', 'success');
        closeCompose();
        
        // Switch to the category they just posted in and 'recent' to see it
        document.querySelector(\`.community-cat[data-cat="\${data.category}"]\`)?.click();
        document.querySelector('.feed-toggle-btn[data-sort="recent"]')?.click();
      }
    } catch (err) {
      window.PataMatch.toast(err.message || 'Error al publicar', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Publicar';
    }
  });

  // Initial load
  loadPosts();
}
