from crewai import Agent, Crew, Process, Task, LLM
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent
from typing import List
import os

@CrewBase
class GoalCrew():
    """BetterOS Goal Management Crew"""

    agents: List[BaseAgent]
    tasks: List[Task]

    def __init__(self):
        self.llm = LLM(
            model="gemini/gemini-2.5-flash",
            api_key=os.getenv("GEMINI_API_KEY")
        )

    @agent
    def boss_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['boss_agent'],
            llm=self.llm,
            verbose=True
        )

    @agent
    def financial_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['financial_agent'],
            llm=self.llm,
            verbose=True
        )

    @agent
    def stoic_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['stoic_agent'],
            llm=self.llm,
            verbose=True
        )

    @agent
    def creative_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['creative_agent'],
            llm=self.llm,
            verbose=True
        )

    @task
    def goal_breakdown_task(self) -> Task:
        return Task(
            config=self.tasks_config['goal_breakdown_task'],
        )

    @task
    def financial_analysis_task(self) -> Task:
        return Task(
            config=self.tasks_config['financial_analysis_task'],
        )

    @task
    def motivation_strategy_task(self) -> Task:
        return Task(
            config=self.tasks_config['motivation_strategy_task'],
        )

    @task
    def emotional_support_task(self) -> Task:
        return Task(
            config=self.tasks_config['emotional_support_task'],
        )

    @task
    def daily_standup_task(self) -> Task:
        return Task(
            config=self.tasks_config['daily_standup_task'],
        )

    @task
    def realignment_task(self) -> Task:
        return Task(
            config=self.tasks_config['realignment_task'],
        )

    @crew
    def crew(self) -> Crew:
        """Creates the BetterOS Goal Management Crew"""
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )