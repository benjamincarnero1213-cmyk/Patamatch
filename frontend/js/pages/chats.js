import * as api from '../api.js?v=4';

export function render() {
  return `
    <main class="pt-32 pb-20 px-6 md:px-12 max-w-6xl mx-auto h-[90vh] flex flex-col">
      <header class="mb-6 flex justify-between items-end">
        <div>
          <h1 class="font-headline-xl text-on-surface mb-2">Mis Chats</h1>
          <p class="font-body-lg text-on-surface-variant">Conversa con otros usuarios sobre adopciones.</p>
        </div>
      </header>

      <div class="flex-1 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col md:flex-row min-h-0">
        
        <!-- Sidebar: List of chats -->
        <div class="w-full md:w-1/3 border-r border-outline-variant/30 flex flex-col h-full bg-surface-bright">
          <div class="p-4 border-b border-outline-variant/30 bg-surface">
            <h2 class="font-bold text-stone-700">Conversaciones</h2>
          </div>
          <div id="chats-list" class="flex-1 overflow-y-auto custom-scroll p-2 space-y-1">
            <div class="p-8 text-center text-stone-500 text-sm">Cargando chats...</div>
          </div>
        </div>

        <!-- Main Chat Area -->
        <div class="w-full md:w-2/3 flex flex-col h-full hidden md:flex bg-white" id="chat-area-container">
          
          <!-- Empty State -->
          <div id="chat-empty-state" class="flex-1 flex flex-col items-center justify-center text-stone-400 p-8">
            <span class="material-symbols-outlined text-6xl mb-4 opacity-50">chat_bubble</span>
            <p class="text-lg font-medium">Selecciona una conversación</p>
          </div>

          <!-- Active Chat -->
          <div id="active-chat" class="hidden flex-1 flex flex-col h-full">
            <!-- Header -->
            <div class="p-4 border-b border-outline-variant/30 bg-surface flex items-center gap-4">
              <button id="back-to-chats" class="md:hidden p-2 -ml-2 rounded-full hover:bg-orange-50 text-stone-600">
                <span class="material-symbols-outlined">arrow_back</span>
              </button>
              <img id="chat-header-avatar" src="" alt="Avatar" class="w-10 h-10 rounded-full object-cover border border-stone-200" />
              <div>
                <h3 id="chat-header-name" class="font-bold text-stone-800 leading-tight">...</h3>
                <p id="chat-header-pet" class="text-xs text-primary font-medium">Mascota: ...</p>
              </div>
            </div>

            <!-- Messages List -->
            <div id="messages-list" class="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-stone-50 custom-scroll">
              <!-- Messages injected here -->
            </div>

            <!-- Input Area -->
            <div class="p-4 border-t border-outline-variant/30 bg-white">
              <form id="chat-form" class="flex gap-2">
                <input type="text" id="chat-input" class="flex-1 px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="Escribe un mensaje..." autocomplete="off" />
                <button type="submit" class="bg-primary text-white p-3 rounded-xl hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center aspect-square" disabled id="send-msg-btn">
                  <span class="material-symbols-outlined">send</span>
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </main>
  `;
}

export async function init() {
  if (!api.isLoggedIn()) {
    window.location.hash = 'login';
    return;
  }

  const currentUser = api.getUser();
  const chatsListEl = document.getElementById('chats-list');
  const chatAreaContainer = document.getElementById('chat-area-container');
  const emptyState = document.getElementById('chat-empty-state');
  const activeChatEl = document.getElementById('active-chat');
  
  const headerName = document.getElementById('chat-header-name');
  const headerAvatar = document.getElementById('chat-header-avatar');
  const headerPet = document.getElementById('chat-header-pet');
  const messagesListEl = document.getElementById('messages-list');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-msg-btn');
  const backBtn = document.getElementById('back-to-chats');

  let currentChatId = null;
  let pollInterval = null;

  async function loadChats() {
    try {
      const res = await api.getChats();
      if (res.success) {
        const chats = res.data;
        if (chats.length === 0) {
          chatsListEl.innerHTML = '<div class="p-8 text-center text-stone-500 text-sm">No tienes chats activos.</div>';
          return;
        }

        chatsListEl.innerHTML = chats.map(c => `
          <div class="chat-item p-3 rounded-xl hover:bg-orange-50 cursor-pointer transition-colors flex gap-3 items-center ${currentChatId == c.id ? 'bg-orange-50 ring-1 ring-primary/30' : ''}" data-chat-id="${c.id}">
            <img src="${c.other_user.avatar || 'https://via.placeholder.com/150'}" class="w-12 h-12 rounded-full object-cover" />
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-baseline mb-0.5">
                <h4 class="font-semibold text-stone-800 text-sm truncate">${c.other_user.name}</h4>
                <span class="text-[10px] text-stone-400 whitespace-nowrap ml-2">${new Date(c.updated_at).toLocaleDateString()}</span>
              </div>
              <p class="text-xs text-primary font-medium truncate mb-0.5">${c.pet_name}</p>
              <p class="text-xs text-stone-500 truncate">${c.latest_message}</p>
            </div>
          </div>
        `).join('');

        // Attach events
        document.querySelectorAll('.chat-item').forEach(el => {
          el.addEventListener('click', () => {
            const id = el.getAttribute('data-chat-id');
            const chat = chats.find(c => c.id == id);
            openChat(chat);
          });
        });
      }
    } catch (err) {
      console.error(err);
      chatsListEl.innerHTML = '<div class="p-4 text-center text-error">Error cargando chats.</div>';
    }
  }

  async function openChat(chat) {
    currentChatId = chat.id;
    
    // Update UI for mobile/desktop
    document.querySelector('.w-full.md\\:w-1\\/3').classList.add('hidden', 'md:flex');
    chatAreaContainer.classList.remove('hidden');
    chatAreaContainer.classList.add('flex');
    
    emptyState.classList.add('hidden');
    activeChatEl.classList.remove('hidden');

    // Set header
    headerName.textContent = chat.other_user.name;
    headerAvatar.src = chat.other_user.avatar || 'https://via.placeholder.com/150';
    headerPet.textContent = `Mascota: ${chat.pet_name}`;
    
    // Highlight active in list
    document.querySelectorAll('.chat-item').forEach(el => {
      if (el.getAttribute('data-chat-id') == chat.id) {
        el.classList.add('bg-orange-50', 'ring-1', 'ring-primary/30');
      } else {
        el.classList.remove('bg-orange-50', 'ring-1', 'ring-primary/30');
      }
    });

    chatInput.value = '';
    
    await loadMessages();
    startPollingMessages();
  }

  async function loadMessages() {
    if (!currentChatId) return;
    try {
      const res = await api.getChatMessages(currentChatId);
      if (res.success) {
        const msgs = res.data;
        if (msgs.length === 0) {
          messagesListEl.innerHTML = '<div class="text-center text-xs text-stone-400 mt-auto mb-auto">Comienza la conversación...</div>';
          return;
        }

        const wasAtBottom = messagesListEl.scrollHeight - messagesListEl.scrollTop <= messagesListEl.clientHeight + 10;

        messagesListEl.innerHTML = msgs.map(m => {
          const isMine = m.sender_id === currentUser.id;
          return `
            <div class="flex flex-col max-w-[80%] ${isMine ? 'self-end items-end' : 'self-start items-start'}">
              <div class="px-4 py-2 rounded-2xl ${isMine ? 'bg-primary text-white rounded-tr-sm' : 'bg-white border border-stone-200 text-stone-800 rounded-tl-sm'} shadow-sm text-sm">
                ${m.body}
              </div>
              <span class="text-[9px] text-stone-400 mt-1 px-1">${new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          `;
        }).join('');

        // Scroll to bottom if it was at bottom
        if (wasAtBottom || msgs.length > 0) { // always scroll to bottom on load for now
          messagesListEl.scrollTop = messagesListEl.scrollHeight;
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  function startPollingMessages() {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(() => {
      loadMessages();
      loadChats(); // refresh latest messages in sidebar
    }, 2000);
  }

  // Back button for mobile
  backBtn.addEventListener('click', () => {
    document.querySelector('.w-full.md\\:w-1\\/3').classList.remove('hidden');
    document.querySelector('.w-full.md\\:w-1\\/3').classList.add('flex');
    chatAreaContainer.classList.add('hidden');
    chatAreaContainer.classList.remove('flex');
    currentChatId = null;
    if (pollInterval) clearInterval(pollInterval);
    // Remove highlights
    document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('bg-orange-50', 'ring-1', 'ring-primary/30'));
  });

  // Input events
  chatInput.addEventListener('input', () => {
    sendBtn.disabled = !chatInput.value.trim();
  });

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = chatInput.value.trim();
    if (!body || !currentChatId) return;

    chatInput.value = '';
    sendBtn.disabled = true;

    try {
      const res = await api.sendChatMessage(currentChatId, body);
      if (res.success) {
        await loadMessages();
        await loadChats();
      }
    } catch (err) {
      console.error(err);
      window.PataMatch.toast('Error al enviar mensaje', 'error');
    }
  });

  // Initial load
  loadChats();

  // Cleanup on leave
  const originalNavigate = window.onhashchange;
  window.onhashchange = function(e) {
    if (pollInterval) clearInterval(pollInterval);
    if (originalNavigate) originalNavigate(e);
  };
}
