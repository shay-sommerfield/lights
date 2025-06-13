import express, { Request, Response, NextFunction } from 'express';
import { getLightsFromBulbGroup } from './configuration';


const app = express();
const PORT = process.env.PORT || 3000;

const stereoGroupPromise = getLightsFromBulbGroup("stereo");

app.use(express.json());


app.get('/api/stereo', async (_req: Request, res: Response) => {
  let stereo = (await stereoGroupPromise)[0];
  // try attempt to get stereo once if it isn't available
  if (!stereo) {
    stereo = (await getLightsFromBulbGroup("stereo"))[0];
  } 

  try {
    await stereo.toggle();
    res.status(200).json({ message: 'Stereo light toggled successfully!'});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to toggle stereo light.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
