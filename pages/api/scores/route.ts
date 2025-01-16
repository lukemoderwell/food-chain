import { supabase } from '../../../utils/supabase';

export default async function handler(req, res) {
  const { method, body } = req;

  switch (method) {
    case 'POST': {
      // Example: Save a new score
      const { userId, score, day } = body;
      const { data, error } = await supabase
        .from('scores')
        .insert([{ user_id: userId, score, day }]);
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(201).json({ data });
    }
    case 'GET': {
      // Example: Load scores for a user
      const { userId } = req.query;
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', userId);
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(200).json({ data });
    }
    default:
      return res.status(405).end();
  }
}
