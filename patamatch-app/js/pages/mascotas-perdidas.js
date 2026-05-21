import * as api from '../api.js?v=3';;

function buildSidebarCard(pet) {
  const badgeHtml = pet.badge
    ? `<span class="bg-error-container text-error px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">${pet.badge}</span>`
    : '';

  return `
    <div class="lost-pet-card bg-surface rounded-2xl p-3 border border-outline-variant shadow-sm hover:shadow-md transition-shadow cursor-pointer group" data-pet-id="${pet.id}">
      <div class="flex gap-4">
        <img class="w-24 h-24 rounded-xl object-cover" src="${pet.image_url || 'https://via.placeholder.com/150'}" alt="${pet.name}" />
        <div class="flex-1">
          <div class="flex justify-between items-start">
            <h3 class="font-label-lg text-on-surface">${pet.name}</h3>
            ${badgeHtml}
          </div>
          <p class="text-label-sm text-outline mb-2">${pet.breed}</p>
          <div class="flex items-center gap-1 text-label-sm text-secondary">
            <span class="material-symbols-outlined text-sm">location_on</span>
            <span>${pet.location}</span>
          </div>
          <p class="text-[11px] text-outline mt-2 italic">${pet.last_seen || 'Reportado recientemente'}</p>
        </div>
      </div>
    </div>`;
}

function buildMarkerHtml(pet) {
  const size = pet.badge === 'Urgente' ? 'w-12 h-12' : 'w-10 h-10';
  const ringClass = pet.badge === 'Urgente' ? 'bg-primary-container ring-4 ring-primary/20' : 'bg-surface-variant';
  const petIconHtml = pet.badge === 'Urgente'
    ? `<div class="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full border-2 border-white">
         <span class="material-symbols-outlined text-[12px]" style="font-variation-settings: 'FILL' 1, 'wght' 400;">pets</span>
       </div>`
    : '';

  const markerImg = pet.marker_image || pet.image_url || 'https://via.placeholder.com/150';
  const markerLabel = `${pet.name} • ${pet.breed}`;

  return `
    <div class="map-marker group cursor-pointer relative" data-marker-id="${pet.id}">
      <div class="relative">
        <div class="${size} rounded-full border-4 border-white shadow-xl overflow-hidden ${ringClass}">
          <img class="w-full h-full object-cover" src="${markerImg}" alt="${pet.name}" />
        </div>
        ${petIconHtml}
      </div>
      <div class="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface px-3 py-1 rounded-lg shadow-xl whitespace-nowrap border border-outline-variant z-50">
        <p class="font-label-lg">${markerLabel}</p>
      </div>
    </div>`;
}

export function render() {
  return `
<!-- Report Modal -->
<div id="report-modal" class="fixed inset-0 z-[200] hidden items-center justify-center">
  <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" id="report-modal-overlay"></div>
  <div class="relative bg-surface rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8 z-10 max-h-[90vh] overflow-y-auto">
    <div class="flex justify-between items-center mb-6">
      <h2 class="font-headline-md text-on-surface">Reportar Mascota Perdida</h2>
      <button id="report-modal-close" class="p-2 rounded-full hover:bg-surface-container-high transition-colors">
        <span class="material-symbols-outlined text-on-surface-variant">close</span>
      </button>
    </div>
    <form id="report-form" class="space-y-4">
      <div>
        <label class="block font-label-sm text-on-surface-variant mb-1">Nombre de la mascota</label>
        <input id="report-name" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all" type="text" placeholder="Ej: Max" required />
      </div>
      <div>
        <label class="block font-label-sm text-on-surface-variant mb-1">Raza / Especie</label>
        <input id="report-breed" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all" type="text" placeholder="Ej: Golden Retriever" required />
      </div>
      <div>
        <label class="block font-label-sm text-on-surface-variant mb-1">Última ubicación conocida</label>
        <div class="flex gap-2">
          <input id="report-location" class="flex-1 px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all" type="text" placeholder="Ej: Parque Central, Zona 10" required />
          <button id="select-map-btn" class="bg-surface-variant text-on-surface p-3 rounded-xl hover:bg-surface-container-low transition-colors border border-outline-variant flex items-center justify-center" title="Seleccionar en el mapa">
            <span class="material-symbols-outlined">map</span>
          </button>
        </div>
      </div>
      <div>
        <label class="block font-label-sm text-on-surface-variant mb-1">URL de Imagen</label>
        <input id="report-image" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all" type="url" placeholder="https://..." required />
      </div>
      <div>
        <label class="block font-label-sm text-on-surface-variant mb-1">Descripción</label>
        <textarea id="report-desc" class="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none" rows="3" placeholder="Color, tamaño, collar, chip, etc."></textarea>
      </div>
      <button type="submit" class="w-full bg-primary text-white py-4 rounded-xl font-label-lg flex items-center justify-center gap-2 shadow-md hover:scale-[0.98] active:scale-95 transition-all">
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1, 'wght' 400;">add_circle</span>
        Publicar Reporte
      </button>
    </form>
    <!-- Success message (hidden by default) -->
    <div id="report-success" class="hidden text-center py-8">
      <span class="material-symbols-outlined text-5xl text-secondary mb-4" style="font-variation-settings: 'FILL' 1, 'wght' 400;">check_circle</span>
      <h3 class="font-headline-md text-on-surface mb-2">¡Reporte enviado!</h3>
      <p class="font-body-md text-on-surface-variant">Tu reporte ha sido publicado. Te notificaremos si alguien tiene información.</p>
    </div>
  </div>
</div>

<style>
  .map-gradient-overlay {
    background: linear-gradient(to bottom, rgba(255, 248, 244, 0.9) 0%, rgba(255, 248, 244, 0) 20%);
  }
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #ddc0b8; border-radius: 10px; }
  .lost-pet-card.active { border-color: #9c3e20; box-shadow: 0 0 0 2px rgba(156, 62, 32, 0.2); }
  .map-marker.active .ring-primary\\/20 { box-shadow: 0 0 0 8px rgba(156, 62, 32, 0.3); }
  .map-marker.active > div > div:first-child { border-color: #9c3e20; }
</style>

<main class="h-[calc(100vh-80px)] flex flex-col md:flex-row overflow-hidden">
  <!-- Sidebar -->
  <aside class="w-full md:w-96 bg-surface-container-low border-r border-outline-variant flex flex-col z-10">
    <div class="p-6 space-y-4 shadow-sm bg-surface">
      <div class="flex justify-between items-center">
        <h1 class="font-headline-md text-on-surface">Reportes Activos</h1>
        <span id="active-reports-badge" class="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-label-sm">0 Encontrados</span>
      </div>
      <div class="relative">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
        <input id="lost-pet-search" class="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-all outline-none text-body-md" placeholder="Buscar por raza o zona..." type="text" />
      </div>
      <button id="report-btn" class="w-full bg-primary text-white py-4 rounded-xl font-label-lg flex items-center justify-center gap-2 shadow-md hover:scale-[0.98] active:scale-95 transition-all">
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1, 'wght' 400;">add_circle</span>
        Reportar Mascota Perdida
      </button>
    </div>
    <div id="lost-pet-list" class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
      <div class="text-center py-10 text-on-surface-variant">Cargando reportes...</div>
    </div>
  </aside>

  <!-- Map Section -->
  <section class="flex-1 relative bg-surface-container-highest overflow-hidden">
    <!-- Leaflet map container -->
    <div id="leaflet-map-container" class="absolute inset-0 z-0"></div>
    <div class="absolute inset-0 map-gradient-overlay pointer-events-none z-10"></div>

    <!-- Live update banner -->
    <div class="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 z-20 pointer-events-none">
      <div class="bg-surface/90 backdrop-blur-md px-4 py-2 rounded-full border border-outline-variant shadow-lg flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-primary animate-pulse"></span>
        <span id="live-update-text" class="text-label-sm text-on-surface">Actualizaciones en vivo...</span>
      </div>
    </div>

    <!-- Instructions banner -->
    <div id="map-instructions" class="hidden absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <div class="bg-primary text-white px-6 py-3 rounded-full shadow-lg font-label-lg flex items-center gap-2">
        <span class="material-symbols-outlined">touch_app</span> Haz clic en el mapa para ubicar a la mascota
      </div>
    </div>

    <!-- Mobile report button -->
    <div class="absolute bottom-10 left-1/2 -translate-x-1/2 md:hidden z-20">
      <button id="report-btn-mobile" class="bg-primary text-white px-8 py-4 rounded-full font-label-lg shadow-2xl flex items-center gap-2 animate-bounce">
        <span class="material-symbols-outlined">report_gmailerrorred</span>
        Reportar Mascota Perdida
      </button>
    </div>
  </section>
</main>
`;
}

export async function init() {
  const petList = document.getElementById('lost-pet-list');
  const badge = document.getElementById('active-reports-badge');
  const updateText = document.getElementById('live-update-text');
  const mapInstructions = document.getElementById('map-instructions');

  // Dynamically load Leaflet if it's not present (e.g. if the user didn't refresh the SPA)
  if (!window.L) {
    await new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

  let leafletMap = null;
  let leafletMarkers = {};
  let tempMarker = null;
  let selectedLat = null;
  let selectedLng = null;
  let activeId = null;

  // Initialize Leaflet Map
  leafletMap = L.map('leaflet-map-container', { zoomControl: false }).setView([19.4326, -99.1332], 13);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  }).addTo(leafletMap);
  L.control.zoom({ position: 'bottomright' }).addTo(leafletMap);

  // Fix for SPA: invalidate size after the container has been rendered to the screen
  setTimeout(() => {
    leafletMap.invalidateSize();
  }, 100);

  async function loadLostPets() {
    try {
      const res = await api.getLostPets();
      if (res.success) {
        const pets = res.data;
        badge.textContent = `${pets.length} Encontrados`;
        updateText.textContent = `${pets.length} reportes activos en tu zona`;
        
        petList.innerHTML = pets.map(p => buildSidebarCard(p)).join('');
        
        // Clear existing markers
        Object.values(leafletMarkers).forEach(m => leafletMap.removeLayer(m));
        leafletMarkers = {};

        pets.forEach(pet => {
          let lat = parseFloat(pet.marker_top);
          let lng = parseFloat(pet.marker_left);
          if (isNaN(lat) || isNaN(lng)) {
            // fallback to random spot near center if DB has old % values
            lat = 19.4326 + (Math.random() - 0.5) * 0.05;
            lng = -99.1332 + (Math.random() - 0.5) * 0.05;
          }

          const icon = L.divIcon({
            className: 'custom-leaflet-icon',
            html: buildMarkerHtml(pet),
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          });

          const m = L.marker([lat, lng], { icon }).addTo(leafletMap);
          m.on('click', () => setActivePet(pet.id.toString()));
          leafletMarkers[pet.id] = m;
        });
        
        attachEvents();
      }
    } catch (err) {
      petList.innerHTML = '<div class="text-center py-10 text-error">Error al cargar reportes.</div>';
    }
  }

  function setActivePet(petId) {
    document.querySelectorAll('.lost-pet-card').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.map-marker').forEach(m => m.classList.remove('active'));

    if (activeId === petId) {
      activeId = null;
      return;
    }
    activeId = petId;

    const card = document.querySelector(`.lost-pet-card[data-pet-id="${petId}"]`);
    if (card) {
      card.classList.add('active');
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const marker = leafletMarkers[petId];
    if (marker) {
      leafletMap.setView(marker.getLatLng(), 15, { animate: true });
      const el = marker.getElement().querySelector('.map-marker');
      if (el) {
        el.classList.add('active');
        const tooltip = el.querySelector('div > div:last-child');
        if (tooltip) {
          tooltip.classList.remove('opacity-0');
          tooltip.classList.add('opacity-100');
          setTimeout(() => {
            tooltip.classList.remove('opacity-100');
            tooltip.classList.add('opacity-0');
          }, 3000);
        }
      }
    }
  }

  function attachEvents() {
    petList.addEventListener('click', (e) => {
      const card = e.target.closest('.lost-pet-card');
      if (card) {
        setActivePet(card.getAttribute('data-pet-id'));
      }
    });
  }

  // Handle map click for reporting
  leafletMap.on('click', (e) => {
    if (document.getElementById('report-modal').classList.contains('hidden') && mapInstructions.classList.contains('hidden')) {
      return; // Do nothing if not in "select location" mode
    }

    selectedLat = e.latlng.lat;
    selectedLng = e.latlng.lng;
    
    if (tempMarker) leafletMap.removeLayer(tempMarker);
    
    tempMarker = L.marker([selectedLat, selectedLng], {
      icon: L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div class="w-10 h-10 rounded-full border-4 border-white bg-primary shadow-xl flex items-center justify-center text-white"><span class="material-symbols-outlined text-[20px]">pets</span></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      })
    }).addTo(leafletMap);

    if (!mapInstructions.classList.contains('hidden')) {
      mapInstructions.classList.add('hidden');
      document.getElementById('report-modal').classList.remove('hidden');
      document.getElementById('report-modal').classList.add('flex');
    }
  });

  // --- Search filter ---
  const searchInput = document.getElementById('lost-pet-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      const cards = petList.querySelectorAll('.lost-pet-card');
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }

  document.getElementById('select-map-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    mapInstructions.classList.remove('hidden');
  });

  // --- Report Modal ---
  const modal = document.getElementById('report-modal');
  const reportForm = document.getElementById('report-form');
  const reportSuccess = document.getElementById('report-success');

  function openModal() {
    if (!api.isLoggedIn()) {
      window.PataMatch.toast('Debes iniciar sesión para reportar una mascota', 'error');
      return;
    }
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    reportForm.classList.remove('hidden');
    reportSuccess.classList.add('hidden');
  }

  function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    reportForm.reset();
  }

  document.getElementById('report-btn')?.addEventListener('click', openModal);
  document.getElementById('report-btn-mobile')?.addEventListener('click', openModal);
  document.getElementById('report-modal-close')?.addEventListener('click', closeModal);
  document.getElementById('report-modal-overlay')?.addEventListener('click', closeModal);

  // Form submission via API
  reportForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = reportForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Enviando...';

    const data = {
      name: document.getElementById('report-name').value,
      breed: document.getElementById('report-breed').value,
      location: document.getElementById('report-location').value,
      image_url: document.getElementById('report-image').value,
      description: document.getElementById('report-desc').value,
      lat: selectedLat ? selectedLat.toString() : leafletMap.getCenter().lat.toString(),
      lng: selectedLng ? selectedLng.toString() : leafletMap.getCenter().lng.toString()
    };

    try {
      const res = await api.reportLostPet(data);
      if (res.success) {
        reportForm.classList.add('hidden');
        reportSuccess.classList.remove('hidden');
        loadLostPets(); // Refresh the list
        setTimeout(closeModal, 2500);
      }
    } catch (err) {
      window.PataMatch.toast(err.message || 'Error al enviar reporte', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="material-symbols-outlined">add_circle</span> Publicar Reporte';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Load data on init
  loadLostPets();
}
