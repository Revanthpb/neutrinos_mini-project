interface SectionData {
  title: string;
  description: string;
}

window.onload = () => {
  const addBtn = document.getElementById("addSectionBtn")!;
  const sectionsDiv = document.getElementById("sections")!;
  const searchResults = document.getElementById("searchResults")!;
  const suggestions = document.getElementById("suggestions")!;

  const popup = document.getElementById("popup")!;
  const titleInput = document.getElementById("titleInput") as HTMLInputElement;
  const descInput = document.getElementById("descInput") as HTMLTextAreaElement;
  const saveBtn = document.getElementById("saveBtn")!;
  const closeBtn = document.getElementById("closeBtn")!;

  const searchInput = document.querySelector(".search-box input") as HTMLInputElement;
  const searchBtn = document.querySelector(".search-box button")!;

  let sections: SectionData[] = JSON.parse(localStorage.getItem("sections") || "[]");

  // 🔄 Render Sections
  const renderSections = () => {
    sectionsDiv.innerHTML = "";

    sections.forEach((sec, index) => {
      const section = document.createElement("div");
      section.className = "section";

      section.innerHTML = `
        <h3>${sec.title}</h3>
        <p>${sec.description}</p>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      `;

      // DELETE
      section.querySelector(".delete-btn")!.addEventListener("click", () => {
        sections.splice(index, 1);
        localStorage.setItem("sections", JSON.stringify(sections));
        renderSections();
      });

      // EDIT
      section.querySelector(".edit-btn")!.addEventListener("click", () => {
        popup.classList.remove("hidden");
        titleInput.value = sec.title;
        descInput.value = sec.description;

        saveBtn.onclick = () => {
          const t = titleInput.value.trim();
          const d = descInput.value.trim();
          if (!t || !d) return;

          sections[index] = { title: t, description: d };
          localStorage.setItem("sections", JSON.stringify(sections));

          popup.classList.add("hidden");
          renderSections();
        };
      });

      sectionsDiv.appendChild(section);
    });
  };

  // ➕ ADD NEW SECTION
  addBtn.onclick = () => {
    popup.classList.remove("hidden");
    titleInput.value = "";
    descInput.value = "";

    saveBtn.onclick = () => {
      const t = titleInput.value.trim();
      const d = descInput.value.trim();
      if (!t || !d) return;

      sections.push({ title: t, description: d });
      localStorage.setItem("sections", JSON.stringify(sections));

      popup.classList.add("hidden");
      renderSections();
    };
  };

  closeBtn.onclick = () => popup.classList.add("hidden");

  // 🔍 SEARCH
  searchBtn.onclick = async () => {
    const q = searchInput.value.trim();
    if (!q) return;

    searchResults.innerHTML = "Loading...";

    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`
      );

      if (!res.ok) throw new Error("Not found");

      const data = await res.json();

      searchResults.innerHTML = `
        <div class="section">
          <h3>${data.title || "No title"}</h3>
          <p>${data.extract || "No information found"}</p>

          <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(q)}" target="_blank" class="read-more">
            📖 Read full article
          </a>

          <br/><br/>
          <button id="editSearchBtn">✏️ Edit Article</button>
        </div>
      `;

      // ✏️ EDIT SEARCH RESULT
      const editBtn = document.getElementById("editSearchBtn")!;
      editBtn.onclick = () => {
        popup.classList.remove("hidden");

        titleInput.value = data.title || "";
        descInput.value = data.extract || "";

        saveBtn.onclick = () => {
          const t = titleInput.value.trim();
          const d = descInput.value.trim();
          if (!t || !d) return;

          sections.push({ title: t, description: d });
          localStorage.setItem("sections", JSON.stringify(sections));

          popup.classList.add("hidden");
          renderSections();
        };
      };

    } catch {
      searchResults.innerHTML = `
        <div class="section">
          <p>No results found. Try another keyword.</p>
        </div>
      `;
    }
  };

  // 💡 SUGGESTIONS
  searchInput.oninput = async () => {
    const q = searchInput.value;
    if (!q) {
      suggestions.style.display = "none";
      return;
    }

    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${q}&limit=5&origin=*`
    );
    const data = await res.json();

    suggestions.innerHTML = "";
    suggestions.style.display = "block";

    data[1].forEach((item: string) => {
      const div = document.createElement("div");
      div.textContent = item;

      div.onclick = () => {
        searchInput.value = item;
        suggestions.style.display = "none";
        searchBtn.click();
      };

      suggestions.appendChild(div);
    });
  };

  renderSections();
};