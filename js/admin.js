(function () {
  var KEY = "proceilings-gallery";
  var gate = document.getElementById("gate");
  var panel = document.getElementById("panel");
  var mine = document.getElementById("mine");

  function load() {
    var saved = [];
    try { saved = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { saved = []; }
    if (!saved.length && Array.isArray(window.GALLERY_POSTS)) saved = window.GALLERY_POSTS.slice();
    return saved;
  }
  function save(posts) {
    localStorage.setItem(KEY, JSON.stringify(posts));
    window.GALLERY_POSTS = posts;
  }
  function shrink(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var max = 1400;
          var scale = Math.min(1, max / Math.max(img.width, img.height));
          var canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  function render() {
    var posts = load().sort(function (a, b) { return b.created - a.created; });
    mine.innerHTML = "";
    posts.forEach(function (post) {
      var article = document.createElement("article");
      article.className = "post";
      article.innerHTML = '<div class="post-head"><strong></strong><div class="post-meta"></div></div><p></p><div class="post-tools"><button class="danger" type="button">Remove</button></div>';
      article.querySelector("strong").textContent = post.title;
      article.querySelector(".post-meta").textContent = post.location || "";
      article.querySelector("p").textContent = post.description;
      article.querySelector("button").addEventListener("click", function () {
        save(load().filter(function (item) { return item.id !== post.id; }));
        render();
      });
      mine.appendChild(article);
    });
  }

  if (sessionStorage.getItem("proceilings-auth") === "yes") {
    gate.classList.add("hidden");
    panel.classList.remove("hidden");
    render();
  }
  gate.addEventListener("submit", function (event) {
    event.preventDefault();
    if (document.getElementById("code").value === window.SITE.adminCode) {
      sessionStorage.setItem("proceilings-auth", "yes");
      gate.classList.add("hidden");
      panel.classList.remove("hidden");
      render();
    } else {
      alert("That code is not right.");
    }
  });
  document.getElementById("uploader").addEventListener("submit", async function (event) {
    event.preventDefault();
    var before = await shrink(document.getElementById("before").files[0]);
    var after = await shrink(document.getElementById("after").files[0]);
    var posts = load();
    posts.push({
      id: Date.now().toString(),
      created: Date.now(),
      title: document.getElementById("title").value.trim(),
      location: document.getElementById("location").value.trim(),
      description: document.getElementById("description").value.trim(),
      before: before,
      after: after
    });
    save(posts);
    event.target.reset();
    render();
    alert("Saved on this computer. Download the gallery file and replace js/gallery-data.js so customers can see it.");
  });
  document.getElementById("export").addEventListener("click", function () {
    var body = "window.GALLERY_POSTS = " + JSON.stringify(load()) + ";\n";
    var blob = new Blob([body], { type: "text/javascript" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "gallery-data.js";
    link.click();
  });
})();
