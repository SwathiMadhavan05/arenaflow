# ArenaFlow - Smart Venue Management Platform

ArenaFlow is a completely integrated full-stack simulation, management, and predictive AI suite developed specifically for modern stadium operations.

## Setup Instructions

### 1. Prerequisites
Ensure you have the following installed locally on your system:
- Python 3.9+
- Node.js v14+
- `pip` & `npm`

### 2. Backend Installation (FastAPI & Engine)
1. Navigate to the `/backend` directory inside the project root.
2. Create and activate a Virtual Environment to isolate dependencies.
   - `python -m venv venv`
   - `source venv/bin/activate` *(for Mac/Linux)*
3. Install the required Python dependencies:
   `pip install fastapi uvicorn httpx python-dotenv pydantic google-generativeai`
4. Set up your Google API Key for the AI predictive Fan Assistant framework:
   Create a `.env` file within the `/backend` folder explicitly:
   ```env
   GOOGLE_API_KEY="your_gemini_api_key_here"
   ```
5. Start the backend simulation and API suite:
   `uvicorn main:app --host 0.0.0.0 --port 8000`

### 3. Frontend Installation (React / Vite)
1. Navigate to the `/frontend` directory via a separate terminal instance.
2. Install npm dependencies via package manager:
   `npm install`
3. If not cleanly resolved, explicitly ensure UI libraries are mounted:
   `npm install lucide-react recharts axios`
4. Deploy the frontend server tracking the backend:
   `npm run dev`

### 4. Cloud Deployment Architecture (Google Cloud Run)
The full-stack platform has been successfully architected leveraging a robust unified Multi-Stage Docker process! This allows absolute independence compiling explicitly down towards a natively routed service map.   

*Execute natively to deploy to **ArenaFlow Cloud** (project id: `arenaflow-493615`):*
```bash
gcloud run deploy arenaflow-master \
  --source . \
  --project arenaflow-493615 \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GOOGLE_API_KEY=YOUR_ACTUAL_KEY_HERE"
```

---

## The 3-Minute Demonstration Script
To properly demonstrate the ArenaFlow application to operations stakeholders, follow this linear interactive progression:

1. **Top-Level Spatial Tracking**: Start securely on the unified `Command Centre` tab. Demonstrate the 60% left-side **SVG Heatmap**. Show how clicking the side toggles isolates spatial capacities across *Washrooms, Crowd Models, Gates etc*. Highlight how these dynamically bind to simulation payloads.

2. **Alert Triggering & Diagnostics**: Call attention to the right hand `Live Activity Feed`. As the backend processes intervals, observe it explicitly generating context-aware notifications marking warning thresholds across different zones precisely.

3. **Facilities Dispatch AI**: Scroll down to the multi-column component grid, explicitly demonstrating the `WashroomPanel`. Notice how the embedded `recharts` trajectories predict 15-minute future utilizations visually. Click "Dispatch Crew" to demo instant interaction handling and state persistence.

4. **Predictive Analytics Parking Model**: Move visually to the exact middle `ParkingLotMap` graphical widget. In the search terminal, write "ABC-1" into the locator tool and demo the exact algorithmic hash overlay finding your localized zone vector seamlessly!

5. **Phase Control Mechanics End-To-End**: Using the giant "Advance Phase ▶" button nested immediately at the absolute top of the Command Centre UI, purposefully cycle the stadium from *Pre-match* to *Final-whistle*. Watch how the unified engine cascades unique multiplier loads automatically—you'll witness `Entry Gate` load balancing limits physically breached. 

6. **LLM RAG Overrides**: Observe how the Gateboard hits critical egress depth, triggering the **AI Egress Overrides** alert banner. Once finished, finally migrate to the `Fan Assistant` tab and prompt Gemini *“Which parking lots are currently heavily populated?”*. Because of Context-Injected RAG logic, the LLM will reply incorporating live venue telemetry.
