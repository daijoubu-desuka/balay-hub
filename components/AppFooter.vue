<template>
  <footer class="footer">
    <div class="wrap">
      <div class="foot-grid">
        <div class="foot-brand">
          <NuxtLink to="/" aria-label="BahayHub home"><Logo :size="28" /></NuxtLink>
          <p>Browser-based property service for Butuan City. Listings and accounts stay on this device.</p>
          <span class="local"><Icon name="shield" /> BUTUAN CITY · LOCAL SERVICE</span>
        </div>
        <div>
          <h4>Explore properties</h4>
          <ul>
            <li><NuxtLink to="/browse?q=Villa Kananga">Condos in Villa Kananga</NuxtLink></li>
            <li><NuxtLink to="/browse?q=J.C. Aquino">Homes near J.C. Aquino Avenue</NuxtLink></li>
            <li><NuxtLink to="/browse?q=Baan Riverside">House &amp; Lots in Baan Riverside</NuxtLink></li>
            <li><NuxtLink to="/commercial">Commercial spaces in Bancasi</NuxtLink></li>
            <li><NuxtLink to="/new-developments">Pre-selling Turnkey Projects</NuxtLink></li>
          </ul>
        </div>
        <div>
          <h4>Services &amp; disclosures</h4>
          <ul>
            <li><button type="button" @click="useUiStore().toast('Broker verification is not connected yet.')">Broker Verification Portal</button></li>
            <li><button type="button" @click="useUiStore().toast('Escrow information only. No funds are held.')">Escrow information · no funds held</button></li>
            <li><button type="button" @click="useUiStore().toast('Open a property and use “Request a viewing”.')">Viewing request</button></li>
            <li><button type="button" @click="useUiStore().toast('Tax reference is informational only.')">Tax reference · informational</button></li>
            <li><button type="button" @click="useUiStore().toast('Agent verification is not checked in this version.')">Agent verification · not checked</button></li>
          </ul>
        </div>
        <div>
          <h4>Consumer assistance</h4>
          <div class="help-box">
            <b>Need help?</b>
            <span>Phone support is not connected</span>
            <span>All workflows stay in this browser</span>
            <span>No email inbox is connected</span>
          </div>
          <button type="button" class="link-orange link-btn" @click="useUiStore().toast('FAQ page will be added in the final phase.')">FAQ: Read the FAQs</button>
        </div>
      </div>
      <div class="legal">
        <div>
          <p>Agent licenses, listing details, titles, and regulatory status have not been verified. No legal, escrow, or financial services are provided.</p>
          <p>© 2026 BahayHub · Butuan City</p>
        </div>
        <nav aria-label="Legal">
          <button type="button" @click="useUiStore().toast('Privacy policy draft coming in the final phase.')">Privacy Policy</button>
          <button type="button" @click="useUiStore().toast('Terms of service draft coming in the final phase.')">Terms of Service</button>
          <button type="button" @click="useUiStore().toast('Disclosures draft coming in the final phase.')">Disclosures</button>
        </nav>
      </div>
    </div>
  </footer>
</template>
