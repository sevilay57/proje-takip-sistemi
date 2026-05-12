const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

function hideAllSections() {
  document.getElementById("dashboard-cards").style.display = "none";
  document.getElementById("project-form").style.display = "none";
  document.getElementById("project-list").innerHTML = "";

  document.getElementById("personnel-section").style.display = "none";
  document.getElementById("material-section").style.display = "none";
  document.getElementById("company-section").style.display = "none";
  document.getElementById("offer-section").style.display = "none";
  document.getElementById("supplier-section").style.display = "none";
  document.getElementById("settings-section").style.display = "none";
  document.getElementById("reports-section").style.display = "none";
}

/* DASHBOARD */

function showDashboard() {
  localStorage.setItem("activeSection", "dashboard");

  hideAllSections();

  document.getElementById("dashboard-cards").style.display = "block";

  loadDashboardStats();
}

async function loadDashboardStats() {
  const projectResponse = await fetch("http://https://proje-takip-sistemi-1.onrender.com/api/projects", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const personnelResponse = await fetch("http://https://proje-takip-sistemi-1.onrender.com/api/personnel", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const offerResponse = await fetch("http://https://proje-takip-sistemi-1.onrender.com/api/offers", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const projects = await projectResponse.json();
  const personnels = await personnelResponse.json();
  const offers = await offerResponse.json();

  const pendingOffers = offers.filter((offer) => offer.status === "Beklemede");

  document.getElementById("total-projects").innerText = projects.length;
  document.getElementById("total-personnel").innerText = personnels.length;
  document.getElementById("total-offers").innerText = pendingOffers.length;
  const activeProjects = projects.filter(
  (project) => getProjectStatus(project.endDate) === "Devam Ediyor"
).length;

const projectPercent = projects.length > 0
  ? Math.round((activeProjects / projects.length) * 100)
  : 0;

document.getElementById("project-progress-bar").style.width =
  projectPercent + "%";

document.getElementById("project-progress-text").innerText =
  `${activeProjects} / ${projects.length} proje devam ediyor`;

const approvedOffers = offers.filter(
  (offer) => offer.status === "Onaylandı"
).length;

const offerPercent = offers.length > 0
  ? Math.round((approvedOffers / offers.length) * 100)
  : 0;

document.getElementById("offer-progress-bar").style.width =
  offerPercent + "%";

document.getElementById("offer-progress-text").innerText =
  `${approvedOffers} / ${offers.length} teklif onaylandı`;
}

/* PROJELER */

async function showProjects() {
  localStorage.setItem("activeSection", "projects");

  hideAllSections();

  document.getElementById("project-form").style.display = "block";

  const projectList = document.getElementById("project-list");

  const response = await fetch("http://https://proje-takip-sistemi-1.onrender.com/api/projects", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const projects = await response.json();

  projectList.innerHTML = "<h2>Projeler</h2>";

  projects.forEach((project) => {
    projectList.innerHTML += `
      <div class="project-card ${getProjectClass(project.endDate)}">
        <h3>${project.title}</h3>

        <p>${project.description}</p>

        <p><strong>Başlangıç:</strong> ${project.startDate || "-"}</p>
        <p><strong>Bitiş:</strong> ${project.endDate || "-"}</p>

        <span>${getProjectStatus(project.endDate)}</span>

        <br><br>

        <button type="button" onclick="deleteProject(${project.id})">
          Projeyi Sil
        </button>

        <hr>

        <select id="personnel-select-${project.id}">
          <option value="">Personel seç</option>
        </select>

        <button type="button" onclick="assignPersonnel(${project.id}, event)">
          Personel Ata
        </button>

        <div id="assigned-personnel-${project.id}"></div>
        <hr>

<select id="material-select-${project.id}">
  <option value="">Malzeme seç</option>
</select>

<input
  type="number"
  id="material-quantity-${project.id}"
  placeholder="Kullanılacak miktar"
/>

<button type="button" onclick="addMaterialToProject(${project.id}, event)">
  Malzeme Kullan
</button>

<div id="used-materials-${project.id}"></div>
      </div>
    `;

    loadPersonnelOptions(project.id);
    loadAssignedPersonnel(project.id);
    loadMaterialOptions(project.id);
loadUsedMaterials(project.id);
  });
}

async function addProject() {
  const title = document.getElementById("project-title").value;
  const description = document.getElementById("project-description").value;
  const startDate = document.getElementById("project-start-date").value;
  const endDate = document.getElementById("project-end-date").value;
  const offerAmount = document.getElementById("project-offer-amount").value;

  await fetch("http://https://proje-takip-sistemi-1.onrender.com/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      title,
      description,
      startDate,
      endDate,
      offerAmount,
    }),
  });

  document.getElementById("project-title").value = "";
  document.getElementById("project-description").value = "";
  document.getElementById("project-start-date").value = "";
  document.getElementById("project-end-date").value = "";
  document.getElementById("project-offer-amount").value = "";

  await showProjects();
}

async function deleteProject(id) {
  await fetch(`http://https://proje-takip-sistemi-1.onrender.com/api/projects/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  await showProjects();
}

function getProjectStatus(endDate) {
  if (!endDate) return "Devam Ediyor";

  const today = new Date();
  const end = new Date(endDate);

  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Gecikti";
  if (diffDays <= 7) return "Yaklaşıyor";

  return "Devam Ediyor";
}

function getProjectClass(endDate) {
  const status = getProjectStatus(endDate);

  if (status === "Gecikti") return "project-late";
  if (status === "Yaklaşıyor") return "project-warning";

  return "project-normal";
}

/* PERSONELLER */

async function showPersonnel() {
  localStorage.setItem("activeSection", "personnel");

  hideAllSections();

  document.getElementById("personnel-section").style.display = "block";

  const response = await fetch("http://https://proje-takip-sistemi-1.onrender.com/api/personnel", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const personnels = await response.json();
  const personnelList = document.getElementById("personnel-list");

  personnelList.innerHTML = "";

  personnels.forEach((personnel) => {
    personnelList.innerHTML += `
      <div class="personnel-card">
        <h3>${personnel.name}</h3>

        <p><strong>Meslek:</strong> ${personnel.department || "-"}</p>
        <p><strong>Departman:</strong> ${personnel.title || "-"}</p>
        <p><strong>Telefon:</strong> ${personnel.phone || "-"}</p>
        <p><strong>E-posta:</strong> ${personnel.email || "-"}</p>

        <button type="button" onclick="deletePersonnel(${personnel.id})">
          Personeli Sil
        </button>
      </div>
    `;
  });
}

async function addPersonnel() {
  const name = document.getElementById("personnel-name").value;
  const department = document.getElementById("personnel-department").value;
  const title = document.getElementById("personnel-title").value;
  const phone = document.getElementById("personnel-phone").value;
  const email = document.getElementById("personnel-email").value;

  await fetch("http://https://proje-takip-sistemi-1.onrender.com/api/personnel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      name,
      department,
      title,
      phone,
      email,
    }),
  });

  document.getElementById("personnel-name").value = "";
  document.getElementById("personnel-department").value = "";
  document.getElementById("personnel-title").value = "";
  document.getElementById("personnel-phone").value = "";
  document.getElementById("personnel-email").value = "";

  await showPersonnel();
}

async function deletePersonnel(id) {
  await fetch(`http://https://proje-takip-sistemi-1.onrender.com/api/personnel/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  await showPersonnel();
}

/* PROJE PERSONEL ATAMA */

async function loadPersonnelOptions(projectId) {
  const response = await fetch("http://https://proje-takip-sistemi-1.onrender.com/api/personnel", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const personnels = await response.json();
  const select = document.getElementById(`personnel-select-${projectId}`);

  select.innerHTML = `<option value="">Personel seç</option>`;

  personnels.forEach((personnel) => {
    select.innerHTML += `
      <option value="${personnel.id}">
        ${personnel.name}
      </option>
    `;
  });
}

async function assignPersonnel(projectId, event) {
  if (event) event.preventDefault();

  const select = document.getElementById(`personnel-select-${projectId}`);
  const personnelId = select.value;

  if (!personnelId) {
    alert("Lütfen personel seç");
    return;
  }

  await fetch("http://https://proje-takip-sistemi-1.onrender.com/api/assignments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      projectId,
      personnelId,
    }),
  });

  select.value = "";

  await loadAssignedPersonnel(projectId);
}

async function loadAssignedPersonnel(projectId) {
  const response = await fetch(`http://https://proje-takip-sistemi-1.onrender.com/api/assignments/${projectId}`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const personnels = await response.json();
  const assignedDiv = document.getElementById(`assigned-personnel-${projectId}`);

  assignedDiv.innerHTML = "<h4>Atanan Personeller</h4>";

  if (personnels.length === 0) {
    assignedDiv.innerHTML += "<p>Henüz personel atanmadı.</p>";
    return;
  }

  personnels.forEach((personnel) => {
    assignedDiv.innerHTML += `
      <div class="assigned-personnel">
        <span>${personnel.name}</span>

        <button type="button" onclick="removePersonnelFromProject(${projectId}, ${personnel.id}, event)">
          Kaldır
        </button>
      </div>
    `;
  });
}

async function removePersonnelFromProject(projectId, personnelId, event) {
  if (event) event.preventDefault();

  await fetch(`http://https://proje-takip-sistemi-1.onrender.com/api/assignments/${projectId}/${personnelId}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  await loadAssignedPersonnel(projectId);
}

/* STOK */

async function showMaterials() {
  localStorage.setItem("activeSection", "materials");

  hideAllSections();

  document.getElementById("material-section").style.display = "block";

  await loadSupplierOptions();
  await loadMaterials();
}

async function loadMaterials() {
  const response = await fetch("http://https://proje-takip-sistemi-1.onrender.com/api/materials", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const materials = await response.json();
  const materialList = document.getElementById("material-list");

  materialList.innerHTML = "";

  materials.forEach((material) => {
    materialList.innerHTML += `
      <div class="material-card">
        <h3>${material.name}</h3>

        <p><strong>Miktar:</strong> ${material.quantity}</p>
        <p><strong>Birim:</strong> ${material.unit}</p>
        <p><strong>Birim Fiyat:</strong> ${material.unitPrice} ₺</p>
        <p><strong>Toplam:</strong> ${material.quantity * material.unitPrice} ₺</p>

        <button type="button" onclick="deleteMaterial(${material.id}, event)">
          Malzeme Sil
        </button>
      </div>
    `;
  });
}

async function addMaterial(event) {
  if (event) event.preventDefault();

  localStorage.setItem("activeSection", "materials");

  const name = document.getElementById("material-name").value;
  const quantity = document.getElementById("material-quantity").value;
  const unit = document.getElementById("material-unit").value;
  const unitPrice = document.getElementById("material-price").value;
  const supplierId = document.getElementById("material-supplier").value;

  await fetch("http://https://proje-takip-sistemi-1.onrender.com/api/materials", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      name,
      quantity,
      unit,
      unitPrice,
      supplierId,
    }),
  });

  document.getElementById("material-name").value = "";
  document.getElementById("material-quantity").value = "";
  document.getElementById("material-unit").value = "";
  document.getElementById("material-price").value = "";
  document.getElementById("material-supplier").value = "";

  document.getElementById("material-section").style.display = "block";

  await loadSupplierOptions();
  await loadMaterials();
}

async function deleteMaterial(id, event) {
  if (event) event.preventDefault();

  localStorage.setItem("activeSection", "materials");

  await fetch(`http://https://proje-takip-sistemi-1.onrender.com/api/materials/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  document.getElementById("material-section").style.display = "block";

  await loadMaterials();
}

async function loadSupplierOptions() {
  const response = await fetch("http://https://proje-takip-sistemi-1.onrender.com/api/suppliers", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const suppliers = await response.json();
  const select = document.getElementById("material-supplier");

  select.innerHTML = `<option value="">Tedarikçi seç</option>`;

  suppliers.forEach((supplier) => {
    select.innerHTML += `
      <option value="${supplier.id}">
        ${supplier.name}
      </option>
    `;
  });
}

/* CARİLER */

async function showCompanies() {
  localStorage.setItem("activeSection", "companies");

  hideAllSections();

  document.getElementById("company-section").style.display = "block";

  const response = await fetch("http://https://proje-takip-sistemi-1.onrender.com/api/companies", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const companies = await response.json();
  const companyList = document.getElementById("company-list");

  companyList.innerHTML = "";

  companies.forEach((company) => {
    companyList.innerHTML += `
      <div class="company-card">
        <h3>${company.name}</h3>

        <p><strong>Telefon:</strong> ${company.phone || "-"}</p>
        <p><strong>E-posta:</strong> ${company.email || "-"}</p>
        <p><strong>Adres:</strong> ${company.address || "-"}</p>

        <button type="button" onclick="deleteCompany(${company.id})">
          Firmayı Sil
        </button>
      </div>
    `;
  });
}

async function addCompany() {
  const name = document.getElementById("company-name").value;
  const phone = document.getElementById("company-phone").value;
  const email = document.getElementById("company-email").value;
  const address = document.getElementById("company-address").value;

  await fetch("http://https://proje-takip-sistemi-1.onrender.com/api/companies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      name,
      phone,
      email,
      address,
    }),
  });

  document.getElementById("company-name").value = "";
  document.getElementById("company-phone").value = "";
  document.getElementById("company-email").value = "";
  document.getElementById("company-address").value = "";

  await showCompanies();
}

async function deleteCompany(id) {
  await fetch(`http://https://proje-takip-sistemi-1.onrender.com/api/companies/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  await showCompanies();
}

/* TEKLİFLER */

async function showOffers() {
  localStorage.setItem("activeSection", "offers");

  hideAllSections();

  document.getElementById("offer-section").style.display = "block";

  await loadCompanyOptions();

  const response = await fetch("http://https://proje-takip-sistemi-1.onrender.com/api/offers", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const offers = await response.json();
  const offerList = document.getElementById("offer-list");

  offerList.innerHTML = "";

  offers.forEach((offer) => {
    offerList.innerHTML += `
      <div class="offer-card">
        <h3>${offer.title}</h3>

        <p><strong>Firma:</strong> ${offer.Company ? offer.Company.name : offer.companyId}</p>
        <p><strong>Tutar:</strong> ${offer.amount} ₺</p>
        <p><strong>Durum:</strong> ${offer.status}</p>

        <button type="button" onclick="approveOffer(${offer.id})">Onayla</button>
        <button type="button" onclick="rejectOffer(${offer.id})">Reddet</button>
        <button type="button" onclick="createProjectFromOffer(${offer.id})">Projeye Dönüştür</button>
        <button type="button" onclick="deleteOffer(${offer.id})">Sil</button>
        <button type="button" onclick="printOffer(${offer.id})">
  PDF Oluştur
</button>
        <hr>

<input
  type="text"
  id="offer-item-name-${offer.id}"
  placeholder="Ürün / Hizmet Adı"
/>

<input
  type="number"
  id="offer-item-quantity-${offer.id}"
  placeholder="Adet"
/>

<input
  type="number"
  id="offer-item-price-${offer.id}"
  placeholder="Birim Fiyat"
/>

<button type="button" onclick="addOfferItem(${offer.id}, event)">
  Kalem Ekle
</button>

<div id="offer-items-${offer.id}"></div>
      </div>
        `;

    loadOfferItems(offer.id);
  });
}

async function loadCompanyOptions() {
  const response = await fetch("http://https://proje-takip-sistemi-1.onrender.com/api/companies", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const companies = await response.json();
  const select = document.getElementById("offer-company");

  select.innerHTML = "";

  companies.forEach((company) => {
    select.innerHTML += `
      <option value="${company.id}">
        ${company.name}
      </option>
    `;
  });
}

async function addOffer() {
  const title = document.getElementById("offer-title").value;
  const companyId = document.getElementById("offer-company").value;
  const amount = document.getElementById("offer-amount").value;

  await fetch("http://https://proje-takip-sistemi-1.onrender.com/api/offers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      title,
      companyId,
      amount,
    }),
  });

  document.getElementById("offer-title").value = "";
  document.getElementById("offer-amount").value = "";

  await showOffers();
}

async function approveOffer(id) {
  await fetch(`http://https://proje-takip-sistemi-1.onrender.com/api/offers/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      status: "Onaylandı",
    }),
  });

  await showOffers();
}

async function rejectOffer(id) {
  await fetch(`http://https://proje-takip-sistemi-1.onrender.com/api/offers/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      status: "Reddedildi",
    }),
  });

  await showOffers();
}

async function createProjectFromOffer(id) {
  await fetch(`http://https://proje-takip-sistemi-1.onrender.com/api/offers/${id}/create-project`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  alert("Teklif projeye dönüştürüldü");

  await showOffers();
}

async function deleteOffer(id) {
  await fetch(`http://https://proje-takip-sistemi-1.onrender.com/api/offers/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  await showOffers();
}

/* TEDARİKÇİLER */

async function showSuppliers() {
  localStorage.setItem("activeSection", "suppliers");

  hideAllSections();

  document.getElementById("supplier-section").style.display = "block";

  const response = await fetch("http://https://proje-takip-sistemi-1.onrender.com/api/suppliers", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const suppliers = await response.json();
  const supplierList = document.getElementById("supplier-list");

  supplierList.innerHTML = "";

  suppliers.forEach((supplier) => {
    supplierList.innerHTML += `
      <div class="supplier-card">
        <h3>${supplier.name}</h3>

        <p><strong>Telefon:</strong> ${supplier.phone || "-"}</p>
        <p><strong>E-posta:</strong> ${supplier.email || "-"}</p>
        <p><strong>Adres:</strong> ${supplier.address || "-"}</p>

        <button type="button" onclick="deleteSupplier(${supplier.id})">
          Tedarikçi Sil
        </button>
      </div>
    `;
  });
}

async function addSupplier() {
  const name = document.getElementById("supplier-name").value;
  const phone = document.getElementById("supplier-phone").value;
  const email = document.getElementById("supplier-email").value;
  const address = document.getElementById("supplier-address").value;

  await fetch("http://https://proje-takip-sistemi-1.onrender.com/api/suppliers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      name,
      phone,
      email,
      address,
    }),
  });

  document.getElementById("supplier-name").value = "";
  document.getElementById("supplier-phone").value = "";
  document.getElementById("supplier-email").value = "";
  document.getElementById("supplier-address").value = "";

  await showSuppliers();
}

async function deleteSupplier(id) {
  await fetch(`http://https://proje-takip-sistemi-1.onrender.com/api/suppliers/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  await showSuppliers();
}

/* SAYFA YÜKLENİNCE */

window.addEventListener("load", () => {
  loadDashboardStats();

  const activeSection = localStorage.getItem("activeSection");

  if (!activeSection || activeSection === "dashboard") {
    showDashboard();
  }

  if (activeSection === "projects") {
    showProjects();
  }

  if (activeSection === "personnel") {
    showPersonnel();
  }

  if (activeSection === "materials") {
    showMaterials();
  }

  if (activeSection === "companies") {
    showCompanies();
  }

  if (activeSection === "offers") {
    showOffers();
  }

  if (activeSection === "suppliers") {
    showSuppliers();
  }
 if (activeSection === "reports") {
  showReports();
}
});
/* =========================
   PROJE MALZEME KULLANIMI
========================= */

async function loadMaterialOptions(projectId) {

  const response = await fetch(
    "http://https://proje-takip-sistemi-1.onrender.com/api/materials",
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  const materials = await response.json();

  const select = document.getElementById(
    `material-select-${projectId}`
  );

  select.innerHTML = `
    <option value="">Malzeme seç</option>
  `;

  materials.forEach((material) => {

    select.innerHTML += `
      <option value="${material.id}">
        ${material.name} (${material.quantity})
      </option>
    `;

  });

}

async function addMaterialToProject(projectId, event) {

  if (event) {
    event.preventDefault();
  }

  const materialId = document.getElementById(
    `material-select-${projectId}`
  ).value;

  const quantityUsed = document.getElementById(
    `material-quantity-${projectId}`
  ).value;

  if (!materialId || !quantityUsed) {
    alert("Malzeme ve miktar gir");
    return;
  }

  const response = await fetch(
    "http://https://proje-takip-sistemi-1.onrender.com/api/project-materials",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },

      body: JSON.stringify({
        projectId,
        materialId,
        quantityUsed,
      }),

    }
  );

  const data = await response.json();

  if (data.message === "Stok miktarı yetersiz") {
    alert("Yetersiz stok");
    return;
  }

  document.getElementById(
    `material-quantity-${projectId}`
  ).value = "";

  await loadUsedMaterials(projectId);

  await loadMaterialOptions(projectId);

}

async function loadUsedMaterials(projectId) {

  const response = await fetch(
    `http://https://proje-takip-sistemi-1.onrender.com/api/project-materials/${projectId}`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  const materials = await response.json();

  const div = document.getElementById(
    `used-materials-${projectId}`
  );

  div.innerHTML = `
    <h4>Kullanılan Malzemeler</h4>
  `;

  let totalCost = 0;

  materials.forEach((material) => {

    totalCost += material.totalCost;

    div.innerHTML += `
      <div class="used-material-item">

        <p>
          Malzeme:
${material.Material ? material.Material.name : material.materialId}
        </p>

        <p>
          Kullanılan:
          ${material.quantityUsed}
        </p>

        <p>
          Maliyet:
          ${material.totalCost} ₺
        </p>

        <hr>

      </div>
    `;

  });

 const projectResponse = await fetch(
  "http://https://proje-takip-sistemi-1.onrender.com/api/projects",
  {
    headers: {
      Authorization: "Bearer " + token,
    },
  }
);

const projects = await projectResponse.json();

const currentProject = projects.find(
  (p) => p.id == projectId
);

const offerAmount = currentProject
  ? currentProject.offerAmount
  : 0;

const difference = totalCost - offerAmount;

div.innerHTML += `
  <h3>
    Teklif Tutarı:
    ${offerAmount} ₺
  </h3>

  <h3>
    Gerçek Maliyet:
    ${totalCost} ₺
  </h3>

  <h3 style="
  color: ${difference > 0 ? '#ef4444' : '#22c55e'};
">
  Fark:
  ${difference} ₺
</h3>
`;
}
async function addOfferItem(offerId, event) {
  if (event) event.preventDefault();

  const productName = document.getElementById(`offer-item-name-${offerId}`).value;
  const quantity = document.getElementById(`offer-item-quantity-${offerId}`).value;
  const unitPrice = document.getElementById(`offer-item-price-${offerId}`).value;

  if (!productName || !quantity || !unitPrice) {
    alert("Ürün adı, adet ve birim fiyat gir");
    return;
  }

  await fetch("http://https://proje-takip-sistemi-1.onrender.com/api/offer-items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      offerId,
      productName,
      quantity,
      unitPrice,
    }),
  });

  document.getElementById(`offer-item-name-${offerId}`).value = "";
  document.getElementById(`offer-item-quantity-${offerId}`).value = "";
  document.getElementById(`offer-item-price-${offerId}`).value = "";

  await loadOfferItems(offerId);
}

async function loadOfferItems(offerId) {
  const response = await fetch(`http://https://proje-takip-sistemi-1.onrender.com/api/offer-items/${offerId}`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const items = await response.json();
  const div = document.getElementById(`offer-items-${offerId}`);

  div.innerHTML = "<h4>Teklif Kalemleri</h4>";

  let total = 0;

  items.forEach((item) => {
    total += item.totalPrice;

    div.innerHTML += `
      <div class="offer-item-card">
        <p><strong>Ürün/Hizmet:</strong> ${item.productName}</p>
        <p><strong>Adet:</strong> ${item.quantity}</p>
        <p><strong>Birim Fiyat:</strong> ${item.unitPrice} ₺</p>
        <p><strong>Toplam:</strong> ${item.totalPrice} ₺</p>
        <hr>
      </div>
    `;
  });

  div.innerHTML += `<h3>Genel Teklif Toplamı: ${total} ₺</h3>`;
}
function filterProjects() {
  const searchValue = document
    .getElementById("project-search")
    .value
    .toLowerCase();

  const cards = document.querySelectorAll(".project-card");

  cards.forEach((card) => {
    const text = card.innerText.toLowerCase();

    if (text.includes(searchValue)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}
function printOffer(offerId) {
  const offerCard = document
    .querySelector(`#offer-items-${offerId}`)
    .closest(".offer-card");

  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
    <html>
      <head>
        <title>Teklif PDF</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
          }

          h1, h2, h3 {
            color: #111827;
          }

          .offer-card {
            border: 1px solid #ddd;
            padding: 25px;
            border-radius: 12px;
          }

          button, input, select {
            display: none;
          }

          p {
            font-size: 15px;
          }
        </style>
      </head>
      <body>
        <h1>Proje Takip Sistemi</h1>
        <h2>Teklif Formu</h2>

        ${offerCard.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
}
/* AYARLAR */

async function showSettings() {

  localStorage.setItem("activeSection", "settings");

  hideAllSections();

  document.getElementById("settings-section").style.display = "block";

  const response = await fetch(
    "http://https://proje-takip-sistemi-1.onrender.com/api/users",
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  const users = await response.json();

  const userList = document.getElementById("user-list");

  userList.innerHTML = "";

  users.forEach((user) => {

    userList.innerHTML += `
      <div class="user-card">

        <h3>${user.name}</h3>

        <p>
          <strong>E-posta:</strong>
          ${user.email}
        </p>

        <p>
          <strong>Rol:</strong>
          ${user.role}
        </p>

      </div>
    `;

  });

}
/* RAPORLAR */

async function showReports() {

  localStorage.setItem("activeSection", "reports");

  hideAllSections();

  document.getElementById("reports-section").style.display = "block";

  const projectResponse = await fetch(
    "http://https://proje-takip-sistemi-1.onrender.com/api/projects",
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  const materialResponse = await fetch(
    "http://https://proje-takip-sistemi-1.onrender.com/api/materials",
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  const offerResponse = await fetch(
    "http://https://proje-takip-sistemi-1.onrender.com/api/offers",
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  const projects = await projectResponse.json();
  const materials = await materialResponse.json();
  const offers = await offerResponse.json();

  let stockValue = 0;

  materials.forEach((material) => {
    stockValue += material.quantity * material.unitPrice;
  });

  let offerValue = 0;

  offers.forEach((offer) => {
    offerValue += Number(offer.amount);
  });

  document.getElementById("report-stock-value").innerText =
    stockValue + " ₺";

  document.getElementById("report-offer-value").innerText =
    offerValue + " ₺";

  document.getElementById("report-project-count").innerText =
    projects.length;
}