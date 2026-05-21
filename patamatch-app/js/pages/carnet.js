import * as api from '../api.js';

function buildCarnetHTML(carnet) {
  const vaxHTML = carnet.vaccinations.map(v => {
    let statusClass = 'bg-green-100 text-green-700';
    let statusText = 'Actualizada';
    if (v.status === 'expiring') {
      statusClass = 'bg-yellow-100 text-yellow-700';
      statusText = 'Vence pronto';
    } else if (v.status === 'expired') {
      statusClass = 'bg-red-100 text-red-700';
      statusText = 'Vencida';
    }

    return `
      <tr>
        <td class="py-6 font-bold text-on-surface">${v.name}</td>
        <td class="py-6 text-on-surface-variant">${v.last_date}</td>
        <td class="py-6 text-on-surface-variant ${v.status === 'expiring' ? 'font-bold text-yellow-600' : ''}">${v.next_date}</td>
        <td class="py-6"><span class="px-3 py-1.5 rounded-lg ${statusClass} text-xs font-bold uppercase tracking-wide">${statusText}</span></td>
      </tr>
    `;
  }).join('');

  const historyHTML = carnet.medical_history.map(h => `
    <div class="border-l-2 border-primary-fixed/30 pl-4 py-1">
      <p class="text-xs font-bold text-primary-fixed mb-1">${h.date}</p>
      <p class="font-bold mb-1">${h.title}</p>
      <p class="text-sm text-primary-fixed/80">${h.notes}</p>
    </div>
  `).join('');

  return `
  <div class="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
    <div>
      <span class="inline-block py-1 px-3 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-sm text-label-sm uppercase mb-4 tracking-wider">Identificación Digital Oficial</span>
      <h1 class="font-headline-xl text-headline-xl text-on-background">Pasaporte Digital de ${carnet.pet_name}</h1>
      <p class="font-body-lg text-body-lg text-on-surface-variant mt-2">Siempre disponible, actualizado en tiempo real para su seguridad y cuidado.</p>
    </div>
    <div class="flex gap-3 justify-center">
      <button id="download-pdf" class="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-container-high border border-outline-variant text-on-surface hover:bg-surface-container transition-colors font-label-lg text-label-lg">
        <span class="material-symbols-outlined">download</span>
        Descargar PDF
      </button>
      <button id="share-id" class="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-on-primary hover:opacity-90 transition-all active:scale-[0.98] font-label-lg text-label-lg shadow-lg">
        <span class="material-symbols-outlined">share</span>
        Compartir ID
      </button>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
    <div class="lg:col-span-8 flex flex-col gap-8">
      <!-- Main ID Card -->
      <div class="bg-surface-container-lowest rounded-[2rem] overflow-hidden id-card-shadow border border-surface-container flex flex-col md:flex-row min-h-[480px]">
        <div class="md:w-2/5 relative">
          <img class="w-full h-full object-cover" alt="${carnet.pet_name}" src="${carnet.image_url || 'https://via.placeholder.com/300'}"/>
          <div class="absolute top-4 left-4">
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-secondary font-label-sm text-label-sm shadow-sm">
              <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">favorite</span>
              ${carnet.spayed_neutered ? 'Esterilizado' : 'Sin esterilizar'}
            </div>
          </div>
        </div>
        <div class="md:w-3/5 p-8 md:p-12 flex flex-col">
          <div class="flex justify-between items-start mb-8">
            <div>
              <h2 class="font-headline-lg text-headline-lg text-primary mb-1">${carnet.pet_name}</h2>
              <p class="text-on-surface-variant font-label-lg text-label-lg">${carnet.breed} • ${carnet.gender}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-y-8 gap-x-4 mb-12">
            <div>
              <label class="block text-outline font-label-sm text-label-sm uppercase tracking-widest mb-1">Fecha de Nacimiento</label>
              <p class="font-headline-md text-headline-md">${carnet.birth_date}</p>
            </div>
            <div>
              <label class="block text-outline font-label-sm text-label-sm uppercase tracking-widest mb-1">Color / Marcas</label>
              <p class="font-headline-md text-headline-md">${carnet.color}</p>
            </div>
            <div class="col-span-2">
              <label class="block text-outline font-label-sm text-label-sm uppercase tracking-widest mb-1">ID de Microchip</label>
              <div class="flex items-center gap-3">
                <p class="font-headline-md text-headline-md font-mono tracking-tight">${carnet.microchip_id}</p>
                <span class="material-symbols-outlined text-secondary text-[20px]">verified_user</span>
              </div>
            </div>
          </div>
          <div class="mt-auto pt-8 border-t border-surface-container flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                <span class="material-symbols-outlined">pets</span>
              </div>
              <div>
                <p class="text-xs text-outline uppercase font-bold tracking-tighter">Especie</p>
                <p class="font-bold text-on-surface">${carnet.species}</p>
              </div>
            </div>
            <div class="bg-secondary-fixed px-4 py-2 rounded-full flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-secondary"></span>
              <span class="text-on-secondary-fixed-variant text-xs font-bold uppercase tracking-wider">Salud Certificada</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Vaccination Table -->
      <div class="bg-surface-container-low rounded-3xl p-8 border border-surface-container">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary">vaccines</span>
            <h3 class="font-headline-md text-headline-md">Registro de Vacunación</h3>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-outline-variant">
                <th class="py-4 font-label-lg text-label-lg text-outline">VACUNA</th>
                <th class="py-4 font-label-lg text-label-lg text-outline">ÚLTIMA DOSIS</th>
                <th class="py-4 font-label-lg text-label-lg text-outline">PRÓXIMA DOSIS</th>
                <th class="py-4 font-label-lg text-label-lg text-outline">ESTADO</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-container">
              ${vaxHTML}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="lg:col-span-4 flex flex-col gap-8">
      <!-- Vet Info -->
      <div class="bg-white rounded-3xl p-8 border border-surface-container-high shadow-sm">
        <h4 class="font-label-lg text-label-lg text-outline uppercase tracking-widest mb-6">Veterinario Principal</h4>
        <div class="flex gap-4 mb-6">
          <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-primary text-3xl">local_hospital</span>
          </div>
          <div>
            <p class="font-bold text-on-surface text-lg">${carnet.vet_name}</p>
            <p class="text-on-surface-variant text-sm">${carnet.vet_clinic}</p>
          </div>
        </div>
        <div class="space-y-4">
          <a class="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors" href="tel:${carnet.vet_phone}">
            <span class="material-symbols-outlined text-primary">call</span>
            <span class="font-semibold">${carnet.vet_phone}</span>
          </a>
        </div>
      </div>
      
      <!-- Medical History -->
      <div class="bg-primary text-white rounded-3xl p-8 shadow-xl">
        <div class="flex items-center justify-between mb-6">
          <h4 class="font-label-lg text-label-lg text-primary-fixed uppercase tracking-widest">Historial Médico</h4>
          <span class="material-symbols-outlined">history_edu</span>
        </div>
        <div class="space-y-6">
          ${historyHTML}
        </div>
      </div>
    </div>
  </div>`;
}

export function render() {
  return `
<main class="pt-32 pb-24 px-6 max-w-7xl mx-auto" id="carnet-container">
  <div class="text-center py-20 text-on-surface-variant border border-dashed rounded-xl border-outline-variant">
    Cargando carnet digital...
  </div>
</main>`;
}

export async function init() {
  const container = document.getElementById('carnet-container');

  if (!api.isLoggedIn()) {
    container.innerHTML = `
      <div class="text-center py-20">
        <span class="material-symbols-outlined text-6xl text-outline-variant mb-4">lock</span>
        <h2 class="font-headline-md text-on-surface mb-4">Debes iniciar sesión</h2>
        <p class="text-on-surface-variant mb-6">Inicia sesión para ver tus carnets digitales.</p>
        <a href="#login" class="inline-block px-8 py-3 bg-primary text-on-primary rounded-xl font-label-lg shadow-md">Iniciar Sesión</a>
      </div>
    `;
    return;
  }

  try {
    const res = await api.getCarnets();
    if (res.success) {
      if (res.data.length === 0) {
        container.innerHTML = `
          <div class="text-center py-20 border border-dashed rounded-xl border-outline-variant">
            <span class="material-symbols-outlined text-6xl text-outline-variant mb-4">pets</span>
            <h2 class="font-headline-md text-on-surface mb-2">No tienes carnets vinculados</h2>
            <p class="text-on-surface-variant">Acude a una clínica afiliada para emitir el pasaporte digital de tu mascota.</p>
          </div>
        `;
      } else {
        // Render the first carnet
        const carnet = res.data[0];
        container.innerHTML = buildCarnetHTML(carnet);
        attachEvents();
      }
    }
  } catch (err) {
    container.innerHTML = '<div class="text-center py-10 text-error">Error al cargar carnet.</div>';
  }

  function attachEvents() {
    document.getElementById('download-pdf')?.addEventListener('click', () => {
      window.PataMatch.toast('Descargando PDF del carnet...', 'info');
    });

    document.getElementById('share-id')?.addEventListener('click', () => {
      const fakeUrl = 'https://patamatch.com/id/share-link';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(fakeUrl).then(() => {
          window.PataMatch.toast('¡Enlace copiado al portapapeles!', 'success');
        });
      } else {
        window.PataMatch.toast('¡Enlace copiado al portapapeles!', 'success');
      }
    });
  }
}
