# CrewAI Integration - Installation Guide

## Prerequisites

- Python >= 3.10 and < 3.14
- Node.js (already installed)
- Windows PowerShell (for Windows users)

## Step 1: Check Python Version

```bash
python --version
```

Should show Python 3.10 or higher (but less than 3.14).

## Step 2: Install UV Package Manager

**On Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

After installation, update your shell:
```powershell
uv tool update-shell
```

Then restart your terminal.

## Step 3: Install CrewAI CLI

```bash
uv tool install crewai
```

Verify installation:
```bash
uv tool list
```

You should see:
```
crewai v0.102.0
- crewai
```

## Step 4: Create CrewAI Project

Navigate to backend directory:
```bash
cd backend
```

Create the crew project:
```bash
crewai create crew goal_crew
```

This creates:
```
backend/goal_crew/
├── .env
├── pyproject.toml
├── README.md
└── src/
    └── goal_crew/
        ├── main.py
        ├── crew.py
        ├── config/
        │   ├── agents.yaml
        │   └── tasks.yaml
        └── tools/
            └── custom_tool.py
```

## Step 5: Configure Environment

Copy your Gemini API key to the crew's .env file:
```bash
cd goal_crew
echo GEMINI_API_KEY=your_key_here > .env
```

Or manually edit `backend/goal_crew/.env` and add:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

## Step 6: Install Dependencies

Inside the goal_crew directory:
```bash
crewai install
```

## Step 7: Test the Crew

```bash
crewai run
```

## Step 8: Update Node.js Service

The Node.js service at `backend/src/services/crew.ts` will need to be updated to point to the new crew location:

```typescript
this.scriptPath = path.join(__dirname, '../../goal_crew/src/goal_crew/main.py');
```

## Troubleshooting

### Issue: `crewai` command not found
**Solution:** Restart your terminal after installing UV and running `uv tool update-shell`

### Issue: Python version error
**Solution:** Install Python 3.10-3.13 from [python.org](https://python.org/downloads)

### Issue: `chroma-hnswlib` build error on Windows
**Solution:** Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/) with "Desktop development with C++"

## Next Steps

After installation:
1. Edit `backend/goal_crew/src/goal_crew/config/agents.yaml` to customize agents
2. Edit `backend/goal_crew/src/goal_crew/config/tasks.yaml` to define tasks
3. Modify `backend/goal_crew/src/goal_crew/crew.py` to implement crew logic
4. Update Node.js routes to call the crew

## Quick Commands Reference

```bash
# Install CrewAI
uv tool install crewai

# Create new crew project
crewai create crew <project_name>

# Install project dependencies
crewai install

# Run the crew
crewai run

# Update CrewAI
uv tool install crewai --upgrade
```
