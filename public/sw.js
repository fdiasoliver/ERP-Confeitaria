// Service worker mínimo — existe só para satisfazer o critério de
// instalabilidade do Chrome (precisa de um SW registrado com handler de
// fetch). Deliberadamente sem estratégia de cache offline: pedidos, estoque e
// preços mudam o tempo todo — cachear agressivamente serviria dado
// desatualizado para quem estivesse offline. Se/quando fizer sentido cache
// real (ex: assets estáticos da Vitrine), desenhar com cuidado então.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
