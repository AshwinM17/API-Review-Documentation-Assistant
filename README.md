# API Doc Assistant

An AI-powered API documentation and review assistant. Paste any OpenAPI/Swagger spec URL to view it visually, chat with an AI about it, or compare two spec versions side-by-side.

---

## Features

| Section | What it does |
|---|---|
| **View API Specs** | Fetches any Swagger/OpenAPI URL and renders it as clean, collapsible endpoint cards |
| **AI Chat with API** | Chat with an AI assistant that has full context of your API spec |
| **Spec Comparison** | Enter two spec URLs — the AI identifies breaking changes, added/removed endpoints, and migration steps |

---

## Tech Stack

- **Frontend** — React 18 + Vite + TailwindCSS
- **Backend** — ASP.NET Core 8 Web API (C#)
- **AI** — Azure AI Foundry / Azure OpenAI

---

## Prerequisites

| Tool | Version |
|---|---|
| [.NET SDK](https://dotnet.microsoft.com/download) | 8.0 or later |
| [Node.js](https://nodejs.org/) | 18.x or later |
| npm | 9.x or later |
| Azure OpenAI resource | Deployment ready |

---

## Step 1 — Configure Azure OpenAI Keys

Open `backend/appsettings.json` and fill in your credentials:

```json
{
  "AzureOpenAI": {
    "Endpoint":        "https://YOUR-RESOURCE.openai.azure.com",
    "ApiKey":          "YOUR_AZURE_OPENAI_API_KEY",
    "DeploymentName":  "gpt-4o",
    "ApiVersion":      "2024-02-15-preview"
  }
}
```

### Where to find these values

| Field | Where to find it |
|---|---|
| `Endpoint` | Azure Portal → your OpenAI resource → **Keys and Endpoint** → Endpoint |
| `ApiKey` | Azure Portal → your OpenAI resource → **Keys and Endpoint** → KEY 1 |
| `DeploymentName` | Azure AI Foundry → **Deployments** → your model's deployment name |
| `ApiVersion` | Use `2024-02-15-preview` (or check [Azure docs](https://learn.microsoft.com/azure/ai-services/openai/reference) for latest) |



---

## Step 2 — Run the Backend

```bash
cd backend
dotnet restore
dotnet run
```

The API starts at **http://localhost:5000**

You should see:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
```

### Available endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/spec/view` | Fetch & parse an OpenAPI spec |
| POST | `/api/chat` | Chat with AI about a spec |
| POST | `/api/compare` | Compare two specs with AI |

---

## Step 3 — Run the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app opens at **http://localhost:5173**

Vite proxies all `/api` requests to `http://localhost:5000`, so both run together seamlessly.

---

## Project Structure

```
api-doc-assistant/
├── backend/
│   ├── Controllers/
│   │   ├── SpecController.cs       # POST /api/spec/view
│   │   ├── ChatController.cs       # POST /api/chat
│   │   └── CompareController.cs    # POST /api/compare
│   ├── Services/
│   │   ├── SpecService.cs          # Fetches + parses OpenAPI specs
│   │   └── OpenAIService.cs        # Calls Azure OpenAI securely
│   ├── Models/
│   │   └── Models.cs               # All request/response models
│   ├── Properties/
│   │   └── launchSettings.json     # Runs on port 5000
│   ├── Program.cs                  # App setup, CORS, DI
│   └── appsettings.json            # ← Put your keys here
│
└── frontend/
    ├── public/
    │   └── favicon.svg
    ├── src/
    │   ├── api/
    │   │   └── client.js           # All API calls in one place
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── EndpointCard.jsx     # Collapsible, color-coded endpoint
    │   │   ├── ChatWindow.jsx       # Scrollable chat with input bar
    │   │   ├── MessageBubble.jsx    # Markdown + syntax-highlighted bubbles
    │   │   └── Loader.jsx
    │   ├── pages/
    │   │   ├── ViewSpec.jsx
    │   │   ├── Chat.jsx
    │   │   ├── Compare.jsx
    │   │   └── NotFound.jsx
    │   ├── App.jsx                  # Router
    │   └── index.css               # Tailwind + custom classes
    ├── vite.config.js              # Dev proxy → :5000
    └── tailwind.config.js
```

---

## Test with a Public Spec

Use these URLs to test without your own API:

```
https://petstore3.swagger.io/api/v3/openapi.json    ← Petstore (JSON)
https://petstore3.swagger.io/api/v3/openapi.yaml    ← Petstore (YAML)
```

### Testing the Compare feature

Use two different spec versions — for example any API that has changed between versions. You can host two local JSON files via any static server and point to them.

---



## Troubleshooting

| Problem | Fix |
|---|---|
| `CORS error` in browser | Make sure the backend is running on port 5000 |
| `Failed to fetch spec` | The spec URL must be publicly accessible (no auth required) |
| `Azure OpenAI 401` | Check your `ApiKey` in `appsettings.json` |
| `Azure OpenAI 404` | Check your `DeploymentName` — it must match exactly |
| `Could not parse OpenAPI spec` | Verify the URL returns valid JSON or YAML OpenAPI 3.x |
| `npm install` fails | Make sure Node 18+ is installed: `node --version` |
| `dotnet restore` fails | Make sure .NET 8 SDK is installed: `dotnet --version` |
