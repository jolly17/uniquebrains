# UniqueBrains

**Where every brain learns differently.**

A platform for the neurodiverse community featuring free courses, community Q&A, educational content, and care journey resources.

🌐 **Live Site**: [https://uniquebrains.org](https://uniquebrains.org)  
📖 **Technical Docs**: [TECHNICAL_DOCS.md](./TECHNICAL_DOCS.md)

---

## ✨ Features

- **📚 Courses** - Free online courses for neurodivergent learners
- **💬 Community** - Q&A forum for parents and caregivers
- **📖 Content** - Educational resources about neurodiversity
- **🏥 Care** - Interactive roadmap for care journey milestones

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/jolly17/uniquebrains.git
cd uniquebrains
npm install

# Set up environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v6, Vite |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Hosting | GitHub Pages |
| Monitoring | Sentry |

---

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React Context (Auth)
├── data/           # Static data and constants
├── lib/            # Utilities (Supabase, Sentry)
├── pages/          # Page components
├── services/       # API service functions
├── styles/         # Design system (tokens, utilities)
└── utils/          # Helper functions
```

---

## 📚 Documentation

For developers, see **[TECHNICAL_DOCS.md](./TECHNICAL_DOCS.md)** which covers:
- Architecture and data flow
- Design system and tokens
- Authentication setup
- Database schema
- API services
- Deployment process
- Troubleshooting

---

## 🚢 Deployment

```bash
# Build for production
npm run build

# Commit and push (auto-deploys to GitHub Pages)
git add docs
git commit -m "Deploy"
git push
```

---

## 📞 Contact

- **Email**: hello@uniquebrains.org
- **Website**: [uniquebrains.org](https://uniquebrains.org)

---

**Built with ❤️ for the neurodiverse community**

*Last Updated: March 2026*