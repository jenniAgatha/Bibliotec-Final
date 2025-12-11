// perfil.js — preview de avatar e salvar em localStorage
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('avatarInput');
  const preview = document.getElementById('avatarPreview');
  const nomeField = document.getElementById('nomePerfil');
  const saveBtn = document.getElementById('saveBtn');
  const removeBtn = document.getElementById('removeBtn');

  // carregar estado salvo
  try {
    const saved = localStorage.getItem('perfil:data');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.image) preview.src = data.image;
      if (data.name) nomeField.value = data.name;
    }
  } catch(e){ console.warn('erro lendo storage', e) }

  // preview on file select with client-side resize to avoid huge dataURLs
  input.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const MAX_DIM = 800; // max width/height
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // compute new size
        let { width: w, height: h } = img;
        if (w > MAX_DIM || h > MAX_DIM) {
          const ratio = w / h;
          if (ratio > 1) { w = MAX_DIM; h = Math.round(MAX_DIM / ratio); }
          else { h = MAX_DIM; w = Math.round(MAX_DIM * ratio); }
        }
        // draw to canvas
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        // choose output type (prefer jpeg to reduce size, keep png if original was png with transparency)
        const origType = file.type || 'image/jpeg';
        const outType = origType === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outType, 0.8);
        preview.src = dataUrl;
      };
      img.onerror = () => { preview.src = reader.result; };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  saveBtn.addEventListener('click', () => {
    const data = { name: nomeField.value || '', image: preview.src };
    try{ localStorage.setItem('perfil:data', JSON.stringify(data)); alert('Perfil salvo no navegador.'); }
    catch(e){ alert('Erro ao salvar: '+e.message) }
  });

  removeBtn.addEventListener('click', () => {
    // reset para placeholder
    preview.src = 'imagens/Group (1).png';
    nomeField.value = '';
    localStorage.removeItem('perfil:data');
  });
});
