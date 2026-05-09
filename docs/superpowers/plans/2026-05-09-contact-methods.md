# Contact Methods & Tag Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add up to 5 customizable contact method links with icons to the hero section (replacing the contact button), and add icon support to tags.

**Architecture:** New `ContactMethods` DB table with own controller/service; `Tag` entity gains nullable icon columns; shared `IconPickerComponent` (ControlValueAccessor) used in both contact and tag admin forms; 15 SVG icons bundled in `assets/icons/`.

**Tech Stack:** ASP.NET Core 8, EF Core + SQLite, Angular 21 standalone components, signals, Reactive Forms, ControlValueAccessor.

---

## File Map

| Action | Path |
|--------|------|
| Create ×15 | `Portfolio-Client/src/assets/icons/*.svg` |
| Create | `Portfolio-Client/src/app/components/icon-picker/icon-picker.component.ts` |
| Create | `Portfolio-Client/src/app/components/icon-picker/icon-picker.component.spec.ts` |
| Create | `Portfolio/Api/Models/ContactMethod.cs` |
| Create | `Portfolio/Api/Models/Dtos/ContactMethodRequest.cs` |
| Create | `Portfolio/Api/Models/Dtos/ContactMethodResponse.cs` |
| Create | `Portfolio/Api/Controllers/ContactMethodsController.cs` |
| Create | `Portfolio-Client/src/app/services/contact-method.service.ts` |
| Create | `Portfolio-Client/src/app/services/contact-method.service.spec.ts` |
| Modify | `Portfolio/Api/Data/AppDbContext.cs` |
| Modify | `Portfolio/Api/Models/Tag.cs` |
| Modify | `Portfolio/Api/Models/Dtos/TagDto.cs` |
| Modify | `Portfolio/Api/Controllers/TagsController.cs` |
| Modify | `Portfolio-Client/src/app/config/api.config.ts` |
| Modify | `Portfolio-Client/src/app/services/tag.service.ts` |
| Modify | `Portfolio-Client/src/app/components/admin/admin.component.ts` |
| Modify | `Portfolio-Client/src/app/components/admin/admin.component.html` |
| Modify | `Portfolio-Client/src/app/components/admin/admin.component.scss` |
| Modify | `Portfolio-Client/src/app/components/home/home.component.ts` |
| Modify | `Portfolio-Client/src/app/components/home/home.component.html` |
| Modify | `Portfolio-Client/src/app/components/home/home.component.scss` |

---

### Task 1: Bundle SVG icons

**Files:**
- Create: `Portfolio-Client/src/assets/icons/linkedin.svg` (and 14 more)

- [ ] **Step 1: Create assets/icons directory and all 15 SVG files**

Create each file with this exact content:

**`Portfolio-Client/src/assets/icons/linkedin.svg`**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
</svg>
```

**`Portfolio-Client/src/assets/icons/github.svg`**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
</svg>
```

**`Portfolio-Client/src/assets/icons/telegram.svg`**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
</svg>
```

**`Portfolio-Client/src/assets/icons/whatsapp.svg`**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
</svg>
```

**`Portfolio-Client/src/assets/icons/discord.svg`**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.034.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
</svg>
```

**`Portfolio-Client/src/assets/icons/email.svg`**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
</svg>
```

**`Portfolio-Client/src/assets/icons/instagram.svg`**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12c0 3.259.014 3.668.072 4.948.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.689.072-4.948 0-3.259-.014-3.667-.072-4.947-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
</svg>
```

**`Portfolio-Client/src/assets/icons/x.svg`**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
</svg>
```

**`Portfolio-Client/src/assets/icons/youtube.svg`**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
</svg>
```

**`Portfolio-Client/src/assets/icons/reddit.svg`**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
</svg>
```

**`Portfolio-Client/src/assets/icons/tiktok.svg`**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
</svg>
```

**`Portfolio-Client/src/assets/icons/phone.svg`**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
</svg>
```

**`Portfolio-Client/src/assets/icons/website.svg`**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
</svg>
```

**`Portfolio-Client/src/assets/icons/twitch.svg`**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
</svg>
```

**`Portfolio-Client/src/assets/icons/vk.svg`**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.12-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.864 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
</svg>
```

- [ ] **Step 2: Verify files exist**

Run: `ls Portfolio-Client/src/assets/icons/`
Expected: 15 `.svg` files listed.

- [ ] **Step 3: Commit**

```bash
git add Portfolio-Client/src/assets/icons/
git commit -m "feat: add bundled SVG icon set for contact methods and tags"
```

---

### Task 2: IconPickerComponent

**Files:**
- Create: `Portfolio-Client/src/app/components/icon-picker/icon-picker.component.ts`
- Create: `Portfolio-Client/src/app/components/icon-picker/icon-picker.component.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `Portfolio-Client/src/app/components/icon-picker/icon-picker.component.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IconPickerComponent, IconSelection } from './icon-picker.component';

@Component({
  standalone: true,
  imports: [IconPickerComponent, ReactiveFormsModule],
  template: `<app-icon-picker [formControl]="ctrl" />`
})
class HostComponent {
  ctrl = new FormControl<IconSelection>({ iconKey: null, customIconUrl: null });
}

describe('IconPickerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent]
    }).compileComponents();
  });

  it('selecting predefined icon sets iconKey and clears customIconUrl', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const picker = fixture.debugElement.query(
      e => e.componentInstance instanceof IconPickerComponent
    ).componentInstance as IconPickerComponent;

    picker.selectIcon('github');
    expect(host.ctrl.value).toEqual({ iconKey: 'github', customIconUrl: null });
  });

  it('typing custom URL clears iconKey', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const picker = fixture.debugElement.query(
      e => e.componentInstance instanceof IconPickerComponent
    ).componentInstance as IconPickerComponent;

    picker.selectIcon('github');
    picker.onCustomUrl('https://example.com/icon.svg');
    expect(host.ctrl.value).toEqual({ iconKey: null, customIconUrl: 'https://example.com/icon.svg' });
  });

  it('writeValue populates the component value', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const picker = fixture.debugElement.query(
      e => e.componentInstance instanceof IconPickerComponent
    ).componentInstance as IconPickerComponent;

    host.ctrl.setValue({ iconKey: 'linkedin', customIconUrl: null });
    fixture.detectChanges();
    expect(picker.value).toEqual({ iconKey: 'linkedin', customIconUrl: null });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run from `Portfolio-Client/`: `npx vitest run src/app/components/icon-picker/icon-picker.component.spec.ts`
Expected: FAIL — `IconPickerComponent` not found.

- [ ] **Step 3: Create the component**

Create `Portfolio-Client/src/app/components/icon-picker/icon-picker.component.ts`:

```typescript
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  forwardRef, inject
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface IconSelection {
  iconKey: string | null;
  customIconUrl: string | null;
}

export const ICONS = [
  'linkedin', 'github', 'telegram', 'whatsapp', 'discord',
  'email', 'instagram', 'x', 'youtube', 'reddit',
  'tiktok', 'phone', 'website', 'twitch', 'vk'
] as const;

@Component({
  selector: 'app-icon-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => IconPickerComponent),
    multi: true
  }],
  template: `
<div class="icon-picker">
  <div class="icon-grid">
    @for (key of icons; track key) {
      <button type="button" class="icon-btn"
              [class.selected]="value.iconKey === key"
              (click)="selectIcon(key)" [title]="key">
        <img [src]="'/assets/icons/' + key + '.svg'" [alt]="key" width="20" height="20">
      </button>
    }
  </div>
  <input class="icon-url-input" type="text"
         placeholder="Or paste icon URL…"
         [value]="value.customIconUrl ?? ''"
         (input)="onCustomUrl($any($event.target).value)">
</div>
`,
  styles: [`
.icon-picker { display: flex; flex-direction: column; gap: 8px; }
.icon-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.icon-btn {
  width: 36px; height: 36px; border-radius: 6px;
  border: 2px solid var(--g-border);
  background: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  padding: 0; transition: border-color 0.15s;
  img { display: block; }
}
.icon-btn:hover { border-color: var(--g-primary); }
.icon-btn.selected { border-color: var(--g-primary); background: oklch(96% 0.04 278); }
.icon-url-input {
  width: 100%; padding: 0.5rem 0.75rem;
  border: 1px solid var(--g-border); border-radius: 8px;
  font-size: 0.875rem; background: #fff; color: var(--g-text);
  box-sizing: border-box; font-family: inherit;
}
.icon-url-input:focus { outline: none; border-color: var(--g-primary); }
  `]
})
export class IconPickerComponent implements ControlValueAccessor {
  private cdr = inject(ChangeDetectorRef);

  readonly icons = ICONS;
  value: IconSelection = { iconKey: null, customIconUrl: null };

  private onChange: (v: IconSelection) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(v: IconSelection | null): void {
    this.value = v ?? { iconKey: null, customIconUrl: null };
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (v: IconSelection) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  selectIcon(key: string): void {
    this.value = { iconKey: key, customIconUrl: null };
    this.onChange(this.value);
    this.onTouched();
    this.cdr.markForCheck();
  }

  onCustomUrl(url: string): void {
    this.value = { iconKey: null, customIconUrl: url || null };
    this.onChange(this.value);
    this.onTouched();
    this.cdr.markForCheck();
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/app/components/icon-picker/icon-picker.component.spec.ts`
Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add Portfolio-Client/src/app/components/icon-picker/
git commit -m "feat: add IconPickerComponent with ControlValueAccessor"
```

---

### Task 3: Backend — ContactMethod model, DTOs, AppDbContext

**Files:**
- Create: `Portfolio/Api/Models/ContactMethod.cs`
- Create: `Portfolio/Api/Models/Dtos/ContactMethodRequest.cs`
- Create: `Portfolio/Api/Models/Dtos/ContactMethodResponse.cs`
- Modify: `Portfolio/Api/Data/AppDbContext.cs`

- [ ] **Step 1: Create ContactMethod entity**

Create `Portfolio/Api/Models/ContactMethod.cs`:

```csharp
namespace Portfolio.Api.Models;

public class ContactMethod
{
    public int Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public string? IconKey { get; set; }
    public string? CustomIconUrl { get; set; }
    public string Url { get; set; } = string.Empty;
    public int Order { get; set; }
}
```

- [ ] **Step 2: Create DTOs**

Create `Portfolio/Api/Models/Dtos/ContactMethodRequest.cs`:

```csharp
namespace Portfolio.Api.Models.Dtos;

public class ContactMethodRequest
{
    public string Label { get; set; } = string.Empty;
    public string? IconKey { get; set; }
    public string? CustomIconUrl { get; set; }
    public string Url { get; set; } = string.Empty;
    public int Order { get; set; }
}
```

Create `Portfolio/Api/Models/Dtos/ContactMethodResponse.cs`:

```csharp
namespace Portfolio.Api.Models.Dtos;

public class ContactMethodResponse
{
    public int Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public string? IconKey { get; set; }
    public string? CustomIconUrl { get; set; }
    public string Url { get; set; } = string.Empty;
    public int Order { get; set; }
}
```

- [ ] **Step 3: Add DbSet to AppDbContext**

In `Portfolio/Api/Data/AppDbContext.cs`, add this line after the existing `DbSet` declarations:

```csharp
public DbSet<ContactMethod> ContactMethods => Set<ContactMethod>();
```

Full file after edit:

```csharp
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Models;

namespace Portfolio.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<ContactMethod> ContactMethods => Set<ContactMethod>();
    public DbSet<UserProfile> Profiles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Project>()
            .HasMany(p => p.Tags)
            .WithMany()
            .UsingEntity(j => j.ToTable("ProjectTags"));

        modelBuilder.Entity<UserProfile>().HasData(new UserProfile
        {
            Id = 1,
            Name = "Serhio",
            Role = "Software & Unity Developer",
            Bio = "I build immersive experiences...",
            PhotoUrl = "https://placehold.co/400x400/10b981/white?text=S",
            CvUrl = "#",
            Email = "hello@example.com"
        });
    }
}
```

- [ ] **Step 4: Build to verify no compile errors**

Run from `Portfolio/`: `dotnet build`
Expected: Build succeeded, 0 errors.

- [ ] **Step 5: Commit**

```bash
git add Portfolio/Api/Models/ContactMethod.cs Portfolio/Api/Models/Dtos/ContactMethodRequest.cs Portfolio/Api/Models/Dtos/ContactMethodResponse.cs Portfolio/Api/Data/AppDbContext.cs
git commit -m "feat(backend): add ContactMethod entity, DTOs, and DbSet"
```

---

### Task 4: Backend — AddContactMethods EF migration

**Files:**
- Auto-generated: `Portfolio/Migrations/`

- [ ] **Step 1: Create the migration**

Run from `Portfolio/`:
```powershell
dotnet ef migrations add AddContactMethods
```
Expected: New migration file `Portfolio/Migrations/<timestamp>_AddContactMethods.cs` created.

- [ ] **Step 2: Verify migration content**

Open the generated `Up` method. It must contain a `CreateTable` call for `ContactMethods` with columns: `Id`, `Label`, `IconKey`, `CustomIconUrl`, `Url`, `Order`. If it doesn't, the DbSet was not wired up correctly — go back to Task 3 Step 3.

- [ ] **Step 3: Apply migration**

Run from `Portfolio/`:
```powershell
dotnet ef database update
```
Expected: `Applying migration '..._AddContactMethods'`. If you see "No migrations were applied", verify step 1 ran successfully.

- [ ] **Step 4: Verify table exists**

Run from `Portfolio/`:
```powershell
dotnet run &
```
Then `GET http://localhost:5177/api/ContactMethods` — expected: `200 []` (empty array).
Stop the server.

- [ ] **Step 5: Commit**

```bash
git add Portfolio/Migrations/
git commit -m "feat(backend): add AddContactMethods EF migration"
```

---

### Task 5: Backend — ContactMethodsController

**Files:**
- Create: `Portfolio/Api/Controllers/ContactMethodsController.cs`

- [ ] **Step 1: Create the controller**

Create `Portfolio/Api/Controllers/ContactMethodsController.cs`:

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Data;
using Portfolio.Api.Models;
using Portfolio.Api.Models.Dtos;

namespace Portfolio.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactMethodsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ContactMethodsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var methods = await _context.ContactMethods
            .OrderBy(m => m.Order)
            .ToListAsync();
        return Ok(methods.Select(ToResponse));
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ContactMethodRequest request)
    {
        if (await _context.ContactMethods.CountAsync() >= 5)
            return BadRequest(new { error = new { code = "MAX_CONTACT_METHODS", message = "Maximum 5 contact methods allowed." } });

        var method = new ContactMethod
        {
            Label = request.Label,
            IconKey = request.IconKey,
            CustomIconUrl = request.CustomIconUrl,
            Url = request.Url,
            Order = request.Order
        };
        _context.ContactMethods.Add(method);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = method.Id }, ToResponse(method));
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ContactMethodRequest request)
    {
        var method = await _context.ContactMethods.FindAsync(id);
        if (method == null) return NotFound();

        method.Label = request.Label;
        method.IconKey = request.IconKey;
        method.CustomIconUrl = request.CustomIconUrl;
        method.Url = request.Url;
        method.Order = request.Order;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var method = await _context.ContactMethods.FindAsync(id);
        if (method == null) return NotFound();
        _context.ContactMethods.Remove(method);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpPut("reorder")]
    public async Task<IActionResult> Reorder([FromBody] int[] orderedIds)
    {
        var methods = await _context.ContactMethods.ToListAsync();
        if (orderedIds.Length != methods.Count ||
            !orderedIds.OrderBy(x => x).SequenceEqual(methods.Select(m => m.Id).OrderBy(x => x)))
            return BadRequest(new { error = new { code = "INVALID_IDS", message = "Submitted IDs do not match existing contact methods." } });

        for (int i = 0; i < orderedIds.Length; i++)
        {
            var method = methods.First(m => m.Id == orderedIds[i]);
            method.Order = i;
        }
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static ContactMethodResponse ToResponse(ContactMethod m) => new()
    {
        Id = m.Id,
        Label = m.Label,
        IconKey = m.IconKey,
        CustomIconUrl = m.CustomIconUrl,
        Url = m.Url,
        Order = m.Order
    };
}
```

- [ ] **Step 2: Build to verify**

Run from `Portfolio/`: `dotnet build`
Expected: Build succeeded, 0 errors.

- [ ] **Step 3: Smoke-test the API**

Run `dotnet run` from `Portfolio/`.
- `GET http://localhost:5177/api/ContactMethods` → `200 []`
- `POST http://localhost:5177/api/ContactMethods` with JWT header and body `{"label":"LinkedIn","iconKey":"linkedin","customIconUrl":null,"url":"https://linkedin.com/in/me","order":0}` → `201`
- `GET http://localhost:5177/api/ContactMethods` → `200 [{"id":1,"label":"LinkedIn",...}]`

Stop the server.

- [ ] **Step 4: Commit**

```bash
git add Portfolio/Api/Controllers/ContactMethodsController.cs
git commit -m "feat(backend): add ContactMethodsController with CRUD and reorder"
```

---

### Task 6: Backend — Update Tag entity, TagDto, TagRequest

**Files:**
- Modify: `Portfolio/Api/Models/Tag.cs`
- Modify: `Portfolio/Api/Models/Dtos/TagDto.cs`
- Create: `Portfolio/Api/Models/Dtos/TagRequest.cs`

- [ ] **Step 1: Add icon fields to Tag entity**

Replace `Portfolio/Api/Models/Tag.cs` with:

```csharp
namespace Portfolio.Api.Models;

public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#ffffff";
    public string? IconKey { get; set; }
    public string? CustomIconUrl { get; set; }
}
```

- [ ] **Step 2: Update TagDto to include icon fields**

Replace `Portfolio/Api/Models/Dtos/TagDto.cs` with:

```csharp
namespace Portfolio.Api.Models.Dtos;

public class TagDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#ffffff";
    public string? IconKey { get; set; }
    public string? CustomIconUrl { get; set; }
}
```

- [ ] **Step 3: Create TagRequest DTO**

Create `Portfolio/Api/Models/Dtos/TagRequest.cs`:

```csharp
namespace Portfolio.Api.Models.Dtos;

public class TagRequest
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#ffffff";
    public string? IconKey { get; set; }
    public string? CustomIconUrl { get; set; }
}
```

- [ ] **Step 4: Build to verify**

Run from `Portfolio/`: `dotnet build`
Expected: Build succeeded, 0 errors.

- [ ] **Step 5: Commit**

```bash
git add Portfolio/Api/Models/Tag.cs Portfolio/Api/Models/Dtos/TagDto.cs Portfolio/Api/Models/Dtos/TagRequest.cs
git commit -m "feat(backend): add icon fields to Tag entity and DTOs"
```

---

### Task 7: Backend — AddTagIcons migration + update TagsController

**Files:**
- Auto-generated: `Portfolio/Migrations/`
- Modify: `Portfolio/Api/Controllers/TagsController.cs`

- [ ] **Step 1: Create the migration**

Run from `Portfolio/`:
```powershell
dotnet ef migrations add AddTagIcons
```
Expected: new migration with `AddColumn` for `IconKey` and `CustomIconUrl` on `Tags` table.

- [ ] **Step 2: Apply migration**

Run from `Portfolio/`:
```powershell
dotnet ef database update
```
Expected: migration applied.

- [ ] **Step 3: Update TagsController**

Replace `Portfolio/Api/Controllers/TagsController.cs` with:

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Data;
using Portfolio.Api.Models;
using Portfolio.Api.Models.Dtos;

namespace Portfolio.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TagsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TagsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetTags()
    {
        var tags = await _context.Tags.ToListAsync();
        return Ok(tags.Select(ToDto));
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateTag([FromBody] TagRequest request)
    {
        var tag = new Tag
        {
            Name = request.Name,
            Color = request.Color,
            IconKey = request.IconKey,
            CustomIconUrl = request.CustomIconUrl
        };
        _context.Tags.Add(tag);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetTags), new { id = tag.Id }, ToDto(tag));
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTag(int id, [FromBody] TagRequest request)
    {
        var tag = await _context.Tags.FindAsync(id);
        if (tag == null) return NotFound();

        tag.Name = request.Name;
        tag.Color = request.Color;
        tag.IconKey = request.IconKey;
        tag.CustomIconUrl = request.CustomIconUrl;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTag(int id)
    {
        var tag = await _context.Tags.FindAsync(id);
        if (tag == null) return NotFound();
        _context.Tags.Remove(tag);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static TagDto ToDto(Tag t) => new()
    {
        Id = t.Id,
        Name = t.Name,
        Color = t.Color,
        IconKey = t.IconKey,
        CustomIconUrl = t.CustomIconUrl
    };
}
```

- [ ] **Step 4: Build to verify**

Run from `Portfolio/`: `dotnet build`
Expected: Build succeeded, 0 errors.

- [ ] **Step 5: Commit**

```bash
git add Portfolio/Migrations/ Portfolio/Api/Controllers/TagsController.cs
git commit -m "feat(backend): add AddTagIcons migration and update TagsController"
```

---

### Task 8: Frontend — api.config, ContactMethodService, TagService update

**Files:**
- Modify: `Portfolio-Client/src/app/config/api.config.ts`
- Create: `Portfolio-Client/src/app/services/contact-method.service.ts`
- Create: `Portfolio-Client/src/app/services/contact-method.service.spec.ts`
- Modify: `Portfolio-Client/src/app/services/tag.service.ts`

- [ ] **Step 1: Write failing service test**

Create `Portfolio-Client/src/app/services/contact-method.service.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ContactMethodService } from './contact-method.service';
import { API_CONFIG } from '../config/api.config';

describe('ContactMethodService', () => {
  let service: ContactMethodService;
  let http: HttpTestingController;
  const base = `${API_CONFIG.baseUrl}/ContactMethods`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ContactMethodService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getMethods calls GET /ContactMethods', () => {
    service.getMethods().subscribe();
    http.expectOne(base).flush([]);
  });

  it('createMethod calls POST /ContactMethods', () => {
    const req = { label: 'X', iconKey: 'x', customIconUrl: null, url: 'https://x.com', order: 0 };
    service.createMethod(req).subscribe();
    const r = http.expectOne(base);
    expect(r.request.method).toBe('POST');
    r.flush({ id: 1, ...req });
  });

  it('deleteMethod calls DELETE /ContactMethods/1', () => {
    service.deleteMethod(1).subscribe();
    const r = http.expectOne(`${base}/1`);
    expect(r.request.method).toBe('DELETE');
    r.flush(null);
  });

  it('reorder calls PUT /ContactMethods/reorder', () => {
    service.reorder([2, 1, 3]).subscribe();
    const r = http.expectOne(`${base}/reorder`);
    expect(r.request.method).toBe('PUT');
    expect(r.request.body).toEqual([2, 1, 3]);
    r.flush(null);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/services/contact-method.service.spec.ts`
Expected: FAIL — `ContactMethodService` not found.

- [ ] **Step 3: Add contactMethods endpoint to api.config.ts**

Replace `Portfolio-Client/src/app/config/api.config.ts` with:

```typescript
import { environment } from '../../environments/environment';

export const API_CONFIG = {
  baseUrl: environment.baseUrl,
  endpoints: {
    project: 'Project',
    auth: 'auth',
    profile: 'profile',
    tags: 'Tags',
    contactMethods: 'ContactMethods'
  }
};
```

- [ ] **Step 4: Create ContactMethodService**

Create `Portfolio-Client/src/app/services/contact-method.service.ts`:

```typescript
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';

export interface ContactMethod {
  id: number;
  label: string;
  iconKey: string | null;
  customIconUrl: string | null;
  url: string;
  order: number;
}

export interface ContactMethodRequest {
  label: string;
  iconKey: string | null;
  customIconUrl: string | null;
  url: string;
  order: number;
}

@Injectable({ providedIn: 'root' })
export class ContactMethodService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.endpoints.contactMethods}`;

  getMethods() {
    return this.http.get<ContactMethod[]>(this.apiUrl);
  }

  createMethod(request: ContactMethodRequest) {
    return this.http.post<ContactMethod>(this.apiUrl, request);
  }

  updateMethod(id: number, request: ContactMethodRequest) {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  deleteMethod(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  reorder(orderedIds: number[]) {
    return this.http.put<void>(`${this.apiUrl}/reorder`, orderedIds);
  }
}
```

- [ ] **Step 5: Update TagService with icon fields**

Replace `Portfolio-Client/src/app/services/tag.service.ts` with:

```typescript
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';

export interface Tag {
  id: number;
  name: string;
  color: string;
  iconKey: string | null;
  customIconUrl: string | null;
}

export interface TagRequest {
  name: string;
  color: string;
  iconKey: string | null;
  customIconUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class TagService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.endpoints.tags}`;

  getTags() {
    return this.http.get<Tag[]>(this.apiUrl);
  }

  createTag(tag: TagRequest) {
    return this.http.post<Tag>(this.apiUrl, tag);
  }

  updateTag(id: number, tag: TagRequest) {
    return this.http.put<void>(`${this.apiUrl}/${id}`, { id, ...tag });
  }

  deleteTag(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

- [ ] **Step 6: Run tests**

Run: `npx vitest run src/app/services/contact-method.service.spec.ts`
Expected: 4 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add Portfolio-Client/src/app/config/api.config.ts Portfolio-Client/src/app/services/contact-method.service.ts Portfolio-Client/src/app/services/contact-method.service.spec.ts Portfolio-Client/src/app/services/tag.service.ts
git commit -m "feat(frontend): add ContactMethodService, update TagService with icon fields"
```

---

### Task 9: Frontend — Admin component (Contact tab + tag icon picker)

**Files:**
- Modify: `Portfolio-Client/src/app/components/admin/admin.component.ts`
- Modify: `Portfolio-Client/src/app/components/admin/admin.component.html`
- Modify: `Portfolio-Client/src/app/components/admin/admin.component.scss`

- [ ] **Step 1: Update admin.component.ts**

Replace `Portfolio-Client/src/app/components/admin/admin.component.ts` with:

```typescript
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProjectService, Project, ProjectRequest } from '../../services/project.service';
import { ProfileService } from '../../services/profile.service';
import { TagService, Tag, TagRequest } from '../../services/tag.service';
import { ContactMethodService, ContactMethod, ContactMethodRequest } from '../../services/contact-method.service';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';
import { IconPickerComponent, IconSelection } from '../icon-picker/icon-picker.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MarkdownEditorComponent, IconPickerComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  private projectService = inject(ProjectService);
  private profileService = inject(ProfileService);
  private tagService = inject(TagService);
  private contactMethodService = inject(ContactMethodService);

  activeTab = signal<'profile' | 'projects' | 'tags' | 'contact'>('projects');
  projects = signal<Project[]>([]);
  allTags = signal<Tag[]>([]);
  contactMethods = signal<ContactMethod[]>([]);
  editingProjectId = signal<number | null>(null);
  editingTagId = signal<number | null>(null);
  editingContactId = signal<number | null>(null);
  selectedTagIds = signal<number[]>([]);
  isSubmittingProject = false;
  isSubmittingProfile = false;
  isSubmittingContact = false;

  profileForm = new FormGroup({
    name: new FormControl('', Validators.required),
    role: new FormControl('', Validators.required),
    bio: new FormControl(''),
    photoUrl: new FormControl(''),
    cvUrl: new FormControl(''),
    email: new FormControl('', Validators.email)
  });

  projectForm = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl(''),
    downloads: new FormControl('0'),
    videoLayout: new FormControl('above'),
    videoUrl: new FormControl(''),
    marketLink: new FormControl(''),
    previewImageUrl: new FormControl('')
  });

  tagForm = new FormGroup({
    name: new FormControl('', Validators.required),
    color: new FormControl('#3b82f6', Validators.required),
    icon: new FormControl<IconSelection>({ iconKey: null, customIconUrl: null })
  });

  contactForm = new FormGroup({
    label: new FormControl('', Validators.required),
    url: new FormControl('', Validators.required),
    icon: new FormControl<IconSelection>({ iconKey: null, customIconUrl: null })
  });

  ngOnInit(): void {
    this.loadProjects();
    this.loadProfile();
    this.loadTags();
    this.loadContactMethods();
  }

  loadProjects() {
    this.projectService.getProjects().subscribe({
      next: (data) => this.projects.set(data),
      error: (err) => console.error('Failed to load projects', err)
    });
  }

  loadProfile() {
    this.profileService.getProfile().subscribe({
      next: (data) => { if (data) this.profileForm.patchValue(data); },
      error: (err) => console.error('Failed to load profile', err)
    });
  }

  loadTags() {
    this.tagService.getTags().subscribe({
      next: (data) => this.allTags.set(data),
      error: (err) => console.error('Failed to load tags', err)
    });
  }

  loadContactMethods() {
    this.contactMethodService.getMethods().subscribe({
      next: (data) => this.contactMethods.set(data),
      error: (err) => console.error('Failed to load contact methods', err)
    });
  }

  onProfileSubmit() {
    if (this.profileForm.invalid || this.isSubmittingProfile) return;
    this.isSubmittingProfile = true;
    this.profileService.updateProfile(this.profileForm.value).subscribe({
      next: () => { alert('Profile updated successfully!'); this.isSubmittingProfile = false; },
      error: () => { this.isSubmittingProfile = false; }
    });
  }

  onSubmit() {
    if (this.projectForm.invalid || this.isSubmittingProject) return;
    this.isSubmittingProject = true;
    const id = this.editingProjectId();
    const projectData: ProjectRequest = {
      ...(this.projectForm.value as Omit<ProjectRequest, 'tagIds'>),
      tagIds: this.selectedTagIds()
    };
    if (id) {
      this.projectService.updateProject(id, projectData).subscribe({
        next: () => { this.loadProjects(); this.cancelEdit(); this.isSubmittingProject = false; },
        error: () => { this.isSubmittingProject = false; }
      });
    } else {
      this.projectService.addProject(projectData).subscribe({
        next: (newProject) => {
          this.projects.update(items => [...items, newProject]);
          this.cancelEdit();
          this.isSubmittingProject = false;
        },
        error: () => { this.isSubmittingProject = false; }
      });
    }
  }

  editProject(project: Project) {
    this.editingProjectId.set(project.id);
    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
      downloads: project.downloads,
      videoLayout: project.videoLayout,
      videoUrl: project.videoUrl,
      marketLink: project.marketLink,
      previewImageUrl: project.previewImageUrl
    });
    this.selectedTagIds.set(project.tags.map(t => t.id));
    this.activeTab.set('projects');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingProjectId.set(null);
    this.selectedTagIds.set([]);
    this.projectForm.reset({ downloads: '0', videoLayout: 'above' });
  }

  deleteProject(id: number) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(id).subscribe({
        next: () => this.projects.update(items => items.filter(p => p.id !== id)),
        error: (err) => console.error('Delete failed', err)
      });
    }
  }

  toggleTag(id: number) {
    this.selectedTagIds.update(ids =>
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
    );
  }

  onTagSubmit() {
    if (this.tagForm.invalid) return;
    const { name, color, icon } = this.tagForm.value as { name: string; color: string; icon: IconSelection };
    const tagRequest: TagRequest = {
      name,
      color,
      iconKey: icon?.iconKey ?? null,
      customIconUrl: icon?.customIconUrl ?? null
    };
    const id = this.editingTagId();
    if (id) {
      this.tagService.updateTag(id, tagRequest).subscribe({
        next: () => {
          this.allTags.update(tags => tags.map(t => t.id === id ? { id, ...tagRequest } : t));
          this.cancelTagEdit();
        },
        error: (err) => console.error('Tag operation failed', err)
      });
    } else {
      this.tagService.createTag(tagRequest).subscribe({
        next: (tag) => {
          this.allTags.update(tags => [...tags, tag]);
          this.tagForm.reset({ color: '#3b82f6', icon: { iconKey: null, customIconUrl: null } });
        },
        error: (err) => console.error('Tag operation failed', err)
      });
    }
  }

  editTag(tag: Tag) {
    this.editingTagId.set(tag.id);
    this.tagForm.patchValue({
      name: tag.name,
      color: tag.color,
      icon: { iconKey: tag.iconKey, customIconUrl: tag.customIconUrl }
    });
  }

  cancelTagEdit() {
    this.editingTagId.set(null);
    this.tagForm.reset({ color: '#3b82f6', icon: { iconKey: null, customIconUrl: null } });
  }

  deleteTag(id: number) {
    if (confirm('Delete this tag? It will be removed from all projects.')) {
      this.tagService.deleteTag(id).subscribe({
        next: () => {
          this.allTags.update(tags => tags.filter(t => t.id !== id));
          this.selectedTagIds.update(ids => ids.filter(i => i !== id));
          this.loadProjects();
        }
      });
    }
  }

  onContactSubmit() {
    if (this.contactForm.invalid || this.isSubmittingContact) return;
    this.isSubmittingContact = true;
    const { label, url, icon } = this.contactForm.value as { label: string; url: string; icon: IconSelection };
    const id = this.editingContactId();
    const request: ContactMethodRequest = {
      label,
      url,
      iconKey: icon?.iconKey ?? null,
      customIconUrl: icon?.customIconUrl ?? null,
      order: id
        ? (this.contactMethods().find(m => m.id === id)?.order ?? 0)
        : this.contactMethods().length
    };
    if (id) {
      this.contactMethodService.updateMethod(id, request).subscribe({
        next: () => {
          this.contactMethods.update(methods =>
            methods.map(m => m.id === id ? { ...m, ...request } : m)
          );
          this.cancelContactEdit();
          this.isSubmittingContact = false;
        },
        error: () => { this.isSubmittingContact = false; }
      });
    } else {
      this.contactMethodService.createMethod(request).subscribe({
        next: (method) => {
          this.contactMethods.update(methods => [...methods, method]);
          this.contactForm.reset({ icon: { iconKey: null, customIconUrl: null } });
          this.isSubmittingContact = false;
        },
        error: () => { this.isSubmittingContact = false; }
      });
    }
  }

  editContact(method: ContactMethod) {
    this.editingContactId.set(method.id);
    this.contactForm.patchValue({
      label: method.label,
      url: method.url,
      icon: { iconKey: method.iconKey, customIconUrl: method.customIconUrl }
    });
  }

  cancelContactEdit() {
    this.editingContactId.set(null);
    this.contactForm.reset({ icon: { iconKey: null, customIconUrl: null } });
  }

  deleteContact(id: number) {
    if (confirm('Delete this contact method?')) {
      this.contactMethodService.deleteMethod(id).subscribe({
        next: () => this.contactMethods.update(methods => methods.filter(m => m.id !== id)),
        error: (err) => console.error('Delete contact failed', err)
      });
    }
  }

  moveContact(index: number, direction: -1 | 1) {
    const methods = [...this.contactMethods()];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= methods.length) return;
    [methods[index], methods[newIndex]] = [methods[newIndex], methods[index]];
    methods.forEach((m, i) => (m.order = i));
    this.contactMethods.set(methods);
    this.contactMethodService.reorder(methods.map(m => m.id)).subscribe({
      error: (err) => console.error('Reorder failed', err)
    });
  }
}
```

- [ ] **Step 2: Update admin.component.html — add Contact tab button and tab section**

The nav currently has 3 tab buttons. Add a 4th. Find this block in `admin.component.html`:

```html
<nav class="admin-tabs">
    <button [class.active]="activeTab() === 'projects'" (click)="activeTab.set('projects')">Projects</button>
    <button [class.active]="activeTab() === 'tags'" (click)="activeTab.set('tags')">Tags</button>
    <button [class.active]="activeTab() === 'profile'" (click)="activeTab.set('profile')">Profile</button>
  </nav>
```

Replace it with:

```html
<nav class="admin-tabs">
    <button [class.active]="activeTab() === 'projects'" (click)="activeTab.set('projects')">Projects</button>
    <button [class.active]="activeTab() === 'tags'" (click)="activeTab.set('tags')">Tags</button>
    <button [class.active]="activeTab() === 'contact'" (click)="activeTab.set('contact')">Contact</button>
    <button [class.active]="activeTab() === 'profile'" (click)="activeTab.set('profile')">Profile</button>
  </nav>
```

- [ ] **Step 3: Add icon picker to Tags form in admin.component.html**

Find this block in the Tags tab section:

```html
        <div class="form-row">
          <input formControlName="name" placeholder="Tag name *">
          <div class="color-field">
            <label class="field-label">Color</label>
            <input type="color" formControlName="color" class="color-input">
          </div>
        </div>
```

Replace with:

```html
        <div class="form-row">
          <input formControlName="name" placeholder="Tag name *">
          <div class="color-field">
            <label class="field-label">Color</label>
            <input type="color" formControlName="color" class="color-input">
          </div>
        </div>
        <div class="form-field">
          <label class="field-label">Icon</label>
          <app-icon-picker formControlName="icon" />
        </div>
```

- [ ] **Step 4: Add Contact tab section to admin.component.html**

Append before the closing `</div>` at the end of the template:

```html
  <!-- ===== CONTACT TAB ===== -->
  @if (activeTab() === 'contact') {
    <section class="form-section">
      <h2>{{ editingContactId() ? 'Edit Contact Method' : 'Add Contact Method' }}</h2>
      @if (contactMethods().length >= 5 && !editingContactId()) {
        <p class="empty-hint">Maximum 5 contact methods reached. Delete one to add another.</p>
      } @else {
        <form [formGroup]="contactForm" (ngSubmit)="onContactSubmit()">
          <div class="form-row">
            <input formControlName="label" placeholder="Label (e.g. LinkedIn) *">
            <input formControlName="url" placeholder="URL or mailto:… *">
          </div>
          <div class="form-field">
            <label class="field-label">Icon</label>
            <app-icon-picker formControlName="icon" />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="contactForm.invalid || isSubmittingContact">
              {{ editingContactId() ? 'Update' : 'Add Contact Method' }}
            </button>
            @if (editingContactId()) {
              <button type="button" class="btn-cancel" (click)="cancelContactEdit()">Cancel</button>
            }
          </div>
        </form>
      }
    </section>

    <section class="list-section">
      <h2>Contact Methods ({{ contactMethods().length }}/5)</h2>
      <div class="admin-list">
        @if (contactMethods().length === 0) {
          <p class="empty-state">No contact methods yet.</p>
        } @else {
          @for (method of contactMethods(); track method.id; let i = $index) {
            <div class="admin-card">
              <div class="contact-info">
                @if (method.iconKey) {
                  <img class="contact-icon-preview" [src]="'/assets/icons/' + method.iconKey + '.svg'"
                       [alt]="method.label" width="28" height="28">
                } @else if (method.customIconUrl) {
                  <img class="contact-icon-preview" [src]="method.customIconUrl"
                       [alt]="method.label" width="28" height="28">
                } @else {
                  <span class="contact-icon-placeholder">{{ method.label.slice(0,2).toUpperCase() }}</span>
                }
                <div>
                  <strong>{{ method.label }}</strong>
                  <p class="meta">{{ method.url }}</p>
                </div>
              </div>
              <div class="actions">
                <button class="btn-edit" (click)="moveContact(i, -1)" [disabled]="i === 0" title="Move up">↑</button>
                <button class="btn-edit" (click)="moveContact(i, 1)" [disabled]="i === contactMethods().length - 1" title="Move down">↓</button>
                <button class="btn-edit" (click)="editContact(method)">Edit</button>
                <button class="btn-delete" (click)="deleteContact(method.id)">Delete</button>
              </div>
            </div>
          }
        }
      </div>
    </section>
  }
```

- [ ] **Step 5: Append contact-info styles to admin.component.scss**

Add to the end of `Portfolio-Client/src/app/components/admin/admin.component.scss`:

```scss
.contact-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  margin-right: 1rem;
}

.contact-icon-preview {
  flex-shrink: 0;
  border-radius: 4px;
}

.contact-icon-placeholder {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: var(--g-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--g-muted);
  flex-shrink: 0;
}
```

- [ ] **Step 6: Build to verify**

Run from `Portfolio-Client/`: `ng build`
Expected: Build completed with 0 errors.

- [ ] **Step 7: Commit**

```bash
git add Portfolio-Client/src/app/components/admin/
git commit -m "feat(admin): add Contact tab with CRUD and icon picker in tag form"
```

---

### Task 10: Frontend — Home component (contact icons row + tag icons)

**Files:**
- Modify: `Portfolio-Client/src/app/components/home/home.component.ts`
- Modify: `Portfolio-Client/src/app/components/home/home.component.html`
- Modify: `Portfolio-Client/src/app/components/home/home.component.scss`

- [ ] **Step 1: Update home.component.ts**

Add `ContactMethodService` and `ContactMethod` import and signal. The current `ngOnInit` loads projects and profile. Add contact methods.

In `home.component.ts`, make these changes:

**Add import at top:**
```typescript
import { ContactMethodService, ContactMethod } from '../../services/contact-method.service';
```

**Add to the inject section (after `private profileService = inject(ProfileService);`):**
```typescript
private contactMethodService = inject(ContactMethodService);
```

**Add signal (after existing signals):**
```typescript
contactMethods = signal<ContactMethod[]>([]);
```

**Add load call in `ngOnInit` (after existing calls):**
```typescript
this.contactMethodService.getMethods().subscribe(data => this.contactMethods.set(data));
```

Full updated file for reference:

```typescript
import { Component, HostListener, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { ProfileService } from '../../services/profile.service';
import { ContactMethodService, ContactMethod } from '../../services/contact-method.service';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { MarkdownModule } from 'ngx-markdown';
import { Tag } from '../../services/tag.service';

interface Project {
  id: number;
  name: string;
  description: string;
  downloads: string;
  videoLayout: string;
  previewImageUrl?: string;
  videoUrl?: string;
  marketLink?: string;
  tags: Tag[];
}

interface Profile {
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  cvUrl: string;
  email: string;
}

interface FloatingCoin {
  id: number;
  left: number;
  value: number;
  duration: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe, MarkdownModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private projectService = inject(ProjectService);
  private profileService = inject(ProfileService);
  private contactMethodService = inject(ContactMethodService);
  private coinIdCounter = 0;
  private spawnInterval: ReturnType<typeof setInterval> | null = null;
  private despawnTimeouts = new Map<number, ReturnType<typeof setTimeout>>();

  projects = signal<Project[]>([]);
  profile = signal<Profile>({ name: '', role: '', bio: '', photoUrl: '', cvUrl: '', email: '' });
  contactMethods = signal<ContactMethod[]>([]);
  selectedProject = signal<Project | null>(null);
  gameScore = signal<number>(0);
  floatingCoins = signal<FloatingCoin[]>([]);

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(data => this.projects.set(data));
    this.profileService.getProfile().subscribe(data => { if (data) this.profile.set(data); });
    this.contactMethodService.getMethods().subscribe(data => this.contactMethods.set(data));
```

> **Note:** Only add the three lines shown above — the `contactMethodService` injection, `contactMethods` signal, and the `getMethods()` subscribe call. Do not touch the rest of the component (coin game logic, `HostListener`, etc.).

- [ ] **Step 2: Replace contact button in home.component.html**

Find this block:

```html
      <div class="hero-actions">
        @if (profile().cvUrl) {
          <a [href]="profile().cvUrl" target="_blank" class="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
            Download CV
          </a>
        }
        @if (profile().email) {
          <a [href]="'mailto:' + profile().email" class="btn-outline">Get in Touch</a>
        }
      </div>
```

Replace with:

```html
      <div class="hero-actions">
        @if (profile().cvUrl) {
          <a [href]="profile().cvUrl" target="_blank" class="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
            Download CV
          </a>
        }
        @if (contactMethods().length > 0) {
          <div class="contact-icons">
            @for (method of contactMethods(); track method.id) {
              <a [href]="method.url" target="_blank" rel="noopener noreferrer"
                 class="contact-icon-btn" [title]="method.label"
                 [attr.aria-label]="method.label">
                @if (method.iconKey) {
                  <img [src]="'/assets/icons/' + method.iconKey + '.svg'"
                       [alt]="method.label" width="20" height="20">
                } @else if (method.customIconUrl) {
                  <img [src]="method.customIconUrl" [alt]="method.label" width="20" height="20">
                } @else {
                  <span aria-hidden="true">{{ method.label.slice(0, 2).toUpperCase() }}</span>
                }
              </a>
            }
          </div>
        }
      </div>
```

- [ ] **Step 3: Add tag icons to tag-badge in home.component.html**

Find the tag-badge loop in the project cards. It currently looks like:

```html
@for (tag of p.tags; track tag.id) {
  <span class="tag-badge" [style.background-color]="tag.color">{{ tag.name }}</span>
}
```

Replace with:

```html
@for (tag of p.tags; track tag.id) {
  <span class="tag-badge" [style.background-color]="tag.color">
    @if (tag.iconKey) {
      <img class="tag-icon" [src]="'/assets/icons/' + tag.iconKey + '.svg'" alt="" width="12" height="12">
    } @else if (tag.customIconUrl) {
      <img class="tag-icon" [src]="tag.customIconUrl" alt="" width="12" height="12">
    }
    {{ tag.name }}
  </span>
}
```

Do the same for any other `tag-badge` loops in the modal section of home.component.html.

- [ ] **Step 4: Add contact icon and tag icon styles to home.component.scss**

Append to `Portfolio-Client/src/app/components/home/home.component.scss`:

```scss
// ── Contact icons ───────────────────────────────────────────────────────────────
.contact-icons {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.contact-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--c-border);
  background: var(--c-card);
  text-decoration: none;
  color: var(--c-text);
  transition: border-color 0.2s, transform 0.2s, background 0.2s;
  font-size: 0.7rem;
  font-weight: 700;

  img { display: block; filter: saturate(0) brightness(0.4); }

  &:hover {
    border-color: var(--c-primary);
    background: var(--c-primary-pale);
    transform: translateY(-2px);
    img { filter: none; }
  }
}

// ── Tag icon in badges ──────────────────────────────────────────────────────────
.tag-icon {
  display: inline-block;
  vertical-align: middle;
  margin-right: 3px;
  filter: brightness(0) invert(1);
}
```

- [ ] **Step 5: Build to verify**

Run from `Portfolio-Client/`: `ng build`
Expected: Build completed with 0 errors.

- [ ] **Step 6: Commit**

```bash
git add Portfolio-Client/src/app/components/home/
git commit -m "feat(home): replace contact button with contact icons row, add tag icons"
```

---

## Self-Review

**Spec coverage:**
- ✅ Up to 5 contact methods (enforced in controller POST)
- ✅ ContactMethod: Label, IconKey, CustomIconUrl, Url, Order
- ✅ ContactMethodsController: GET/POST/PUT/DELETE/reorder
- ✅ Tag entity: IconKey, CustomIconUrl added + migration
- ✅ TagsController updated to handle icon fields
- ✅ IconPickerComponent: predefined grid + custom URL, ControlValueAccessor
- ✅ 15 SVG icons in assets/icons/
- ✅ Admin: new Contact tab with CRUD + reorder (↑↓)
- ✅ Admin: icon picker in tag form
- ✅ Home: contact icons row replaces "Get in Touch" button
- ✅ Home: tag-badge shows icon
- ✅ Error: 400 with typed error code when > 5 methods attempted
- ✅ Tests: IconPickerComponent spec, ContactMethodService spec

**Type consistency check:**
- `IconSelection` defined in `icon-picker.component.ts`, imported in admin component ✅
- `ContactMethod` / `ContactMethodRequest` defined in `contact-method.service.ts`, imported everywhere ✅
- `TagRequest` defined in `tag.service.ts`, used in `onTagSubmit` ✅
- `moveContact(index, direction: -1 | 1)` — `-1 | 1` type used consistently ✅
