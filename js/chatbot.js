// chatbot.js - backend powered chat

const API_BASE = 'https://tech-inventory-backend.onrender.com/api/messages';

(function(){
  const widget = document.createElement('div');
  widget.id = 'chat-widget';
  widget.innerHTML = `
    <button id="chat-toggle">Chat</button>
    <div id="chat-panel" class="hidden">
      <div id="chat-messages"></div>
      <div class="chat-controls">
        <input id="chat-input" placeholder="Ask a question..." />
        <button id="chat-send">Send</button>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  const toggle = widget.querySelector('#chat-toggle');
  const panel = widget.querySelector('#chat-panel');
  const messagesEl = widget.querySelector('#chat-messages');
  const input = widget.querySelector('#chat-input');
  const sendBtn = widget.querySelector('#chat-send');

  toggle.onclick = ()=> panel.classList.toggle('hidden');

  function aiReply(q){
    if(q.includes('shipping')) return 'Shipping is 3–7 business days.';
    if(q.includes('return')) return 'Returns accepted within 14 days.';
    return 'Thanks! Our team will respond shortly.';
  }

  sendBtn.onclick = async ()=>{
    const q = input.value.trim();
    if(!q) return;

    const a = aiReply(q);

    messagesEl.innerHTML += `
      <div class="msg question">${q}</div>
      <div class="msg answer">${a}</div>
    `;

    input.value = '';
    messagesEl.scrollTop = messagesEl.scrollHeight;

    await fetch(`${API_BASE}/messages`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ question:q, answer:a })
    });
  };
})();
