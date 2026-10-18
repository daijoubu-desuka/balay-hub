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
            <li><NuxtLink to="/?q=Villa Kananga">Condos in Villa Kananga</NuxtLink></li>
            <li><NuxtLink to="/?q=J.C. Aquino">Homes near J.C. Aquino Avenue</NuxtLink></li>
            <li><NuxtLink to="/?q=Baan Riverside">House &amp; Lots in Baan Riverside</NuxtLink></li>
            <li><NuxtLink to="/commercial">Commercial spaces in Bancasi</NuxtLink></li>
            <li><NuxtLink to="/new-developments">Pre-selling Turnkey Projects</NuxtLink></li>
          </ul>
        </div>
        <div>
          <h4>Services &amp; disclosures</h4>
          <ul>
            <li><a href="#" @click.prevent="useUiStore().toast('Broker verification is not connected yet.')">Broker Verification Portal</a></li>
            <li><a href="#" @click.prevent="useUiStore().toast('Escrow information only. No funds are held.')">Escrow information · no funds held</a></li>
            <li><a href="#" @click.prevent="useUiStore().toast('Open a property and use “Request a viewing”.')">Viewing request</a></li>
            <li><a href="#" @click.prevent="useUiStore().toast('Tax reference is informational only.')">Tax reference · informational</a></li>
            <li><a href="#" @click.prevent="useUiStore().toast('Agent verification is not checked in this version.')">Agent verification · not checked</a></li>
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
          <a href="#" class="link-orange" style="text-transform:none;font-size:13px" @click.prevent="useUiStore().toast('FAQ page will be added in the final phase.')">FAQ: Read the FAQs</a>
        </div>
      </div>
      <div class="legal">
        <div>
          <p>Agent licenses, listing details, titles, and regulatory status have not been verified. No legal, escrow, or financial services are provided.</p>
          <p>© 2026 BahayHub · Butuan City</p>
        </div>
        <nav aria-label="Legal">
          <a href="#" @click.prevent="useUiStore().toast('Privacy policy draft coming in the final phase.')">Privacy Policy</a>
          <a href="#" @click.prevent="useUiStore().toast('Terms of service draft coming in the final phase.')">Terms of Service</a>
          <a href="#" @click.prevent="useUiStore().toast('Disclosures draft coming in the final phase.')">Disclosures</a>
        </nav>
      </div>
    </div>
  </footer>
</template>
