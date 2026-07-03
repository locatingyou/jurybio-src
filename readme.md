<p align="center">
    <img src=".github/transparent-logo.png" height="128" width="128" />
</p>

## stack

- nextjs
- postgresql
- drizzle orm
- zod
- resend

#### (package/icon details)

- react-icons (social icons)
- tabler-icons (ui icons)

## Architecture

```
├── app
│   ├── [url] <- SSR & RSC
│   │   ├── not-found.tsx
│   │   └── page.tsx
│   ├── _components
│   │   ├── background.tsx
│   │   ├── footer.tsx
│   │   ├── header.tsx
│   │   └── landing-page
│   │       ├── cta.tsx
│   │       ├── faq.tsx
│   │       ├── features.tsx
│   │       ├── hero.tsx
│   │       └── pricing.tsx
│   ├── dashboard <- RSC
│   │   ├── _components
│   │   │   ├── analytics
│   │   │   │   ├── devices-card.tsx
│   │   │   │   ├── total-cards.tsx
│   │   │   │   └── views-chart.tsx
│   │   │   └── overview
│   │   │       ├── cards
│   │   │       │   └── index.tsx
│   │   │       ├── profile-completion.tsx
│   │   │       └── quick-actions.tsx
│   │   ├── analytics
│   │   │   └── page.tsx
│   │   ├── badges
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── profile
│   │       ├── _components
│   │       │   ├── AvatarBannerUploader.tsx
│   │       │   ├── BackgroundManager.tsx
│   │       │   ├── ProfilePreviewWrapper.tsx
│   │       │   └── RichTextEditor.tsx
│   │       ├── _forms
│   │       │   ├── Animation-Settings.tsx
│   │       │   ├── AvailableBadges.tsx
│   │       │   ├── CardSettings.tsx
│   │       │   ├── LayoutForm.tsx
│   │       │   ├── PageEffects.tsx
│   │       │   └── ProfileForm.tsx
│   │       └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── legal
│   │   ├── privacy
│   │   │   └── page.tsx
│   │   └── terms
│   │       └── page.tsx
│   ├── not-found.tsx
│   ├── page.tsx
│   ├── privacy
│   │   └── page.tsx
│   └── terms
│       └── page.tsx
```
