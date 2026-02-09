self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("budget").then(cache =>
      cache.addAll(["./","index.html","style.css","app.js"])
    )
  );
});