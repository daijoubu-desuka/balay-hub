<template>
  <div>
    <AppHeader />
    <div class="banner"><b>Browser storage · offline mode</b>Actions save in this browser only; secure authentication, a database, email, and text messages are not connected.</div>
    <main id="main"><slot /></main>
    <footer class="footer" style="margin-top:0;padding:22px 0">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap">
        <Logo :size="24" />
        <span style="color:var(--muted);font-size:13px">Butuan City real estate · Browser-stored data</span>
        <nav style="display:flex;gap:16px;font-weight:700;color:var(--ink)"><NuxtLink to="/">Browse</NuxtLink><NuxtLink to="/for-rent">For Rent</NuxtLink></nav>
      </div>
    </footer>
  </div>
</template>
