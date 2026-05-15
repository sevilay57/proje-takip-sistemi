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
  const projectResponse = await fetch("https://proje-takip-sistemi-3.onrender.com/api/projects", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const personnelResponse = await fetch("https://proje-takip-sistemi-3.onrender.com/api/personnel", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const offerResponse = await fetch("https://proje-takip-sistemi-3.onrender.com/api/offers", {
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
  document.getElementById("project-search").style.display = "block";

  const projectList = document.getElementById("project-list");

  const response = await fetch("https://proje-takip-sistemi-3.onrender.com/api/projects", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const projects = await response.json();

  projectList.innerHTML = "<h2>Projeler</h2>";

  projects.forEach((project) => {
    projectList.innerHTML += `
      <div class="category-box">

        <div class="category-header"
             onclick="toggleProjectBox('project-box-${project.id}')">

          <h2>${project.title}</h2>

        </div>

        <div
          class="category-materials"
          id="project-box-${project.id}"
          style="display:none;"
        >

          <div class="project-card ${getProjectClass(project.endDate)}">

            <p>${project.description}</p>

            <p><strong>Başlangıç:</strong> ${project.startDate || "-"}</p>
            <p><strong>Bitiş:</strong> ${project.endDate || "-"}</p>

            <span>${getProjectStatus(project.endDate)}</span>

            <br><br>

            <button type="button" onclick="deleteProject(${project.id})">
              Projeyi Sil
            </button>

            <hr>

          <button type="button" onclick="toggleProjectMiniBox('personnel-assign-box-${project.id}')">
  Personel Ata
</button>

<div
  id="personnel-assign-box-${project.id}"
  style="display:none; margin-top:10px;"
>
  <select id="personnel-select-${project.id}">
    <option value="">Personel seç</option>
  </select>

  <button type="button" onclick="assignPersonnel(${project.id}, event)">
    Onayla
  </button>
</div>

            <div class="project-mini-box"
                 onclick="toggleProjectMiniBox('personnel-box-${project.id}')">

              <h4>Atanan Personeller</h4>

              <div
                class="project-mini-content"
                id="personnel-box-${project.id}"
                style="display:none;"
              >
                <div id="assigned-personnel-${project.id}"></div>
              </div>

            </div>

            <hr>
<button type="button"
        onclick="toggleProjectMiniBox('material-use-box-${project.id}')">
  Malzeme Kullan
</button>

<div
  id="material-use-box-${project.id}"
  style="display:none; margin-top:10px;"
>

  <select id="material-select-${project.id}">
    <option value="">Malzeme seç</option>
  </select>

  <input
    type="number"
    id="material-quantity-${project.id}"
    placeholder="Kullanılacak miktar"
  />

  <button type="button"
          onclick="addMaterialToProject(${project.id}, event)">
    Onayla
  </button>

</div>

            <div class="project-mini-box"
                 onclick="toggleProjectMiniBox('materials-box-${project.id}')">

              <h4>Kullanılan Malzemeler</h4>

              <div
                class="project-mini-content"
                id="materials-box-${project.id}"
                style="display:none;"
              >
                <div id="used-materials-${project.id}"></div>
              </div>

            </div>

          </div>

        </div>

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

  await fetch("https://proje-takip-sistemi-3.onrender.com/api/projects", {
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
  await fetch(`https://proje-takip-sistemi-3.onrender.com/api/projects/${id}`, {
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
  document.getElementById("project-search").style.display = "none";

  const response = await fetch("https://proje-takip-sistemi-3.onrender.com/api/personnel", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const personnels = await response.json();

  const projectsResponse = await fetch(
    "https://proje-takip-sistemi-3.onrender.com/api/projects",
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  const projects = await projectsResponse.json();

  const personnelList = document.getElementById("personnel-list");

  personnelList.innerHTML = "";

  personnels.forEach((personnel) => {

    const assignedProjects = projects.filter(project =>
      project.Personnels &&
      project.Personnels.some(p => p.id === personnel.id)
    );

    personnelList.innerHTML += `
      <div class="category-box">

        <div class="category-header"
             onclick="toggleProjectMiniBox('personnel-detail-${personnel.id}')">

          <div style="display:flex; justify-content:space-between; align-items:center;">

            <h3>${personnel.name}</h3>

            <span>
            ${personnel.title || "-"}
            </span>

          </div>

        </div>

        <div
          class="category-materials"
          id="personnel-detail-${personnel.id}"
          style="display:none;"
        >

          <div class="personnel-card">

            <p>
              <strong>Meslek:</strong>
              ${personnel.title || "-"}
            </p>

            <p>
              <strong>Telefon:</strong>
              ${personnel.phone || "-"}
            </p>

            <p>
              <strong>E-posta:</strong>
              ${personnel.email || "-"}
            </p>

            <hr>

            <h4>Projeler</h4>

            ${
              assignedProjects.length > 0
                ? assignedProjects.map(project => `
                  <div class="assigned-project-item">

                    <strong>${project.title}</strong>

                    <span>
                      ${getProjectStatus(project.endDate)}
                    </span>

                  </div>
                `).join("")
                : "<p>Henüz proje atanmadı.</p>"
            }

            <br>

            <button
              type="button"
              onclick="deletePersonnel(${personnel.id})"
            >
              Personeli Sil
            </button>

          </div>

        </div>

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

  await fetch("https://proje-takip-sistemi-3.onrender.com/api/personnel", {
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
  await fetch(`https://proje-takip-sistemi-3.onrender.com/api/personnel/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  await showPersonnel();
}

/* PROJE PERSONEL ATAMA */

async function loadPersonnelOptions(projectId) {
  const response = await fetch("https://proje-takip-sistemi-3.onrender.com/api/personnel", {
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

  await fetch("https://proje-takip-sistemi-3.onrender.com/api/assignments", {
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
  const response = await fetch(`https://proje-takip-sistemi-3.onrender.com/api/assignments/${projectId}`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const personnels = await response.json();
  const assignedDiv = document.getElementById(`assigned-personnel-${projectId}`);

  assignedDiv.innerHTML = "";

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

  await fetch(`https://proje-takip-sistemi-3.onrender.com/api/assignments/${projectId}/${personnelId}`, {
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

  const materialResponse = await fetch(
    "https://proje-takip-sistemi-3.onrender.com/api/materials",
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  const supplierResponse = await fetch(
    "https://proje-takip-sistemi-3.onrender.com/api/suppliers",
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  const materials = await materialResponse.json();
  const suppliers = await supplierResponse.json();

  const materialList = document.getElementById("material-list");

  materialList.innerHTML = "";


  const groupedMaterials = {
  "Elektrik": [],
  "Mekanik": [],
  "Pnömatik": [],
  "Hidrolik": [],
  "Bağlantı Elemanı": [],
  "Sarf Malzeme": [],
};
delete groupedMaterials[""];
delete groupedMaterials["PLC"];
delete groupedMaterials["Diğer"];
  materials.forEach((material) => {

    let category = material.category;
    if (category.toLowerCase() === "sarf") {
  category = "Sarf Malzeme";
}

    if (groupedMaterials[category]) {
  groupedMaterials[category].push(material);
}

  });

  Object.keys(groupedMaterials).forEach((category) => {

    materialList.innerHTML += `
      <div class="category-box">

        <div class="category-header"
             onclick="toggleCategory('${category}')">

          <h2>${category}</h2>

        </div>

        <div
          class="category-materials"
          id="category-${category}"
          style="display:none;"
        >
        </div>

      </div>
    `;

    const categoryDiv = document.getElementById(`category-${category}`);

    groupedMaterials[category].forEach((material) => {

      const quantity = Number(material.quantity || 0);
      const unitPrice = Number(material.unitPrice || 0);

      const totalValue = quantity * unitPrice;

      const supplier = suppliers.find(
        (s) => s.id == material.supplierId
      );

      const supplierName = supplier
        ? supplier.name
        : "Tedarikçi yok";

      let stockStatus = `Kalan: ${quantity} ${material.unit || ""}`;
      let statusClass = "stock-ok";

      if (quantity <= 0) {

        stockStatus = "Stok Bitti";
        statusClass = "stock-empty";

      } else if (quantity < 10) {

        stockStatus = `Kalan: ${quantity} ${material.unit || ""}`;
        statusClass = "stock-critical";

      }

      categoryDiv.innerHTML += `
        <div class="material-card">

          <div class="material-header">

            <h3>${material.name}</h3>

            <span class="${statusClass}">
              ${stockStatus}
            </span>

          </div>

          <p>
            <strong>Tür:</strong>
            ${material.type || "-"}
          </p>

          <p>
            <strong>Miktar:</strong>
            ${quantity} ${material.unit || ""}
          </p>

          <p>
            <strong>Birim Fiyat:</strong>
            ${unitPrice} ₺
          </p>

          <p>
            <strong>Toplam Değer:</strong>
            ${totalValue} ₺
          </p>

          <p>
            <strong>Depo Konumu:</strong>
            ${material.warehouseLocation || "-"}
          </p>

          <p>
            <strong>Tedarikçi:</strong>
            ${supplierName}
          </p>

          <button
            type="button"
            onclick="deleteMaterial(${material.id}, event)"
          >
            Malzeme Sil
          </button>

        </div>
      `;

    });

  });

}
function toggleCategory(category) {
  function toggleProjectMiniBox(id) {

  const div = document.getElementById(id);

  if (div.style.display === "none") {
    div.style.display = "block";
  } else {
    div.style.display = "none";
  }

}
  const div = document.getElementById(`category-${category}`);

  if (div.style.display === "none") {
    div.style.display = "block";
  } else {
    div.style.display = "none";
  }
}

async function deleteMaterial(id, event) {
  if (event) event.preventDefault();

  localStorage.setItem("activeSection", "materials");

  await fetch(`https://proje-takip-sistemi-3.onrender.com/api/materials/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  await loadMaterials();
}
 
async function loadSupplierOptions() {
  const response = await fetch("https://proje-takip-sistemi-3.onrender.com/api/suppliers", {
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

  const response = await fetch("https://proje-takip-sistemi-3.onrender.com/api/companies", {
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
  const code = document.getElementById("company-code").value;
  const type = document.getElementById("company-type").value;
  const authorized = document.getElementById("company-authorized").value;

  const phone = document.getElementById("company-phone").value;
  const email = document.getElementById("company-email").value;

  const taxNumber = document.getElementById("company-tax-number").value;
  const taxOffice = document.getElementById("company-tax-office").value;

  const address = document.getElementById("company-address").value;

  const balance = document.getElementById("company-balance").value;
  const currency = document.getElementById("company-currency").value;

  const paymentType = document.getElementById("company-payment-type").value;
  const dueDay = document.getElementById("company-due-day").value;

  const status = document.getElementById("company-status").value;
  const notes = document.getElementById("company-notes").value;

  await fetch("https://proje-takip-sistemi-3.onrender.com/api/companies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },

    body: JSON.stringify({
      name,
      code,
      type,
      authorized,
      phone,
      email,
      taxNumber,
      taxOffice,
      address,
      balance,
      currency,
      paymentType,
      dueDay,
      status,
      notes,
    }),
  });

  loadCompanies();
}


async function deleteCompany(id) {
  await fetch(`https://proje-takip-sistemi-3.onrender.com/api/companies/${id}`, {
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

  const response = await fetch("https://proje-takip-sistemi-3.onrender.com/api/offers", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const offers = await response.json();
  const offerList = document.getElementById("offer-list");

  offerList.innerHTML = "";

  const activeOffers = offers.filter(
  (offer) => offer.status !== "Reddedildi"
);
  activeOffers.forEach((offer) => {
    offerList.innerHTML += `
      <div class="offer-card">
        <h3>${offer.title}</h3>

        <p><strong>Firma:</strong> ${offer.Company ? offer.Company.name : offer.companyId}</p>
        <p><strong>Tutar:</strong> ${offer.amount} ₺</p>
        <p><strong>Durum:</strong> ${offer.status}</p>

        <button type="button" onclick="rejectOffer(${offer.id})">Reddet</button>
        <button type="button" onclick="showOfferProjectDates(${offer.id})">
  Projeye Dönüştür
</button>

<div id="offer-date-box-${offer.id}" style="display:none; margin-top:15px;">
  <input
    type="date"
    id="offer-start-date-${offer.id}"
    value="${new Date().toISOString().split('T')[0]}"
  />

  <input
    type="date"
    id="offer-end-date-${offer.id}"
  />

  <button type="button" onclick="createProjectFromOffer(${offer.id})">
    Onayla ve Projeye Aktar
  </button>
</div>
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
  const response = await fetch("https://proje-takip-sistemi-3.onrender.com/api/companies", {
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

  await fetch("https://proje-takip-sistemi-3.onrender.com/api/offers", {
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
  await fetch(`https://proje-takip-sistemi-3.onrender.com/api/offers/${id}/status`, {
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
  await fetch(`https://proje-takip-sistemi-3.onrender.com/api/offers/${id}/status`, {
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
async function deleteOffer(id) {
  await fetch(`https://proje-takip-sistemi-3.onrender.com/api/offers/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  await showOffers();
}

function showOfferProjectDates(id) {
  document.getElementById(`offer-date-box-${id}`).style.display = "block";
}
async function createProjectFromOffer(id) {

  const startDate = document.getElementById(
    `offer-start-date-${id}`
  ).value;

  const endDate = document.getElementById(
    `offer-end-date-${id}`
  ).value;

  if (!endDate) {
    alert("Bitiş tarihi seç");
    return;
  }

  await fetch(`https://proje-takip-sistemi-3.onrender.com/api/offers/${id}/create-project`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      startDate,
      endDate,
    }),
  });

  alert("Proje oluşturuldu");

  await showOffers();
}
/* TEDARİKÇİLER */

async function showSuppliers() {
  localStorage.setItem("activeSection", "suppliers");

  hideAllSections();

  document.getElementById("supplier-section").style.display = "block";

  const response = await fetch("https://proje-takip-sistemi-3.onrender.com/api/suppliers", {
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

  await fetch("https://proje-takip-sistemi-3.onrender.com/api/suppliers", {
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
  await fetch(`https://proje-takip-sistemi-3.onrender.com/api/suppliers/${id}`, {
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
    "https://proje-takip-sistemi-3.onrender.com/api/materials",
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
    "https://proje-takip-sistemi-3.onrender.com/api/project-materials",
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
    `https://proje-takip-sistemi-3.onrender.com/api/project-materials/${projectId}`,
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

  <table class="used-material-table">
    <thead>
      <tr>
        <th>Malzeme</th>
        <th>Kullanılan</th>
        <th>Maliyet</th>
      </tr>
    </thead>
    <tbody id="used-material-table-${projectId}">
    </tbody>
  </table>
`;

const tableBody = document.getElementById(`used-material-table-${projectId}`);

  let totalCost = 0;

  materials.forEach((material) => {

  totalCost += material.totalCost;

  tableBody.innerHTML += `
    <tr>
      <td>
        ${material.Material ? material.Material.name : material.materialId}
      </td>

      <td>
        ${material.quantityUsed}
      </td>

      <td>
        ${material.totalCost} ₺
      </td>
    </tr>
  `;

});

 const projectResponse = await fetch(
  "https://proje-takip-sistemi-3.onrender.com/api/projects",
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
  color: ${difference < 0 ? '#ef4444' : '#22c55e'};
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

  await fetch("https://proje-takip-sistemi-3.onrender.com/api/offer-items", {
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
  const response = await fetch(`https://proje-takip-sistemi-3.onrender.com/api/offer-items/${offerId}`, {
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
    "https://proje-takip-sistemi-3.onrender.com/api/users",
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
    "https://proje-takip-sistemi-3.onrender.com/api/projects",
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  const materialResponse = await fetch(
    "https://proje-takip-sistemi-3.onrender.com/api/materials",
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  const offerResponse = await fetch(
    "https://proje-takip-sistemi-3.onrender.com/api/offers",
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
console.log("dashboard js çalıştı");
function filterMaterials() {
  const searchValue = document
    .getElementById("material-search")
    .value
    .toLowerCase();

  const cards = document.querySelectorAll(".material-card");

  cards.forEach((card) => {
    const text = card.innerText.toLowerCase();

    if (text.includes(searchValue)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}
async function addMaterial(event) {
  if (event) {
    event.preventDefault();
  }

  const token = localStorage.getItem("token");

  const name = document.getElementById("material-name").value;
  const category = document.getElementById("material-category").value;
  const quantity = document.getElementById("material-quantity").value;
  const criticalStock = document.getElementById("material-critical").value;
  const unit = document.getElementById("material-unit").value;
  const unitPrice = document.getElementById("material-price").value;
  const warehouseLocation = document.getElementById("material-location").value;
  const description = document.getElementById("material-description").value;
  const supplierId = document.getElementById("material-supplier").value;

  try {
    const response = await fetch("https://proje-takip-sistemi-3.onrender.com/api/materials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        name,
        category,
        quantity,
        criticalStock,
        unit,
        unitPrice,
        warehouseLocation,
        description,
        supplierId,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Malzeme eklendi");

      loadMaterials();

      document.getElementById("material-name").value = "";
      document.getElementById("material-category").value = "";
      document.getElementById("material-quantity").value = "";
      document.getElementById("material-critical").value = "";
      document.getElementById("material-unit").value = "";
      document.getElementById("material-price").value = "";
      document.getElementById("material-location").value = "";
      document.getElementById("material-description").value = "";
      document.getElementById("material-supplier").value = "";
    } else {
      alert(data.message || "Malzeme eklenemedi");
    }
  } catch (error) {
    console.log(error);
    alert("Sunucu hatası");
  }
}
function updateMaterialTypes() {
  const category = document.getElementById("material-category").value;
  const typeSelect = document.getElementById("material-type");

  const types = {
    Elektrik: ["PLC", "Röle", "Kablo", "Sensör", "Kontaktör", "Güç Kaynağı"],
    Mekanik: ["Rulman", "Mil", "Lineer Kızak", "Kaplin", "Dişli"],
    Pnömatik: ["Valf", "Hava Silindiri", "Hortum", "Regülatör"],
    Hidrolik: ["Hidrolik Pompa", "Hidrolik Valf", "Hidrolik Hortum"],
    "Bağlantı Elemanı": ["Cıvata", "Somun", "Pul", "Rakor"],
    "Sarf Malzeme": ["Bant", "Yağ", "Sprey", "Eldiven"],
  };

  typeSelect.innerHTML = `<option value="">Malzeme Türü Seç</option>`;

  if (!types[category]) return;

  types[category].forEach((type) => {
    typeSelect.innerHTML += `<option value="${type}">${type}</option>`;
  });
}

function autoFillMaterialInfo() {
  const category = document.getElementById("material-category").value;
  const type = document.getElementById("material-type").value;

  const codeInput = document.getElementById("material-code");
  const locationSelect = document.getElementById("material-location");

  const categoryCodes = {
    Elektrik: "ELK",
    Mekanik: "MEK",
    Pnömatik: "PNO",
    Hidrolik: "HDR",
    "Bağlantı Elemanı": "BGL",
    "Sarf Malzeme": "SRF",
  };

  const locations = {
    PLC: "A-1",
    Röle: "A-2",
    Kablo: "A-3",
    Sensör: "A-3",
    Kontaktör: "A-2",
    "Güç Kaynağı": "A-1",

    Rulman: "B-1",
    Mil: "B-2",
    "Lineer Kızak": "B-3",
    Kaplin: "B-2",
    Dişli: "B-3",

    Valf: "C-1",
    "Hava Silindiri": "C-2",
    Hortum: "C-3",
    Regülatör: "C-1",

    "Hidrolik Pompa": "D-1",
    "Hidrolik Valf": "D-2",
    "Hidrolik Hortum": "D-2",

    Cıvata: "E-1",
    Somun: "E-1",
    Pul: "E-1",
    Rakor: "E-2",

    Bant: "E-2",
    Yağ: "D-2",
    Sprey: "E-2",
    Eldiven: "E-2",
  };

  if (locations[type]) {
    locationSelect.value = locations[type];
  }

  if (categoryCodes[category] && type) {
    const randomNumber = Math.floor(100 + Math.random() * 900);
    codeInput.value = `${categoryCodes[category]}-${randomNumber}`;
  }
}
function autoDetectMaterial() {
  const name = document.getElementById("material-name").value.toLowerCase();

  const category = document.getElementById("material-category");
  const type = document.getElementById("material-type");
  const location = document.getElementById("material-location");

  if (name.includes("plc")) {
    category.value = "Elektrik";
    updateMaterialTypes();
    type.value = "PLC";
    location.value = "A-1";
  } else if (name.includes("röle") || name.includes("role")) {
    category.value = "Elektrik";
    updateMaterialTypes();
    type.value = "Röle";
    location.value = "A-2";
  } else if (name.includes("kablo")) {
    category.value = "Elektrik";
    updateMaterialTypes();
    type.value = "Kablo";
    location.value = "A-3";
  } else if (name.includes("rulman")) {
    category.value = "Mekanik";
    updateMaterialTypes();
    type.value = "Rulman";
    location.value = "B-1";
  } else if (name.includes("valf")) {
    category.value = "Pnömatik";
    updateMaterialTypes();
    type.value = "Valf";
    location.value = "C-1";
  }
}
function autoDetectMaterial() {
  const name = document.getElementById("material-name").value.toLowerCase();

  const category = document.getElementById("material-category");
  const type = document.getElementById("material-type");
  const location = document.getElementById("material-location");
  const unit = document.getElementById("material-unit");
  const code = document.getElementById("material-code");

  if (name.includes("plc")) {
    category.value = "Elektrik";
    type.value = "PLC";
    location.value = "A-1";
    unit.value = "adet";
    code.value = "ELK-PLC-" + Date.now().toString().slice(-4);
  } else if (name.includes("röle") || name.includes("role")) {
    category.value = "Elektrik";
    type.value = "Röle";
    location.value = "A-2";
    unit.value = "adet";
    code.value = "ELK-RLE-" + Date.now().toString().slice(-4);
  } else if (name.includes("kablo")) {
    category.value = "Elektrik";
    type.value = "Kablo";
    location.value = "A-3";
    unit.value = "metre";
    code.value = "ELK-KBL-" + Date.now().toString().slice(-4);
  } else if (name.includes("rulman")) {
    category.value = "Mekanik";
    type.value = "Rulman";
    location.value = "B-1";
    unit.value = "adet";
    code.value = "MEK-RLM-" + Date.now().toString().slice(-4);
  } else if (name.includes("valf")) {
    category.value = "Pnömatik";
    type.value = "Valf";
    location.value = "C-1";
    unit.value = "adet";
    code.value = "PNO-VLF-" + Date.now().toString().slice(-4);
  } else if (name.includes("cıvata") || name.includes("civata")) {
    category.value = "Bağlantı Elemanı";
    type.value = "Cıvata";
    location.value = "E-1";
    unit.value = "adet";
    code.value = "BGL-CVT-" + Date.now().toString().slice(-4);
  }
}
function autoDetectMaterial() {
  const name = document.getElementById("material-name").value.toLowerCase();

  const category = document.getElementById("material-category");
  const type = document.getElementById("material-type");
  const location = document.getElementById("material-location");
  const unit = document.getElementById("material-unit");
  const code = document.getElementById("material-code");

  if (name.includes("plc")) {
    category.value = "Elektrik";
    type.value = "PLC";
    location.value = "A-1";
    unit.value = "adet";
    code.value = "ELK-PLC-" + Date.now().toString().slice(-4);
  } else if (name.includes("röle") || name.includes("role")) {
    category.value = "Elektrik";
    type.value = "Röle";
    location.value = "A-2";
    unit.value = "adet";
    code.value = "ELK-RLE-" + Date.now().toString().slice(-4);
  } else if (name.includes("kablo")) {
    category.value = "Elektrik";
    type.value = "Kablo";
    location.value = "A-3";
    unit.value = "metre";
    code.value = "ELK-KBL-" + Date.now().toString().slice(-4);
  } else if (name.includes("rulman")) {
    category.value = "Mekanik";
    type.value = "Rulman";
    location.value = "B-1";
    unit.value = "adet";
    code.value = "MEK-RLM-" + Date.now().toString().slice(-4);
  } else if (name.includes("valf")) {
    category.value = "Pnömatik";
    type.value = "Valf";
    location.value = "C-1";
    unit.value = "adet";
    code.value = "PNO-VLF-" + Date.now().toString().slice(-4);
  } else if (name.includes("cıvata") || name.includes("civata")) {
    category.value = "Bağlantı Elemanı";
    type.value = "Cıvata";
    location.value = "E-1";
    unit.value = "adet";
    code.value = "BGL-CVT-" + Date.now().toString().slice(-4);
  }
}
function toggleProjectMiniBox(id) {
  const div = document.getElementById(id);

  if (!div) {
    console.log("Bulunamadı:", id);
    return;
  }

  if (div.style.display === "none" || div.style.display === "") {
    div.style.display = "block";
  } else {
    div.style.display = "none";
  }
}
function toggleProjectBox(id) {
  const div = document.getElementById(id);

  if (div.style.display === "none" || div.style.display === "") {
    div.style.display = "block";
  } else {
    div.style.display = "none";
  }
}