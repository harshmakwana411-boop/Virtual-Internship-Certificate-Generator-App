# Deployment Guide

## Quick Deployment

### Firebase Hosting (Fastest)

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Initialize
firebase init hosting

# 4. Deploy
firebase deploy

# Site live at: https://your-project.web.app
```

### Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Deploy
netlify deploy --prod

# 3. Follow prompts
```

### GitHub Pages

Push code to GitHub, enable Pages in settings.

## Production Checklist

- [ ] Update favicon
- [ ] Configure custom domain
- [ ] Set up SSL/HTTPS
- [ ] Enable email notifications
- [ ] Configure backups
- [ ] Set admin users
- [ ] Test all features
- [ ] Monitor performance

## Monitoring

- Firebase Console for usage
- Browser console for errors
- Firestore indexes for performance
- Storage usage metrics
