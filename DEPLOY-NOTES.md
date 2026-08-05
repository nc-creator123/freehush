# NC-02 FreeHush — deploy checklist

1. **Domain** ✅ freehush.com (set 2026-08-03). Canonicals/sitemap/robots swapped;
   contact address is `crew@freehush.com` — CREATE THIS MAILBOX so reader mail doesn't bounce.
2. **Demo footer line removed 2026-08-04** ("Demo build, not yet live.") — site is live.
3. **Krisp affiliate tracking LIVE 2026-08-04** — Impact link installed in _redirects
   (301!) and as the /go/krisp/ stub fallback. Never paste the raw pxf.io URL into
   page HTML; everything routes via /go/krisp/. Adobe/Auphonic routes still await
   program approval.
2. **Affiliate redirects → 301s** (config inside each stub):
   - /go/krisp/ → Impact tracking URL (Krisp program)
   - /go/adobe-podcast/ → Partnerize tracking URL (Adobe Affiliate Program; note: Podcast
     Premium is bundled with Adobe Express Premium, which IS an eligible product — confirm
     the right link/product in the Partnerize dashboard)
   - /go/auphonic/ → FastSpring tracking URL (apply at auphonic.com/licensing/affiliate;
     20% commission, 30-day cookies)
   Until an application is approved, point that 301 at the vendor homepage.
3. **GA4** — own property for this site; privacy policy already describes GA4-only.
4. **GSC** — own Search Console property; submit sitemap.xml.
5. **Free-tier facts** — all limits verified 2026-07-28 against vendor pages:
   Krisp Free 60 min/day (help.krisp.ai) · Adobe 1 hr/day, 30-min/500 MB · Auphonic 2 hrs/mo,
   jingle on free, from €9/mo paid · NVIDIA Broadcast RTX-only · re-verify at launch; freemium
   terms move often and the site's whole premise is having them right.
6. **Email** — wire the contact inbox.
7. **Cross-portfolio** — no shared text, palette, byline or phrasing with NC-07 (checked at build).
