import { spawn } from 'child_process';
import path from 'path';

interface UserContext {
  values?: string[];
  five_year_goal?: string;
  anxieties?: string[];
  financial_data?: any;
  goals?: Goal[];
  todos?: string[];
}

interface Goal {
  title: string;
  progress: number;
}

export class CrewService {
  private pythonPath: string;
  private scriptPath: string;
  private workingDir: string;

  constructor() {
    this.pythonPath = 'uv';
    this.workingDir = path.join(__dirname, '../../goal_crew');
    this.scriptPath = 'run';
  }

  private async runPythonCrew(
    command: string,
    userContext: UserContext,
    args: string[] = []
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const python = spawn(this.pythonPath, [this.scriptPath, 'python', '-m', 'goal_crew.main', command, ...args], {
        cwd: this.workingDir,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
      });
      
      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      python.stdin.write(JSON.stringify(userContext));
      python.stdin.end();

      python.on('close', (code) => {
        if (code !== 0) {
          console.error('Python stderr:', stderr);
          reject(new Error(`Python process exited with code ${code}: ${stderr}`));
        } else {
          try {
            // Extract JSON from stdout - find the last valid JSON line
            const lines = stdout.split('\n').reverse();
            const jsonLine = lines.find(line => {
              const trimmed = line.trim();
              return trimmed.startsWith('{') && trimmed.includes('"');
            });
            
            if (!jsonLine) {
              throw new Error('No JSON output found');
            }
            
            const result = JSON.parse(jsonLine);
            
            // For daily_standup, extract the briefing from nested JSON if present
            if (command === 'daily_standup' && result.briefing) {
              try {
                const briefingData = JSON.parse(result.briefing.replace(/```json\n|```/g, ''));
                if (briefingData.briefing) {
                  result.briefing = briefingData.briefing.priority_focus || 
                                   briefingData.briefing.message || 
                                   JSON.stringify(briefingData.briefing);
                }
              } catch (e) {
                // If parsing fails, keep original briefing
              }
            }
            
            // For realignment, parse DROP and FOCUS sections
            if (command === 'realignment' && result.filtered_todos) {
              const text = result.filtered_todos;
              const dropMatch = text.match(/\*\*DROP:\*\*([\s\S]*?)\*\*FOCUS:\*\*/i);
              const focusMatch = text.match(/\*\*FOCUS:\*\*([\s\S]*?)$/i);
              
              if (dropMatch && focusMatch) {
                const parseItems = (section: string) => {
                  return section
                    .split(/\n\s*\*\s+/)  // Split by bullet points
                    .filter(item => item.trim() && item.includes('**'))
                    .map(item => {
                      const match = item.match(/\*\*(.+?):\*\*\s*(.+)/s);
                      if (match) {
                        return {
                          title: match[1].trim(),
                          description: match[2].trim()
                        };
                      }
                      return null;
                    })
                    .filter(item => item !== null);
                };
                
                result.drop = parseItems(dropMatch[1]);
                result.focus = parseItems(focusMatch[1]);
                result.todaysFocus = result.focus[0]?.title || '';
              }
            }
            
            resolve(result);
          } catch (error) {
            console.error('Failed to parse output:', stdout);
            reject(new Error(`Failed to parse Python output: ${error}`));
          }
        }
      });
    });
  }

  async createGoalPlan(
    goal: string,
    deadlineDays: number,
    userContext: UserContext
  ): Promise<any> {
    return this.runPythonCrew('create_plan', userContext, [goal, deadlineDays.toString()]);
  }

  async generateDailyStandup(
    goals: Goal[],
    userContext: UserContext
  ): Promise<any> {
    return this.runPythonCrew('daily_standup', { ...userContext, goals });
  }

  async realignTodos(
    todos: string[],
    userContext: UserContext
  ): Promise<any> {
    return this.runPythonCrew('realignment', { ...userContext, todos });
  }

  // Homescreen-specific method
  async generateHomescreenInsights(
    userContext: UserContext
  ): Promise<any> {
    // Use daily standup for homescreen insights
    const goals = userContext.goals || [];
    return this.generateDailyStandup(goals as Goal[], userContext);
  }

  async getRealignment(
    userContext: UserContext
  ): Promise<any> {
    const todos = userContext.todos || [];
    return this.realignTodos(todos, userContext);
  }
}

export const crewService = new CrewService();
