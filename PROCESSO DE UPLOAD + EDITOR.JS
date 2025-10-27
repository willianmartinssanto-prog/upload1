<!-- Script Upload Box v11.2 -->
<script>
document.addEventListener("DOMContentLoaded", function () {

  if (window.uploadBoxInitialized) return;
  window.uploadBoxInitialized = true;

  // Util: aguarda um seletor aparecer no DOM
  function waitForElement(selector, callback) {
    const el = document.querySelector(selector);
    if (el) { callback(el); }
    else {
      const observer = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) { observer.disconnect(); callback(el); }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  // Normaliza texto: remove acentos, pontuação e espaços extras
  function normalizeKey(nome) {
    return nome
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")   // remove acentos
      .replace(/[^a-zA-Z0-9\s]/g, "")    // remove pontuação/símbolos
      .trim()
      .replace(/\s+/g, "_")              // espaços -> underscore
      .toLowerCase();
  }

  // >>> LISTA DE EXCLUSÃO (como você já tinha)
  const excludedProducts = [
    "capa em tecido para q30 box truss com velcro",
    "Capas para Boxtruss fechadas s/ velcro três faces",
    "Kit com 10 Colete para para promotor de marca e produto",
    "Kit c/ 10 coletes para Staff, Apoio ou segurança de evento",
    "Laço 40 cm Para Inauguração Com Faixa de 3m",
    "Camisa para Staff Personalizadas",
    "Camisa para segurança Personalizadas",
    "kit c/ 10 colete para repositor ou treinamento p/ supermercado",
    "kit c/ 10 coletes para staff ou segurança de evento",
    "Capa tipo envelope em tecido elástico suplex para mesa Pranchão",
    "Capas para Boxtruss fechadas s/ velcro",
    "laço gigante para showroom – destaque perfeito para exposição de veículos",
    "laço gigante com faixa para showroom – destaque perfeito para exposição de veículos",
    "capa cadeira preferencial kit c/ 10 capas de cadeira",
    "kit 10 capas assento preferencial vários tamanhos",
    "kit c/ 4 capa para cabeceira de poltronas ônibus na cor amarela - assento preferencial",
    "cortinas para indivualização de poltronas em ônibus",
    "cortinas para onibus, micro-onibus, vans",
    "corturas para onibus, micro-onibus, vans - vermelhas saída de emergência",
    "capa para assento de ônibus - várias cores",
    "Capa em tecido para Q15 box truss com velcro",
    "Capa em tecido para Q25 box truss com velcro",
    "Toalhas de mesa Tecido Oxford 300x300cm",
    "Kit c/ 10 Toalhas de mesa Tecido Oxford 200x145cm",
    "Kit c/ 10 Toalhas de mesa Tecido Oxford 150x145cm",
    "capa de carro para showroom e eventos sem personalização",
    "capa para grade de isolamento para eventos - lisas"
  ];

  // >>> NORMALIZA a lista de exclusão UMA VEZ
  const excludedNormalized = excludedProducts.map(normalizeKey);

  // Espera o título do produto (ajuste o seletor se necessário)
  waitForElement(".nome-produto.titulo.cor-secundaria", function (productNameEl) {
    const rawProductName = productNameEl.textContent || "";
    const productName = rawProductName.trim();
    const normalizedName = normalizeKey(productName);

    // DEBUG opcional
    console.debug("[Upload Box] Produto:", productName, "-> key:", normalizedName);

    // >>> AQUI ESTÁ A CORREÇÃO: compara usando a versão normalizada
    if (excludedNormalized.includes(normalizedName)) {
      console.debug("[Upload Box] Bloqueado por lista de exclusão.");
      return; // não injeta nada nesta página
    }

    const storageKey = "uploadedFile_" + normalizedName;

    // Cria o bloco
    const uploadBox = document.createElement("div");
    uploadBox.classList.add("upload-box");
    uploadBox.innerHTML = `
      <!-- Primeiro Card (Upload) -->
      <div id="uploadStep" class="upload-step">
        <h4 class="upload-title">Envie sua arte</h4>
        <p class="upload-subtitle">Dúvidas no envio da arte?
          <a href="https://www.mdecoracoes.com.br/pagina/duvidas-no-envio-das-artes.html" target="_blank" rel="noopener">Consulte o manual</a>.
        </p>
        <div class="upload-actions">
          <label for="fileInput" class="custom-file-label">☁️ Upload de arquivo</label>
          <input type="file" id="fileInput" accept=".png,.jpg,.jpeg,.pdf" />
          <button id="uploadBtn" class="primary-btn">Enviar arquivo</button>
        </div>
        <div id="fileName" class="file-name"></div>
        <div id="uploadStatus"></div>
      </div>

      <!-- Segundo Card (Sucesso + Prévia) -->
      <div id="successStep" class="success-step" style="display:none;">
        <div class="success-banner">✅ Sua personalização foi aplicada!
          <span class="subtext">Agora você pode revisar, editar ou trocar a logo antes de finalizar sua compra.</span>
        </div>

        <div class="preview-actions">
          <div class="preview-area">
            <h4 class="preview-title">Prévia do seu produto</h4>
            <div id="previewThumb" class="preview-thumb"></div>
            <button id="viewMockupBtn" class="view-btn">🔍 Ver maior</button>
          </div>

          <div class="actions-col">
            <button id="changeBtn">Trocar arquivo</button>
            <button id="openEditorBtn" class="solid-editor"
              title="Versão Beta: Nosso sistema de edição e criação de mockup está em processo de desenvolvimento, pode ocorrer limitações ou erros durante o processo de edição.">🎨 Abrir Editor</button>
          </div>
        </div>
      </div>
    `;

    // Insere após o título do produto
    productNameEl.insertAdjacentElement("afterend", uploadBox);

    const fileInput = uploadBox.querySelector("#fileInput");
    const uploadBtn = uploadBox.querySelector("#uploadBtn");
    const successStep = uploadBox.querySelector("#successStep");
    const uploadStep = uploadBox.querySelector("#uploadStep");
    const previewThumb = uploadBox.querySelector("#previewThumb");
    const viewMockupBtn = uploadBox.querySelector("#viewMockupBtn");
    const changeBtn = uploadBox.querySelector("#changeBtn");
    const openEditorBtn = uploadBox.querySelector("#openEditorBtn");
    const fileName = uploadBox.querySelector("#fileName");

    // Restaura se já tiver arquivo salvo
    const savedFile = localStorage.getItem(storageKey);
    if (savedFile) showPreview(savedFile);

    fileInput.addEventListener("change", function () {
      fileName.textContent = fileInput.files.length ? `📎 Arquivo selecionado: ${fileInput.files[0].name}` : "";
    });

    uploadBtn.addEventListener("click", function () {
      if (!fileInput.files.length) { alert("Por favor, selecione um arquivo antes de enviar."); return; }

      const file = fileInput.files[0];
      uploadStep.style.display = "none";
      successStep.style.display = "block";

      const reader = new FileReader();
      reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width * 2;
          canvas.height = img.height * 2;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(function (blobUpscaled) {
            const cloudName = "dckwn4y2a";
            const uploadPreset = "mdecoracoes";

            const formData = new FormData();
            formData.append("file", blobUpscaled, "arte-upscalada.png");
            formData.append("upload_preset", uploadPreset);

            fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData })
              .then(async res => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.error?.message || "Erro desconhecido");
                localStorage.setItem(storageKey, data.secure_url);
                showPreview(data.secure_url);
              })
              .catch(err => {
                console.error("❌ Erro ao enviar para Cloudinary:", err);
                previewThumb.innerHTML = "⚠️ Erro no envio da arte.";
              });
          }, "image/png", 1.0);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });

    changeBtn.addEventListener("click", function () {
      localStorage.removeItem(storageKey);
      successStep.style.display = "none";
      uploadStep.style.display = "block";
      fileInput.value = "";
      previewThumb.innerHTML = "";
      fileName.textContent = "";
    });

    openEditorBtn.addEventListener("click", function () {
      const savedFile = localStorage.getItem(storageKey);
      if (!savedFile) { alert("⚠️ Nenhum arquivo enviado ainda."); return; }
      // função externa presumida
      if (typeof abrirMockupPopup === "function") {
        abrirMockupPopup(savedFile, storageKey);
      } else {
        alert("Editor indisponível no momento.");
      }
    });

    viewMockupBtn.addEventListener("click", function () {
      const savedFile = localStorage.getItem(storageKey);
      if (savedFile) window.open(savedFile, "_blank");
    });

    function showPreview(savedFile) {
      // mostra estado de carregamento imediatamente
      uploadStep.style.display = "none";
      successStep.style.display = "block";
      previewThumb.innerHTML = `<div class="preview-loading">⏳ Carregando prévia…</div>`;

      // resolve a URL a exibir (aceita string JSON ou URL)
      let fileToShow = savedFile;
      try {
        const obj = JSON.parse(savedFile);
        fileToShow = obj.mockup || obj.logo || savedFile;
      } catch { /* mantém savedFile */ }

      // pré-carrega a imagem e só depois injeta no DOM
      const img = new Image();
      img.onload = function () {
        previewThumb.innerHTML = "";
        previewThumb.appendChild(img);
      };
      img.onerror = function () {
        previewThumb.innerHTML = `⚠️ Falha ao carregar a prévia.`;
      };
      img.alt = "Prévia";
      img.style.maxWidth = "100%";
      img.style.maxHeight = "100%";
      img.style.objectFit = "contain";
      img.src = fileToShow;
    }

    /* ============================
       >>> Escuta o evento do editor
       Atualiza a prévia assim que o mockup é salvo no popup (sem recarregar a página)
       ============================ */
    window.addEventListener("MB_MOCKUP_SAVED", function (ev) {
      try {
        const data = ev.detail || {};
        if (!data || data.storageKey !== storageKey) return; // ignora eventos de outros produtos

        // Garante sincronização local (embora o editor já grave no localStorage)
        let obj;
        try { obj = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { obj = {}; }
        obj.mockup = data.url; // já vem com cache-busting
        localStorage.setItem(storageKey, JSON.stringify(obj));

        // Atualiza a prévia imediatamente (mostra "carregando" e troca ao onload)
        showPreview(JSON.stringify(obj));
      } catch (e) {
        // silencia erros para não quebrar a UX
        console.debug("[Upload Box] Evento MB_MOCKUP_SAVED ignorado:", e);
      }
    });

  });
});
</script>

<style>
.upload-box { background:#fff; border:1px solid #e0e0e0; border-radius:14px; padding:26px; margin-top:24px; box-shadow:0 6px 20px rgba(0,0,0,0.05); font-family:'Inter',sans-serif; max-width:550px; }

/* Primeiro Card */
.upload-title { font-size:1.3rem; font-weight:600; color:#0D1C2E; margin-bottom:6px; }
.upload-subtitle { font-size:0.92rem; color:#666; margin-bottom:22px; }
.upload-subtitle a { color:#6A1B9A; font-weight:500; text-decoration:none; }
.upload-subtitle a:hover { text-decoration:underline; }
.upload-actions { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
.custom-file-label,.primary-btn { flex:1; min-width:150px; height:48px; border-radius:10px; font-size:0.95rem; font-weight:500; cursor:pointer; transition:all 0.3s ease; display:flex; align-items:center; justify-content:center; text-align:center; box-sizing:border-box; line-height:1; }
.custom-file-label { border:2px solid #6A1B9A; color:#6A1B9A; background:#f9fdfb; }
.custom-file-label:hover { background:#f3e5f5; }
.primary-btn { background:#6A1B9A; border:none; color:#fff; }
.primary-btn:hover { background:#E91E63; }
#fileInput { display:none; }
.file-name { margin-top:8px; font-size:0.85rem; color:#444; }

/* Segundo Card */
.success-banner { background:#e6f7ed; color:#2e7d32; font-weight:600; padding:12px; border-radius:8px; margin-bottom:18px; text-align:center; border:1px solid #c8e6c9; }
.success-banner .subtext { display:block; font-weight:400; font-size:0.85rem; margin-top:4px; color:#388e3c; }

.preview-actions { display:flex; justify-content:space-between; align-items:center; gap:18px; flex-wrap:wrap; }
.preview-area { flex:2; text-align:center; }
.preview-title { font-size:1.1rem; font-weight:600; margin-bottom:8px; color:#0D1C2E; }
.preview-thumb { width:240px; height:180px; margin:0 auto; background:#fafafa; border:1px solid #ddd; border-radius:12px; display:flex; align-items:center; justify-content:center; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.08); }
.preview-thumb img { max-width:100%; max-height:100%; object-fit:contain; }
.view-btn { margin-top:8px; padding:6px 12px; border-radius:6px; border:1px solid #ccc; background:#f9f9f9; cursor:pointer; }
.view-btn:hover { background:#eee; }

.actions-col { flex:1; display:flex; flex-direction:column; gap:10px; }
#changeBtn { background:transparent; border:1.5px solid #6A1B9A; border-radius:10px; padding:9px 16px; cursor:pointer; font-size:0.9rem; font-weight:500; color:#6A1B9A; transition:all 0.3s ease; }
#changeBtn:hover { background:#f3e5f5; }
.solid-editor { background:#6A1B9A; color:#fff; border:none; border-radius:10px; padding:9px 16px; cursor:pointer; font-size:0.9rem; font-weight:500; transition:all 0.3s ease; }
.solid-editor:hover { background:#4a0072; }

/* Loader simples da prévia */
.preview-loading { font-size:0.95rem; color:#666; display:flex; align-items:center; gap:8px; }
.preview-loading::before { content:""; width:14px; height:14px; border:2px solid #bbb; border-top-color:#6A1B9A; border-radius:50%; display:inline-block; animation:spin .9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
