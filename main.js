document.documentElement.classList.add("js");

const bookingUrl = "https://square.site/book/F8ACV2WMBGPBK/boney-s-barbershop-llc-wilmington-de";

const previewButtons = [...document.querySelectorAll("[data-preview-service]")];
if (previewButtons.length) {
  const photos = [...document.querySelectorAll("[data-preview-photo]")];
  const wall = document.querySelector(".hero-wall");
  let activeButton = null;

  previewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeButton = activeButton === button ? null : button;
      wall.classList.toggle("has-selection", activeButton !== null);

      previewButtons.forEach((item) => {
        const selected = item === activeButton;
        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });

      photos.forEach((photo) => {
        const matches = activeButton !== null &&
          photo.dataset.previewPhoto === activeButton.dataset.previewService;
        photo.classList.toggle("is-current", matches);
        photo.classList.toggle("is-muted", activeButton !== null && !matches);
      });
    });
  });
}

const builder = document.querySelector("[data-cut-builder]");
if (builder) {
  const services = [
    { name: "Haircut and shave", price: 25, key: "haircut-and-shave", photo: "photo-7", alt: "Adult haircut with beard grooming" },
    { name: "Afros/Naturals", price: 20, key: "afros-naturals", photo: "photo-6", alt: "Young customer with a fresh haircut" },
    { name: "Fades", price: 19, key: "fades", photo: "photo-4", alt: "Close side profile of a fade cut in the shop" },
    { name: "Even Hairstyles", price: 18, key: "even-hairstyles", photo: "photo-5", alt: "Adult haircut photographed from the side" },
    { name: "Senior Citizen Haircuts (65 and over)", price: 16, key: "senior-haircuts", photo: "photo-7", alt: "Adult haircut with beard grooming" },
    { name: "Kids Haircuts (12 and under)", price: 15, key: "kids-haircuts", photo: "photo-3", alt: "Child in the barbershop chair" },
    { name: "Shaves and Shape-ups", price: 10, key: "shaves-shape-ups", photo: "photo-7", alt: "Adult haircut with beard grooming" }
  ];

  builder.innerHTML = `
    <div class="builder-interface">
      <div data-person-list></div>
      <div class="builder-actions">
        <button class="plain-button" type="button" data-add-person>Add another person</button>
        <button class="plain-button" type="button" data-clear-list>Start over</button>
      </div>
      <p class="builder-empty" data-empty-state role="status">Pick a service above to start your cut list.</p>
      <div class="builder-total"><span>Menu total</span><output data-menu-total aria-live="polite">$0</output></div>
      <p class="builder-note">Menu total only. Final price is set in the shop. Missed Appointment Fee of $15 applies separately and is not part of this total.</p>
      <p class="booking-explanation">Square opens separately. Your cut list is not sent with the booking.</p>
      <a class="button button--light" href="${bookingUrl}" target="_blank" rel="noopener noreferrer">Book Your Appointment Online</a>
    </div>`;

  const personList = builder.querySelector("[data-person-list]");
  const totalOutput = builder.querySelector("[data-menu-total]");
  const emptyState = builder.querySelector("[data-empty-state]");
  const activePhoto = document.querySelector("[data-active-cut-photo]");
  const people = [];
  let nextId = 1;
  let lastPhoto = services[2];

  const serviceRows = [...document.querySelectorAll("[data-service-key]")];
  serviceRows.forEach((row) => {
    const service = services.find((item) => item.key === row.dataset.serviceKey);
    if (!service) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "row-button";
    button.setAttribute("aria-label", `Add ${service.name}, $${service.price}, to your cut list`);

    const name = row.querySelector(".price-row-name");
    const price = row.querySelector(".price");
    const count = document.createElement("small");
    count.className = "row-count";
    count.hidden = true;
    name.append(count);
    button.append(name, price);
    row.append(button);

    button.addEventListener("click", () => {
      const emptyPerson = people.find((person) => !person.key);
      if (emptyPerson) {
        emptyPerson.key = service.key;
      } else {
        people.push({ id: nextId++, key: service.key });
      }
      lastPhoto = service;
      renderPeople();
    });
  });

  function updateSummary() {
    const selected = people
      .map((person) => services.find((service) => service.key === person.key))
      .filter(Boolean);
    const total = selected.reduce((sum, service) => sum + service.price, 0);

    totalOutput.value = `$${total}`;
    totalOutput.textContent = `$${total}`;
    emptyState.hidden = selected.length > 0;

    serviceRows.forEach((row) => {
      const count = selected.filter((service) => service.key === row.dataset.serviceKey).length;
      const countLabel = row.querySelector(".row-count");
      row.classList.toggle("is-selected", count > 0);
      if (countLabel) {
        countLabel.hidden = count === 0;
        countLabel.textContent = `${count} in list`;
      }
    });

    if (selected.length === 0) lastPhoto = services[2];
    if (activePhoto) {
      activePhoto.src = `assets/${lastPhoto.photo}.jpg`;
      activePhoto.alt = lastPhoto.alt;
    }
  }

  function renderPeople(focusLast = false) {
    personList.replaceChildren();

    people.forEach((person, index) => {
      const row = document.createElement("div");
      row.className = "person-row";

      const field = document.createElement("div");
      const label = document.createElement("label");
      const select = document.createElement("select");
      select.id = `person-service-${person.id}`;
      label.htmlFor = select.id;
      label.textContent = `Person ${index + 1}: Choose a service`;

      select.add(new Option("Choose a service", ""));
      services.forEach((service) => {
        select.add(new Option(`${service.name} ($${service.price})`, service.key));
      });
      select.value = person.key;
      select.addEventListener("change", () => {
        person.key = select.value;
        const service = services.find((item) => item.key === person.key);
        if (service) lastPhoto = service;
        updateSummary();
      });

      field.append(label, select);
      row.append(field);

      if (people.length > 1) {
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "plain-button";
        remove.textContent = `Remove person ${index + 1}`;
        remove.addEventListener("click", () => {
          people.splice(index, 1);
          renderPeople();
          builder.querySelector("[data-add-person]").focus();
        });
        row.append(remove);
      }
      personList.append(row);
    });

    updateSummary();
    if (focusLast) personList.querySelector(".person-row:last-child select").focus();
  }

  builder.querySelector("[data-add-person]").addEventListener("click", () => {
    people.push({ id: nextId++, key: "" });
    renderPeople(true);
  });

  builder.querySelector("[data-clear-list]").addEventListener("click", () => {
    people.length = 0;
    people.push({ id: nextId++, key: "" });
    renderPeople(true);
  });

  people.push({ id: nextId++, key: "" });
  renderPeople();
}