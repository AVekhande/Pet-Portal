function showTip(id) {
  let tip = document.getElementById(id);
  if (tip.style.display === "none" || tip.style.display === "") {
    tip.style.display = "block";
  } else {
    tip.style.display = "none";
  }
}