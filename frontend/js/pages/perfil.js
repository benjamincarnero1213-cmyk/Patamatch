import { updateProfile } from '../api.js';

export function render() {
    const user = window.PataMatch.user;
    if (!user) {
        window.location.hash = 'login';
        return '';
    }

    const avatarUrl = user.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&background=random';

    return `
    <div class="max-w-2xl mx-auto px-6 py-12">
        <div class="mb-8">
            <h1 class="font-headline-lg text-stone-800 mb-2">Mi Perfil</h1>
            <p class="text-stone-600">Actualiza tu información personal y foto de perfil.</p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
            <form id="perfil-form" class="space-y-6">
                <!-- Avatar Preview -->
                <div class="flex items-center gap-6 mb-8">
                    <img id="avatar-preview" src="${avatarUrl}" alt="Avatar" class="w-24 h-24 rounded-full object-cover border-4 border-stone-50 shadow-sm" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random'"/>
                    <div>
                        <h3 class="font-bold text-stone-800 text-lg">${user.name}</h3>
                        <p class="text-stone-500 text-sm">${user.email}</p>
                    </div>
                </div>

                <div class="space-y-4">
                    <div>
                        <label for="name" class="block text-sm font-semibold text-stone-700 mb-2">Nombre Completo</label>
                        <input type="text" id="name" name="name" value="${user.name}" required
                            class="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#D96C4A] focus:border-[#D96C4A] transition-all outline-none"
                            placeholder="Ej. Sarah Miller" />
                    </div>

                    <div>
                        <label for="avatar_file" class="block text-sm font-semibold text-stone-700 mb-2">Sube una Foto de Perfil</label>
                        <input type="file" id="avatar_file" name="avatar_file" accept="image/*"
                            class="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#D96C4A] focus:border-[#D96C4A] transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#D96C4A]/10 file:text-[#D96C4A] hover:file:bg-[#D96C4A]/20 cursor-pointer" />
                        <p class="text-xs text-stone-500 mt-2">Sube una imagen desde tu computadora (JPG, PNG). Se adaptará automáticamente.</p>
                    </div>
                </div>

                <div class="pt-6 border-t border-stone-100 flex justify-end gap-4">
                    <a href="#home" class="px-6 py-3 rounded-xl text-stone-600 font-semibold hover:bg-stone-50 transition-colors">Cancelar</a>
                    <button type="submit" id="save-profile-btn" class="bg-[#D96C4A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#c45a39] active:scale-[0.98] transition-all shadow-sm">
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    </div>
    `;
}

export function init() {
    const user = window.PataMatch.user;
    if (!user) return;

    const form = document.getElementById('perfil-form');
    const avatarInput = document.getElementById('avatar_file');
    const avatarPreview = document.getElementById('avatar-preview');
    const nameInput = document.getElementById('name');
    const saveBtn = document.getElementById('save-profile-btn');

    let currentBase64Avatar = user.avatar_url || '';

    // File input handler with resize
    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Max dimensions to prevent huge strings
                const MAX_WIDTH = 400;
                const MAX_HEIGHT = 400;
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                currentBase64Avatar = dataUrl;
                avatarPreview.src = dataUrl;
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
    
    nameInput.addEventListener('input', (e) => {
        if (!currentBase64Avatar) {
            avatarPreview.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(e.target.value || 'Usuario') + '&background=random';
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = nameInput.value.trim();

        if (!name) {
            window.PataMatch.toast('El nombre es requerido', 'error');
            return;
        }

        const originalText = saveBtn.innerText;
        saveBtn.innerText = 'Guardando...';
        saveBtn.disabled = true;

        try {
            const res = await updateProfile({ name, avatar_url: currentBase64Avatar });
            if (res.success) {
                // Update local state
                window.PataMatch.user = { ...window.PataMatch.user, ...res.data };
                localStorage.setItem('patamatch_user', JSON.stringify(window.PataMatch.user));
                
                window.PataMatch.toast('Perfil actualizado correctamente', 'success');
                // Refresh to show new avatar in navigation immediately
                setTimeout(() => {
                    window.location.reload();
                }, 800);
            }
        } catch (err) {
            window.PataMatch.toast(err.message || 'Error al actualizar perfil', 'error');
        } finally {
            saveBtn.innerText = originalText;
            saveBtn.disabled = false;
        }
    });
}
