/*
// chatbot.js - backend powered chat (FIXED UI + positioning)

const API_BASE = 'https://tech-inventory-backend.onrender.com/api';

(function(){
  const widget = document.createElement('div');
  widget.id = 'chat-widget';
  widget.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 300px;
    font-family: Arial, sans-serif;
    z-index: 9999;
  `;

  widget.innerHTML = `
    <button id="chat-toggle" style="
      width:100%;
      padding:10px;
      background:#1b5e20;
      color:#fff;
      border:none;
      border-radius:6px;
    ">Chat</button>

    <div id="chat-panel" class="hidden" style="
      background:#fff;
      border:1px solid #ccc;
      border-radius:6px;
      margin-top:6px;
      display:flex;
      flex-direction:column;
      height:350px;
    ">
      <div id="chat-messages" style="
        flex:1;
        padding:10px;
        overflow-y:auto;
        font-size:14px;
      "></div>

      <div style="display:flex;border-top:1px solid #ddd">
        <input id="chat-input" placeholder="Ask a question..."
          style="flex:1;padding:8px;border:none"/>
        <button id="chat-send" style="
          padding:8px 12px;
          border:none;
          background:#1b5e20;
          color:#fff;
        ">Send</button>
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
    q = q.toLowerCase();
    if(q.includes('shipping')) return 'Shipping takes 3–7 business days.';
    if(q.includes('return')) return 'Returns accepted within 14 days.';
    if(q.includes('payment')) return 'This is a cash-on-delivery demo checkout.';
    return 'Thanks! Our team will respond shortly.';
  }

  sendBtn.onclick = async ()=>{
    const q = input.value.trim();
    if(!q) return;

    const a = aiReply(q);

    messagesEl.innerHTML += `
      <div style="margin-bottom:6px"><strong>You:</strong> ${q}</div>
      <div style="margin-bottom:10px;color:#1b5e20">
        <strong>AI:</strong> ${a}
      </div>
    `;

    input.value = '';
    messagesEl.scrollTop = messagesEl.scrollHeight;

    try{
      await fetch(`${API_BASE}/messages`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ question:q, answer:a })
      });
    }catch(e){
      console.error('Message save failed');
    }
  };
})();
*/
