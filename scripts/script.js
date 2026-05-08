const allVideos = [
  {
    id: 1,
    city: "Санкт-Петербург",
    time: "day",
    title: "Невский проспект",
    description: "Поток машин и пешеходов в центре города.",
    thumbnail: "https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&w=600&q=80",
    video: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  },
  {
    id: 2,
    city: "Санкт-Петербург",
    time: "night",
    title: "Набережная ночью",
    description: "Огни города отражаются в воде Невы.",
    thumbnail: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80",
    video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  },
  {
    id: 3,
    city: "Москва",
    time: "day",
    title: "Панорама центра",
    description: "Вид на город с высоты в ясный день.",
    thumbnail: "https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&w=600&q=80",
    video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  },
  {
    id: 4,
    city: "Москва",
    time: "sunset",
    title: "Закат на высотке",
    description: "Оранжевое небо и стеклянные фасады.",
    thumbnail: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80",
    video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
  },
  {
    id: 5,
    city: "Казань",
    time: "day",
    title: "Центральная площадь",
    description: "Живой городской ритм в обеденное время.",
    thumbnail: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=600&q=80",
    video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
  },
  {
    id: 6,
    city: "Казань",
    time: "night",
    title: "Огни вечернего города",
    description: "Подсветка улиц и редкие ночные машины.",
    thumbnail: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=600&q=80",
    video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
  },
  {
    id: 7,
    city: "Екатеринбург",
    time: "sunset",
    title: "Солнечные лучи в стекле",
    description: "Теплый свет заката на фасадах делового центра.",
    thumbnail: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80",
    video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"
  },
  {
    id: 8,
    city: "Екатеринбург",
    time: "night",
    title: "Пустые перекрестки",
    description: "Ночной город и длинные тени от фонарей.",
    thumbnail: "https://images.unsplash.com/photo-1493244040629-496f6d136cc3?auto=format&fit=crop&w=600&q=80",
    video: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
  }
];

const PAGE_SIZE = 5;

const form = document.querySelector("#search-form");
const video = document.querySelector("#current-video");
const list = document.querySelector("#videos-list");
const listContainer = document.querySelector("#list-container");
const videoContainer = document.querySelector("#video-container");

const itemTemplate = document.querySelector(".content__list-item-template").content;
const moreTemplate = document.querySelector(".more-button-template").content;
const preloaderTemplate = document.querySelector(".preloader-template").content;
const errorTemplate = document.querySelector(".error-template").content;

let filteredVideos = [];
let renderedCount = 0;

function showPreloader(container) {
  const preloader = preloaderTemplate.cloneNode(true);
  container.append(preloader);
}

function clearOverlay(container) {
  const overlay = container.querySelector(".preloader, .error");
  if (overlay) {
    overlay.remove();
  }
}

function showError(container, message) {
  clearOverlay(container);
  const node = errorTemplate.cloneNode(true);
  node.querySelector(".error__text").textContent = message;
  container.append(node);
}

function setCurrentVideo(url) {
  video.src = url;
  video.load();
}

function createCard(item) {
  const fragment = itemTemplate.cloneNode(true);
  const link = fragment.querySelector(".content__card-link");
  const title = fragment.querySelector(".content__video-card-title");
  const description = fragment.querySelector(".content__video-card-description");
  const img = fragment.querySelector(".content__video-card-thumbnail");

  title.textContent = item.title;
  description.textContent = item.description;
  img.src = item.thumbnail;
  img.alt = item.title;

  link.addEventListener("click", (event) => {
    event.preventDefault();
    document.querySelector(".content__card-link_current")?.classList.remove("content__card-link_current");
    link.classList.add("content__card-link_current");
    setCurrentVideo(item.video);
  });

  return fragment;
}

function renderMoreButton() {
  listContainer.querySelector(".more-button")?.remove();
  if (renderedCount >= filteredVideos.length) {
    return;
  }

  const buttonNode = moreTemplate.cloneNode(true);
  const button = buttonNode.querySelector(".more-button");

  button.addEventListener("click", () => {
    renderChunk();
  });

  listContainer.append(buttonNode);
}

function renderChunk() {
  const chunk = filteredVideos.slice(renderedCount, renderedCount + PAGE_SIZE);
  chunk.forEach((item) => {
    list.append(createCard(item));
  });
  renderedCount += chunk.length;
  renderMoreButton();
}

function renderResult() {
  list.innerHTML = "";
  renderedCount = 0;

  if (!filteredVideos.length) {
    showError(videoContainer, "По вашему запросу ничего не найдено");
    return;
  }

  clearOverlay(videoContainer);
  renderChunk();

  const firstVideo = filteredVideos[0];
  setCurrentVideo(firstVideo.video);
  const firstLink = list.querySelector(".content__card-link");
  firstLink?.classList.add("content__card-link_current");
}

function filterData({ city, times }) {
  return allVideos.filter((item) => {
    const cityMatch = item.city.toLowerCase().includes(city.toLowerCase());
    const timeMatch = times.includes(item.time);
    return cityMatch && timeMatch;
  });
}

function getFormData() {
  const formData = new FormData(form);
  return {
    city: (formData.get("query") || "").toString().trim(),
    times: formData.getAll("time")
  };
}

async function runSearch() {
  clearOverlay(listContainer);
  clearOverlay(videoContainer);
  showPreloader(listContainer);
  showPreloader(videoContainer);

  await new Promise((resolve) => {
    window.setTimeout(resolve, 450);
  });

  const { city, times } = getFormData();

  if (!times.length) {
    clearOverlay(listContainer);
    showError(videoContainer, "Выберите хотя бы один период времени");
    list.innerHTML = "";
    return;
  }

  filteredVideos = filterData({ city, times });
  clearOverlay(listContainer);
  renderResult();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await runSearch();
});

runSearch();
