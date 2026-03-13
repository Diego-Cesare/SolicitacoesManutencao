// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import {
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD1yJJ_xP7mxCvzpSnrbfNISmFugMcQvLA",
  authDomain: "smectmanutencao-16c2e.firebaseapp.com",
  projectId: "smectmanutencao-16c2e",
  storageBucket: "smectmanutencao-16c2e.firebasestorage.app",
  messagingSenderId: "252078232955",
  appId: "1:252078232955:web:117bfeaa588130c04259de",
  measurementId: "G-XMJ0QXDS1P",
};

// Inicializa Firebase
let db = null;
let firebaseInitError = null;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  firebaseInitError = error;
  console.error("Falha ao inicializar Firebase:", error);
}

// Aguarda DOM carregar
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formulario");
  // const unitSelectEl = document.getElementById("unit-select");
  const typeSelectEl = document.getElementById("type-select");

  const modalEl = document.getElementById("result-modal");
  const modalContentEl = document.getElementById("modal-content");
  const modalTitleEl = document.getElementById("modal-title");
  const modalMessageEl = document.getElementById("modal-message");
  const modalCloseBtn = document.getElementById("modal-close-btn");

  const hasModal =
    modalEl &&
    modalContentEl &&
    modalTitleEl &&
    modalMessageEl &&
    modalCloseBtn;

  console.log("APP carregado");
  console.log("Form encontrado:", form);

  // ---------- LISTAS ----------
  const types = [
    "Alvenaria",
    "Capina",
    "Carpintaria",
    "Decoração",
    "Elétrica",
    "Esgoto",
    "Hidráulica",
    "Internet",
    "Limpeza",
    "Marcenaria",
    "Mudança",
    "Pintura",
    "Poda de Árvores",
    "Roçada",
    "Transporte",
  ];

  // Preenche select de tipos
  types.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    typeSelectEl.appendChild(option);
  });

  // ---------- MODAL ----------
  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.add("hidden");
    modalEl.setAttribute("aria-hidden", "true");
  }

  function openModal({ title, message, type }) {
    if (!hasModal) {
      alert(title + "\n\n" + message);
      return;
    }

    modalTitleEl.textContent = title;
    modalMessageEl.textContent = message;

    modalContentEl.classList.remove("success", "error");
    modalContentEl.classList.add(type);

    modalEl.classList.remove("hidden");
    modalEl.setAttribute("aria-hidden", "false");
  }

  if (hasModal) {
    modalCloseBtn.addEventListener("click", closeModal);

    modalEl.addEventListener("click", (event) => {
      if (event.target.hasAttribute("data-close-modal")) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    });
  }

  // ---------- GERAR PAYLOAD ----------
  function buildRegistroPayload(formEl) {
    const formData = new FormData(formEl);
    const nowIso = new Date().toISOString();

    return {
      requerente: formData.get("unidade")?.toString().trim() || "",
      // equipe: formData.get("equipe")?.toString().trim() || "",
      assunto: formData.get("tipo")?.toString().trim() || "",
      sobre: formData.get("descricao")?.toString().trim() || "",
      horaPedido: nowIso,
      pedidoCriado: nowIso,
    };
  }

  // ---------- SUBMIT ----------
  if (!form) {
    console.error("Formulário não encontrado.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("Submit disparado");

    if (!db || firebaseInitError) {
      openModal({
        title: "Erro",
        message: "Falha ao conectar ao banco.",
        type: "error",
      });
      return;
    }

    const dados = buildRegistroPayload(form);

    // 🔎 VALIDAÇÃO
    if (!dados.requerente || !dados.assunto) {
      openModal({
        title: "Campos obrigatórios",
        message: "Preencha Unidade e Tipo antes de enviar.",
        type: "error",
      });
      return;
    }

    try {
      console.log("Enviando dados:", dados);

      const docRef = await addDoc(collection(db, "registros"), dados);

      console.log("Registro salvo:", docRef.id);

      openModal({
        title: "Envio concluído",
        message: "Registro salvo com sucesso.",
        type: "success",
      });

      form.reset();
    } catch (erro) {
      console.error("Erro ao salvar:", erro);

      openModal({
        title: "Falha no envio",
        message: "Não foi possível salvar o registro.",
        type: "error",
      });
    }
  });
});
