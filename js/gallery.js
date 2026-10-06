
(function () {
  var feed = document.getElementById("feed");
  if (!feed) return;
  var posts = Array.isArray(window.GALLERY_POSTS) ? window.GALLERY_POSTS.slice() : [];
  try {
    var local = JSON.parse(localStorage.getItem("proceilings-gallery") || "[]");
    if (local.length) posts = local;
  } catch (e) {}
  posts.sort(function (a, b) { return (b.created || 0) - (a.created || 0); });
  var empty = document.getElementById("empty");
  if (!posts.length) return;
  if (empty) empty.remove();
  posts.forEach(function (post) {
    var article = document.createElement("article");
    article.className = "post";
    var when = post.created ? new Date(post.created).toLocaleDateString() : "";
    var photos = post.photos || [post.before, post.after].filter(Boolean);
    article.innerHTML = '<div class="post-head"><strong></strong><div class="post-meta"></div></div><div class="photos"></div><p></p>';
    article.querySelector("strong").textContent = post.title || "Job";
    article.querySelector(".post-meta").textContent = when;
    article.querySelector("p").textContent = post.description || "";
    photos.forEach(function (src) {
      var img = document.createElement("img");
      img.src = src;
      img.alt = post.title || "Job photo";
      article.querySelector(".photos").appendChild(img);
    });
    feed.appendChild(article);
  });
})();
