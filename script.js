const apiKey = "f129943d";
let page = 1;
let currentSearch = "";

document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
};

function searchMovies(reset = true) {
  const query = document.getElementById("searchInput").value.trim();
  const ratingFilter = document.getElementById("ratingFilter").value;
  const genreFilter = document.getElementById("genreFilter").value;

  if (!query) return;

  if (reset) {
    page = 1;
    document.getElementById("movies").innerHTML = "";
  }

  currentSearch = query;
  saveSearchHistory(query);

  fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${query}&page=${page}`)
    .then(res => res.json())
    .then(data => {
      if (data.Response === "True") {
        data.Search.forEach(movie => {
          fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`)
            .then(res => res.json())
            .then(details => {
              if (ratingFilter !== "all" && parseFloat(details.imdbRating) < parseFloat(ratingFilter)) return;
              if (genreFilter !== "all" && !details.Genre.toLowerCase().includes(genreFilter)) return;
              displayMovie(details, "movies");
            });
        });
      }
    });
}

function displayMovie(movie, containerId) {
  const container = document.getElementById(containerId);
  const card = document.createElement("div");
  card.className = "movie-card";

  const imgSrc = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Image";

  card.innerHTML = `
    <img src="${imgSrc}" alt="${movie.Title}" />
    <div class="movie-info">
      <h4>${movie.Title}</h4>
      <p>${movie.Year}</p>
    </div>
    <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavorite('${movie.imdbID}', this)">❤️</button>
  `;

  card.onclick = () => showDetails(movie.imdbID);
  container.appendChild(card);
}

function showDetails(imdbID) {
  fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`)
    .then(res => res.json())
    .then(movie => {
      const modal = document.getElementById("movieModal");
      const content = document.getElementById("modalContent");
      content.innerHTML = `
        <h2>${movie.Title}</h2>
        <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}" style="width:100%"/>
        <p><strong>Genre:</strong> ${movie.Genre}</p>
        <p><strong>Rating:</strong> ${movie.imdbRating}</p>
        <p><strong>Released:</strong> ${movie.Released}</p>
        <p><strong>Description:</strong> ${movie.Plot}</p>
      `;
      modal.style.display = "block";
    });
}

document.getElementById("movieModal").onclick = () => {
  document.getElementById("movieModal").style.display = "none";
};

function loadMore() {
  page++;
  searchMovies(false);
}

function toggleFavorite(id, btn) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
    btn.textContent = "❤️";
  } else {
    favorites.push(id);
    btn.textContent = "💖";
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  displayFavorites();
}

function displayFavorites() {
  const favs = JSON.parse(localStorage.getItem("favorites")) || [];
  const container = document.getElementById("favorites");
  container.innerHTML = "";

  favs.forEach(id => {
    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${id}`)
      .then(res => res.json())
      .then(movie => {
        const card = document.createElement("div");
        card.className = "movie-card";
        const imgSrc = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Image";
        card.innerHTML = `
          <img src="${imgSrc}" />
          <div class="movie-info">
            <h4>${movie.Title}</h4>
            <p>${movie.Year}</p>
          </div>
          <button class="remove-btn" onclick="removeFavorite('${movie.imdbID}')">🗑️</button>
        `;
        container.appendChild(card);
      });
  });
}

function removeFavorite(id) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter(f => f !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  displayFavorites();
}

function saveSearchHistory(query) {
  let history = JSON.parse(localStorage.getItem("history")) || [];
  if (!history.includes(query)) {
    history.unshift(query);
    if (history.length > 5) history.pop();
    localStorage.setItem("history", JSON.stringify(history));
  }
  showHistory();
}

document.getElementById("searchInput").addEventListener("input", showHistory);

function showHistory() {
  const list = document.getElementById("searchHistoryList");
  const history = JSON.parse(localStorage.getItem("history")) || [];
  const input = document.getElementById("searchInput").value;
  list.innerHTML = "";

  if (!input) {
    list.style.display = "none";
    return;
  }

  const filtered = history.filter(h => h.toLowerCase().startsWith(input.toLowerCase()));
  filtered.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    li.onclick = () => {
      document.getElementById("searchInput").value = item;
      list.style.display = "none";
      searchMovies();
    };
    list.appendChild(li);
  });

  list.style.display = filtered.length ? "block" : "none";
}

window.onload = () => {
  displayFavorites();
  showHistory();
};