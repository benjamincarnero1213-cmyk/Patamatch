import * as api from '../api.js?v=4';

export function render() {
  // Register is a full-page layout — signal the router to hide nav/footer
  window.PataMatch = window.PataMatch || {};
  window.PataMatch.isFullPage = true;

  return `
<main class="min-h-screen flex items-stretch">
  <!-- Image Side (Desktop) -->
  <div class="hidden lg:block lg:w-1/2 relative overflow-hidden">
    <div class="absolute inset-0 bg-primary opacity-10 mix-blend-multiply z-10"></div>
    <img class="absolute inset-0 w-full h-full object-cover" alt="Golden retriever y gato calico juntos en un hogar soleado" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLAWwbh2dJqSbgMgyaN5rFfW_6-bV1ea_HuGUxb81ZgWgeQEISoCGRRbWA7PDSVJbTDtKQAp61EYoUJ3arOsaClVsN3ngM_Fx-ymhpEhJDAyllDFNCf6Ehu60ev1lIqfCqKdEH401V-glzTnHHRloTifD05r2xgxDsXw3VHcsIH2ovGTFcJ5MA7t_Y0FnC-QmFJtmArw7TcdgwbN7dI_Vae2S7OSwnZK6cqtsqKxUhus2ZTOVoyT82oUi92IUcRlikzwNfqB8wDco8"/>
    <div class="absolute inset-0 flex flex-col justify-end p-xl z-20 bg-gradient-to-t from-black/60 to-transparent">
      <div class="max-w-md">
        <h1 class="font-headline-xl text-white mb-md">Únete a la comunidad de PataMatch</h1>
        <p class="font-body-lg text-white/90">Miles de mascotas esperan un hogar lleno de amor. Tu nueva mejor compañía está a solo unos clics de distancia.</p>
      </div>
    </div>
  </div>
  <!-- Form Side -->
  <div class="w-full lg:w-1/2 flex items-center justify-center p-md md:p-lg lg:p-xl bg-surface-container-low">
    <div class="w-full max-w-md bg-white rounded-xl shadow-sm p-lg border border-surface-variant">
      <!-- Mobile Brand Header -->
      <div class="lg:hidden flex items-center gap-2 mb-6">
        <span class="material-symbols-outlined text-primary text-3xl" style="font-variation-settings: 'FILL' 1;">pets</span>
        <span class="font-headline-md text-primary tracking-tight">PataMatch</span>
      </div>
      <div class="mb-lg">
        <h2 class="font-headline-lg text-primary mb-xs">Bienvenido</h2>
        <p class="font-body-md text-on-surface-variant">Completa tus datos para crear una cuenta.</p>
      </div>
      <form id="register-form" class="space-y-md" novalidate>
        <div class="space-y-xs">
          <label class="font-label-lg text-on-surface-variant block ml-xs" for="reg-name">Nombre Completo</label>
          <div class="relative flex items-center">
            <span class="material-symbols-outlined absolute left-4 text-outline">person</span>
            <input class="w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-0 outline-none transition-all bg-surface-bright placeholder:text-outline" id="reg-name" placeholder="Ej. Juan Pérez" type="text" required/>
          </div>
          <p class="text-error text-xs hidden" id="reg-name-error">El nombre es requerido</p>
        </div>
        <div class="space-y-xs">
          <label class="font-label-lg text-on-surface-variant block ml-xs" for="reg-email">Correo Electrónico</label>
          <div class="relative flex items-center">
            <span class="material-symbols-outlined absolute left-4 text-outline">mail</span>
            <input class="w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-0 outline-none transition-all bg-surface-bright placeholder:text-outline" id="reg-email" placeholder="tu@email.com" type="email" required/>
          </div>
          <p class="text-error text-xs hidden" id="reg-email-error">Por favor ingresa un correo válido</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div class="space-y-xs">
            <label class="font-label-lg text-on-surface-variant block ml-xs" for="reg-password">Contraseña</label>
            <div class="relative flex items-center">
              <span class="material-symbols-outlined absolute left-4 text-outline">lock</span>
              <input class="w-full pl-12 pr-10 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-0 outline-none transition-all bg-surface-bright placeholder:text-outline" id="reg-password" placeholder="********" type="password" required/>
              <button class="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors" type="button" id="toggle-reg-password">
                <span class="material-symbols-outlined text-[20px]">visibility</span>
              </button>
            </div>
            <p class="text-error text-xs hidden" id="reg-password-error">Mínimo 6 caracteres</p>
          </div>
          <div class="space-y-xs">
            <label class="font-label-lg text-on-surface-variant block ml-xs" for="reg-city">Ciudad</label>
            <div class="relative flex items-center">
              <span class="material-symbols-outlined absolute left-4 text-outline">location_on</span>
              <input class="w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-0 outline-none transition-all bg-surface-bright placeholder:text-outline" id="reg-city" placeholder="Ciudad" type="text" required/>
            </div>
            <p class="text-error text-xs hidden" id="reg-city-error">La ciudad es requerida</p>
          </div>
        </div>
        <div class="flex items-start gap-sm pt-xs">
          <input class="mt-1 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0" id="terms" type="checkbox"/>
          <label class="font-label-sm text-on-surface-variant" for="terms">
            Acepto los <a class="text-primary font-semibold hover:underline" href="#">términos y condiciones</a> y la política de privacidad de PataMatch.
          </label>
        </div>
        <p class="text-error text-xs hidden" id="reg-terms-error">Debes aceptar los términos y condiciones</p>
        <button class="w-full bg-primary hover:bg-surface-tint text-on-primary font-label-lg py-4 rounded-lg shadow-md transition-all flex justify-center items-center gap-sm active:scale-[0.98]" type="submit">
          Crear Cuenta
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">pets</span>
        </button>
      </form>
      <div class="mt-lg pt-md border-t border-outline-variant text-center">
        <p class="font-body-md text-on-surface-variant">
          ¿Ya tienes una cuenta? 
          <a class="text-primary font-bold hover:underline ml-xs cursor-pointer" data-navigate="login">Inicia Sesión</a>
        </p>
      </div>
    </div>
  </div>
</main>
  `;
}

export function init() {
  window.PataMatch = window.PataMatch || {};

  // Password visibility toggle
  const toggleBtn = document.getElementById('toggle-reg-password');
  const passwordInput = document.getElementById('reg-password');

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
      const icon = toggleBtn.querySelector('.material-symbols-outlined');
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.textContent = 'visibility_off';
      } else {
        passwordInput.type = 'password';
        icon.textContent = 'visibility';
      }
    });
  }

  // Form validation and submission
  const form = document.getElementById('register-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let isValid = true;

      const nameInput = document.getElementById('reg-name');
      const emailInput = document.getElementById('reg-email');
      const cityInput = document.getElementById('reg-city');
      const termsCheckbox = document.getElementById('terms');

      const nameError = document.getElementById('reg-name-error');
      const emailError = document.getElementById('reg-email-error');
      const passwordError = document.getElementById('reg-password-error');
      const cityError = document.getElementById('reg-city-error');
      const termsError = document.getElementById('reg-terms-error');

      // Validate name
      if (!nameInput.value.trim()) {
        nameError.classList.remove('hidden');
        nameInput.closest('.relative').querySelector('input').classList.add('border-error');
        isValid = false;
      } else {
        nameError.classList.add('hidden');
        nameInput.classList.remove('border-error');
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value || !emailRegex.test(emailInput.value)) {
        emailError.classList.remove('hidden');
        emailInput.classList.add('border-error');
        isValid = false;
      } else {
        emailError.classList.add('hidden');
        emailInput.classList.remove('border-error');
      }

      // Validate password
      if (!passwordInput.value || passwordInput.value.length < 6) {
        passwordError.classList.remove('hidden');
        passwordInput.classList.add('border-error');
        isValid = false;
      } else {
        passwordError.classList.add('hidden');
        passwordInput.classList.remove('border-error');
      }

      // Validate city
      if (!cityInput.value.trim()) {
        cityError.classList.remove('hidden');
        cityInput.classList.add('border-error');
        isValid = false;
      } else {
        cityError.classList.add('hidden');
        cityInput.classList.remove('border-error');
      }

      // Validate terms
      if (!termsCheckbox.checked) {
        termsError.classList.remove('hidden');
        isValid = false;
      } else {
        termsError.classList.add('hidden');
      }

      if (isValid) {
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Creando...';
        
        try {
          const res = await api.register(nameInput.value.trim(), emailInput.value, passwordInput.value, cityInput.value.trim());
          if (res.success) {
            window.PataMatch.user = res.data.user;
            window.PataMatch.isFullPage = false;
            window.PataMatch.toast('¡Cuenta creada exitosamente!', 'success');
            window.location.hash = '#home';
          }
        } catch (err) {
          window.PataMatch.toast(err.message || 'Error al crear la cuenta', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Crear Cuenta <span class="material-symbols-outlined" style="font-variation-settings: \'FILL\' 1;">pets</span>';
        }
      }
    });

    // Clear errors on input
    const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('border-error');
        // Find the closest error message
        const container = input.closest('.space-y-xs');
        if (container) {
          const errorEl = container.querySelector('.text-error');
          if (errorEl) errorEl.classList.add('hidden');
        }
      });
    });

    // Clear terms error on change
    const termsCheckbox = document.getElementById('terms');
    if (termsCheckbox) {
      termsCheckbox.addEventListener('change', () => {
        const termsError = document.getElementById('reg-terms-error');
        if (termsError) termsError.classList.add('hidden');
      });
    }
  }
}
