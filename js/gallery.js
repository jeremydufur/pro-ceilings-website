(function () {
  var feed = document.getElementById("feed");
  if (!feed) return;
  var posts = Array.isArray(window.GALLERY_POSTS) ? window.GALLERY_POSTS.slice() : [];
  try {
    var local = JSON.parse(localStorage.getItem("proceilings-gallery") || "[]");
    if (local.length) posts = local;
  } catch (e) {}
  posts.sort(function (a, b) { return (b.created || 0) - (a.created || 0); });
  posts.forEach(function (post) {
    var article = document.createElement("article");
    article.className = "post";
    var when = post.created ? new Date(post.created).toLocaleDateString() : "";
    article.innerHTML =
      '<div class="post-head"><strong>' + escapeHtml(post.title || "Job") + '</strong><div class="post-meta">' +
      escapeHtml([post.location, when].filter(Boolean).join(" · ")) + '</div></div>' +
      '<div class="pair"><figure><img alt="Before" src="' + post.before + '"><figcaption>Before</figcaption></figure>' +
      '<figure><img alt="After" src="' + post.after + '"><figcaption>After</figcaption></figure></div>' +
      '<p>' + escapeHtml(post.description || "") + '</p>';
    feed.appendChild(article);
  });
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&", "<": "<", ">": ">", '"': """, "'": "&#39;" }[ch];
    });
  }
})();
