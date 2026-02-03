import express from 'express';
import { crewService } from '../services/crew';

const router = express.Router();

router.post('/create-plan', async (req, res) => {
  try {
    const { goal, deadlineDays, userContext } = req.body;
    const result = await crewService.createGoalPlan(goal, deadlineDays, userContext);
    res.json(result);
  } catch (error: any) {
    console.error('Crew create plan error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/daily-standup', async (req, res) => {
  try {
    const { goals, userContext } = req.body;
    const result = await crewService.generateDailyStandup(goals, userContext);
    res.json(result);
  } catch (error: any) {
    console.error('Crew daily standup error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/realignment', async (req, res) => {
  try {
    const { todos, userContext } = req.body;
    const result = await crewService.realignTodos(todos, userContext);
    res.json(result);
  } catch (error: any) {
    console.error('Crew realignment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Homescreen insights endpoint
router.post('/homescreen-insights', async (req, res) => {
  try {
    const { userContext } = req.body;
    const result = await crewService.generateHomescreenInsights(userContext);
    res.json(result);
  } catch (error: any) {
    console.error('Crew homescreen insights error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
