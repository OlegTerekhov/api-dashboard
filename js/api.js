import { createOverviewChart } from "./charts.js";

console.log("API.JS ЗАПУСТИЛСЯ");

const API_URL = "https://dummyjson.com";

// ==============================
// Состояние
// ==============================

let allUsers = [];

let currentPage = 1;

const usersPerPage = 6;


// ==============================
// Элементы страницы
// ==============================

const usersCount = document.querySelector("#users-count");
const postsCount = document.querySelector("#posts-count");
const commentsCount = document.querySelector("#comments-count");
const postsPerUser = document.querySelector("#posts-per-user");

const usersList = document.querySelector("#users-list");
const postsList = document.querySelector("#posts-list");
const commentsList = document.querySelector("#comments-list");

const pagination = document.querySelector("#pagination");

const errorMessage = document.querySelector("#error-message");
const loadingMessage = document.querySelector("#loading-message");

const refreshButton = document.querySelector("#refresh-button");

const userSearch = document.querySelector("#user-search");
const userSort = document.querySelector("#user-sort");


// ==============================
// Получение данных API
// ==============================

async function fetchData(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`Ошибка API: ${response.status}`);
  }

  return await response.json();
}


// ==============================
// Отображение пользователей
// ==============================

function renderUsers(users) {
  const start = (currentPage - 1) * usersPerPage;
  const end = start + usersPerPage;

  const pageUsers = users.slice(start, end);

  if (pageUsers.length === 0) {
    usersList.innerHTML = `
      <p class="empty-message">
        Пользователь не найден.
      </p>
    `;

    pagination.innerHTML = "";

    return;
  }

  const usersHTML = pageUsers
    .map(function(user) {
      return `
        <div class="user-card">
          <img
            src="${user.image}"
            alt="${user.firstName} ${user.lastName}"
          >

          <div>
            <strong>${user.firstName} ${user.lastName}</strong>
            <p>${user.email}</p>
          </div>
        </div>
      `;
    })
    .join("");

  usersList.innerHTML = usersHTML;

  renderPagination(users);
}


// ==============================
// Пагинация
// ==============================

function renderPagination(users) {
  const totalPages = Math.ceil(users.length / usersPerPage);

  pagination.innerHTML = "";

  if (totalPages <= 1) {
    return;
  }

  // Кнопка "Назад"

  const prevButton = document.createElement("button");

  prevButton.textContent = "← Назад";

  prevButton.disabled = currentPage === 1;

  prevButton.addEventListener("click", function() {
    if (currentPage > 1) {
      currentPage--;

      renderUsers(getFilteredAndSortedUsers());
    }
  });

  pagination.appendChild(prevButton);


  // Номера страниц

  for (let page = 1; page <= totalPages; page++) {

    const button = document.createElement("button");

    button.textContent = page;

    if (page === currentPage) {
      button.classList.add("active");
    }

    button.addEventListener("click", function() {
      currentPage = page;

      renderUsers(getFilteredAndSortedUsers());
    });

    pagination.appendChild(button);
  }


  // Кнопка "Вперёд"

  const nextButton = document.createElement("button");

  nextButton.textContent = "Вперёд →";

  nextButton.disabled = currentPage === totalPages;

  nextButton.addEventListener("click", function() {
    if (currentPage < totalPages) {
      currentPage++;

      renderUsers(getFilteredAndSortedUsers());
    }
  });

  pagination.appendChild(nextButton);
}


// ==============================
// Поиск + сортировка
// ==============================

function getFilteredAndSortedUsers() {
  const searchText = userSearch.value.toLowerCase();

  let filteredUsers = allUsers.filter(function(user) {
    const fullName =
      `${user.firstName} ${user.lastName}`.toLowerCase();

    return fullName.includes(searchText);
  });

  if (userSort.value === "name-asc") {
    filteredUsers.sort(function(a, b) {
      return a.firstName.localeCompare(b.firstName);
    });
  }

  if (userSort.value === "name-desc") {
    filteredUsers.sort(function(a, b) {
      return b.firstName.localeCompare(a.firstName);
    });
  }

  return filteredUsers;
}


// ==============================
// Обновление пользователей
// ==============================

function updateUsers() {
  currentPage = 1;

  const users = getFilteredAndSortedUsers();

  renderUsers(users);
}


// ==============================
// Загрузка Dashboard
// ==============================

async function loadDashboard() {
  try {
    loadingMessage.style.display = "block";
    errorMessage.style.display = "none";

    const [users, posts, comments] = await Promise.all([
      fetchData("/users"),
      fetchData("/posts"),
      fetchData("/comments")
    ]);

    console.log("Пользователи:", users);
    console.log("Посты:", posts);
    console.log("Комментарии:", comments);

    // Сохраняем пользователей
    allUsers = users.users;

    // Статистика
    usersCount.textContent = users.total;
    postsCount.textContent = posts.total;
    commentsCount.textContent = comments.total;

    const averagePosts = posts.total / users.total;

    postsPerUser.textContent = averagePosts.toFixed(2);

    // График
    createOverviewChart({
      users: users,
      posts: posts,
      comments: comments
    });

    // Пользователи
    currentPage = 1;

    updateUsers();

    // Посты
    const postsHTML = posts.posts
      .slice(0, 5)
      .map(function(post) {
        return `
          <article class="post-card">
            <h3>${post.title}</h3>
            <p>${post.body}</p>
            <small>👍 ${post.reactions.likes}</small>
          </article>
        `;
      })
      .join("");

    postsList.innerHTML = postsHTML;

    // Комментарии
    const commentsHTML = comments.comments
      .slice(0, 5)
      .map(function(comment) {
        return `
          <article class="comment-card">
            <strong>${comment.user.fullName}</strong>
            <p>${comment.body}</p>
          </article>
        `;
      })
      .join("");

    commentsList.innerHTML = commentsHTML;

    // Убираем загрузку
    loadingMessage.style.display = "none";

  } catch (error) {
    console.error("Ошибка загрузки Dashboard:", error);

    loadingMessage.style.display = "none";

    errorMessage.innerHTML = `
  <strong>Не удалось загрузить данные</strong>
  <span>
    Проверьте подключение к интернету и попробуйте обновить страницу.
  </span>
`;

    errorMessage.style.display = "flex";
  }
}


// ==============================
// События
// ==============================

// Поиск
userSearch.addEventListener("input", updateUsers);

// Сортировка
userSort.addEventListener("change", updateUsers);

// Обновление данных
refreshButton.addEventListener("click", async function() {
  refreshButton.disabled = true;
  refreshButton.textContent = "Обновление...";

  await loadDashboard();

  refreshButton.disabled = false;
  refreshButton.textContent = "Обновить данные";
});


// ==============================
// Запуск
// ==============================

loadDashboard();