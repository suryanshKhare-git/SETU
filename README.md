# SETU (सेतु) — Explainable Law-Enforcement Intelligence Platform

> **SETU** connects fragmented, siloed crime records (FIRs, CDRs, financial data, vehicle registries, surveillance logs) into a single explainable network graph, so an authorized investigator can search any entity — a person, phone number, vehicle, location, organization, or case — and instantly see how it relates to everything else, with a plain-language explanation for every connection and full human oversight before any conclusion is acted on.

---

## 🚀 Quick Start for Collaborators

Clone the repository to your local machine:
```bash
git clone https://github.com/<YOUR_USERNAME>/<REPO_NAME>.git
cd <REPO_NAME>
```

---

### 1. Frontend Setup (React + TypeScript + Vite + Tailwind CSS)

1. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

2. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

3. **Build for production**:
   ```bash
   npm run build
   ```
   The compiled static files are output to `dist/`.

---

### 2. Backend Setup (FastAPI + NetworkX + Pydantic)

1. **Create and activate a virtual environment**:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

2. **Install Python dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Run the API server**:
   ```bash
   python backend/run.py
   ```
   - API Gateway: [http://127.0.0.1:8000](http://127.0.0.1:8000)
   - Interactive Swagger API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

4. **Run backend automated tests**:
   ```bash
   pytest backend/tests/
   ```

---

## 👥 How to Collaborate on GitHub

### 1. Daily Team Workflow (Branching Strategy)
Never push directly to `main`. Instead, follow the feature branch workflow:

1. **Pull the latest changes from `main`**:
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create a new branch for your task**:
   ```bash
   git checkout -b feature/<feature-name>
   # e.g., git checkout -b feature/timeline-filter
   # or:   git checkout -b fix/mobile-layout
   ```

3. **Make changes, stage, and commit**:
   ```bash
   git status
   git add .
   git commit -m "feat(timeline): add date range filter picker"
   ```

4. **Push your branch to GitHub**:
   ```bash
   git push -u origin feature/<feature-name>
   ```

5. **Open a Pull Request (PR)** on GitHub:
   - Go to your repository on GitHub.
   - Click **"Compare & pull request"**.
   - Request review from your teammates.
   - Once reviewed and approved, merge into `main`.

---

## 📁 Repository Structure

```
├── backend/                  # FastAPI Intelligence Engine
│   ├── app/
│   │   ├── api/routes/       # REST API endpoints (search, graph, cases, audit, reviews)
│   │   ├── core/             # Security, PII encryption, rate limiting
│   │   ├── models/           # Pydantic schemas (canonical entities & edges)
│   │   └── services/         # Ingestion, Entity Resolution, Graph, Explanations, Audit
│   ├── tests/                # Pytest unit & integration test suite (18 tests)
│   ├── requirements.txt      # Python dependencies
│   └── run.py                # Server entrypoint
├── public/                   # Static assets & _redirects for Netlify
├── src/                      # Frontend React Application
│   ├── components/
│   │   ├── audit/            # Cryptographic Audit Vault UI
│   │   ├── graph/            # Force-Directed 60fps Network Graph UI
│   │   ├── home/             # Platform Overview & Pitch Landing Page
│   │   ├── layout/           # Header, RBAC role switcher, navigation
│   │   ├── profile/          # 360° Entity Profile Dossier
│   │   ├── search/           # Universal Omnibox Search UI
│   │   ├── timeline/         # Multi-Lane Chronological Timeline
│   │   └── workspace/        # Case Workspace Pinboard & Dossier Export
│   ├── context/              # Global application state (AppContext)
│   ├── types/                # Canonical TypeScript definitions
│   ├── App.tsx               # Root view router
│   └── main.tsx              # React entrypoint
├── package.json              # Node.js dependencies & scripts
├── tailwind.config.js        # Law-enforcement theme palette
└── vite.config.ts            # Vite configuration
```

---

## 🌐 Automatic Deployment with Netlify

To automatically deploy the frontend on every commit:
1. Go to [Netlify](https://app.netlify.com) and click **"Add new site" > "Import an existing project"**.
2. Connect your **GitHub** account and choose this repository.
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Click **Deploy**. Netlify will now automatically build and publish your site whenever you or your friends merge changes to `main`!

