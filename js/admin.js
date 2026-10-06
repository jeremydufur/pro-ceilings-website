
(function () {
  var KEY = "proceilings-gallery";
  var gate = document.getElementById("gate");
  var panel = document.getElementById("panel");
  var mine = document.getElementById("mine");
  var picker = document.getElementById("photos");
  var picked = document.getElementById("picked");
  document.getElementById("pick").addEventListener("click", function () { picker.click(); });
  picker.addEventListener("change", function () {
    picked.textContent = picker.files.length ? picker.files.length + " photo" + (picker.files.length === 1 ? "" : "s") + " ready." : "No photos selected.";
  });
  picker.style.display = "none";
  function load() {
    try { var saved = JSON.parse(localStorage.getItem(KEY) || "[]"); if (saved.length) return saved; } catch (e) {}
    return Array.isArray(window.GALLERY_POSTS) ? window.GALLERY_POSTS.slice() : [];
  }
  function save(posts) { localStorage.setItem(KEY, JSON.stringify(posts)); }
  function shrink(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var max = 1400, scale = Math.min(1, max / Math.max(img.width, img.height));
          var canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  function render() {
    mine.innerHTML = "";
    load().sort(function (a, b) { return b.created - a.created; }).forEach(function (post) {
      var article = document.createElement("article");
      article.className = "post";
      article.innerHTML = '<div class="post-head"><strong></strong></div><p></p><div class="post-tools"><button class="danger" type="button">Remove</button></div>';
      article.querySelector("strong").textContent = post.title;
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
    if (document.getElementById("code").value === "ProCeilings684") {
      sessionStorage.setItem("proceilings-auth", "yes");
      gate.classList.add("hidden");
      panel.classList.remove("hidden");
      render();
    } else alert("That code is not right.");
  });
  document.getElementById("uploader").addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!picker.files.length) { alert("Upload at least one photo."); return; }
    var photos = [];
    for (var i = 0; i < picker.files.length; i++) photos.push(await shrink(picker.files[i]));
    var posts = load();
    posts.push({
      id: Date.now().toString(),
      created: Date.now(),
      title: document.getElementById("title").value.trim(),
      description: document.getElementById("description").value.trim(),
      photos: photos
    });
    save(posts);
    event.target.reset();
    picked.textContent = "No photos selected.";
    render();
    alert("Posted. Open Before & After to see it.");
  });
  document.getElementById("export").addEventListener("click", function () {
    var blob = new Blob(["window.GALLERY_POSTS = " + JSON.stringify(load()) + ";\n"], { type: "text/javascript" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "gallery-data.js";
    link.click();
  });
})();
