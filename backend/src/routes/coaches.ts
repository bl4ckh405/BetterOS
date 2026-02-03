import { Router } from 'express';
import { dataService } from '../services/data';
import { CreateCoachRequest } from '../types';

export const coachRoutes = Router();

// GET /api/coaches - Get all coaches
coachRoutes.get('/', (req, res) => {
  try {
    const coaches = dataService.getAllCoaches();
    res.json({ coaches });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coaches' });
  }
});

// POST /api/coaches - Create new coach
coachRoutes.post('/', async (req, res) => {
  try {
    const coachData: CreateCoachRequest = req.body;
    
    // Validate required fields
    if (!coachData.name || !coachData.tagline) {
      return res.status(400).json({ error: 'Name and tagline are required' });
    }

    if (!coachData.youtubeChannelUrl) {
      return res.status(400).json({ error: 'YouTube channel URL is required for knowledge base' });
    }

    const coach = await dataService.createCoach(coachData);
    
    res.status(201).json({ 
      coach,
      message: 'Coach created. Knowledge base ingestion started in background.' 
    });
  } catch (error) {
    console.error('Error creating coach:', error);
    res.status(500).json({ error: 'Failed to create coach' });
  }
});

// GET /api/coaches/:id - Get specific coach
coachRoutes.get('/:id', (req, res) => {
  try {
    const coach = dataService.getCoach(req.params.id);
    if (!coach) {
      return res.status(404).json({ error: 'Coach not found' });
    }
    res.json({ coach });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coach' });
  }
});

// PUT /api/coaches/:id - Update coach
coachRoutes.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const coach = await dataService.updateCoach(req.params.id, updates);
    
    if (!coach) {
      return res.status(404).json({ error: 'Coach not found' });
    }
    
    res.json({ coach });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update coach' });
  }
});

// DELETE /api/coaches/:id - Delete coach
coachRoutes.delete('/:id', async (req, res) => {
  try {
    const deleted = await dataService.deleteCoach(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Coach not found' });
    }
    res.json({ message: 'Coach deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete coach' });
  }
});