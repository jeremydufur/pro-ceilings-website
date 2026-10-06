
(function () {
  var KEY = "proceilings-gallery";
  var gate = document.getElementById("gate");
  var panel = document.getElementById("panel");
  var mine = document.getElementById("mine");
  var picker = document.getElementById("photos");
  var picked = document.getElementById("picked");
  var order = document.getElementById("order");
  var queue = [];
  document.getElementById("pick").addEventListener("click", function () { picker.click(); });
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
  function drawOrder() {
    order.innerHTML = "";
    picked.textContent = queue.length ? "Set the photo order, then add the post." : "No photos selected. After upload, set the order, then add the post.";
    queue.forEach(function (src, index) {
      var row = document.createElement("div");
      row.className = "order-item";
      row.innerHTML = '<img alt=""><strong></strong><button type="button" data-dir="-1">Earlier</button><button type="button" data-dir="1">Later</button>';
      row.querySelector("img").src = src;
      row.querySelector("strong").textContent = "Photo " + (index + 1);
      row.querySelectorAll("button").forEach(function (button) {
        button.addEventListener("click", function () {
          var next = index + Number(button.getAttribute("data-dir"));
          if (next < 0 || next >= queue.length) return;
          var moved = queue.splice(index, 1)[0];
          queue.splice(next, 0, moved);
          drawOrder();
        });
      });
      order.appendChild(row);
    });
  }
  picker.addEventListener("change", async function () {
    for (var i = 0; i < picker.files.length; i++) queue.push(await shrink(picker.files[i]));
    picker.value = "";
    drawOrder();
  });
  function load() {
    try { var saved = JSON.parse(localStorage.getItem(KEY) || "[]"); if (saved.length) return saved; } catch (e) {}
    return Array.isArray(window.GALLERY_POSTS) ? window.GALLERY_POSTS.slice() : [];
  }
  function save(posts) { localStorage.setItem(KEY, JSON.stringify(posts)); }
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
    var entered = document.getElementById("code").value.trim();
    if (entered === "ProCeilings684") {
      sessionStorage.setItem("proceilings-auth", "yes");
      gate.classList.add("hidden");
      panel.classList.remove("hidden");
      render();
    } else {
      alert("That code is not right. Use ProCeilings684");
    }
  });
  document.getElementById("uploader").addEventListener("submit", function (event) {
    event.preventDefault();
    if (!queue.length) { alert("Upload at least one photo."); return; }
    var posts = load();
    posts.push({
      id: Date.now().toString(),
      created: Date.now(),
      title: document.getElementById("title").value.trim(),
      description: document.getElementById("description").value.trim(),
      photos: queue.slice()
    });
    save(posts);
    event.target.reset();
    queue = [];
    drawOrder();
    render();
    window.location.href = "completed-jobs.html";
  });
  var exportButton = document.getElementById("export");
  if (exportButton) exportButton.addEventListener("click", function () {
    var body = "window.GALLERY_POSTS = " + JSON.stringify(load()) + ";";
    var blob = new Blob([body], { type: "text/javascript" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "gallery-data.js";
    link.click();
  });
})();
