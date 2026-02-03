#!/usr/bin/env python
import sys
import json
import warnings

from goal_crew.crew import GoalCrew

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

def create_goal_plan():
    """Create a comprehensive goal plan with all agents"""
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: main.py create_plan <goal> <deadline_days>"}), file=sys.stderr)
        sys.exit(1)
    
    goal = sys.argv[2]
    deadline_days = sys.argv[3]
    
    # Read user context from stdin
    user_context = json.loads(sys.stdin.read())
    
    inputs = {
        'goal': goal,
        'deadline_days': deadline_days,
        'values': ', '.join(user_context.get('values', [])),
        'five_year_goal': user_context.get('five_year_goal', 'Not set'),
        'financial_data': str(user_context.get('financial_data', {})),
        'anxieties': ', '.join(user_context.get('anxieties', [])),
        'goals_summary': f'Current goal: {goal}',
        'todos_list': 'No current todos'
    }
    
    try:
        result = GoalCrew().crew().kickoff(inputs=inputs)
        output = {
            "goal": goal,
            "deadline_days": int(deadline_days),
            "plan": str(result),
            "agents_involved": ["boss", "financial", "creative", "stoic"]
        }
        print(json.dumps(output))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

def daily_standup():
    """Generate daily standup briefing"""
    user_context = json.loads(sys.stdin.read())
    goals = user_context.get('goals', [])
    
    goals_summary = '\n'.join([f"- {g['title']}: {g['progress']}% complete" for g in goals]) if goals else 'No active goals'
    
    inputs = {
        'goal': goals[0]['title'] if goals else 'No goal set',
        'deadline_days': '0',
        'goals_summary': goals_summary,
        'values': ', '.join(user_context.get('values', [])),
        'five_year_goal': user_context.get('five_year_goal', 'Not set'),
        'financial_data': '{}',
        'anxieties': ', '.join(user_context.get('anxieties', [])),
        'todos_list': 'No current todos'
    }
    
    try:
        result = GoalCrew().crew().kickoff(inputs=inputs)
        output = {
            "briefing": str(result),
            "timestamp": "08:00 AM"
        }
        print(json.dumps(output))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

def realignment():
    """Emergency realignment when user is overwhelmed"""
    user_context = json.loads(sys.stdin.read())
    todos = user_context.get('todos', [])
    
    todos_list = '\n'.join([f"- {todo}" for todo in todos]) if todos else 'No current todos'
    
    inputs = {
        'goal': 'General productivity',
        'deadline_days': '0',
        'goals_summary': 'Reviewing current workload',
        'todos_list': todos_list,
        'values': ', '.join(user_context.get('values', [])),
        'five_year_goal': user_context.get('five_year_goal', 'Not set'),
        'financial_data': '{}',
        'anxieties': ', '.join(user_context.get('anxieties', []))
    }
    
    try:
        result = GoalCrew().crew().kickoff(inputs=inputs)
        output = {
            "filtered_todos": str(result)
        }
        print(json.dumps(output))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

def run():
    """Main entry point for Node.js integration"""
    if len(sys.argv) < 2:
        # Default test case for crewai run
        test_inputs = {
            'goal': 'Buy a car',
            'deadline_days': '89',
            'values': 'Family, Security',
            'five_year_goal': 'Financial independence',
            'financial_data': '{}',
            'anxieties': '',
            'goals_summary': 'Current goal: Buy a car',
            'todos_list': 'No current todos'
        }
        
        try:
            result = GoalCrew().crew().kickoff(inputs=test_inputs)
            output = {
                "goal": "Buy a car",
                "deadline_days": 89,
                "plan": str(result),
                "agents_involved": ["boss", "financial", "creative", "stoic"]
            }
            print(json.dumps(output))
        except Exception as e:
            print(json.dumps({"error": str(e)}), file=sys.stderr)
            sys.exit(1)
        return
    
    command = sys.argv[1]
    
    if command == "create_plan":
        create_goal_plan()
    elif command == "daily_standup":
        daily_standup()
    elif command == "realignment":
        realignment()
    else:
        print(json.dumps({"error": f"Unknown command: {command}"}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    run()